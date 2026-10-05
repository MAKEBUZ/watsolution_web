import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Person } from '../../domain/person.entity';
import { Invoice } from '../../domain/invoice.entity';
import { Meter } from '../../domain/meter.entity';

/** Scope the legacy read APIs. Mutations and global lists remain administrator-only. */
@Injectable()
export class RecordAccessGuard implements CanActivate {
  constructor(private readonly db: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req.user?.authorities?.includes('ROLE_ADMIN')) return true;
    if (!req.user || req.method !== 'GET') throw new ForbiddenException();
    let person: Person | undefined;
    const personId = req.params.personId;
    const invoiceId = req.route.path.startsWith('/api/bold') ? (req.params.invoiceId ?? req.query.invoiceId) : undefined;
    const id = Number(personId ?? invoiceId ?? req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) throw new ForbiddenException();
    if (personId || req.route.path.startsWith('/api/people')) {
      person = await this.db.getRepository(Person).findOneBy({ id });
    } else if (req.route.path.startsWith('/api/invoices') || req.route.path.startsWith('/api/bold')) {
      person = (await this.db.getRepository(Invoice).findOne({ where: { id }, relations: { person: true } }))?.person;
    } else if (req.route.path.startsWith('/api/meters')) {
      person = (await this.db.getRepository(Meter).findOne({ where: { id }, relations: { person: true } }))?.person;
    }
    if (!person || person.userId !== String(req.user.id)) throw new ForbiddenException();
    return true;
  }
}
