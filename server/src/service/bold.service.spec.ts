import { createHmac } from 'crypto';
import { BoldService } from './bold.service';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';

describe('Payment evidence', () => {
  const original = process.env.BOLD_SECRET_KEY;
  afterEach(() => { if (original === undefined) delete process.env.BOLD_SECRET_KEY; else process.env.BOLD_SECRET_KEY = original; });
  function fixture() {
    const invoice = { id: 1, boldOrderId: 'test-order', amountDue: '100.00', status: InvoiceStatus.PENDING };
    const repo = { findOne: jest.fn(async () => invoice), save: jest.fn(), manager: { transaction: jest.fn(async fn => fn({getRepository: () => repo})) } };
    const service = new BoldService(repo as any, {} as any, {} as any, {} as any);
    return { service, repo, invoice };
  }
  it('fails closed without the verification key', async () => {
    delete process.env.BOLD_SECRET_KEY; const f=fixture();
    await expect(f.service.processWebhook({}, Buffer.from('{}'), '')).rejects.toThrow(); expect(f.repo.manager.transaction).not.toHaveBeenCalled();
  });
  it('rejects a modified raw body', async () => {
    process.env.BOLD_SECRET_KEY='synthetic-test-key'; const f=fixture();
    const signature=createHmac('sha256','synthetic-test-key').update(Buffer.from('{}').toString('base64')).digest('hex');
    await expect(f.service.processWebhook({},Buffer.from('{ }'),signature)).rejects.toThrow();
  });
  it('rejects a valid signature with the wrong invoice amount', async () => {
    process.env.BOLD_SECRET_KEY='synthetic-test-key'; const f=fixture();
    const body={type:'SALE_APPROVED',data:{payment_id:'synthetic',metadata:{reference:'test-order'},amount:{currency:'COP',total:1}}};
    const raw=Buffer.from(JSON.stringify(body));const signature=createHmac('sha256','synthetic-test-key').update(raw.toString('base64')).digest('hex');
    await expect(f.service.processWebhook(body,raw,signature)).rejects.toThrow('Payment amount mismatch'); expect(f.repo.save).not.toHaveBeenCalled();
  });
  it('never accepts an unrelated order from a browser redirect', async () => {
    const f=fixture(); await expect(f.service.processResult(1,'other')).rejects.toThrow(); expect(f.repo.save).not.toHaveBeenCalled();
  });
  it('does not mark an invoice paid from a browser result request', async () => {
    const f=fixture(); expect(await f.service.processResult(1,'test-order')).toEqual({boldStatus:'UNKNOWN',invoiceStatus:InvoiceStatus.PENDING}); expect(f.repo.save).not.toHaveBeenCalled();
  });
});
