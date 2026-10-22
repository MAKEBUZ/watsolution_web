import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource, EntitySchema, Repository } from 'typeorm';
import * as crypto from 'crypto';
import request from 'supertest';
import { BoldService } from '../../src/service/bold.service';
import { BoldController } from '../../src/web/rest/bold.controller';
import { Invoice } from '../../src/domain/invoice.entity';
import { ActivityLog } from '../../src/domain/activity-log.entity';
import { InvoiceStatus } from '../../src/domain/enumeration/invoice-status';
import { AuthGuard, RolesGuard } from '../../src/security';

// Real TypeORM transactions against an isolated database; the minimal schemas avoid
// unrelated application migrations and PostgreSQL-only timestamp/vector columns.
const invoiceSchema = new EntitySchema<Invoice>({
  name: 'Invoice',
  target: Invoice,
  columns: {
    id: { type: Number, primary: true, generated: true },
    issueDate: { type: String },
    amountDue: { type: Number },
    status: { type: String },
    boldOrderId: { type: String, nullable: true },
    boldTransactionId: { type: String, nullable: true },
  },
  relations: { person: { type: 'many-to-one', target: 'TestPerson', joinColumn: true, nullable: true } },
});
const personSchema = new EntitySchema({
  name: 'TestPerson',
  columns: {
    id: { type: Number, primary: true },
    fullName: { type: String },
    userId: { type: String },
  },
});
const logSchema = new EntitySchema<ActivityLog>({
  name: 'ActivityLog',
  target: ActivityLog,
  columns: {
    id: { type: Number, primary: true, generated: true },
    action: { type: String },
    description: { type: String },
    reference: { type: String },
    amount: { type: Number },
    personName: { type: String, nullable: true },
    createdAt: { type: Date },
  },
});

describe('Bold backend integration', () => {
  let db: DataSource;
  let app: INestApplication;
  let service: BoldService;
  let invoices: Repository<Invoice>;
  const notifications = { send: jest.fn() };
  const users = { findOne: jest.fn() };
  const originalEnv = { ...process.env };
  const event = (type = 'SALE_APPROVED') => ({
    type,
    data: {
      payment_id: 'payment-123',
      metadata: { reference: 'INV-1-existing' },
      amount: { total: 15000, currency: 'COP' },
    },
  });
  const signature = (body: string) => crypto.createHmac('sha256', 'test-secret').update(Buffer.from(body).toString('base64')).digest('hex');
  const deliver = (payload = event()) => {
    const raw = JSON.stringify(payload, null, 2);
    return request(app.getHttpServer())
      .post('/api/bold/webhook')
      .set('Content-Type', 'application/json')
      .set('x-bold-signature', signature(raw))
      .send(raw);
  };
  const current = () => invoices.findOneByOrFail({ id: 1 });

  beforeAll(async () => {
    db = await new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [invoiceSchema, personSchema, logSchema],
      synchronize: true,
    }).initialize();
    invoices = db.getRepository(Invoice);
    service = new BoldService(invoices, users as any, notifications as any);
    const module = await Test.createTestingModule({
      controllers: [BoldController],
      providers: [{ provide: BoldService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication({ rawBody: true });
    await app.init();
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    notifications.send.mockReset().mockResolvedValue(undefined);
    users.findOne.mockReset().mockResolvedValue({ login: 'customer' });
    process.env.BOLD_SECRET_KEY = 'test-secret';
    process.env.BOLD_API_KEY = 'test-api-key';
    await db.getRepository(ActivityLog).clear();
    await invoices.clear();
    await db.getRepository('TestPerson').save({ id: 1, fullName: 'Customer', userId: '1' });
    await invoices.save({
      id: 1,
      issueDate: '2026-10-01',
      amountDue: 15000,
      status: InvoiceStatus.PENDING,
      boldOrderId: 'INV-1-existing',
      person: { id: 1 },
    });
  });
  afterAll(async () => {
    process.env = originalEnv;
    await app?.close();
    await db?.destroy();
  });

  it('accepts the original formatted body and persists payment, transaction and audit entry', async () => {
    await deliver().expect(200, 'OK');
    expect(await current()).toMatchObject({ status: InvoiceStatus.PAID, boldTransactionId: 'payment-123' });
    expect(await db.getRepository(ActivityLog).count()).toBe(1);
    expect(notifications.send).toHaveBeenCalledTimes(1);
  });
  it('handles duplicate delivery without duplicate audit entries or notifications', async () => {
    await deliver().expect(200);
    await deliver().expect(200);
    expect(await db.getRepository(ActivityLog).count()).toBe(1);
    expect(notifications.send).toHaveBeenCalledTimes(1);
  });
  it.each(['', 'bad', '0'.repeat(64)])('rejects invalid signatures (%s)', async sig => {
    await request(app.getHttpServer()).post('/api/bold/webhook').set('x-bold-signature', sig).send(event()).expect(401);
    expect((await current()).status).toBe(InvoiceStatus.PENDING);
  });
  it('rejects a tampered raw body', async () => {
    const raw = JSON.stringify(event());
    await request(app.getHttpServer())
      .post('/api/bold/webhook')
      .set('Content-Type', 'application/json')
      .set('x-bold-signature', signature(raw))
      .send(raw + ' ')
      .expect(401);
  });
  it('fails closed when the secret is absent even if legacy bypass is enabled', async () => {
    delete process.env.BOLD_SECRET_KEY;
    process.env.BOLD_WEBHOOK_SKIP_VERIFY = 'true';
    await deliver().expect(503);
    expect((await current()).status).toBe(InvoiceStatus.PENDING);
  });
  it.each(['SALE_REJECTED', 'VOID_REJECTED', 'VOID_APPROVED', 'UNKNOWN'])('does not cancel a pending or paid invoice on %s', async type => {
    await deliver(event(type)).expect(200);
    expect((await current()).status).toBe(InvoiceStatus.PENDING);
    await deliver().expect(200);
    await deliver(event(type)).expect(200);
    expect((await current()).status).toBe(InvoiceStatus.PAID);
  });
  it('does not revive a cancelled invoice', async () => {
    await invoices.update(1, { status: InvoiceStatus.CANCELLED });
    await deliver().expect(200);
    expect((await current()).status).toBe(InvoiceStatus.CANCELLED);
    expect(await db.getRepository(ActivityLog).count()).toBe(0);
  });
  it.each([
    { total: 1, currency: 'COP' },
    { total: 15000, currency: 'USD' },
  ])('rejects mismatched amount or currency', async amount => {
    const payload = event();
    payload.data.amount = amount;
    await deliver(payload).expect(400);
    expect((await current()).status).toBe(InvoiceStatus.PENDING);
  });
  it('acknowledges unknown references without modifying invoices', async () => {
    const payload = event();
    payload.data.metadata.reference = 'OTHER';
    await deliver(payload).expect(200);
    expect((await current()).status).toBe(InvoiceStatus.PENDING);
  });
  it('rejects an approved event without payment identity', async () => {
    const payload = event();
    delete payload.data.payment_id;
    await deliver(payload).expect(400);
  });
  it('rolls back payment if the audit insert fails, then accepts a retry', async () => {
    await db.query("CREATE TRIGGER fail_audit BEFORE INSERT ON activity_log BEGIN SELECT RAISE(ABORT, 'test failure'); END");
    try {
      await expect(
        service.processWebhook(event(), Buffer.from(JSON.stringify(event())), signature(JSON.stringify(event()))),
      ).rejects.toThrow('test failure');
      expect((await current()).status).toBe(InvoiceStatus.PENDING);
      expect(notifications.send).not.toHaveBeenCalled();
    } finally {
      await db.query('DROP TRIGGER fail_audit');
    }
    await deliver().expect(200);
  });
  it('keeps a committed payment when notification delivery fails', async () => {
    notifications.send.mockRejectedValueOnce(new Error('notification unavailable'));
    await deliver().expect(200);
    expect((await current()).status).toBe(InvoiceStatus.PAID);
  });
  it('reuses an existing reference and generates the correct hash', async () => {
    const first = await service.getHashForInvoice(1);
    expect(await service.getHashForInvoice(1)).toEqual(first);
    expect(first.hash).toBe(crypto.createHash('sha256').update('INV-1-existing15000COPtest-secret').digest('hex'));
  });
  it('assigns only one reference across concurrent initial requests', async () => {
    await invoices.update(1, { boldOrderId: null });
    const results = await Promise.all([service.getHashForInvoice(1), service.getHashForInvoice(1)]);
    expect(results[0].boldOrderId).toBe(results[1].boldOrderId);
    expect((await current()).boldOrderId).toBe(results[0].boldOrderId);
  });
  it.each([InvoiceStatus.PAID, InvoiceStatus.CANCELLED])('does not generate a hash for %s invoices', async status => {
    await invoices.update(1, { status });
    await expect(service.getHashForInvoice(1)).rejects.toThrow('Invoice is not pending');
  });
  it('rejects another invoice reference before querying Bold', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    await expect(service.processResult(1, 'OTHER')).rejects.toThrow('does not belong');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('uses authenticated API confirmation and deduplicates the subsequent webhook', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          reference_id: 'INV-1-existing',
          payment_status: 'APPROVED',
          total: 15000,
        }),
    } as Response);
    expect(await service.processResult(1, 'INV-1-existing')).toEqual({ boldStatus: 'APPROVED', invoiceStatus: InvoiceStatus.PAID });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: { Authorization: 'x-api-key test-api-key' } }),
    );
    await deliver().expect(200);
    expect((await current()).boldTransactionId).toBe('payment-123');
    expect(await db.getRepository(ActivityLog).count()).toBe(1);
    expect(notifications.send).toHaveBeenCalledTimes(1);
  });
  it('rejects API responses with a mismatched reference', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reference_id: 'OTHER', payment_status: 'APPROVED', total: 15000 }),
    } as Response);
    await expect(service.processResult(1, 'INV-1-existing')).rejects.toThrow('does not match');
    expect((await current()).status).toBe(InvoiceStatus.PENDING);
  });
  it('leaves invoices pending on API failure', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));
    expect(await service.processResult(1, 'INV-1-existing')).toEqual({ boldStatus: 'UNKNOWN', invoiceStatus: InvoiceStatus.PENDING });
  });
});
