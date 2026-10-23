import { createHash, createHmac } from 'crypto';
import { createBillingFixture } from './billing-fixture';
import { BoldService } from '../src/service/bold.service';
import { InvoiceService } from '../src/service/invoice.service';
import { InvoiceController } from '../src/web/rest/invoice.controller';
import { PortalService } from '../src/service/portal.service';
import { PortalController } from '../src/web/rest/portal.controller';
import { Invoice } from '../src/domain/invoice.entity';
import { Person } from '../src/domain/person.entity';
import { Meter } from '../src/domain/meter.entity';
import { ActivityLog } from '../src/domain/activity-log.entity';
import { InvoiceStatus } from '../src/domain/enumeration/invoice-status';
import { PersonStatus } from '../src/domain/enumeration/person-status';

describe('Checkout, webhook, PDF and portal on PostgreSQL', () => {
  let fixture: Awaited<ReturnType<typeof createBillingFixture>>;
  let bold: BoldService;
  let invoices: InvoiceService;
  const originalSecret = process.env.BOLD_SECRET_KEY;
  const originalApi = process.env.BOLD_API_KEY;
  const notices = { send: jest.fn().mockResolvedValue(undefined) };
  beforeAll(async () => {
    process.env.BOLD_SECRET_KEY = 'synthetic-integration-secret';
    process.env.BOLD_API_KEY = 'synthetic-integration-public';
    fixture = await createBillingFixture();
    const repo = fixture.db.getRepository(Invoice);
    const logs = fixture.db.getRepository(ActivityLog);
    const users = { findOne: async () => ({ login: 'synthetic-user' }) };
    bold = new BoldService(repo, logs, users as any, notices as any);
    invoices = new InvoiceService(repo, logs, users as any, notices as any);
  });
  afterAll(async () => {
    if (fixture) await fixture.close();
    if (originalSecret === undefined) delete process.env.BOLD_SECRET_KEY; else process.env.BOLD_SECRET_KEY = originalSecret;
    if (originalApi === undefined) delete process.env.BOLD_API_KEY; else process.env.BOLD_API_KEY = originalApi;
  });
  async function newInvoice() {
    return fixture.db.getRepository(Invoice).save({ issueDate: '2026-10-01', dueDate: '2026-10-31',
      consumptionM3: 10, amountDue: 123.45, status: InvoiceStatus.PENDING });
  }
  async function webhook(reference: string, paymentId: string) {
    const payload = { type: 'SALE_APPROVED', data: { payment_id: paymentId, metadata: { reference },
      amount: { currency: 'COP', total: 123.45 } } };
    const raw = Buffer.from(JSON.stringify(payload));
    const signature = createHmac('sha256', process.env.BOLD_SECRET_KEY).update(raw.toString('base64')).digest('hex');
    await bold.processWebhook(payload, raw, signature);
  }
  it('gives twenty blocked simultaneous requests the same committed reference and amount', async () => {
    const invoice = await newInvoice();
    const blocker = fixture.db.createQueryRunner(); await blocker.connect(); await blocker.startTransaction();
    await blocker.manager.getRepository(Invoice).findOne({ where: { id: invoice.id }, lock: { mode: 'pessimistic_write' } });
    const pending = Promise.all(Array.from({ length: 20 }, () => bold.getHashForInvoice(invoice.id)));
    let waiting = 0;
    try {
      const deadline = Date.now() + 10000;
      while (Date.now() < deadline) {
        const [row] = await fixture.db.query("SELECT count(*)::integer AS n FROM pg_stat_activity WHERE application_name = $1 AND wait_event_type = 'Lock'", [fixture.schema]);
        waiting = row.n;
        if (waiting === 20) break;
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    } finally { await blocker.commitTransaction(); await blocker.release(); }
    const results = await pending;
    expect(waiting).toBe(20);
    expect(new Set(results.map(result => result.boldOrderId)).size).toBe(1);
    expect(new Set(results.map(result => result.amount))).toEqual(new Set([123.45]));
    const order = results[0].boldOrderId;
    const expected = createHash('sha256').update(`${order}123.45COPsynthetic-integration-secret`).digest('hex');
    expect(results.every(result => result.hash === expected)).toBe(true);
    expect((await fixture.db.getRepository(Invoice).findOneBy({ id: invoice.id })).boldOrderId).toBe(order);
    await Promise.all(Array.from({ length: 5 }, () => webhook(order, 'synthetic-payment')));
    expect(await fixture.db.getRepository(ActivityLog).countBy({ reference: `FAC-${invoice.id}` })).toBe(1);
    expect(await fixture.db.getRepository(Invoice).findOneBy({ id: invoice.id })).toMatchObject({ status: InvoiceStatus.PAID, boldTransactionId: 'synthetic-payment' });
    await expect(bold.getHashForInvoice(invoice.id)).rejects.toThrow('Invoice is not payable');
  });
  it('rejects an already paid invoice without assigning an order', async () => {
    const invoice = await newInvoice();
    await fixture.db.getRepository(Invoice).update(invoice.id, { status: InvoiceStatus.PAID });
    await expect(bold.getHashForInvoice(invoice.id)).rejects.toThrow('Invoice is not payable');
    expect((await fixture.db.getRepository(Invoice).findOneBy({ id: invoice.id })).boldOrderId).toBeNull();
  });
  it.each(['download', 'admin'])('preserves payment committed during %s PDF upload', async route => {
    const person = await fixture.db.getRepository(Person).save({ fullName: 'Synthetic', documentNumber: `pdf-${route}`, status: PersonStatus.ACTIVE });
    const meter = await fixture.db.getRepository(Meter).save({ waterMeasure: 10, readingDate: '2026-10-01', person });
    const invoice = await newInvoice();
    await fixture.db.getRepository(Invoice).update(invoice.id, { person, meter });
    const checkout = await bold.getHashForInvoice(invoice.id);
    const bucket = { uploadPdf: jest.fn(async () => webhook(checkout.boldOrderId, `payment-${route}`)), getPresignedUrl: jest.fn(async () => 'synthetic-url') };
    const controller = new InvoiceController(invoices, { generate: jest.fn(async () => Buffer.from('synthetic PDF')) } as any, bucket as any, notices as any);
    if (route === 'download') await controller.getDownloadUrl(invoice.id);
    else await controller.generatePdf({ user: { login: 'synthetic-admin' } } as any, invoice.id);
    expect(await fixture.db.getRepository(Invoice).findOneBy({ id: invoice.id })).toMatchObject({
      status: InvoiceStatus.PAID, boldOrderId: checkout.boldOrderId, boldTransactionId: `payment-${route}`,
      pdfUrl: `facturacion/FAC-${invoice.id}.pdf`, amountDue: '123.45',
    });
  });
  it('isolates a portal account whose login matches another owner id or email', async () => {
    const people = fixture.db.getRepository(Person);
    await people.save({ fullName: 'Owner A', documentNumber: 'portal-a', userId: '42', email: 'owner@example.test', status: PersonStatus.ACTIVE });
    const owner = await people.save({ fullName: 'Owner B', documentNumber: 'portal-b', userId: '99', status: PersonStatus.ACTIVE });
    const controller = new PortalController(new PortalService(people, fixture.db.getRepository(Invoice), fixture.db.getRepository(Meter)));
    for (const login of ['42', 'owner@example.test']) {
      expect((await controller.getDashboard({ user: { id: 99, login } } as any)).person.id).toBe(owner.id);
    }
    await expect(controller.getDashboard({ user: { id: 100, login: 'owner@example.test' } } as any)).rejects.toThrow();
  });
});
