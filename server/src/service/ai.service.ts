import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import OpenAI from 'openai';
import { Invoice } from '../domain/invoice.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger('AiService');
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    private readonly dataSource: DataSource,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' });
  }

  async chat(userLogin: string, message: string): Promise<{ reply: string }> {
    const invoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.person', 'person')
      .where('person.userId = :login OR person.email = :login', { login: userLogin })
      .orderBy('invoice.issueDate', 'DESC')
      .take(10)
      .getMany();

    const invoiceContext = this.buildInvoiceContext(invoices);
    const ragDocs = await this.searchRelevantDocs(message, 3);
    const ragContext = ragDocs.map(d => d.content).join('\n\n');

    const systemPrompt = `Eres un asistente de servicio al cliente de WatSolution, sistema de gestión de agua potable. Eres amigable, conciso y respondes siempre en español.

FACTURAS DEL USUARIO:
${invoiceContext}
${ragContext ? `\nINFORMACIÓN ADICIONAL:\n${ragContext}` : ''}

Responde únicamente sobre facturas, pagos y el servicio de agua. Si preguntan sobre otro tema, indica amablemente que no puedes ayudar con eso.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    return { reply: completion.choices[0].message.content ?? 'No pude generar una respuesta.' };
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
      this.logger.warn(`RAG search failed: ${err?.message}`);
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
