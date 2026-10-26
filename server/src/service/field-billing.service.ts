import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { Person } from '../domain/person.entity';
import { Meter } from '../domain/meter.entity';
import { Invoice } from '../domain/invoice.entity';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { MobileOperation } from '../domain/mobile-operation.entity';
import { BillingTariff } from '../domain/billing-tariff.entity';
import { UserDTO } from './dto/user.dto';
import { MobileService, validateReading } from './mobile.service';
import { calculateBill } from './billing.service';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function fieldCommand(value: any) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some(
      k => !['operationId', 'personId', 'previousMeterId', 'waterMeasure', 'readingDate', 'observation', 'billing', 'tariffId'].includes(k),
    )
  )
    throw new BadRequestException('Invalid capture fields');
  const { billing, tariffId, ...reading } = value;
  const command = validateReading(reading);
  if (
    !billing ||
    typeof billing !== 'object' ||
    Array.isArray(billing) ||
    Object.keys(billing).some(k => !['rate', 'fixedCharge', 'subsidy', 'surcharges'].includes(k))
  )
    throw new BadRequestException('Billing snapshot required');
  const prices = {
    rate: billing.rate,
    fixedCharge: billing.fixedCharge,
    subsidy: billing.subsidy ?? 0,
    surcharges: billing.surcharges ?? 0,
  };
  calculateBill(0, prices.rate, prices.fixedCharge, prices.subsidy, prices.surcharges);
  if (tariffId !== undefined && (typeof tariffId !== 'string' || !uuid.test(tariffId)))
    throw new BadRequestException('Invalid tariff version');
  return { ...command, billing: prices, ...(tariffId ? { tariffId } : {}) };
}

@Injectable()
export class FieldBillingService {
  private readonly logger = new Logger('FieldBillingSecurity');
  constructor(
    private readonly db: DataSource,
    private readonly mobile: MobileService,
  ) {}

  async tariff() {
    const row = await this.db.getRepository(BillingTariff).findOne({ where: {}, order: { createdAt: 'DESC', id: 'DESC' } });
    return row ? { id: row.id, rate: Number(row.rate), fixedCharge: Number(row.fixedCharge), createdAt: row.createdAt } : null;
  }

  async setTariff(user: UserDTO, body: any) {
    if (!user.authorities?.includes('ROLE_ADMIN')) throw new ForbiddenException();
    if (!body || Object.keys(body).some(k => !['rate', 'fixedCharge'].includes(k))) throw new BadRequestException();
    calculateBill(0, body.rate, body.fixedCharge, 0, 0);
    const saved = await this.db
      .getRepository(BillingTariff)
      .save({ id: randomUUID(), rate: body.rate, fixedCharge: body.fixedCharge, createdAt: new Date(), createdBy: user.login });
    this.logger.log(
      JSON.stringify({
        event: 'billing.tariff.created',
        actorId: user.id,
        tariffId: saved.id,
        rate: Number(saved.rate),
        fixedCharge: Number(saved.fixedCharge),
      }),
    );
    return { id: saved.id, rate: Number(saved.rate), fixedCharge: Number(saved.fixedCharge), createdAt: saved.createdAt };
  }

  async result(user: UserDTO, id: string) {
    if (!uuid.test(id)) throw new BadRequestException();
    const row = await this.db.getRepository(MobileOperation).findOneBy({ id, userId: user.id });
    if (!row) throw new NotFoundException();
    const person = await this.db.getRepository(Person).findOneBy({ id: row.personId });
    if (!this.mobile.allowed(user, person)) throw new ForbiddenException();
    return JSON.parse(row.result);
  }

  async capture(user: UserDTO, body: unknown) {
    const command = fieldCommand(body);
    const hash = createHash('sha256').update(JSON.stringify(command)).digest('hex');
    const result = await this.db.transaction(async manager => {
      const person = await manager.getRepository(Person).findOne({ where: { id: command.personId }, lock: { mode: 'pessimistic_write' } });
      if (!this.mobile.allowed(user, person)) throw new ForbiddenException();
      const operations = manager.getRepository(MobileOperation);
      const prior = await operations.findOneBy({ id: command.operationId, userId: user.id });
      if (prior) {
        if (prior.payloadHash !== hash) throw new ConflictException('Operation content changed');
        return JSON.parse(prior.result);
      }
      const tariff = command.tariffId ? await manager.getRepository(BillingTariff).findOneBy({ id: command.tariffId }) : null;
      const prices = command.billing;
      if (!user.authorities.includes('ROLE_ADMIN')) {
        if (
          !tariff ||
          Number(tariff.rate) !== prices.rate ||
          Number(tariff.fixedCharge) !== prices.fixedCharge ||
          prices.subsidy !== 0 ||
          prices.surcharges !== 0
        )
          throw new ForbiddenException('Use the prepared tariff');
        // Old immutable tariffs remain valid for captures already queued offline.
        if (new Date(tariff.createdAt).toISOString().slice(0, 10) > command.readingDate)
          throw new ConflictException('Tariff did not exist on capture date');
      } else if (
        command.tariffId &&
        (!tariff || Number(tariff.rate) !== prices.rate || Number(tariff.fixedCharge) !== prices.fixedCharge)
      ) {
        throw new ConflictException('Tariff snapshot changed');
      }
      const meters = manager.getRepository(Meter);
      const previous = await meters.findOne({ where: { person: { id: person.id } }, order: { readingDate: 'DESC', id: 'DESC' } });
      if (!previous || previous.id !== command.previousMeterId) throw new ConflictException('Previous reading changed or missing');
      if (command.waterMeasure < Number(previous.waterMeasure) || command.readingDate < String(previous.readingDate).slice(0, 10))
        throw new ConflictException('Reading requires review');
      const consumption = (Math.round(command.waterMeasure * 100) - Math.round(Number(previous.waterMeasure) * 100)) / 100;
      const amountDue = calculateBill(consumption, prices.rate, prices.fixedCharge, prices.subsidy, prices.surcharges);
      const now = new Date();
      const meter = await meters.save({
        person: { id: person.id },
        waterMeasure: command.waterMeasure,
        readingDate: command.readingDate,
        observation: command.observation,
        createdAt: now,
        createdBy: user.login,
        lastModifiedBy: user.login,
      });
      const invoice = await manager
        .getRepository(Invoice)
        .save({
          person: { id: person.id },
          meter: { id: meter.id },
          issueDate: now,
          dueDate: new Date(now.getTime() + 30 * 86400000),
          consumptionM3: consumption,
          amountDue,
          ratePerM3: prices.rate,
          fixedCharge: prices.fixedCharge,
          subsidyPercent: prices.subsidy,
          additionalCharges: prices.surcharges,
          status: InvoiceStatus.PENDING,
          createdAt: now,
          createdBy: user.login,
          lastModifiedBy: user.login,
        });
      const result = {
        operationId: command.operationId,
        personId: person.id,
        meterId: meter.id,
        waterMeasure: command.waterMeasure,
        readingDate: command.readingDate,
        invoiceId: invoice.id,
        amountDue,
        invoiceStatus: 'confirmed',
      };
      await operations.insert({
        id: command.operationId,
        userId: user.id,
        personId: person.id,
        payloadHash: hash,
        result: JSON.stringify(result),
        createdAt: now,
      });
      return result;
    });
    this.logger.log(
      JSON.stringify({
        event: 'field.capture.confirmed',
        actorId: user.id,
        operationId: result.operationId,
        meterId: result.meterId,
        invoiceId: result.invoiceId,
        tariffId: command.tariffId ?? null,
        administrativePricing: !command.tariffId,
      }),
    );
    return result;
  }
}
