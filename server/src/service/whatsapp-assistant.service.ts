import { Injectable } from '@nestjs/common';
import { createHmac, randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { validLinkJoin, WhatsappAccountService } from './whatsapp-account.service';
import { WHATSAPP_PORTAL, whatsappIntent, whatsappSettings } from './whatsapp-config';

const money = (amount: unknown) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(Number(amount));
const number = (amount: unknown) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(Number(amount));
const date = (value: unknown) => String(value).slice(0, 10);
const invoiceLabel = (invoice: any) => `FAC-${date(invoice.issue_date).slice(0, 4)}-${String(invoice.id).padStart(3, '0')}`;
const status: Record<string, string> = { PENDING: 'Pendiente', PAID: 'Pagada', CANCELLED: 'Anulada' };

@Injectable()
export class WhatsappAssistantService {
  constructor(
    private readonly db: DataSource,
    private readonly accounts: WhatsappAccountService,
  ) {}

  async ingest(message: { id: string; from: string; timestamp: number; text: string }) {
    const intent = whatsappIntent(message.text);
    const senderHash = createHmac('sha256', whatsappSettings().appSecret).update(message.from).digest('hex');
    await this.db.transaction(async q => {
      await q.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`wa-inbound:${message.from}`]);
      const inserted = await q.query(
        `INSERT INTO whatsapp_inbox(message_id,sender_hash,command) VALUES($1,$2,$3)
        ON CONFLICT DO NOTHING RETURNING message_id`,
        [message.id, senderHash, intent],
      );
      if (!inserted.length) return;
      const [{ count }] = await q.query(
        `SELECT count(*)::int AS count FROM whatsapp_inbox WHERE sender_hash=$1 AND received_at>now()-interval '1 hour'`,
        [senderHash],
      );
      // Stop/unlink must remain available even when ordinary query limits have been reached.
      if (count > 60 && !['stop', 'unlink'].includes(intent)) return;
      let link = (await q.query(`SELECT l.* FROM whatsapp_link l ${validLinkJoin} AND l.phone=$1`, [message.from]))[0];
      if (link && intent !== 'link') {
        await q.query('SELECT pg_advisory_xact_lock(48100, $1)', [link.user_id]);
        link = (await q.query(`SELECT l.* FROM whatsapp_link l ${validLinkJoin} AND l.phone=$1`, [message.from]))[0];
      }
      let reply: string;
      let privateLink: string | null = null;
      if (intent === 'unlink') {
        // Remove even expired links. Do not disclose whether the sender had a profile.
        await q.query('DELETE FROM whatsapp_link_code WHERE phone=$1', [message.from]);
        await q.query('DELETE FROM whatsapp_link WHERE phone=$1', [message.from]);
        reply =
          'WhatsApp quedó desvinculado. Ya no se enviarán datos ni avisos de tu cuenta a este chat. Puedes vincularlo de nuevo en ' +
          WHATSAPP_PORTAL;
      } else if (intent === 'stop') {
        await q.query('UPDATE whatsapp_link SET notifications=false WHERE phone=$1', [message.from]);
        await q.query(
          `UPDATE whatsapp_outbox SET state='cancelled',body=NULL,updated_at=now() WHERE phone=$1 AND kind<>'reply' AND state='queued'`,
          [message.from],
        );
        reply =
          'Has desactivado los avisos de WhatsApp. Puedes seguir consultando tus facturas y consumo. Para volver a activarlos, visita ' +
          WHATSAPP_PORTAL;
      } else if (intent === 'link') {
        const [{ attempts }] = await q.query(
          `SELECT count(*)::int AS attempts FROM whatsapp_inbox WHERE sender_hash=$1 AND command='link' AND received_at>now()-interval '1 hour'`,
          [senderHash],
        );
        const ok = attempts <= 5 && (await this.accounts.complete(q, message.from, message.text.trim().split(/\s+/)[1]));
        reply = ok
          ? 'Tu cuenta quedó vinculada durante 90 días. Escribe FACTURAS o CONSUMO para consultar tus datos. Los avisos están desactivados: puedes activarlos en ' +
            WHATSAPP_PORTAL
          : 'No se pudo completar la vinculación. Genera un código nuevo desde tu cuenta y envíalo desde el número indicado allí. El código vence en 10 minutos; se permiten 5 intentos por hora. ' +
            WHATSAPP_PORTAL;
      } else if (!link) {
        reply =
          'Hola, soy el asistente de WatSolution. Para consultar tus facturas y consumo, primero vincula este número desde tu cuenta: ' +
          WHATSAPP_PORTAL +
          '\nInicia sesión, indica tu número y envía aquí el código de vinculación. No compartas contraseñas ni documentos.';
      } else if (intent === 'invoices' || intent === 'consumption') {
        reply = await this.accountReply(q, link.person_id, intent);
        privateLink = link.id;
      } else {
        reply =
          '¿Qué deseas consultar?\n1. FACTURAS: últimas facturas y saldo pendiente.\n2. CONSUMO: consumo de los últimos períodos facturados.\nBAJA: dejar de recibir avisos.\nDESVINCULAR: retirar el acceso a tu cuenta desde este chat.\nGestiona tu vinculación y los avisos en ' +
          WHATSAPP_PORTAL;
      }
      await q.query(
        `INSERT INTO whatsapp_outbox(id,dedup_key,link_id,phone,kind,body,expires_at)
        VALUES($1,$2,$3,$4,'reply',$5,$6) ON CONFLICT DO NOTHING`,
        [randomUUID(), `reply:${message.id}`, privateLink, message.from, reply, new Date(message.timestamp + 23 * 3600000)],
      );
    });
  }

  private async accountReply(q: EntityManager, personId: number, intent: 'invoices' | 'consumption') {
    const invoices = await q.query(
      `SELECT id,issue_date::text,due_date::text,consumption_m_3,amount_due,status
      FROM invoice WHERE "personId"=$1 ${intent === 'consumption' ? "AND status<>'CANCELLED'" : ''}
      ORDER BY issue_date DESC,id DESC LIMIT 5`,
      [personId],
    );
    if (!invoices.length)
      return 'Tu cuenta todavía no tiene facturas disponibles para esta consulta. Puedes revisar el portal: https://watsolution.online/portal';
    if (intent === 'consumption') {
      return (
        'Tu consumo facturado de los últimos períodos:\n\n' +
        invoices
          .map(inv => `${invoiceLabel(inv)} · emitida ${date(inv.issue_date)}\nConsumo: ${number(inv.consumption_m_3)} m³`)
          .join('\n\n') +
        '\n\nEstos valores corresponden al consumo registrado en cada factura, no a la lectura acumulada del medidor. Más detalles: https://watsolution.online/portal'
      );
    }
    const [balance] = await q.query(
      `SELECT COALESCE(SUM(amount_due),0) AS total, count(*)::int AS count FROM invoice WHERE "personId"=$1 AND status='PENDING'`,
      [personId],
    );
    return (
      `Saldo pendiente: ${money(balance.total)} (${balance.count} facturas).\n\nÚltimas facturas:\n\n` +
      invoices
        .map(
          inv =>
            `${invoiceLabel(inv)} · ${status[inv.status] || 'En revisión'}\nValor: ${money(inv.amount_due)} · Vence: ${date(inv.due_date)}\nConsumo: ${number(inv.consumption_m_3)} m³`,
        )
        .join('\n\n') +
      '\n\nPara ver o descargar tus facturas, ingresa a https://watsolution.online/portal'
    );
  }

  async delivery(providerId: string, phone: string, state: string, errorCode?: number) {
    if (!['sent', 'delivered', 'read', 'failed'].includes(state)) return;
    await this.db.query(
      `UPDATE whatsapp_outbox SET delivery_status=$3::varchar, error_code=COALESCE($4,error_code),updated_at=now()
      WHERE provider_id=$1 AND phone=$2 AND
      (delivery_status IS NULL OR (delivery_status='sent' AND $3::varchar IN ('delivered','read','failed')) OR (delivery_status='delivered' AND $3::varchar='read'))`,
      [providerId, phone, state, Number.isSafeInteger(errorCode) ? `META_${errorCode}` : null],
    );
  }
}
