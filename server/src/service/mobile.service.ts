import { BadRequestException, ConflictException, ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource, MoreThan } from 'typeorm';
import { createHash, createPrivateKey, sign } from 'crypto';
import { Person } from '../domain/person.entity';
import { Meter } from '../domain/meter.entity';
import { UserDTO } from './dto/user.dto';
import { MobileOperation } from '../domain/mobile-operation.entity';

export interface ReadingCommand {
  operationId: string;
  personId: number;
  previousMeterId: number | null;
  waterMeasure: number;
  readingDate: string;
  observation?: string;
}

export function validateReading(value: any): ReadingCommand {
  const allowed = ['operationId', 'personId', 'previousMeterId', 'waterMeasure', 'readingDate', 'observation'];
  if (!value || Array.isArray(value) || Object.keys(value).some(k => !allowed.includes(k))) throw new BadRequestException('Invalid command fields');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.operationId) || !Number.isSafeInteger(value.personId) || value.personId < 1) throw new BadRequestException('Invalid identifiers');
  if (value.previousMeterId !== null && (!Number.isSafeInteger(value.previousMeterId) || value.previousMeterId < 1)) throw new BadRequestException('Previous reading required');
  if (!Number.isFinite(value.waterMeasure) || value.waterMeasure < 0 || value.waterMeasure > 99999999.99 || Math.abs(value.waterMeasure * 100 - Math.round(value.waterMeasure * 100)) > 0.00001) throw new BadRequestException('Invalid reading');
  if (typeof value.readingDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.readingDate) || Number.isNaN(Date.parse(value.readingDate)) || new Date(value.readingDate).toISOString().slice(0, 10) !== value.readingDate || value.readingDate > new Date().toISOString().slice(0, 10)) throw new BadRequestException('Invalid date');
  if (value.observation !== undefined && (typeof value.observation !== 'string' || value.observation.length > 500)) throw new BadRequestException('Observation too long');
  return { operationId: value.operationId, personId: value.personId, previousMeterId: value.previousMeterId, waterMeasure: value.waterMeasure, readingDate: value.readingDate, observation: value.observation ?? '' };
}

@Injectable()
export class MobileService {
  constructor(private readonly db: DataSource) {}

  allowed(user: UserDTO, person: Person) {
    return !!person && (user.authorities?.includes('ROLE_ADMIN') || (user.authorities?.includes('ROLE_OPERATOR') && person.assignedOperatorId === user.id));
  }

  permit(user: UserDTO, installationId: string) {
    if (!/^[0-9a-f-]{36}$/i.test(installationId)) throw new BadRequestException('Invalid installation');
    const encoded = process.env.OFFLINE_SIGNING_KEY_BASE64;
    if (!encoded) throw new ServiceUnavailableException('Offline signing is not configured');
    const key = createPrivateKey({ key: Buffer.from(encoded, 'base64'), format: 'der', type: 'pkcs8' });
    if (key.asymmetricKeyType !== 'ed25519') throw new ServiceUnavailableException('Offline signing configuration invalid');
    const now = Math.floor(Date.now() / 1000);
    const head = Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ iss: 'watsolution-api', aud: 'watsolution-offline', sub: String(user.id), installationId, iat: now, exp: now + 12 * 3600 })).toString('base64url');
    const content = `${head}.${body}`;
    return `${content}.${sign(null, Buffer.from(content), key).toString('base64url')}`;
  }

  async bootstrap(user: UserDTO, after = 0) {
    if (!Number.isSafeInteger(after) || after < 0) throw new BadRequestException();
    const admin = user.authorities.includes('ROLE_ADMIN');
    const people = await this.db.getRepository(Person).find({ where: admin ? { id: MoreThan(after) } : { id: MoreThan(after), assignedOperatorId: user.id }, relations: { address: true }, take: 101, order: { id: 'ASC' } });
    const more = people.length > 100;
    const rows = [];
    for (const person of people.slice(0, 100)) {
      const last = await this.db.getRepository(Meter).findOne({ where: { person: { id: person.id } }, order: { readingDate: 'DESC', id: 'DESC' } });
      rows.push({ id: person.id, fullName: person.fullName, subscriberNumber: person.subscriberNumber, address: person.address ? { neighborhood: person.address.neighborhood, street: person.address.street, houseNumber: person.address.houseNumber, city: person.address.city } : null, previousMeterId: last?.id ?? null, previousReading: last ? Number(last.waterMeasure) : null, previousDate: last?.readingDate ?? null });
    }
    return { people: rows, next: more ? rows[rows.length - 1].id : null, serverTime: new Date().toISOString() };
  }

  async capture(user: UserDTO, value: unknown) {
    const command = validateReading(value);
    const hash = createHash('sha256').update(JSON.stringify(command)).digest('hex');
    return this.db.transaction(async manager => {
      // Lock the person to serialize concurrent captures AND assignment changes.
      const person = await manager.getRepository(Person).findOne({ where: { id: command.personId }, lock: { mode: 'pessimistic_write' } });
      if (!this.allowed(user, person)) throw new ForbiddenException();
      const operations = manager.getRepository(MobileOperation);
      const prior = await operations.findOneBy({ userId: user.id, id: command.operationId });
      if (prior) {
        if (prior.payloadHash !== hash) throw new ConflictException('Operation identifier reused with different data');
        return JSON.parse(prior.result);
      }
      const meters = manager.getRepository(Meter);
      const previous = await meters.findOne({ where: { person: { id: person.id } }, order: { readingDate: 'DESC', id: 'DESC' } });
      if ((previous?.id ?? null) !== command.previousMeterId) throw new ConflictException('The previous reading changed. Review this capture.');
      if (previous && (command.waterMeasure < Number(previous.waterMeasure) || command.readingDate <= String(previous.readingDate).slice(0, 10))) throw new ConflictException('Reading or date requires review');
      const meter = await meters.save({ waterMeasure: command.waterMeasure, readingDate: command.readingDate, observation: command.observation, person: { id: person.id }, createdAt: new Date(), createdBy: user.login, lastModifiedBy: user.login });
      const result = { operationId: command.operationId, meterId: meter.id, personId: person.id, waterMeasure: Number(meter.waterMeasure), readingDate: command.readingDate, invoiceStatus: 'not_requested' };
      await operations.insert({ id: command.operationId, userId: user.id, personId: person.id, payloadHash: hash, result: JSON.stringify(result), createdAt: new Date() });
      return result;
    });
  }
}
