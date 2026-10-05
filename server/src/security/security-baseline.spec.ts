import { instanceToPlain } from 'class-transformer';
import { randomBytes } from 'crypto';
import { UserDTO } from '../service/dto/user.dto';
import { loadJwtSettings } from './jwt-settings';
import { RecordAccessGuard } from './guards/record-access.guard';
import { validateReading } from '../service/mobile.service';
import { NotificationController } from '../web/rest/notification.controller';

describe('Security boundaries', () => {
  it('never serializes account credentials or recovery secrets', () => {
    const user = Object.assign(new UserDTO(), { login: 'demo', password: 'synthetic', activationKey: 'synthetic', resetKey: 'synthetic', resetDate: new Date() });
    expect(instanceToPlain(user)).toEqual({ login: 'demo' });
  });
  it('fails closed without a production signing key', () => {
    expect(() => loadJwtSettings({ BACKEND_ENV: 'prod' })).toThrow();
    expect(() => loadJwtSettings({ BACKEND_ENV: 'prod', JWT_SECRET_BASE64: 'short' })).toThrow();
    expect(loadJwtSettings({ BACKEND_ENV: 'prod', JWT_SECRET_BASE64: randomBytes(48).toString('base64') }).secret.length).toBe(48);
  });
  it('denies another customer even with a valid user role', async () => {
    const db = { getRepository: () => ({ findOneBy: async () => ({ userId: '2' }) }) };
    const guard = new RecordAccessGuard(db as any);
    const context = { switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, authorities: ['ROLE_USER'] }, method: 'GET', params: { id: '42' }, route: { path: '/api/people/:id' } }) }) };
    await expect(guard.canActivate(context as any)).rejects.toThrow();
  });
  it('gets notifications from authenticated identity, never from the query', async () => {
    const service = { getForUser: jest.fn() };
    const controller = new NotificationController(service as any);
    await controller.getMyNotifications({ user: { login: 'alice' }, query: { login: 'bob' } } as any);
    expect(service.getForUser).toHaveBeenCalledWith('alice');
  });
});

describe('Reading command validation', () => {
  const reading = { operationId: '343ac377-8f2b-49d2-bf5c-3c4dd3a3c5dc', personId: 7, previousMeterId: null, waterMeasure: 21.55, readingDate: '2026-01-01' };
  it('accepts a canonical reading with a missing initial baseline explicitly recorded', () => expect(validateReading(reading).waterMeasure).toBe(21.55));
  it.each([{ actor: 'other' }, { amountDue: 1 }, { waterMeasure: -1 }, { waterMeasure: Infinity }, { waterMeasure: 1.123 }, { readingDate: '2026-02-30' }, { personId: '7' }, { previousMeterId: undefined }])('rejects manipulated command %j', extra => {
    expect(() => validateReading({ ...reading, ...extra })).toThrow();
  });
});
