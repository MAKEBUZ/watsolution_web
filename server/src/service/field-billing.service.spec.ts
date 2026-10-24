import { fieldCommand, FieldBillingService } from './field-billing.service';
import { Person } from '../domain/person.entity';
import { Meter } from '../domain/meter.entity';
import { Invoice } from '../domain/invoice.entity';
import { MobileOperation } from '../domain/mobile-operation.entity';
import { MobileService } from './mobile.service';

const value = {
  operationId: '343ac377-8f2b-49d2-bf5c-3c4dd3a3c5dc',
  personId: 7,
  previousMeterId: 8,
  waterMeasure: 110,
  readingDate: '2026-10-01',
  billing: { rate: 100, fixedCharge: 5000, subsidy: 0, surcharges: 0 },
};
describe('Atomic field billing contract', () => {
  function fixture() {
    const person = { id: 7, assignedOperatorId: 2 };
    const operations = { findOneBy: jest.fn(async () => null), insert: jest.fn() };
    const meters = {
      findOne: jest.fn(async () => ({ id: 8, waterMeasure: 100, readingDate: '2026-09-01' })),
      save: jest.fn(async row => ({ ...row, id: 9 })),
    };
    const invoices = { save: jest.fn(async row => ({ ...row, id: 22 })) };
    const manager = {
      getRepository: type =>
        type === Person
          ? { findOne: async () => person }
          : type === MobileOperation
            ? operations
            : type === Meter
              ? meters
              : type === Invoice
                ? invoices
                : { findOneBy: async () => null },
    };
    const db = { transaction: async work => work(manager) };
    return { service: new FieldBillingService(db as any, new MobileService(db as any)), operations, meters, invoices };
  }
  it('creates reading and invoice from the exact offline payload and keeps an idempotent result', async () => {
    const f = fixture();
    const actor = { id: 2, login: 'synthetic', authorities: ['ROLE_ADMIN'] } as any;
    const result = await f.service.capture(actor, value);
    expect(result).toEqual(expect.objectContaining({ meterId: 9, invoiceId: 22, amountDue: 6000, operationId: value.operationId }));
    f.operations.findOneBy.mockResolvedValue(f.operations.insert.mock.calls[0][0]);
    expect(await f.service.capture(actor, value)).toEqual(result);
    expect(f.meters.save).toHaveBeenCalledTimes(1);
    expect(f.invoices.save).toHaveBeenCalledTimes(1);
    await expect(f.service.capture(actor, { ...value, waterMeasure: 111 })).rejects.toThrow('Operation content changed');
  });
  it('rejects an operator-supplied arbitrary tariff before any mutation', async () => {
    const f = fixture();
    await expect(f.service.capture({ id: 2, authorities: ['ROLE_OPERATOR'] } as any, value)).rejects.toThrow('Use the prepared tariff');
    expect(f.meters.save).not.toHaveBeenCalled();
  });
  it('rejects another operators customer', async () => {
    const f = fixture();
    await expect(f.service.capture({ id: 3, authorities: ['ROLE_OPERATOR'] } as any, value)).rejects.toThrow();
    expect(f.meters.save).not.toHaveBeenCalled();
  });
  it.each([{ amountDue: 1 }, { billing: { ...value.billing, rate: -1 } }, { tariffId: 'invalid' }])(
    'rejects manipulated fields %j',
    extra => {
      expect(() => fieldCommand({ ...value, ...extra })).toThrow();
    },
  );
});
