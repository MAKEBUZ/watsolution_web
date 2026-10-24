import { randomUUID } from 'crypto';
import { createBillingFixture } from './billing-fixture';
import { FieldBillingService } from '../src/service/field-billing.service';
import { MobileService } from '../src/service/mobile.service';
import { Person } from '../src/domain/person.entity';
import { Meter } from '../src/domain/meter.entity';
import { Invoice } from '../src/domain/invoice.entity';
import { MobileOperation } from '../src/domain/mobile-operation.entity';
import { PersonStatus } from '../src/domain/enumeration/person-status';

describe('Offline capture billing on isolated PostgreSQL', () => {
  let fixture: Awaited<ReturnType<typeof createBillingFixture>>;
  let service: FieldBillingService;
  const admin = { id: 2, login: 'synthetic', authorities: ['ROLE_ADMIN'] } as any;
  const operator = { id: 3, login: 'operator-test', authorities: ['ROLE_OPERATOR'] } as any;
  beforeAll(async () => {
    fixture = await createBillingFixture();
    service = new FieldBillingService(fixture.db, new MobileService(fixture.db));
  });
  afterAll(async () => {
    await fixture?.close();
  });
  async function command() {
    const person = await fixture.db
      .getRepository(Person)
      .save({ fullName: 'Synthetic', documentNumber: randomUUID(), status: PersonStatus.ACTIVE, assignedOperatorId: 3 });
    const previous = await fixture.db.getRepository(Meter).save({ person, waterMeasure: 100, readingDate: '2026-01-01' });
    return {
      operationId: randomUUID(),
      personId: person.id,
      previousMeterId: previous.id,
      waterMeasure: 110,
      readingDate: new Date().toISOString().slice(0, 10),
      billing: { rate: 100, fixedCharge: 5000, subsidy: 0, surcharges: 0 },
    };
  }
  it('commits one reading and one invoice for twenty concurrent retries and later lost-ACK retry', async () => {
    const input = await command();
    const results = await Promise.all(Array.from({ length: 20 }, () => service.capture(admin, input)));
    expect(new Set(results.map(r => r.invoiceId)).size).toBe(1);
    expect(await service.capture(admin, input)).toEqual(results[0]);
    expect(await fixture.db.getRepository(Meter).countBy({ person: { id: input.personId } })).toBe(2);
    expect(await fixture.db.getRepository(Invoice).countBy({ person: { id: input.personId } })).toBe(1);
    expect(results[0].amountDue).toBe(6000);
    await expect(service.capture(admin, { ...input, waterMeasure: 111 })).rejects.toThrow('Operation content changed');
  });
  it('rolls back the reading when the invoice write fails and retries safely', async () => {
    const input = await command();
    await fixture.db.query(`ALTER TABLE "${fixture.schema}".invoice ADD CONSTRAINT synthetic_failure CHECK (amount_due < 6000) NOT VALID`);
    try {
      await expect(service.capture(admin, input)).rejects.toThrow();
    } finally {
      await fixture.db.query(`ALTER TABLE "${fixture.schema}".invoice DROP CONSTRAINT synthetic_failure`);
    }
    expect(await fixture.db.getRepository(Meter).countBy({ person: { id: input.personId } })).toBe(1);
    expect(await fixture.db.getRepository(MobileOperation).countBy({ id: input.operationId })).toBe(0);
    expect((await service.capture(admin, input)).amountDue).toBe(6000);
  });
  it('honors saved tariff versions and rejects changed assignment without losing any server record', async () => {
    const input = await command();
    const tariff = await service.setTariff(admin, { rate: 100, fixedCharge: 5000 });
    await service.setTariff(admin, { rate: 200, fixedCharge: 7000 });
    expect((await service.capture(operator, { ...input, tariffId: tariff.id })).amountDue).toBe(6000);
    const denied = await command();
    await fixture.db.getRepository(Person).update(denied.personId, { assignedOperatorId: 4 });
    await expect(service.capture(operator, { ...denied, tariffId: tariff.id })).rejects.toThrow();
    expect(await fixture.db.getRepository(Meter).countBy({ person: { id: denied.personId } })).toBe(1);
  });
});
