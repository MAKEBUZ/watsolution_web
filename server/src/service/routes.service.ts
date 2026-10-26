import { BadRequestException, HttpException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Person } from '../domain/person.entity';
import { Address } from '../domain/address.entity';

export function coordinates(value: any): [number, number] {
  const { latitude, longitude } = value ?? {};
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    throw new BadRequestException('Coordenadas inválidas.');
  return [longitude, latitude];
}
export const addressLabel = (a: Partial<Address>) =>
  [a.street, a.houseNumber, a.neighborhood, a.city, 'Colombia'].filter(Boolean).join(', ');

@Injectable()
export class RoutesService {
  private nextGeocode = 0;
  private nextRoute = 0;
  private cache = new Map<string, { time: number; data: any[] }>();
  constructor(private readonly db: DataSource) {}
  private async person(id: number) {
    const person = await this.db.getRepository(Person).findOne({ where: { id }, relations: { address: true } });
    if (!person?.address) throw new NotFoundException('El suscriptor no tiene dirección registrada.');
    return person;
  }
  private async json(url: URL): Promise<any> {
    if (url.protocol !== 'https:') throw new ServiceUnavailableException('El proveedor del mapa requiere HTTPS.');
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'WatSolution/1.0 (https://watsolution.online)', Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
        redirect: 'error',
      });
      if (!response.ok) throw new Error('Provider unavailable');
      return await response.json();
    } catch {
      throw new ServiceUnavailableException('El servicio de mapas no está disponible. Intenta más tarde.');
    }
  }
  async geocode(id: number) {
    const person = await this.person(id);
    if (!person.address.city || !person.address.street)
      throw new BadRequestException('Completa ciudad y calle antes de buscar la dirección.');
    const address = addressLabel(person.address);
    const cached = this.cache.get(address);
    if (cached && Date.now() - cached.time < 86400000) return cached.data;
    if (Date.now() < this.nextGeocode) throw new HttpException('Espera un momento antes de buscar otra dirección.', 429);
    this.nextGeocode = Date.now() + 1100;
    const url = new URL(process.env.GEOCODING_URL || 'https://nominatim.openstreetmap.org/search');
    url.search = new URLSearchParams({ q: address, format: 'jsonv2', limit: '5', countrycodes: 'co' }).toString();
    const data = await this.json(url);
    if (!Array.isArray(data)) throw new ServiceUnavailableException();
    const results = data
      .map(p => ({ label: String(p.display_name), latitude: Number(p.lat), longitude: Number(p.lon) }))
      .filter(
        p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180,
      );
    if (this.cache.size >= 1000) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(address, { time: Date.now(), data: results });
    return results;
  }
  async saveLocation(id: number, body: unknown) {
    const [longitude, latitude] = coordinates(body);
    const person = await this.person(id);
    await this.db.getRepository(Address).update(person.address.id, { latitude, longitude });
    return { personId: id, latitude, longitude };
  }
  async plan(body: any) {
    const ids = body?.personIds;
    if (
      !Array.isArray(ids) ||
      ids.length < 2 ||
      ids.length > 25 ||
      new Set(ids).size !== ids.length ||
      ids.some(id => !Number.isSafeInteger(id) || id <= 0)
    )
      throw new BadRequestException('Selecciona entre 2 y 25 viviendas diferentes.');
    const rows = await this.db.getRepository(Person).find({ where: { id: In(ids) }, relations: { address: true } });
    const stops = ids.map(id => {
      const p = rows.find(row => row.id === id);
      if (!p?.address || p.address.latitude == null || p.address.longitude == null)
        throw new BadRequestException('Todas las viviendas deben tener una ubicación confirmada.');
      return {
        personId: id,
        name: p.fullName,
        address: addressLabel(p.address),
        coordinates: coordinates({ latitude: Number(p.address.latitude), longitude: Number(p.address.longitude) }),
      };
    });
    const url = new URL(process.env.ROUTING_URL || 'https://router.project-osrm.org');
    if (Date.now() < this.nextRoute) throw new HttpException('Espera un momento antes de generar otro recorrido.', 429);
    this.nextRoute = Date.now() + 1100;
    url.pathname = `/trip/v1/driving/${stops.map(p => p.coordinates.join(',')).join(';')}`;
    url.search = new URLSearchParams({
      source: 'first',
      destination: 'last',
      roundtrip: 'false',
      overview: 'full',
      geometries: 'geojson',
      steps: 'false',
      radiuses: stops.map(() => '500').join(';'),
    }).toString();
    const data = await this.json(url);
    if (
      data.code !== 'Ok' ||
      data.trips?.length !== 1 ||
      data.waypoints?.length !== stops.length ||
      data.trips[0]?.geometry?.type !== 'LineString' ||
      !Array.isArray(data.trips[0].geometry.coordinates) ||
      data.trips[0].geometry.coordinates.length < 2 ||
      data.trips[0].geometry.coordinates.some(p => !Array.isArray(p) || p.length !== 2 ||
        !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) ||
      !Number.isFinite(data.trips[0].distance) || data.trips[0].distance < 0 ||
      !Number.isFinite(data.trips[0].duration) || data.trips[0].duration < 0 ||
      data.waypoints.some(w => !Number.isInteger(w.waypoint_index) || w.waypoint_index < 0 ||
        w.waypoint_index >= stops.length || !Number.isFinite(w.distance) || w.distance < 0) ||
      new Set(data.waypoints.map(w => w.waypoint_index)).size !== stops.length ||
      data.waypoints[0].waypoint_index !== 0 || data.waypoints[stops.length - 1].waypoint_index !== stops.length - 1
    )
      throw new BadRequestException('No se encontró una ruta transitable entre estas viviendas.');
    if (data.waypoints.some(w => w.distance > 500))
      throw new BadRequestException('Una vivienda está a más de 500 m de una vía. Revisa su ubicación.');
    const ordered = stops.map((p, i) => ({ ...p, order: data.waypoints[i].waypoint_index })).sort((a, b) => a.order - b.order);
    return {
      stops: ordered,
      distance: data.trips[0].distance,
      duration: data.trips[0].duration,
      geometry: data.trips[0].geometry,
      attribution: '© OpenStreetMap contributors · OSRM',
      mode: 'driving',
    };
  }
}
