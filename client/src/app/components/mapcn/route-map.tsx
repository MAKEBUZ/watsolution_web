/** @jsxImportSource react */
import { useEffect } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapRoute, useMap } from './map';
export interface MapStop {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
}
export interface RouteMapProps {
  stops: MapStop[];
  line: [number, number][];
  onError?: (message: string) => void;
}
function Viewport({ stops, line, onError }: RouteMapProps) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map) return;
    const failed = () => onError?.('No se pudo cargar una capa del mapa. Comprueba tu conexión.');
    map.on('error', failed);
    return () => {
      map.off('error', failed);
    };
  }, [map, onError]);
  useEffect(() => {
    if (!map || !isLoaded) return;
    const points = line.length ? line : stops.map(s => [s.longitude, s.latitude]);
    if (!points.length) return;
    const bounds = points.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: 65, maxZoom: 16, duration: 500 },
    );
  }, [map, isLoaded, stops, line]);
  return (
    <div className="map-tools">
      <button aria-label="Acercar mapa" onClick={() => map?.zoomIn()}>
        +
      </button>
      <button aria-label="Alejar mapa" onClick={() => map?.zoomOut()}>
        −
      </button>
    </div>
  );
}
export function RouteMap(props: RouteMapProps) {
  return (
    <Map className="ws-map-cn" center={[-74.1, 4.6]} zoom={7} theme="light">
      <Viewport {...props} />
      {props.stops.map((p, index) => (
        <MapMarker key={p.id} longitude={p.longitude} latitude={p.latitude}>
          <MarkerContent>
            <button className="house-marker" aria-label={p.name}>
              {index + 1}
            </button>
          </MarkerContent>
          <MarkerPopup>
            <div className="house-popup">
              <strong>{p.name}</strong>
              <p>Parada {index + 1}</p>
            </div>
          </MarkerPopup>
        </MapMarker>
      ))}
      {props.line.length > 1 && <MapRoute coordinates={props.line} color="#176b61" width={5} />}
    </Map>
  );
}
