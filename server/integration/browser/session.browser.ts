import { Controller, Get, INestApplication, Req, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { build } from 'esbuild';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomBytes } from 'crypto';
import { createBillingFixture } from '../billing-fixture';
import { User } from '../../src/domain/user.entity';
import { Authority } from '../../src/domain/authority.entity';
import { AuthSession } from '../../src/domain/auth-session.entity';
import { UserService } from '../../src/service/user.service';
import { AuthService } from '../../src/service/auth.service';
import { SessionService } from '../../src/service/session.service';
import { LoginRateLimitService } from '../../src/security/login-rate-limit.service';
import { encodePassword } from '../../src/security/password-util';
import { JwtStrategy } from '../../src/security/passport.jwt.strategy';
import { AuthGuard } from '../../src/security/guards/auth.guard';
import { jwtSettings } from '../../src/security/jwt-settings';
import { UserJWTController } from '../../src/web/rest/user.jwt.controller';
import express from 'express';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AccountController } from '../../src/web/rest/account.controller';
import { AdminController } from '../../src/web/rest/admin.controller';
import { AdminStatsService } from '../../src/service/admin-stats.service';
import { BillingService } from '../../src/service/billing.service';
import { InvoiceService } from '../../src/service/invoice.service';
import { MeterService } from '../../src/service/meter.service';
import { BucketService } from '../../src/service/bucket.service';
import { InvoicePdfService } from '../../src/service/invoice-pdf.service';
import { Invoice } from '../../src/domain/invoice.entity';
import { Meter } from '../../src/domain/meter.entity';
import { Person } from '../../src/domain/person.entity';
import { ActivityLog } from '../../src/domain/activity-log.entity';
import { SessionController } from '../../src/web/rest/session.controller';
import { startNginx } from './nginx-fixture';

// A minimal protected probe, not a replacement for testing the complete application UI.
@Controller('api/browser-probe')
class BrowserProbe {
  @Get() @UseGuards(AuthGuard)
  get(@Req() req: any) { return { id: req.user.id }; }
}

describe('Chromium HTTPS sessions with PostgreSQL', () => {
  let fixture: Awaited<ReturnType<typeof createBillingFixture>>;
  let app: INestApplication;
  let browser: Browser;
  let context: BrowserContext;
  let origin: string;
  let proxy: Awaited<ReturnType<typeof startNginx>> | undefined;
  const oldOrigins = process.env.WEB_ORIGINS;
  const password = randomBytes(24).toString('base64url');
  const responseStatus = (page: Page) => page.evaluate(`fetch('/api/browser-probe', {
    headers: { Authorization: 'Bearer ' + ws.getAccessToken() }
  }).then(r => r.status)`);

  beforeAll(async () => {
    if (!process.env.TEST_TLS_KEY || !process.env.TEST_TLS_CERT) throw new Error('Explicit disposable TLS certificate required');
    if (!process.env.TEST_WEB_DIST) throw new Error('Explicit application build directory required');
    const webDist = resolve(process.env.TEST_WEB_DIST);
    readFileSync(resolve(webDist, 'index.html'));
    fixture = await createBillingFixture();
    const db = fixture.db;
    const sessions = new SessionService(db);
    const jwt = new JwtService({ secret: jwtSettings.secret, signOptions: {
      issuer: jwtSettings.issuer, audience: jwtSettings.audience, expiresIn: '5m',
    } });
    const auth = new AuthService(jwt, sessions, new LoginRateLimitService(db), db.getRepository(Authority), new UserService(db.getRepository(User)));
    await db.getRepository(Authority).save([{ name: 'ROLE_USER' }, { name: 'ROLE_ADMIN' }]);
    await db.getRepository(User).save({ login: 'browser-user', email: 'browser@example.invalid', activated: true,
      password: await encodePassword(password), authorities: [{ name: 'ROLE_USER' }] });
    await db.getRepository(User).save({ login: 'ui-admin', firstName: 'Administrador de prueba', email: 'ui@example.invalid', activated: true,
      password: await encodePassword(password), authorities: [{ name: 'ROLE_ADMIN' }] });
    const logs = db.getRepository(ActivityLog);
    const module = await Test.createTestingModule({ imports: [PassportModule],
      controllers: [UserJWTController, SessionController, BrowserProbe, AccountController, AdminController], providers: [JwtStrategy,
        { provide: AuthService, useValue: auth }, { provide: SessionService, useValue: sessions },
        { provide: DataSource, useValue: db },
        { provide: AdminStatsService, useValue: new AdminStatsService(db.getRepository(User), db.getRepository(Invoice), db.getRepository(Meter), db.getRepository(Person), logs) },
        { provide: BillingService, useValue: new BillingService(db) },
        { provide: InvoiceService, useValue: new InvoiceService(db.getRepository(Invoice), logs, db.getRepository(User), { send: jest.fn() } as any) },
        { provide: MeterService, useValue: new MeterService(db.getRepository(Meter), logs) },
        { provide: getRepositoryToken(ActivityLog), useValue: logs }, { provide: getRepositoryToken(Person), useValue: db.getRepository(Person) },
        { provide: BucketService, useValue: {} }, { provide: InvoicePdfService, useValue: {} }],
    }).compile();
    app = module.createNestApplication({ httpsOptions: {
      key: readFileSync(process.env.TEST_TLS_KEY), cert: readFileSync(process.env.TEST_TLS_CERT),
    } });
    const bundled = await build({ entryPoints: [resolve(__dirname, '../../../client/src/app/shared/config/web-session.ts')],
      bundle: true, write: false, platform: 'browser', format: 'iife', globalName: 'ws',
      define: { SERVER_API_URL: JSON.stringify('/') },
    });
    app.use('/session-client.js', (_req, res) => res.type('application/javascript').send(bundled.outputFiles[0].text));
    app.use('/test-session', (_req, res) => res.type('html').send(`<!doctype html><html lang="es"><title>Prueba aislada de sesión</title>
      <input id="password" type="password" aria-label="Contraseña de prueba"><button id="login">Entrar</button>
      <button id="refresh">Renovar</button><output id="result"></output><script src="/session-client.js"></script>
      <script>
      document.querySelector('#login').onclick = async () => {
        const r = await fetch('/api/authenticate', { method:'POST', headers:{'Content-Type':'application/json','X-Session-Transport':'web'},
          body:JSON.stringify({username:'browser-user',password:document.querySelector('#password').value}) });
        const data=await r.json(); window.loginResponse=data; ws.setAccessToken(data.id_token);
        document.querySelector('#result').textContent=String(r.status);
      };
      document.querySelector('#refresh').onclick = async () => {
        try { await ws.refreshAccessToken(); document.querySelector('#result').textContent='renewed'; }
        catch { document.querySelector('#result').textContent='rejected'; }
      };
      </script></html>`));
    app.use(express.static(webDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || /^\/(api|management|i18n)(\/|$)/.test(req.path) || req.path.includes('.')) return next();
      res.sendFile(resolve(webDist, 'index.html'));
    });
    await app.listen(0, '127.0.0.1');
    origin = await app.getUrl();
    if (process.env.TEST_NGINX === '1') {
      proxy = await startNginx(origin, webDist, process.env.TEST_TLS_KEY, process.env.TEST_TLS_CERT);
      origin = proxy.origin;
    }
    process.env.WEB_ORIGINS = origin;
    browser = await chromium.launch({ headless: true });
  });
  beforeEach(async () => { context = await browser.newContext({ ignoreHTTPSErrors: true }); });
  afterEach(async () => { await context?.close(); });
  afterAll(async () => {
    try { await browser?.close(); await proxy?.close(); await app?.close(); await fixture?.close(); }
    finally { if (oldOrigins === undefined) delete process.env.WEB_ORIGINS; else process.env.WEB_ORIGINS = oldOrigins; }
  });
  const login = async () => {
    const page = await context.newPage(); await page.goto(origin + '/test-session');
    await page.locator('#password').fill(password); await page.locator('#login').click();
    await page.waitForFunction(`document.querySelector('#result').textContent === '200'`);
    return page;
  };

  it('stores a host-only HttpOnly secure cookie without exposing refresh to page JavaScript', async () => {
    const page = await login();
    expect(await page.evaluate('isSecureContext')).toBe(true);
    const cookies = await context.cookies();
    const cookie = cookies.find(c => c.name === '__Host-watsolution-refresh');
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: 'Strict', path: '/', domain: '127.0.0.1' });
    expect(await page.evaluate('document.cookie')).not.toContain('__Host-watsolution-refresh');
    expect(await page.evaluate('Object.keys(loginResponse)')).toEqual(['id_token']);
    expect(await page.evaluate('localStorage.getItem("jhi-authenticationToken")')).toBeNull();
    expect(await page.evaluate('sessionStorage.getItem("jhi-authenticationToken")')).toBeNull();
    expect(await responseStatus(page)).toBe(200);
  });
  it('renews after a reload using the browser-managed cookie and real session module', async () => {
    const page = await login(); await page.reload();
    expect(await page.evaluate('ws.getAccessToken()')).toBeNull();
    await page.locator('#refresh').click(); await page.waitForFunction(`document.querySelector('#result').textContent === 'renewed'`);
    expect(await responseStatus(page)).toBe(200);
  });
  it('serializes two tabs with navigator.locks and keeps the rotated family active', async () => {
    const first = await login(), second = await context.newPage(); await second.goto(origin + '/test-session');
    expect(await first.evaluate('!!navigator.locks')).toBe(true);
    await Promise.all([first.evaluate('ws.refreshAccessToken()'), second.evaluate('ws.refreshAccessToken()')]);
    expect(await responseStatus(first)).toBe(200); expect(await responseStatus(second)).toBe(200);
    const cookie = (await context.cookies()).find(c => c.name === '__Host-watsolution-refresh')!;
    const session = await fixture.db.getRepository(AuthSession).findOneBy({ id: cookie.value.split('.')[0] });
    expect(session.revoked).toBe(false); expect(JSON.parse(session.usedRefreshHashes)).toHaveLength(2);
  });
  it('clears the browser cookie and invalidates access in a second tab after server logout', async () => {
    const first = await login(), second = await context.newPage(); await second.goto(origin + '/test-session');
    await second.evaluate('ws.refreshAccessToken()');
    expect(await first.evaluate(`fetch('/api/session/logout', {method:'POST',headers:{'X-Session-Transport':'web'}}).then(r=>r.status)`)).toBe(201);
    expect((await context.cookies()).some(c => c.name === '__Host-watsolution-refresh')).toBe(false);
    expect(await responseStatus(second)).toBe(401);
    await second.locator('#refresh').click(); await second.waitForFunction(`document.querySelector('#result').textContent === 'rejected'`);
  });
  it('keeps unknown API responses separate from the SPA fallback', async () => {
    const api = await context.request.get(origin + '/api/does-not-exist');
    expect(api.status()).toBe(404);
    expect(api.headers()['content-type']).toContain('application/json');
    expect((await api.json()).statusCode).toBe(404);
    const route = await context.request.get(origin + '/admin/actividad');
    expect(route.status()).toBe(200);
    expect(route.headers()['content-type']).toContain('text/html');
  });
  it('rejects an untrusted Origin without revoking the valid session', async () => {
    const page = await login();
    const cookie = (await context.cookies()).find(c => c.name === '__Host-watsolution-refresh')!;
    const response = await context.request.post(origin + '/api/session/logout', {
      headers: { Origin: 'https://untrusted.example.invalid', 'X-Session-Transport': 'web' },
    });
    expect(response.status()).toBe(403);
    expect((await context.cookies()).find(c => c.name === cookie.name)?.value).toBe(cookie.value);
    const session = await fixture.db.getRepository(AuthSession).findOneBy({ id: cookie.value.split('.')[0] });
    expect(session.revoked).toBe(false);
    expect(await responseStatus(page)).toBe(200);
  });
  const loginUi = async () => {
    const page = await context.newPage();
    await page.goto(origin + '/login');
    await page.locator('#username').fill('ui-admin');
    await page.locator('#password').fill(password);
    await page.locator('.auth-privacy__check').check();
    // Let the initial anonymous account lookup and logout finish before submitting credentials.
    await page.waitForFunction('localStorage.getItem("watsolution-logout")?.startsWith("confirmed:")');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin/resumen');
    await page.locator('.sidebar-profile .name').filter({ hasText: 'Administrador de prueba' }).waitFor();
    return page;
  };
  it('logs in through the actual Vue UI and restores identity after a protected-page reload', async () => {
    const page = await loginUi();
    const account = page.waitForResponse(r => r.url().endsWith('/api/account') && r.status() === 200);
    await page.reload(); await account;
    await page.locator('.sidebar-profile .name').filter({ hasText: 'Administrador de prueba' }).waitFor();
    expect(page.url()).toContain('/admin/resumen');
    expect(await page.evaluate('localStorage.getItem("jhi-authenticationToken")')).toBeNull();
  });
  it('removes protected content from both real UI tabs after logout and prevents reload recovery', async () => {
    const first = await loginUi(), second = await context.newPage();
    await second.goto(origin + '/admin/actividad');
    await second.locator('.logs-card').waitFor();
    const logout = first.waitForResponse(r => r.url().endsWith('/api/session/logout') && r.status() === 201);
    await first.locator('.logout-btn').click(); await logout;
    await first.waitForURL('**/login'); await second.waitForURL('**/login');
    expect(await second.locator('.logs-card').count()).toBe(0);
    expect((await context.cookies()).some(c => c.name === '__Host-watsolution-refresh')).toBe(false);
    await second.reload(); await second.locator('#username').waitFor();
    expect(await second.evaluate('localStorage.getItem("watsolution-logout")?.startsWith("confirmed:")')).toBe(true);
  });

});
