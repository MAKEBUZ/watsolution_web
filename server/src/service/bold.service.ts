import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
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
    const secretKey = process.env.BOLD_SECRET_KEY ?? '';
    const apiKey = process.env.BOLD_API_KEY ?? '';
    if (!secretKey || !apiKey) throw new ServiceUnavailableException('Payment configuration unavailable');
    return this.invoiceRepository.manager.transaction(async manager => {
      const repo = manager.getRepository(Invoice);
      const invoice = await repo.findOne({ where: { id: invoiceId }, lock: { mode: 'pessimistic_write' } });
      if (!invoice) throw new NotFoundException('Invoice not found');
      if (invoice.status !== InvoiceStatus.PENDING) throw new BadRequestException('Invoice is not payable');
      const amount = Number(invoice.amountDue);
      if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Invalid invoice amount');
      const boldOrderId = invoice.boldOrderId || `INV-${invoiceId}-${crypto.randomUUID()}`;
      if (!invoice.boldOrderId) await repo.update(invoiceId, { boldOrderId });
      const hash = crypto.createHash('sha256').update(`${boldOrderId}${amount}COP${secretKey}`).digest('hex');
      return { boldOrderId, hash, apiKey, amount };
    });
  }

  async processWebhook(payload: any, rawBody: Buffer, signature: string): Promise<void> {
    const secret = process.env.BOLD_SECRET_KEY;
    if (!secret || !Buffer.isBuffer(rawBody)) throw new ServiceUnavailableException('Webhook verification unavailable');
    if (!/^[a-f0-9]{64}$/i.test(signature)) throw new UnauthorizedException('Invalid signature');
    // Bold signs base64(raw HTTP bytes), not a reserialized JSON object.
    const expected = crypto.createHmac('sha256', secret).update(rawBody.toString('base64')).digest();
    if (!crypto.timingSafeEqual(expected, Buffer.from(signature, 'hex'))) throw new UnauthorizedException('Invalid signature');
    if (payload?.type !== 'SALE_APPROVED') return; // Rejections never cancel an outstanding or already paid invoice.
    const data = payload.data;
    const reference = data?.metadata?.reference;
    if (typeof reference !== 'string' || reference.length > 160 || typeof data?.payment_id !== 'string' || data.payment_id.length > 160) throw new BadRequestException('Invalid payment event');
    const paid = await this.invoiceRepository.manager.transaction(async manager => {
      const repo = manager.getRepository(Invoice);
      const invoice = await repo.findOne({ where: { boldOrderId: reference }, lock: { mode: 'pessimistic_write' } });
      if (!invoice) return null;
      if (data.amount?.currency !== 'COP' || !Number.isFinite(data.amount?.total) || Math.round(data.amount.total * 100) !== Math.round(Number(invoice.amountDue) * 100)) throw new BadRequestException('Payment amount mismatch');
      if (invoice.status === InvoiceStatus.PAID) return null;
      if (invoice.status !== InvoiceStatus.PENDING) throw new BadRequestException('Invoice requires payment review');
      invoice.status = InvoiceStatus.PAID; invoice.boldTransactionId = data.payment_id;
      await repo.save(invoice);
      await manager.getRepository(ActivityLog).save({ action: ActivityAction.PAGO_FACTURA, description: 'Pago Bold verificado', reference: 'FAC-' + invoice.id, amount: invoice.amountDue, createdAt: new Date() });
      return invoice.id;
    });
    if (paid) {
      const invoice = await this.invoiceRepository.findOne({where:{id:paid},relations:['person']});
      const login = await this.resolveLogin(invoice.person?.userId);
      if (login) await this.notificationService.send(login, 'invoice.paid', 'Pago confirmado', 'Se confirmó el pago de tu factura.', paid).catch(() => { this.logger.warn('Payment notification pending delivery'); });
    }
  }

  async processResult(invoiceId: number, boldOrderId: string): Promise<{ boldStatus: string; invoiceStatus: InvoiceStatus }> {
    const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (!boldOrderId || invoice.boldOrderId !== boldOrderId) throw new BadRequestException('Order does not belong to this invoice');
    // A browser redirect is not payment proof. Only the verified webhook changes financial state.
    return { boldStatus: invoice.status === InvoiceStatus.PAID ? 'APPROVED' : 'UNKNOWN', invoiceStatus: invoice.status };
  }
}
