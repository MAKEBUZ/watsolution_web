import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import OpenAI from 'openai';
import { Invoice } from '../domain/invoice.entity';
import { Person } from '../domain/person.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger('AiService');
  private get openai(): OpenAI {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new ServiceUnavailableException('Public FAQ indexing is not configured');
    return new OpenAI({apiKey:key});
  }

  constructor(
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Person) private readonly personRepository: Repository<Person>,
    private readonly dataSource: DataSource,
  ) {

  }

  private validateMessage(message: string) {
    if (typeof message !== 'string' || !message.trim() || message.length > 1000) throw new BadRequestException('Invalid message');
  }

  async chat(userId: number, message: string): Promise<{ reply: string }> {
    this.validateMessage(message);
    const invoices = await this.invoiceRepository.find({ where: { person: { userId: String(userId) } }, order: { issueDate: 'DESC' }, take: 20 });
    return { reply: this.localSummary(invoices) };
  }

  async adminChat(message: string): Promise<{ reply: string }> {
    this.validateMessage(message);
    const document = message.match(/\b\d{6,12}\b/)?.[0];
    if (!document) return { reply: 'Indica la cédula del suscriptor para consultar su facturación. La consulta se procesa dentro de WatSolution.' };
    const person = await this.personRepository.findOne({ where: { documentNumber: document } });
    if (!person) return { reply: 'No se encontró el suscriptor.' };
    const invoices = await this.invoiceRepository.find({ where: { person: { id: person.id } }, order: { issueDate: 'DESC' }, take: 20 });
    return { reply: this.localSummary(invoices) };
  }

  private localSummary(invoices: Invoice[]): string {
    // Personal billing and free-form prompts never leave the application backend.
    if (!invoices.length) return 'No hay facturas disponibles para esta cuenta.';
    const pending = invoices.filter(invoice => invoice.status === 'PENDING');
    const cents = pending.reduce((sum, invoice) => sum + Math.round(Number(invoice.amountDue) * 100), 0);
    return 'Consulta de las últimas ' + invoices.length + ' facturas. Pendientes: ' + pending.length + '. Saldo pendiente de esta consulta: $' + (cents / 100).toLocaleString('es-CO') + ' COP. Revisa el detalle de facturas para ver el historial completo.';
  }

  async indexDocument(content: string, metadata: Record<string, any> = {}): Promise<void> {
    const embedding = await this.embed(content);
    await this.dataSource.query(
      `INSERT INTO document_embeddings (content, embedding, metadata) VALUES ($1, $2::vector, $3)`,
      [content, `[${embedding.join(',')}]`, JSON.stringify(metadata)],
    );
  }

  async seedFaqs(): Promise<number> {
    const faqs = [
      'Para pagar tu factura usa el botón Bold en la sección Pagos de la plataforma.',
      'El estado de una factura puede ser: PENDING (pendiente), PAID (pagada) o CANCELLED (cancelada).',
      'Si tu factura está vencida (en mora), aún puedes pagarla desde la plataforma.',
      'El monto incluye el consumo del período y los impuestos correspondientes.',
      'El historial de facturas está disponible en la sección Facturas del menú principal.',
      'Los pagos se procesan a través de Bold, pasarela con certificación PCI-DSS.',
      'Tras el pago, el estado de la factura se actualiza automáticamente a PAID.',
      'Si tienes problemas con un pago, contacta a la administración de WatSolution.',
    ];

    let indexed = 0;
    for (const faq of faqs) {
      await this.indexDocument(faq, { type: 'faq' });
      indexed++;
    }
    this.logger.log(`Seeded ${indexed} FAQ documents`);
    return indexed;
  }

  private buildInvoiceContext(invoices: Invoice[]): string {
    if (invoices.length === 0) return 'El usuario no tiene facturas registradas.';
    return invoices
      .map(inv => {
        const year = inv.issueDate ? new Date(inv.issueDate).getFullYear() : new Date().getFullYear();
        const num = `FAC-${year}-${String(inv.id).padStart(3, '0')}`;
        const amount = Number(inv.amountDue).toLocaleString('es-CO');
        const due = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('es-CO') : 'N/A';
        return `- ${num}: estado=${inv.status}, monto=$${amount} COP, vence=${due}`;
      })
      .join('\n');
  }

  private async searchRelevantDocs(query: string, limit: number): Promise<Array<{ content: string }>> {
    try {
      const embedding = await this.embed(query);
      return await this.dataSource.query(
        `SELECT content FROM document_embeddings ORDER BY embedding <=> $1::vector LIMIT $2`,
        [`[${embedding.join(',')}]`, limit],
      );
    } catch (err) {
      this.logger.warn('Public FAQ search unavailable');
      return [];
    }
  }

  private async embed(text: string): Promise<number[]> {
    const res = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    });
    return res.data[0].embedding;
  }
}
