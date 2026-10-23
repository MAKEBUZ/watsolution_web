import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { Meter } from '../domain/meter.entity';
import { Invoice } from '../domain/invoice.entity';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { BillingFormDTO } from './dto/billing-form.dto';

export function calculateBill(consumption: number, rate: number, fixed: number, subsidy: number, extra: number) {
  if ([consumption, rate, fixed, subsidy, extra].some(v => !Number.isFinite(v) || v < 0) || subsidy > 1 || [consumption, rate, fixed, extra].some(v => v > 99999999.99 || Math.abs(v * 100 - Math.round(v * 100)) > 0.00001) || Math.abs(subsidy * 10000 - Math.round(subsidy * 10000)) > 0.00001) throw new BadRequestException('Invalid billing values');
  const units = BigInt(Math.round(consumption * 100));
  const rateCents = BigInt(Math.round(rate * 100));
  const subtotal = (units * rateCents + 50n) / 100n + BigInt(Math.round(fixed * 100));
  const total = (subtotal * BigInt(10000 - Math.round(subsidy * 10000)) + 5000n) / 10000n + BigInt(Math.round(extra * 100));
  if (total > 9999999999n) throw new BadRequestException('Amount exceeds supported precision');
  return Number(total) / 100;
}

@Injectable()
export class BillingService {
  constructor(private readonly db: DataSource) {}
  async generate(actor: string, dto: BillingFormDTO) {
    if (!Number.isSafeInteger(dto.meterId) || dto.meterId < 1 || !Number.isSafeInteger(dto.personId) || dto.personId < 1) throw new BadRequestException('Select a confirmed reading');
    return this.db.transaction(async manager => {
      const meters = manager.getRepository(Meter);
      const locked = await meters.findOne({ where: { id: dto.meterId }, lock: { mode: 'pessimistic_write' } });
      if (!locked) throw new BadRequestException('Reading unavailable');
      const meter = await meters.findOne({ where: { id: dto.meterId }, relations: { person: true } });
      if (meter.person?.id !== dto.personId) throw new BadRequestException('Reading does not belong to this person');
      const invoices = manager.getRepository(Invoice);
      const existing = await invoices.findOne({ where: { meter: { id: meter.id } } });
      if (existing) return existing;
      const previous = await meters.findOne({ where: [
        { person: { id: dto.personId }, readingDate: LessThan(meter.readingDate) },
        { person: { id: dto.personId }, readingDate: meter.readingDate, id: LessThan(meter.id) },
      ], order: { readingDate: 'DESC', id: 'DESC' } });
      if (!previous) throw new ConflictException('The initial reading has no billing baseline');
      const consumption = (Math.round(Number(meter.waterMeasure) * 100) - Math.round(Number(previous.waterMeasure) * 100)) / 100;
      const amount = calculateBill(consumption, dto.rate, dto.fixedCharge, dto.subsidy ?? 0, dto.surcharges ?? 0);
      const now = new Date();
      return invoices.save({ person: { id: dto.personId }, meter: { id: meter.id }, issueDate: now, dueDate: new Date(now.getTime() + 30 * 86400000), consumptionM3: consumption, amountDue: amount, ratePerM3: dto.rate, fixedCharge: dto.fixedCharge, subsidyPercent: dto.subsidy ?? 0, additionalCharges: dto.surcharges ?? 0, status: InvoiceStatus.PENDING, createdBy: actor, lastModifiedBy: actor, createdAt: now });
    });
  }
}
