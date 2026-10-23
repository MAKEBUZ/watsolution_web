import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';
import { SessionController } from './session.controller';
import { AuthService } from '../../service/auth.service';
import { SessionService } from '../../service/session.service';
import { JwtStrategy } from '../../security/passport.jwt.strategy';
import { refreshCookie } from '../../security/web-session';
import { JwtService } from '@nestjs/jwt';
import { jwtSettings } from '../../security/jwt-settings';

describe('Session logout HTTP contract', () => {
  let app: INestApplication;
  const originalOrigins = process.env.WEB_ORIGINS;
  const sessions = { revokeByRefresh: jest.fn(), revoke: jest.fn() };
  const auth = { validateUser: jest.fn(async () => ({ id: 2, sessionId: 'mobile-session' })) };
  const jwt = new JwtService({ secret: jwtSettings.secret, signOptions: { issuer: jwtSettings.issuer, audience: jwtSettings.audience } });
  beforeAll(async () => {
    process.env.WEB_ORIGINS = 'https://app.example.test';
    const module = await Test.createTestingModule({
      imports: [PassportModule], controllers: [SessionController],
      providers: [JwtStrategy, { provide: SessionService, useValue: sessions }, { provide: AuthService, useValue: auth }],
    }).compile();
    app = module.createNestApplication(); await app.init();
  });
  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => {
    await app.close();
    if (originalOrigins === undefined) delete process.env.WEB_ORIGINS;
    else process.env.WEB_ORIGINS = originalOrigins;
  });
  it('allows trusted web logout with expired JWT and clears the secure cookie', async () => {
    const expired = jwt.sign({ id: 2 }, { expiresIn: -1 });
    const response = await request(app.getHttpServer()).post('/api/session/logout')
      .set('X-Session-Transport', 'web').set('Origin', 'https://app.example.test')
      .set('Authorization', `Bearer ${expired}`).set('Cookie', `${refreshCookie}=synthetic-refresh`).expect(201);
    expect(sessions.revokeByRefresh).toHaveBeenCalledWith('synthetic-refresh');
    expect(sessions.revoke).not.toHaveBeenCalled();
    expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly; Secure; SameSite=Strict/);
    expect(response.headers['set-cookie'][0]).toContain('Expires=Thu, 01 Jan 1970');
    expect(response.headers['cache-control']).toBe('no-store');
  });
  it.each(['https://evil.example.test', ''])('rejects untrusted or absent origin %s before revocation', async origin => {
    const req = request(app.getHttpServer()).post('/api/session/logout').set('X-Session-Transport', 'web');
    if (origin) req.set('Origin', origin);
    const response = await req.expect(403);
    expect(sessions.revokeByRefresh).not.toHaveBeenCalled();
    expect(response.headers['set-cookie']).toBeUndefined();
  });
  it('keeps JWT authentication mandatory for mobile logout', async () => {
    await request(app.getHttpServer()).post('/api/session/logout').expect(401);
    expect(sessions.revoke).not.toHaveBeenCalled();
    const token = jwt.sign({ id: 2 }, { expiresIn: '1m' });
    await request(app.getHttpServer()).post('/api/session/logout').set('Authorization', `Bearer ${token}`).expect(201);
    expect(sessions.revoke).toHaveBeenCalledWith('mobile-session', 2);
  });
});
