import express from 'express';
import request from 'supertest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { configureHttpSecurity, contentSecurityPolicy, permissionsPolicy } from './http-security';

describe('HTTP privacy and browser security', () => {
  const app = express();
  configureHttpSecurity(app);
  app.get('/api/private', (_req, res) => {
    res.json({ ok: true });
  });
  it('does not disclose Express and prevents caching even on error responses', async () => {
    for (const path of ['/api/private', '/missing']) {
      const res = await request(app).get(path);
      expect(res.headers['x-powered-by']).toBeUndefined();
      expect(res.headers['etag']).toBeUndefined();
      expect(res.headers['cache-control']).toContain('no-store');
      expect(res.headers['referrer-policy']).toBe('no-referrer');
      expect(res.headers['strict-transport-security']).toBe('max-age=31536000');
      // Express' final 404 handler tightens this further for its error document.
      expect(res.headers['content-security-policy']).toBe(path === '/missing' ? "default-src 'none'" : contentSecurityPolicy);
      expect(res.headers['permissions-policy']).toBe(permissionsPolicy);
    }
  });
  it('keeps the proxy and direct API policies aligned, without allowing arbitrary scripts or eval', () => {
    const proxy = readFileSync(resolve(__dirname, '../../../client/nginx.conf'), 'utf8');
    expect(proxy).toContain(`Content-Security-Policy "${contentSecurityPolicy}"`);
    expect(contentSecurityPolicy).toContain("script-src 'self' https://checkout.bold.co;");
    expect(contentSecurityPolicy).not.toContain('unsafe-eval');
    expect(proxy).toContain('proxy_ssl_verify on;');
    expect(proxy).toContain('proxy_hide_header X-Powered-By;');
  });
});
