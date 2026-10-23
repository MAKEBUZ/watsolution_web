import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import * as crypto from 'crypto';
import request from 'supertest';
import { BoldService } from '../src/service/bold.service';
import { BoldController } from '../src/web/rest/bold.controller';
import { Invoice } from '../src/domain/invoice.entity';
import { Person } from '../src/domain/person.entity';
import { ActivityLog } from '../src/domain/activity-log.entity';
import { InvoiceStatus } from '../src/domain/enumeration/invoice-status';
import { PersonStatus } from '../src/domain/enumeration/person-status';
import { AuthGuard, RolesGuard } from '../src/security';
import { RecordAccessGuard } from '../src/security/guards/record-access.guard';
import { createBillingFixture } from './billing-fixture';

describe('Bold backend integration', () => {
  let fixture: Awaited<ReturnType<typeof createBillingFixture>>;
  let db: DataSource;
  let app: INestApplication;
  let service: BoldService;
  let invoices: Repository<Invoice>;
  let invoiceId: number;
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
  const current = () => invoices.findOneByOrFail({ id: invoiceId });

  beforeAll(async () => {
    // PostgreSQL row locks and rollback are part of the payment contract.
    fixture = await createBillingFixture();
    db = fixture.db;
    invoices = db.getRepository(Invoice);
    service = new BoldService(invoices, db.getRepository(ActivityLog), users as any, notifications as any);
    const module = await Test.createTestingModule({
      controllers: [BoldController],
      providers: [{ provide: BoldService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RecordAccessGuard)
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
    await db.getRepository(Person).save({ id: 1, fullName: 'Customer', documentNumber: 'synthetic-1', userId: '1', status: PersonStatus.ACTIVE });
    const invoice = await invoices.save({
      issueDate: '2026-10-01',
      dueDate: '2026-10-31',
      consumptionM3: 10,
      amountDue: 15000,
      status: InvoiceStatus.PENDING,
      boldOrderId: 'INV-1-existing',
      person: { id: 1 },
    });
    invoiceId = invoice.id;
  });
  afterAll(async () => {
    process.env = originalEnv;
    await app?.close();
    await fixture?.close();
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
    await invoices.update(invoiceId, { status: InvoiceStatus.CANCELLED });
    await deliver().expect(400);
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
    await db.query("CREATE FUNCTION fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test failure'; END; $$");
    await db.query('CREATE TRIGGER fail_audit BEFORE INSERT ON activity_log FOR EACH ROW EXECUTE FUNCTION fail_audit()');
    try {
      await expect(
        service.processWebhook(event(), Buffer.from(JSON.stringify(event())), signature(JSON.stringify(event()))),
      ).rejects.toThrow('test failure');
      expect((await current()).status).toBe(InvoiceStatus.PENDING);
      expect(notifications.send).not.toHaveBeenCalled();
    } finally {
      await db.query('DROP TRIGGER fail_audit ON activity_log');
      await db.query('DROP FUNCTION fail_audit()');
    }
    await deliver().expect(200);
  });
  it('keeps a committed payment when notification delivery fails', async () => {
    notifications.send.mockRejectedValueOnce(new Error('notification unavailable'));
    await deliver().expect(200);
    expect((await current()).status).toBe(InvoiceStatus.PAID);
  });
  it('reuses an existing reference and generates the correct hash', async () => {
    const first = await service.getHashForInvoice(invoiceId);
    expect(await service.getHashForInvoice(invoiceId)).toEqual(first);
    expect(first.hash).toBe(crypto.createHash('sha256').update('INV-1-existing15000COPtest-secret').digest('hex'));
  });
  it('assigns only one reference across concurrent initial requests', async () => {
    await invoices.update(invoiceId, { boldOrderId: null });
    const results = await Promise.all([service.getHashForInvoice(invoiceId), service.getHashForInvoice(invoiceId)]);
    expect(results[0].boldOrderId).toBe(results[1].boldOrderId);
    expect((await current()).boldOrderId).toBe(results[0].boldOrderId);
  });
  it.each([InvoiceStatus.PAID, InvoiceStatus.CANCELLED])('does not generate a hash for %s invoices', async status => {
    await invoices.update(invoiceId, { status });
    await expect(service.getHashForInvoice(invoiceId)).rejects.toThrow('Invoice is not payable');
  });
  it('rejects another invoice reference before querying Bold', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    await expect(service.processResult(invoiceId, 'OTHER')).rejects.toThrow('does not belong');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('keeps a browser result pending until the signed webhook confirms payment', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          reference_id: 'INV-1-existing',
          payment_status: 'APPROVED',
          total: 15000,
        }),
    } as Response);
    expect(await service.processResult(invoiceId, 'INV-1-existing')).toEqual({ boldStatus: 'UNKNOWN', invoiceStatus: InvoiceStatus.PENDING });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await db.getRepository(ActivityLog).count()).toBe(0);
    await deliver().expect(200);
    expect(await service.processResult(invoiceId, 'INV-1-existing')).toEqual({ boldStatus: 'APPROVED', invoiceStatus: InvoiceStatus.PAID });
    await deliver().expect(200);
    expect((await current()).boldTransactionId).toBe('payment-123');
    expect(await db.getRepository(ActivityLog).count()).toBe(1);
    expect(notifications.send).toHaveBeenCalledTimes(1);
  });
  it('does not use an external API response as browser payment evidence', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reference_id: 'OTHER', payment_status: 'APPROVED', total: 15000 }),
    } as Response);
    expect(await service.processResult(invoiceId, 'INV-1-existing')).toEqual({ boldStatus: 'UNKNOWN', invoiceStatus: InvoiceStatus.PENDING });
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await current()).status).toBe(InvoiceStatus.PENDING);
  });
  it('can read local payment status even if the payment API is unavailable', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));
    expect(await service.processResult(invoiceId, 'INV-1-existing')).toEqual({ boldStatus: 'UNKNOWN', invoiceStatus: InvoiceStatus.PENDING });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
