import { createHash } from 'crypto';
import { BoldService } from './bold.service';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';

describe('Atomic checkout reference (T-009)', () => {
  const originalSecret = process.env.BOLD_SECRET_KEY;
  const originalApi = process.env.BOLD_API_KEY;
  beforeEach(() => { process.env.BOLD_SECRET_KEY = 'synthetic'; process.env.BOLD_API_KEY = 'synthetic-public'; });
  afterEach(() => {
    if (originalSecret === undefined) delete process.env.BOLD_SECRET_KEY; else process.env.BOLD_SECRET_KEY = originalSecret;
    if (originalApi === undefined) delete process.env.BOLD_API_KEY; else process.env.BOLD_API_KEY = originalApi;
  });
  function fixture() {
    const row: any = { id: 1, boldOrderId: null, amountDue: '123.45', status: InvoiceStatus.PENDING };
    let queue = Promise.resolve();
    const locked = { findOne: jest.fn(async () => ({ ...row })), update: jest.fn(async (_id, changes) => Object.assign(row, changes)) };
    const repo = {
      findOne: jest.fn(async () => ({ ...row })), update: locked.update,
      manager: { transaction: jest.fn(fn => {
        const result = queue.then(() => fn({ getRepository: () => locked }));
        queue = result.then(() => undefined, () => undefined); return result;
      }) },
    };
    return { row, locked, repo, service: new BoldService(repo as any, {} as any, {} as any, {} as any) };
  }
  it('returns one stable order and signature to twenty simultaneous requests', async () => {
    const f = fixture();
    const results = await Promise.all(Array.from({ length: 20 }, () => f.service.getHashForInvoice(1)));
    expect(new Set(results.map(result => result.boldOrderId)).size).toBe(1);
    expect(new Set(results.map(result => result.hash)).size).toBe(1);
    expect(f.locked.update).toHaveBeenCalledTimes(1);
    expect(f.locked.findOne).toHaveBeenCalledWith({ where: { id: 1 }, lock: { mode: 'pessimistic_write' } });
    expect(results[0].hash).toBe(createHash('sha256').update(`${f.row.boldOrderId}123.45COPsynthetic`).digest('hex'));
    expect(f.repo.findOne).not.toHaveBeenCalled();
  });
  it('reuses an existing reference without rewriting it', async () => {
    const f = fixture(); f.row.boldOrderId = 'existing';
    expect((await f.service.getHashForInvoice(1)).boldOrderId).toBe('existing');
    expect(f.locked.update).not.toHaveBeenCalled();
  });
  it('reads payment status inside the transaction', async () => {
    const f = fixture(); f.locked.findOne.mockResolvedValue({ ...f.row, status: InvoiceStatus.PAID });
    await expect(f.service.getHashForInvoice(1)).rejects.toThrow('Invoice is not payable');
    expect(f.locked.update).not.toHaveBeenCalled();
  });
  it.each([0, -1, NaN, Infinity])('does not create an order for invalid amount %s', async amount => {
    const f = fixture(); f.row.amountDue = amount;
    await expect(f.service.getHashForInvoice(1)).rejects.toThrow(); expect(f.locked.update).not.toHaveBeenCalled();
  });
  it('fails without payment configuration before modifying an invoice', async () => {
    const f = fixture(); delete process.env.BOLD_SECRET_KEY;
    await expect(f.service.getHashForInvoice(1)).rejects.toThrow('Payment configuration unavailable');
    expect(f.locked.update).not.toHaveBeenCalled();
  });
  it('does not return an order if commit fails', async () => {
    const f = fixture(); f.repo.manager.transaction.mockRejectedValue(new Error('synthetic commit failure'));
    await expect(f.service.getHashForInvoice(1)).rejects.toThrow('synthetic commit failure');
  });
});
