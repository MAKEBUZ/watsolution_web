import { MobileService } from './mobile.service';
import { Person } from '../domain/person.entity';
import { Meter } from '../domain/meter.entity';
import { MobileOperation } from '../domain/mobile-operation.entity';
describe('Mobile capture boundaries', () => {
  const command = { operationId: '343ac377-8f2b-49d2-bf5c-3c4dd3a3c5dc', personId: 7, previousMeterId: 8, waterMeasure: 21.55, readingDate: '2026-01-02' };
  const user = { id: 2, login: 'operator', authorities: ['ROLE_OPERATOR'] };
  function fixture() {
    let saved;
    const people = { findOne: jest.fn(async () => ({ id: 7, assignedOperatorId: 2 })) };
    const meters = { findOne: jest.fn(async () => ({ id: 8, waterMeasure: 20, readingDate: '2026-01-01' })), save: jest.fn(async value => ({ ...value, id: 9 })) };
    const operations = { findOneBy: jest.fn(async () => saved), insert: jest.fn(async value => { saved = value; }) };
    const db = { transaction: async fn => fn({ getRepository: type => type === Person ? people : type === Meter ? meters : type === MobileOperation ? operations : null }) };
    return { service: new MobileService(db as any), people, meters, operations };
  }
  it('returns the original confirmation after a lost acknowledgment without another reading', async () => {
    const f = fixture(); const first = await f.service.capture(user as any, command);
    expect(await f.service.capture(user as any, command)).toEqual(first); expect(f.meters.save).toHaveBeenCalledTimes(1);
  });
  it('rejects changed payload under the same operation id', async () => {
    const f = fixture(); await f.service.capture(user as any, command);
    await expect(f.service.capture(user as any, { ...command, waterMeasure: 22 })).rejects.toThrow(); expect(f.meters.save).toHaveBeenCalledTimes(1);
  });
  it('checks current assignment even for a previously acknowledged operation', async () => {
    const f = fixture(); await f.service.capture(user as any, command);
    f.people.findOne.mockResolvedValue({ id: 7, assignedOperatorId: 3 });
    await expect(f.service.capture(user as any, command)).rejects.toThrow(); expect(f.meters.save).toHaveBeenCalledTimes(1);
  });
  it('keeps a stale baseline in conflict instead of overwriting newer server data', async () => {
    const f = fixture(); await expect(f.service.capture(user as any, { ...command, previousMeterId: 6 })).rejects.toThrow();
    expect(f.meters.save).not.toHaveBeenCalled(); expect(f.operations.insert).not.toHaveBeenCalled();
  });
});

describe('Mobile access reconciliation', () => {
  it('restricts operators to assigned identifiers and returns no personal fields', async () => {
    const find = jest.fn(async (_options: unknown) => [{ id: 7 }]);
    const service = new MobileService({ getRepository: () => ({ find }) } as any);
    const result = await service.access({ id: 2, authorities: ['ROLE_OPERATOR'] } as any, [7, 8]);
    expect(result).toEqual({ allowedIds: [7] });
    expect(find.mock.calls[0][0]).toMatchObject({ select: { id: true }, where: { assignedOperatorId: 2 } });
  });
  it('rejects oversized and malformed batches before querying', async () => {
    const getRepository = jest.fn();
    const service = new MobileService({ getRepository } as any);
    for (const ids of [null, [0], ['7'], Array(101).fill(7)]) {
      await expect(service.access({ id: 2, authorities: ['ROLE_OPERATOR'] } as any, ids)).rejects.toThrow();
    }
    expect(getRepository).not.toHaveBeenCalled();
  });
  it('denies customer access even when invoked outside the controller', async () => {
    const service = new MobileService({ getRepository: jest.fn() } as any);
    await expect(service.access({ id: 2, authorities: ['ROLE_USER'] } as any, [7])).rejects.toThrow();
  });
});
