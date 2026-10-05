import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { createBillingFixture } from './billing-fixture';
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
import { jwtSettings } from '../src/security/jwt-settings';
import { PersonStatus } from '../src/domain/enumeration/person-status';
import { InvoiceStatus } from '../src/domain/enumeration/invoice-status';

describe('Financial routes with real guards and PostgreSQL', () => {
  let fixture: Awaited<ReturnType<typeof createBillingFixture>>;
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  beforeAll(async () => {
    fixture = await createBillingFixture();
    const db = fixture.db;
    const logs = db.getRepository(ActivityLog);
    const notices = { send: jest.fn() };
    const users = { findOne: jest.fn() };
    // Only identity lookup is synthetic. JWT signature/expiry and role guards remain real.
    const auth = { validateUser: async ({ id }) => id === 1 || id === 2
      ? { id, login: `synthetic-${id}`, authorities: [id === 1 ? 'ROLE_ADMIN' : 'ROLE_USER'] } : undefined };
    const module = await Test.createTestingModule({ imports: [PassportModule],
      controllers: [InvoiceController, MeterController, AdminController, MobileController],
      providers: [JwtStrategy, { provide: AuthService, useValue: auth }, { provide: DataSource, useValue: db },
        { provide: InvoiceService, useValue: new InvoiceService(db.getRepository(Invoice), logs, users as any, notices as any) },
        { provide: MeterService, useValue: new MeterService(db.getRepository(Meter), logs) },
        { provide: BillingService, useValue: new BillingService(db) }, { provide: MobileService, useValue: new MobileService(db) },
        { provide: getRepositoryToken(ActivityLog), useValue: logs }, { provide: getRepositoryToken(Person), useValue: db.getRepository(Person) },
        { provide: NotificationService, useValue: notices }, { provide: AdminStatsService, useValue: {} },
        { provide: InvoicePdfService, useValue: {} }, { provide: BucketService, useValue: {} }],
    }).compile();
    app = module.createNestApplication(); await app.init();
    const jwt = new JwtService({ secret: jwtSettings.secret, signOptions: { issuer: jwtSettings.issuer, audience: jwtSettings.audience, expiresIn: '5m' } });
    adminToken = jwt.sign({ id: 1 }); userToken = jwt.sign({ id: 2 });
  });
  afterAll(async () => { if (app) await app.close(); if (fixture) await fixture.close(); });
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
});
