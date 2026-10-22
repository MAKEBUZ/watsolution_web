import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Invoice } from '../domain/invoice.entity';
import { User } from '../domain/user.entity';
import { InvoiceStatus } from '../domain/enumeration/invoice-status';
import { ActivityLog } from '../domain/activity-log.entity';
import { ActivityAction } from '../domain/enumeration/activity-action';
import { NotificationService } from './notification.service';

interface BoldWebhook {
  type?: string;
  data?: {
    payment_id?: string;
    metadata?: { reference?: string };
    amount?: { total?: number; currency?: string };
  };
}

interface BoldVoucher {
  reference_id?: string;
  payment_status?: string;
  transaction_id?: string;
  total?: number;
}

@Injectable()
export class BoldService {
  private readonly logger = new Logger('BoldService');

  constructor(
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  private credentials(): { secretKey: string; apiKey: string } {
    const secretKey = process.env.BOLD_SECRET_KEY;
    const apiKey = process.env.BOLD_API_KEY;
    if (!secretKey || !apiKey) throw new ServiceUnavailableException('Bold credentials are not configured');
    return { secretKey, apiKey };
  }

  private amount(invoice: Invoice): number {
    // Keep the integer COP amount used by the existing payment button.
    const amount = Math.round(Number(invoice.amountDue));
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new BadRequestException('Invalid invoice amount');
    return amount;
  }

  async getHashForInvoice(invoiceId: number): Promise<{ boldOrderId: string; hash: string; apiKey: string; amount: number }> {
    const { secretKey, apiKey } = this.credentials();
    let invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status !== InvoiceStatus.PENDING) throw new ConflictException('Invoice is not pending');
    this.amount(invoice);

    // Reuse the reference so reopening the button cannot orphan an in-flight payment.
    // The conditional write also handles simultaneous requests for the first hash.
    if (!invoice.boldOrderId) {
      await this.invoiceRepository.update(
        { id: invoiceId, status: InvoiceStatus.PENDING, boldOrderId: IsNull() },
        { boldOrderId: `INV-${invoiceId}-${crypto.randomUUID()}` },
      );
      invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
      if (!invoice || invoice.status !== InvoiceStatus.PENDING || !invoice.boldOrderId) {
        throw new ConflictException('Invoice changed while preparing payment');
      }
    }
    const amount = this.amount(invoice);
    const boldOrderId = invoice.boldOrderId;
    const hash = crypto.createHash('sha256').update(`${boldOrderId}${amount}COP${secretKey}`).digest('hex');
    return { boldOrderId, hash, apiKey, amount };
  }

  async processWebhook(payload: BoldWebhook, rawBody: Buffer, signature: string): Promise<void> {
    const secretKey = process.env.BOLD_SECRET_KEY;
    if (!secretKey) throw new ServiceUnavailableException('Bold webhook secret is not configured');
    if (!rawBody || !/^[a-f0-9]{64}$/i.test(signature ?? '')) {
      throw new UnauthorizedException('Invalid Bold webhook signature');
    }
    const expected = crypto.createHmac('sha256', secretKey).update(rawBody.toString('base64')).digest();
    if (!crypto.timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
      throw new UnauthorizedException('Invalid Bold webhook signature');
    }

    // A rejected attempt does not cancel the invoice. Voids require reconciliation:
    // the invoice status alone cannot represent a refund or its accounting effects.
    if (payload?.type !== 'SALE_APPROVED') {
      if (payload?.type === 'VOID_APPROVED') this.logger.warn('Bold void received; manual reconciliation required');
      return;
    }
    const reference = payload.data?.metadata?.reference;
    const transactionId = payload.data?.payment_id;
    if (typeof reference !== 'string' || !reference || typeof transactionId !== 'string' || !transactionId) {
      throw new BadRequestException('Missing Bold payment reference or transaction');
    }
    const invoice = await this.invoiceRepository.findOne({ where: { boldOrderId: reference }, relations: ['person'] });
    if (!invoice) {
      this.logger.warn('Bold payment does not match a local invoice');
      return;
    }
    if (payload.data.amount?.currency !== 'COP' || payload.data.amount?.total !== this.amount(invoice)) {
      throw new BadRequestException('Bold payment amount or currency does not match invoice');
    }
    await this.markPaid(invoice, transactionId);
  }

  private async markPaid(invoice: Invoice, transactionId?: string): Promise<void> {
    const changed = await this.invoiceRepository.manager.transaction(async manager => {
      const result = await manager.update(
        Invoice,
        { id: invoice.id, boldOrderId: invoice.boldOrderId, amountDue: invoice.amountDue, status: InvoiceStatus.PENDING },
        { status: InvoiceStatus.PAID, ...(transactionId ? { boldTransactionId: transactionId } : {}) },
      );
      if (!result.affected) return false;
      const log = new ActivityLog();
      log.action = ActivityAction.PAGO_FACTURA;
      log.description = 'Pago Bold aprobado';
      log.reference = `FAC-${invoice.id}`;
      log.amount = invoice.amountDue;
      log.personName = invoice.person?.fullName ?? null;
      log.createdAt = new Date();
      await manager.save(ActivityLog, log);
      return true;
    });
    if (!changed) {
      // The API confirmation can arrive before the webhook supplies its payment ID.
      if (transactionId)
        await this.invoiceRepository.update(
          { id: invoice.id, boldOrderId: invoice.boldOrderId, status: InvoiceStatus.PAID, boldTransactionId: IsNull() },
          { boldTransactionId: transactionId },
        );
      return;
    }
    try {
      const userId = Number(invoice.person?.userId);
      const user = Number.isSafeInteger(userId) && userId > 0 ? await this.userRepository.findOne({ where: { id: userId } }) : null;
      if (user?.login) {
        const num = `FAC-${new Date(invoice.issueDate).getFullYear()}-${String(invoice.id).padStart(3, '0')}`;
        await this.notificationService.send(
          user.login,
          'invoice.paid',
          'Pago exitoso',
          `Tu pago de la factura ${num} fue procesado exitosamente. ¡Gracias!`,
          invoice.id,
        );
      }
    } catch (err) {
      this.logger.error(`Bold payment saved, but notification failed for invoice ${invoice.id}: ${err.message}`);
    }
  }

  async processResult(invoiceId: number, boldOrderId: string): Promise<{ boldStatus: string; invoiceStatus: InvoiceStatus }> {
    const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId }, relations: ['person'] });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (!boldOrderId || boldOrderId !== invoice.boldOrderId) throw new BadRequestException('Bold order does not belong to invoice');
    const { apiKey } = this.credentials();
    let data: BoldVoucher;
    try {
      const res = await fetch(`https://payments.api.bold.co/v2/payment-voucher/${encodeURIComponent(boldOrderId)}`, {
        headers: { Authorization: `x-api-key ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = (await res.json()) as BoldVoucher;
    } catch (err) {
      this.logger.warn(`Bold API query failed: ${err.message}`);
      return { boldStatus: 'UNKNOWN', invoiceStatus: invoice.status };
    }
    const boldStatus = data?.payment_status ?? 'UNKNOWN';
    if (boldStatus === 'APPROVED') {
      if (data.reference_id !== boldOrderId || data.total !== this.amount(invoice)) {
        throw new BadRequestException('Bold payment does not match invoice');
      }
      await this.markPaid(invoice, data.transaction_id);
    }
    const current = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
    return { boldStatus, invoiceStatus: current?.status ?? invoice.status };
  }
}
