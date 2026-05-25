import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Invoice } from '../domain/invoice.entity';
import { User } from '../domain/user.entity';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { ActivityLog } from '../domain/activity-log.entity';
import { ActivityAction } from '../domain/enumeration/activity-action';
import { NotificationService } from './notification.service';

@Injectable()
export class BoldService {
  private readonly logger = new Logger('BoldService');

  constructor(
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(ActivityLog) private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  private async resolveLogin(userId?: string): Promise<string | null> {
    if (!userId) return null;
    const user = await this.userRepository.findOne({ where: { id: parseInt(userId, 10) } as any });
    return user?.login ?? null;
  }

  async getHashForInvoice(invoiceId: number): Promise<{ boldOrderId: string; hash: string; apiKey: string; amount: number }> {
    const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const secretKey = process.env.BOLD_SECRET_KEY ?? '';
    const apiKey = process.env.BOLD_API_KEY ?? '';
    const timestamp = Math.floor(Date.now() / 1000);
    const boldOrderId = `INV-${invoiceId}-${timestamp}`;
    const amount = Math.round(Number(invoice.amountDue));

    const hash = crypto.createHash('sha256').update(`${boldOrderId}${amount}COP${secretKey}`).digest('hex');

    await this.invoiceRepository.update(invoiceId, { boldOrderId });

    return { boldOrderId, hash, apiKey, amount };
  }

  async processWebhook(payload: any, rawBody: string, signature: string): Promise<void> {
    const secretKey = process.env.BOLD_SECRET_KEY ?? '';
    const skipVerify = process.env.BOLD_WEBHOOK_SKIP_VERIFY === 'true';

    if (!skipVerify && secretKey) {
      const expected = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');
      if (signature !== expected) {
        throw new UnauthorizedException('Invalid Bold webhook signature');
      }
    }

    const { reference_id, payment_status, transaction_id } = payload ?? {};
    if (!reference_id) return;

    const invoice = await this.invoiceRepository.findOne({
      where: { boldOrderId: reference_id } as any,
      relations: ['person'],
    });
    if (!invoice) {
      this.logger.warn(`No invoice found for bold_order_id: ${reference_id}`);
      return;
    }

    if (payment_status === 'APPROVED' && invoice.status !== InvoiceStatus.PAID) {
      await this.invoiceRepository.update(invoice.id, {
        status: InvoiceStatus.PAID,
        boldTransactionId: transaction_id ?? null,
      });

      const log = new ActivityLog();
      log.action = ActivityAction.PAGO_FACTURA;
      log.description = 'Pago Bold aprobado';
      log.reference = `FAC-${invoice.id}`;
      log.amount = invoice.amountDue;
      log.personName = invoice.person?.fullName ?? null;
      log.createdAt = new Date();
      await this.activityLogRepository.save(log).catch(() => {});

      const login = await this.resolveLogin(invoice.person?.userId);
      if (login) {
        const year = new Date(invoice.issueDate).getFullYear();
        const num = `FAC-${year}-${String(invoice.id).padStart(3, '0')}`;
        await this.notificationService.send(login, 'invoice.paid', 'Pago exitoso', `Tu pago de la factura ${num} fue procesado exitosamente. ¡Gracias!`, invoice.id).catch(() => {});
      }
    } else if (['REJECTED', 'FAILED', 'VOIDED'].includes(payment_status)) {
      await this.invoiceRepository.update(invoice.id, { status: InvoiceStatus.CANCELLED });
    }
  }

  async processResult(invoiceId: number, boldOrderId: string): Promise<{ boldStatus: string; invoiceStatus: InvoiceStatus }> {
    const apiKey = process.env.BOLD_API_KEY ?? '';
    let boldStatus = 'UNKNOWN';

    try {
      const res = await fetch(`https://payments.api.bold.co/v2/payment-voucher/${encodeURIComponent(boldOrderId)}`, {
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        boldStatus = data?.payment_status ?? 'UNKNOWN';
      }
    } catch (err) {
      this.logger.warn(`Bold API query failed for ${boldOrderId}: ${err.message}`);
    }

    const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    if (boldStatus === 'APPROVED' && invoice.status !== InvoiceStatus.PAID) {
      await this.invoiceRepository.update(invoiceId, { status: InvoiceStatus.PAID });
      invoice.status = InvoiceStatus.PAID;

      const fullInvoice = await this.invoiceRepository.findOne({ where: { id: invoiceId }, relations: ['person'] });
      const login = await this.resolveLogin(fullInvoice?.person?.userId);
      if (login) {
        const year = new Date(fullInvoice.issueDate).getFullYear();
        const num = `FAC-${year}-${String(invoiceId).padStart(3, '0')}`;
        await this.notificationService.send(login, 'invoice.paid', 'Pago exitoso', `Tu pago de la factura ${num} fue procesado exitosamente. ¡Gracias!`, invoiceId).catch(() => {});
      }
    }

    return { boldStatus, invoiceStatus: invoice.status };
  }
}
