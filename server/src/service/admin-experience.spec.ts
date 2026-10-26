/* eslint-disable @typescript-eslint/require-await */
import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../security/guards/roles.guard';
import { RoutesController } from '../web/rest/routes.controller';
import { TestimonialController, PublicTestimonialController, testimonialInput } from '../web/rest/testimonial.controller';
import { PortalController } from '../web/rest/portal.controller';
import { NotificationService } from './notification.service';
import { RoutesService } from './routes.service';

function access(controller: any, method: string, role: string) {
  return new RolesGuard(new Reflector()).canActivate({
    getClass: () => controller,
    getHandler: () => controller.prototype[method],
    switchToHttp: () => ({ getRequest: () => ({ user: { authorities: [role] } }) }),
  } as any);
}
describe('Administrator access and private notifications', () => {
  it.each(['ROLE_USER', 'ROLE_OPERATOR'])('denies %s access to maps, routes, testimonials and subscriber previews', role => {
    for (const method of ['plan', 'location', 'geocode']) expect(access(RoutesController, method, role)).toBe(false);
    for (const method of ['create', 'update', 'remove', 'list']) expect(access(TestimonialController, method, role)).toBe(false);
    expect(access(PortalController, 'subscriber', role)).toBe(false);
  });
  it('allows an administrator without ROLE_USER to enter the subscriber portal', () => {
    expect(access(PortalController, 'getDashboard', 'ROLE_ADMIN')).toBe(true);
    expect(access(PortalController, 'subscriber', 'ROLE_ADMIN')).toBe(true);
  });
  it('limits reading and deleting notifications to the authenticated owner', async () => {
    const repo = { update: jest.fn(), delete: jest.fn() };
    const service = new NotificationService(repo as any, {} as any, {} as any);
    await service.markRead('alice', 42);
    await service.remove('alice', 42);
    await service.removeRead('alice');
    expect(repo.update).toHaveBeenCalledWith({ userLogin: 'alice', id: 42 }, { read: true });
    expect(repo.delete.mock.calls).toEqual([[{ userLogin: 'alice', id: 42 }], [{ userLogin: 'alice', read: true }]]);
  });
  it('never exposes unpublished testimonials on the public page and rejects invalid publication values', async () => {
    const repo = { find: jest.fn(async () => []) };
    await new PublicTestimonialController(repo as any).list();
    expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { published: true } }));
    expect(() => testimonialInput({ name: 'Name', text: 'Text', role: '', company: '', position: 0, published: 'false' })).toThrow();
  });
});

describe('Residential route planning', () => {
  afterEach(() => jest.restoreAllMocks());
  const people = [
    {
      id: 1,
      fullName: 'Private person A',
      documentNumber: 'private-document',
      address: { id: 10, street: 'Calle 1', city: 'Bogotá', latitude: '4.6012345', longitude: '-74.1012345' },
    },
    {
      id: 2,
      fullName: 'Private person B',
      address: { id: 20, street: 'Calle 2', city: 'Bogotá', latitude: '4.6112345', longitude: '-74.1112345' },
    },
  ];
  function fixture() {
    const repo = { find: jest.fn(async () => people), findOne: jest.fn(async () => people[0]), update: jest.fn() };
    return { service: new RoutesService({ getRepository: () => repo } as any), repo };
  }
  it('rejects duplicate destinations and missing coordinates before contacting a provider', async () => {
    const fetcher = jest.spyOn(global, 'fetch');
    const { service, repo } = fixture();
    await expect(service.plan({ personIds: [1, 1] })).rejects.toThrow();
    repo.find.mockResolvedValue([{ ...people[0], address: { ...people[0].address, latitude: null } }, people[1]]);
    await expect(service.plan({ personIds: [1, 2] })).rejects.toThrow('ubicación confirmada');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('sends only coordinates to routing and follows the returned waypoint order', async () => {
    const fetcher = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 'Ok',
        trips: [
          {
            distance: 1200,
            duration: 300,
            geometry: {
              type: 'LineString',
              coordinates: [
                [-74.1, 4.6],
                [-74.11, 4.61],
              ],
            },
          },
        ],
        waypoints: [
          { waypoint_index: 0, distance: 2 },
          { waypoint_index: 1, distance: 3 },
        ],
      }),
    } as any);
    const result = await fixture().service.plan({ personIds: [1, 2] });
    expect(result.stops.map(p => p.personId)).toEqual([1, 2]);
    const request = (fetcher.mock.calls[0][0] as URL).href;
    expect(request).toContain('-74.1012345,4.6012345');
    expect(request).not.toContain('Private');
    expect(request).not.toContain('private-document');
    expect(result.distance).toBe(1200);
  });
  it('caches geocoding searches and never sends names or documents', async () => {
    const fetcher = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [{ display_name: 'Calle 1', lat: '4.6012345', lon: '-74.1012345' }] } as any);
    const { service } = fixture();
    await service.geocode(1);
    await service.geocode(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect((fetcher.mock.calls[0][0] as URL).href).not.toContain('Private');
    expect((fetcher.mock.calls[0][0] as URL).href).not.toContain('private-document');
  });
  it('preserves household coordinate precision and validates range', async () => {
    const { service, repo } = fixture();
    await service.saveLocation(1, { latitude: 4.6012345, longitude: -74.1012345 });
    expect(repo.update).toHaveBeenCalledWith(10, { latitude: 4.6012345, longitude: -74.1012345 });
    await expect(service.saveLocation(1, { latitude: 91, longitude: 0 })).rejects.toThrow();
  });
});
