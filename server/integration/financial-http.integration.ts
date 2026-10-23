import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID, randomBytes } from 'crypto';
import request from 'supertest';
import { createBillingFixture } from './billing-fixture';
import { User } from '../src/domain/user.entity';
import { Authority } from '../src/domain/authority.entity';
import { AuthSession } from '../src/domain/auth-session.entity';
import { UserService } from '../src/service/user.service';
import { SessionService } from '../src/service/session.service';
import { LoginRateLimitService } from '../src/security/login-rate-limit.service';
import { encodePassword } from '../src/security/password-util';
import { UserJWTController } from '../src/web/rest/user.jwt.controller';
import { SessionController } from '../src/web/rest/session.controller';
import { Invoice } from '../src/domain/invoice.entity';
import { Person } from '../src/domain/person.entity';
import { Meter } from '../src/domain/meter.entity';
import { ActivityLog } from '../src/domain/activity-log.entity';
import { InvoiceController } from '../src/web/rest/invoice.controller';
import { MeterController } from '../src/web/rest/meter.controller';
import { AdminController } from '../src/web/rest/admin.controller';
import { MobileController } from '../src/web/rest/mobile.controller';
import { InvoiceService } from '../src/service/invoice.service';
import { MeterService } from '../src/service/meter.service';
import { BillingService } from '../src/service/billing.service';
import { MobileService } from '../src/service/mobile.service';
import { AuthService } from '../src/service/auth.service';
import { AdminStatsService } from '../src/service/admin-stats.service';
import { InvoicePdfService } from '../src/service/invoice-pdf.service';
import { BucketService } from '../src/service/bucket.service';
import { NotificationService } from '../src/service/notification.service';
import { JwtStrategy } from '../src/security/passport.jwt.strategy';
import { refreshCookie } from '../src/security/web-session';
import { jwtSettings } from '../src/security/jwt-settings';
import { PersonStatus } from '../src/domain/enumeration/person-status';
import { InvoiceStatus } from '../src/domain/enumeration/invoice-status';

describe('Financial routes with real guards and PostgreSQL', () => {
  let fixture: Awaited<ReturnType<typeof createBillingFixture>>;
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  const originalOrigins = process.env.WEB_ORIGINS;
  const webOrigin = 'https://app.example.test';
  const password = randomBytes(24).toString('base64url');
  const login = async (username: string) => (await request(app.getHttpServer()).post('/api/authenticate').send({ username, password }).expect(200)).body;
  const seed = async (name: string, role = 'ROLE_USER', activated = true) => fixture.db.getRepository(User).save({
    login: name, email: name + '@example.invalid', activated, password: await encodePassword(password), authorities: [{ name: role }],
  });
  beforeAll(async () => {
    process.env.WEB_ORIGINS = webOrigin;
    fixture = await createBillingFixture();
    const db = fixture.db;
    const logs = db.getRepository(ActivityLog);
    const notices = { send: jest.fn() };
    const users = db.getRepository(User);
    const sessions = new SessionService(db);
    const jwt = new JwtService({ secret: jwtSettings.secret, signOptions: { issuer: jwtSettings.issuer, audience: jwtSettings.audience, expiresIn: '5m' } });
    const auth = new AuthService(jwt, sessions, new LoginRateLimitService(db), db.getRepository(Authority), new UserService(users));
    await db.getRepository(Authority).save([{ name: 'ROLE_ADMIN' }, { name: 'ROLE_USER' }]);
    await seed('admin', 'ROLE_ADMIN'); await seed('subscriber');
    const module = await Test.createTestingModule({ imports: [PassportModule],
      controllers: [InvoiceController, MeterController, AdminController, MobileController, UserJWTController, SessionController],
      providers: [JwtStrategy, { provide: SessionService, useValue: sessions }, { provide: AuthService, useValue: auth }, { provide: DataSource, useValue: db },
        { provide: InvoiceService, useValue: new InvoiceService(db.getRepository(Invoice), logs, users, notices as any) },
        { provide: MeterService, useValue: new MeterService(db.getRepository(Meter), logs) },
        { provide: BillingService, useValue: new BillingService(db) }, { provide: MobileService, useValue: new MobileService(db) },
        { provide: getRepositoryToken(ActivityLog), useValue: logs }, { provide: getRepositoryToken(Person), useValue: db.getRepository(Person) },
        { provide: NotificationService, useValue: notices }, { provide: AdminStatsService, useValue: {} },
        { provide: InvoicePdfService, useValue: {} }, { provide: BucketService, useValue: {} }],
    }).compile();
    app = module.createNestApplication(); await app.init();
    adminToken = (await login('admin')).id_token;
    userToken = (await login('subscriber')).id_token;
  });
  afterAll(async () => {
    try { if (app) await app.close(); if (fixture) await fixture.close(); }
    finally {
      if (originalOrigins === undefined) delete process.env.WEB_ORIGINS;
      else process.env.WEB_ORIGINS = originalOrigins;
    }
  });
  const call = (method: string, path: string, token = adminToken) => {
    const req = request(app.getHttpServer())[method](path);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it.each(['PENDING', 'ACTIVE_ORDER', 'PAID'])('denies every generic write with ADMIN for %s and leaves rows unchanged', async state => {
    const people = fixture.db.getRepository(Person), meters = fixture.db.getRepository(Meter), invoices = fixture.db.getRepository(Invoice);
    const person = await people.save({ fullName: 'Synthetic', documentNumber: randomUUID(), status: PersonStatus.ACTIVE });
    const meter = await meters.save({ person, readingDate: '2020-01-01', waterMeasure: 10 });
    const invoice = await invoices.save({ person, meter, issueDate: '2020-01-01', dueDate: '2020-02-01', consumptionM3: 10,
      amountDue: 25, status: state === 'PAID' ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
      boldOrderId: state === 'PENDING' ? null : 'active-order', boldTransactionId: state === 'PAID' ? 'confirmed-payment' : null });
    const before = { invoice: await invoices.findOneBy({ id: invoice.id }), meter: await meters.findOneBy({ id: meter.id }),
      invoiceCount: await invoices.count(), meterCount: await meters.count(), logs: await fixture.db.getRepository(ActivityLog).count() };
    for (const [entity, id, body] of [
      ['invoices', invoice.id, { ...invoice, amountDue: 1, status: 'PENDING', boldOrderId: 'tampered', person: { id: 999 } }],
      ['meters', meter.id, { ...meter, waterMeasure: 0, person: { id: 999 } }],
    ] as const) {
      for (const [method, path] of [['post', `/api/${entity}`], ['put', `/api/${entity}`], ['put', `/api/${entity}/${id}`], ['delete', `/api/${entity}/${id}`]]) {
        const response = await call(method, path).send(body).expect(409);
        expect(response.body.message).toContain('suspendida');
      }
    }
    expect(await invoices.findOneBy({ id: invoice.id })).toEqual(before.invoice);
    expect(await meters.findOneBy({ id: meter.id })).toEqual(before.meter);
    expect(await invoices.count()).toBe(before.invoiceCount); expect(await meters.count()).toBe(before.meterCount);
    expect(await fixture.db.getRepository(ActivityLog).count()).toBe(before.logs);
    await call('get', `/api/invoices/${invoice.id}`).expect(200);
    await call('get', `/api/meters/${meter.id}`).expect(200);
  });
  it('preserves JWT and role checks for generic and canonical writes', async () => {
    for (const path of ['/api/invoices', '/api/meters', '/api/admin/billing/generate', '/api/mobile/sync/push']) {
      await call('post', path, '').send({}).expect(401);
      await call('post', path, userToken).send({}).expect(403);
    }
  });
  it('keeps confirmed mobile capture and canonical billing available and idempotent', async () => {
    const person = await fixture.db.getRepository(Person).save({ fullName: 'Canonical', documentNumber: randomUUID(), status: PersonStatus.ACTIVE });
    const first = await call('post', '/api/mobile/sync/push').send({ operationId: randomUUID(), personId: person.id,
      previousMeterId: null, readingDate: '2020-01-01', waterMeasure: 100 }).expect(201);
    const second = await call('post', '/api/mobile/sync/push').send({ operationId: randomUUID(), personId: person.id,
      previousMeterId: first.body.meterId, readingDate: '2020-02-01', waterMeasure: 110 }).expect(201);
    const dto = { meterId: second.body.meterId, personId: person.id, rate: 2, fixedCharge: 5, subsidy: 0, surcharges: 0 };
    const generated = await call('post', '/api/admin/billing/generate').send(dto).expect(201);
    expect(Number(generated.body.amountDue)).toBe(25);
    expect(Number(generated.body.consumptionM3)).toBe(10);
    expect(generated.body.status).toBe('PENDING');
    const repeated = await call('post', '/api/admin/billing/generate').send(dto).expect(201);
    expect(repeated.body.id).toBe(generated.body.id);
    expect(await fixture.db.getRepository(Invoice).countBy({ meter: { id: second.body.meterId } })).toBe(1);
  });
  it('rejects wrong passwords and disabled accounts without creating sessions', async () => {
    await seed('disabled', 'ROLE_USER', false);
    const before = await fixture.db.getRepository(AuthSession).count();
    for (const credentials of [{ username: 'subscriber', password: 'wrong-password' }, { username: 'disabled', password }]) {
      await request(app.getHttpServer()).post('/api/authenticate').send(credentials).expect(401);
    }
    expect(await fixture.db.getRepository(AuthSession).count()).toBe(before);
  });

  it('scopes invoice and meter reads to the persisted owner', async () => {
    const owner = await seed('owner'); await seed('outsider');
    const person = await fixture.db.getRepository(Person).save({ fullName: 'Owner', documentNumber: randomUUID(), status: PersonStatus.ACTIVE, userId: String(owner.id) });
    const meter = await fixture.db.getRepository(Meter).save({ person, readingDate: '2020-01-01', waterMeasure: 10 });
    const invoice = await fixture.db.getRepository(Invoice).save({ person, meter, issueDate: '2020-01-01', dueDate: '2020-02-01', consumptionM3: 10, amountDue: 25, status: InvoiceStatus.PENDING });
    const own = await login('owner'), other = await login('outsider');
    for (const path of [`/api/invoices/${invoice.id}`, `/api/meters/${meter.id}`, `/api/invoices/by-person/${person.id}`, `/api/meters/by-person/${person.id}`]) {
      await call('get', path, own.id_token).expect(200);
      await call('get', path, other.id_token).expect(403);
    }
  });

  it('rechecks persisted roles and activation for an already issued access token', async () => {
    const user = await seed('changing-admin', 'ROLE_ADMIN');
    const token = (await login(user.login)).id_token;
    await call('get', '/api/invoices', token).expect(200);
    await fixture.db.getRepository(User).save({ id: user.id, authorities: [{ name: 'ROLE_USER' }] });
    await call('get', '/api/invoices', token).expect(403);
    await fixture.db.getRepository(User).update(user.id, { activated: false });
    await call('get', '/api/invoices', token).expect(401);
  });

  it('revokes persisted access and refresh through HTTP logout', async () => {
    const user = await seed('logout-admin', 'ROLE_ADMIN'); const tokens = await login(user.login);
    await call('post', '/api/session/logout', tokens.id_token).expect(201);
    await call('get', '/api/invoices', tokens.id_token).expect(401);
    await call('post', '/api/session/refresh', '').send({ refresh_token: tokens.refresh_token }).expect(401);
    const session = await fixture.db.getRepository(AuthSession).findOneBy({ userId: user.id });
    expect(session.revoked).toBe(true);
    expect(session.refreshHash).not.toBe(tokens.refresh_token);
  });

  it('rotates refresh and revokes the family on proven replay through HTTP', async () => {
    await seed('refresh-admin', 'ROLE_ADMIN'); const original = await login('refresh-admin');
    const renewed = await call('post', '/api/session/refresh', '').send({ refresh_token: original.refresh_token }).expect(201);
    expect(renewed.body.refresh_token).not.toBe(original.refresh_token);
    await call('get', '/api/invoices', renewed.body.id_token).expect(200);
    await call('post', '/api/session/refresh', '').send({ refresh_token: original.refresh_token }).expect(401);
    await call('get', '/api/invoices', renewed.body.id_token).expect(401);
    await call('post', '/api/session/refresh', '').send({ refresh_token: renewed.body.refresh_token }).expect(401);
  });

  it('persists login throttling in the disposable schema without creating a session', async () => {
    const before = await fixture.db.getRepository(AuthSession).count();
    for (let attempt = 0; attempt < 10; attempt++) {
      await request(app.getHttpServer()).post('/api/authenticate').send({ username: 'unknown', password }).expect(401);
    }
    await request(app.getHttpServer()).post('/api/authenticate').send({ username: 'unknown', password }).expect(429);
    expect(await fixture.db.getRepository(AuthSession).count()).toBe(before);
    const rows = await fixture.db.query('SELECT attempts FROM auth_rate_limit WHERE attempts = 11');
    expect(rows).toHaveLength(1);
  });

  // Cookies are supplied manually: these are HTTP contract tests, not browser/TLS tests.
  const web = (path: string, cookie?: string, origin = webOrigin) => {
    const req = request(app.getHttpServer()).post(path).set('X-Session-Transport', 'web');
    if (origin) req.set('Origin', origin);
    if (cookie) req.set('Cookie', cookie);
    return req;
  };
  const cookieOf = (response: request.Response) => response.headers['set-cookie'][0].split(';')[0];
  const assertCookie = (response: request.Response) => {
    const value = response.headers['set-cookie'][0];
    expect(value).toMatch(new RegExp('^' + refreshCookie + '='));
    for (const attribute of ['Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict']) expect(value).toContain(attribute);
    expect(value).not.toMatch(/Domain=/i);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.refresh_token).toBeUndefined();
  };
  const webLogin = (username: string) => web('/api/authenticate').send({ username, password }).expect(200);

  it('issues and rotates a host-only secure refresh cookie without exposing it in JSON', async () => {
    await seed('web-admin', 'ROLE_ADMIN');
    const first = await webLogin('web-admin'); assertCookie(first);
    const second = await web('/api/session/refresh', cookieOf(first)).send({}).expect(201); assertCookie(second);
    expect(cookieOf(second)).not.toBe(cookieOf(first));
    await call('get', '/api/invoices', second.body.id_token).expect(200);
    const id = cookieOf(first).split('=')[1].split('.')[0];
    const stored = await fixture.db.getRepository(AuthSession).findOneBy({ id });
    expect(stored.revoked).toBe(false);
    expect(JSON.parse(stored.usedRefreshHashes)).toHaveLength(1);
    expect(stored.refreshHash).not.toBe(cookieOf(second).split('=')[1]);
  });

  it.each(['https://evil.example.test', ''])('rejects web requests from origin %s before mutating session state', async origin => {
    const name = 'origin-' + randomUUID(); await seed(name);
    const first = await webLogin(name);
    const before = await fixture.db.getRepository(AuthSession).find({ order: { id: 'ASC' } });
    for (const path of ['/api/authenticate', '/api/session/refresh', '/api/session/logout']) {
      const response = await web(path, cookieOf(first), origin).send({ username: name, password }).expect(403);
      expect(response.headers['set-cookie']).toBeUndefined();
    }
    expect(await fixture.db.getRepository(AuthSession).find({ order: { id: 'ASC' } })).toEqual(before);
  });

  it('does not accept body refresh tokens in web mode or cookies as native credentials', async () => {
    await seed('transport-admin', 'ROLE_ADMIN');
    const native = await login('transport-admin');
    await web('/api/session/refresh').send({ refresh_token: native.refresh_token }).expect(401);
    const browser = await webLogin('transport-admin');
    await request(app.getHttpServer()).post('/api/session/refresh').set('Cookie', cookieOf(browser)).send({}).expect(401);
    await request(app.getHttpServer()).post('/api/session/logout').set('Cookie', cookieOf(browser)).expect(401);
    await call('get', '/api/invoices', browser.body.id_token).expect(200);
    await call('get', '/api/invoices', native.id_token).expect(200);
  });

  it('logs out with expired access, clears the cookie and revokes only its persisted family', async () => {
    const user = await seed('web-logout', 'ROLE_ADMIN');
    const first = await webLogin(user.login), other = await webLogin(user.login);
    const id = cookieOf(first).split('=')[1].split('.')[0];
    const jwt = new JwtService({ secret: jwtSettings.secret, signOptions: { issuer: jwtSettings.issuer, audience: jwtSettings.audience } });
    const expired = jwt.sign({ id: user.id, sid: id }, { expiresIn: -1 });
    const response = await web('/api/session/logout', cookieOf(first)).set('Authorization', 'Bearer ' + expired).expect(201);
    assertCookie(response);
    expect(response.headers['set-cookie'][0]).toContain('Expires=Thu, 01 Jan 1970');
    await call('get', '/api/invoices', first.body.id_token).expect(401);
    await web('/api/session/refresh', cookieOf(first)).send({}).expect(401);
    await call('get', '/api/invoices', other.body.id_token).expect(200);
    await web('/api/session/logout', cookieOf(first)).expect(201);
    expect((await fixture.db.getRepository(AuthSession).findOneBy({ id })).revoked).toBe(true);
  });

  it('does not revoke a web session using a forged refresh with its known family id', async () => {
    await seed('web-forged', 'ROLE_ADMIN'); const first = await webLogin('web-forged');
    const id = cookieOf(first).split('=')[1].split('.')[0];
    await web('/api/session/logout', refreshCookie + '=' + id + '.' + randomBytes(48).toString('base64url')).expect(201);
    await call('get', '/api/invoices', first.body.id_token).expect(200);
    expect((await fixture.db.getRepository(AuthSession).findOneBy({ id })).revoked).toBe(false);
  });

  it('serializes concurrent web refresh requests and revokes a proven replay family', async () => {
    await seed('web-race', 'ROLE_ADMIN'); const first = await webLogin('web-race');
    const results = await Promise.all([web('/api/session/refresh', cookieOf(first)).send({}), web('/api/session/refresh', cookieOf(first)).send({})]);
    expect(results.map(r => r.status).sort()).toEqual([201, 401]);
    const rotated = results.find(r => r.status === 201)!;
    await call('get', '/api/invoices', rotated.body.id_token).expect(401);
    await web('/api/session/refresh', cookieOf(rotated)).send({}).expect(401);
  });

  it('denies web refresh after account deactivation and persists revocation', async () => {
    const user = await seed('web-disabled'); const first = await webLogin(user.login);
    await fixture.db.getRepository(User).update(user.id, { activated: false });
    await web('/api/session/refresh', cookieOf(first)).send({}).expect(401);
    expect((await fixture.db.getRepository(AuthSession).findOneBy({ userId: user.id })).revoked).toBe(true);
  });

});
