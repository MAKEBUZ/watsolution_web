import { ConflictException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { MeterService } from './meter.service';

describe('Financial CRUD containment (T-011)', () => {
  it.each(['PENDING', 'PENDING_WITH_ORDER', 'PAID'].flatMap(state =>
    ['invoice', 'meter'].flatMap(entity => ['save', 'update', 'deleteById'].map(operation => [state, entity, operation])),
  ))('blocks %s %s %s before accessing persistence', async (state, entity, operation) => {
    const repo = { save: jest.fn(async value => value), update: jest.fn(), delete: jest.fn(), findOne: jest.fn(async () => null) };
    const service = entity === 'invoice'
      ? new InvoiceService(repo as any, repo as any, repo as any, { send: jest.fn() } as any)
      : new MeterService(repo as any, repo as any);
    const input = operation === 'deleteById' ? 1 : { id: 1, status: state === 'PAID' ? 'PAID' : 'PENDING',
      boldOrderId: state === 'PENDING_WITH_ORDER' ? 'active-order' : null, amountDue: 1, waterMeasure: 1 };
    await expect(service[operation](input)).rejects.toBeInstanceOf(ConflictException);
    for (const method of Object.values(repo)) expect(method).not.toHaveBeenCalled();
  });
});
