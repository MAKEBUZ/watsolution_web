import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Subject, Observable } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification, NotificationType } from '../domain/notification.entity';
import { Invoice } from '../domain/invoice.entity';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';

interface SseEvent {
  data: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger('NotificationService');
  private readonly streams = new Map<string, Subject<SseEvent>>();

  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  subscribe(userLogin: string): Observable<SseEvent> {
    const prev = this.streams.get(userLogin);
    if (prev) prev.complete();

    const subject = new Subject<SseEvent>();
    this.streams.set(userLogin, subject);

    subject.subscribe({ complete: () => this.streams.delete(userLogin) });
    return subject.asObservable();
  }

  async send(userLogin: string, type: NotificationType, title: string, message: string, invoiceId?: number): Promise<void> {
    const notif = this.notifRepo.create({ userLogin, type, title, message, invoiceId, read: false });
    const saved = await this.notifRepo.save(notif);

    const subject = this.streams.get(userLogin);
    if (subject) {
      subject.next({ data: JSON.stringify({ id: saved.id, type, title, message, invoiceId, createdAt: saved.createdAt }) });
    }
  }

  async getForUser(userLogin: string): Promise<Notification[]> {
    return this.notifRepo.find({
      where: { userLogin },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAllRead(userLogin: string): Promise<void> {
    await this.notifRepo.update({ userLogin, read: false }, { read: true });
  }

  async countUnread(userLogin: string): Promise<number> {
    return this.notifRepo.count({ where: { userLogin, read: false } });
  }

  @Cron('0 8 * * *')
  async checkInvoiceDates(): Promise<void> {
    this.logger.log('Running invoice due-date notification cron');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    const in3DaysEnd = new Date(in3Days);
    in3DaysEnd.setHours(23, 59, 59, 999);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const dueSoon = await this.invoiceRepo.find({
      where: { status: InvoiceStatus.PENDING, dueDate: Between(in3Days, in3DaysEnd) as any },
      relations: ['person'],
    });

    for (const inv of dueSoon) {
      const login = inv.person?.userId ?? inv.person?.email;
      if (!login) continue;
      const num = `FAC-${new Date(inv.issueDate).getFullYear()}-${String(inv.id).padStart(3, '0')}`;
      await this.send(login, 'invoice.due_soon', 'Factura próxima a vencer', `Tu factura ${num} vence en 3 días. Evita recargos pagando a tiempo.`, inv.id);
    }

    const overdue = await this.invoiceRepo.find({
      where: { status: InvoiceStatus.PENDING, dueDate: Between(yesterday, yesterdayEnd) as any },
      relations: ['person'],
    });

    for (const inv of overdue) {
      const login = inv.person?.userId ?? inv.person?.email;
      if (!login) continue;
      const num = `FAC-${new Date(inv.issueDate).getFullYear()}-${String(inv.id).padStart(3, '0')}`;
      await this.send(login, 'invoice.overdue', 'Factura vencida', `Tu factura ${num} está vencida. Realiza el pago para evitar suspensión del servicio.`, inv.id);
    }

    this.logger.log(`Cron done: ${dueSoon.length} due_soon, ${overdue.length} overdue`);
  }
}
