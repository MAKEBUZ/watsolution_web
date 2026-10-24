import express from 'express';
import request from 'supertest';
import { configureAuthTraffic } from './auth-traffic';

describe('Authentication origin limits', () => {
  const prior = process.env.TRUSTED_PROXY_IPS;
  afterEach(() => {
    if (prior === undefined) delete process.env.TRUSTED_PROXY_IPS;
    else process.env.TRUSTED_PROXY_IPS = prior;
  });
  function fixture(proxies = '') {
    process.env.TRUSTED_PROXY_IPS = proxies;
    const limits = { consumeBucket: jest.fn(async (_key: string, _maximum: number) => undefined) };
    const app = express();
    configureAuthTraffic(app, limits as any);
    app.post('/api/authenticate', (_req, res) => {
      res.json({ ok: true });
    });
    return { app, limits };
  }
  it('ignores attacker forwarded headers from an untrusted peer', async () => {
    const { app, limits } = fixture();
    await request(app).post('/api/authenticate').set('X-Forwarded-For', '198.51.100.7').expect(200);
    const key = limits.consumeBucket.mock.calls[1][0];
    expect(key).not.toContain('198.51.100.7');
  });
  it('uses the closest untrusted address, not the attacker leftmost value', async () => {
    const { app, limits } = fixture('127.0.0.1,::1');
    await request(app).post('/api/authenticate').set('X-Forwarded-For', '198.51.100.7, 203.0.113.8').expect(200);
    expect(limits.consumeBucket.mock.calls[1][0]).toBe('origin:auth:203.0.113.8');
  });
  it('fails closed with a generic error when the limiter storage is unavailable', async () => {
    const { app, limits } = fixture();
    limits.consumeBucket.mockRejectedValue(new Error('database details must not escape'));
    const response = await request(app).post('/api/authenticate').expect(503);
    expect(response.headers['retry-after']).toBe('60');
    expect(response.text).not.toContain('database');
  });
  it('rejects broad trust configuration', () => {
    expect(() => fixture('true')).toThrow('exact proxy');
  });
});
