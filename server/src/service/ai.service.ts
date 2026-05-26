import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import OpenAI from 'openai';
import { Invoice } from '../domain/invoice.entity';
import { Person } from '../domain/person.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger('AiService');
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Person) private readonly personRepository: Repository<Person>,
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

  async adminChat(message: string): Promise<{ reply: string }> {
    const docMatch = message.match(/\b\d{6,12}\b/);
    const ragDocs = await this.searchRelevantDocs(message, 3);
    const ragContext = ragDocs.map(d => d.content).join('\n\n');

    let subscriberContext = '';

    if (docMatch) {
      const docNumber = docMatch[0];
      const person = await this.personRepository.findOne({
        where: { documentNumber: docNumber },
        relations: { address: true },
      });

      if (person) {
        const invoices = await this.invoiceRepository
          .createQueryBuilder('invoice')
          .leftJoinAndSelect('invoice.person', 'person')
          .where('person.id = :personId', { personId: person.id })
          .orderBy('invoice.issueDate', 'DESC')
          .take(20)
          .getMany();

        const now = new Date();
        const pending = invoices.filter(i => i.status === 'PENDING');
        const overdue = invoices.filter(i => i.status === 'PENDING' && new Date(i.dueDate) < now);
        const paid = invoices.filter(i => i.status === 'PAID');
        const totalDebt = pending.reduce((acc, i) => acc + Number(i.amountDue ?? 0), 0);

        const address = person.address
          ? [person.address.street, person.address.houseNumber, person.address.neighborhood, person.address.city]
              .filter(Boolean).join(', ')
          : 'Sin dirección registrada';

        subscriberContext = `
SUSCRIPTOR ENCONTRADO (Cédula: ${docNumber}):
- Nombre: ${person.fullName}
- N° Suscriptor: ${person.subscriberNumber ?? 'N/A'}
- Estrato: ${person.stratum ?? 'N/A'}
- Estado: ${person.status}
- Dirección: ${address}
- Email: ${person.email ?? 'N/A'}
- Teléfono: ${person.phone ?? 'N/A'}

RESUMEN DE FACTURACIÓN:
- Total facturas: ${invoices.length}
- Pendientes: ${pending.length} (${overdue.length} en mora)
- Pagadas: ${paid.length}
- Deuda total pendiente: $${Number(totalDebt).toLocaleString('es-CO')} COP

FACTURAS DETALLADAS:
${this.buildInvoiceContext(invoices)}`;
      } else {
        subscriberContext = `No se encontró ningún suscriptor con cédula ${docNumber}.`;
      }
    }

    const needsCedula =
      !docMatch &&
      /factura|deuda|mora|pago|cobro|saldo|cuánto|cuanto|debe|pendiente|historial|suscriptor|usuario/i.test(message);

    const systemPrompt = `Eres el asistente administrativo de WatSolution para el equipo de administración. Tienes acceso completo a datos de suscriptores y facturación.

${subscriberContext ? subscriberContext : needsCedula ? 'Para consultar la información de un suscriptor específico, necesitas el número de cédula. Pídela.' : 'No hay suscriptor seleccionado. Puedes consultar información general o pedir la cédula de un suscriptor.'}
${ragContext ? `\nINFORMACIÓN ADICIONAL:\n${ragContext}` : ''}

INSTRUCCIONES:
- Si el administrador pregunta por un suscriptor sin proporcionar cédula, PIDE la cédula antes de responder.
- Si hay datos de suscriptor, responde con detalle: facturas pendientes, montos, fechas de vencimiento, estado de mora.
- Puedes dar resúmenes de deuda, listar facturas vencidas, recomendar acciones.
- Responde siempre en español, de forma clara y estructurada.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 700,
      temperature: 0.4,
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
