import { BadRequestException, ConflictException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { whatsappSettings } from './whatsapp-config';
import { WhatsappTemplateService } from './whatsapp-template.service';

export const testKinds = {
  connection: 'admin.test.connection',
  created: 'admin.test.created',
  due: 'admin.test.due',
  paid: 'admin.test.paid',
};
export const testTemplates = {
  'admin.test.created': 'invoice.created',
  'admin.test.due': 'invoice.due_soon',
  'admin.test.paid': 'invoice.paid',
};
export const testConnectionText =
  'Prueba de conexión de WatSolution. Este mensaje confirma que el canal de WhatsApp puede enviar mensajes a este número. No corresponde a una factura ni a un pago real.';
export async function isActiveWhatsappAdmin(q: Pick<EntityManager, 'query'>, userId: number): Promise<boolean> {
  if (!Number.isSafeInteger(userId) || userId < 1) return false;
  return (
    (
      await q.query(
        `SELECT u.id FROM jhi_user u JOIN jhi_user_authorities_jhi_authority a ON a."jhiUserId"=u.id
    WHERE u.id=$1 AND u.activated=true AND a."jhiAuthorityName"='ROLE_ADMIN'`,
        [userId],
      )
    ).length === 1
  );
}

@Injectable()
export class WhatsappAdminService {
  constructor(
    private readonly db: DataSource,
    private readonly templates: WhatsappTemplateService,
  ) {}

  async status(userId: number) {
    if (!(await isActiveWhatsappAdmin(this.db, userId))) throw new ForbiddenException();
    let configured = false;
    try {
      whatsappSettings();
      configured = process.env.WHATSAPP_ASSISTANT_ENABLED === 'true';
    } catch {
      /* No secrets in diagnostics. */
    }
    return {
      configured,
      businessPhone: /^[1-9]\d{7,14}$/.test(process.env.WHATSAPP_BUSINESS_PHONE || '') ? process.env.WHATSAPP_BUSINESS_PHONE : null,
      templates: await this.templates.status(),
      history: await this.db.query(
        `SELECT id,kind,state,delivery_status AS "deliveryStatus",error_code AS "errorCode",
        '•••• '||right(phone,4) AS phone,created_at AS "createdAt" FROM whatsapp_outbox
        WHERE dedup_key LIKE $1 ORDER BY created_at DESC LIMIT 20`,
        [`admin-test:${userId}:%`],
      ),
    };
  }

  async send(userId: number, body: { phone?: unknown; type?: unknown; consent?: unknown; requestId?: unknown }) {
    whatsappSettings();
    if (process.env.WHATSAPP_ASSISTANT_ENABLED !== 'true') throw new ConflictException('El canal de WhatsApp está desactivado.');
    if (typeof body?.phone !== 'string' || !/^\+?[1-9]\d{7,14}$/.test(body.phone))
      throw new BadRequestException('Incluye el código de país, sin espacios. Ejemplo: +573001234567.');
    if (typeof body.type !== 'string' || !Object.prototype.hasOwnProperty.call(testKinds, body.type))
      throw new BadRequestException('Tipo de prueba inválido.');
    if (body.consent !== true) throw new BadRequestException('Confirma que el número es tuyo o que su titular autorizó la prueba.');
    if (
      typeof body.requestId !== 'string' ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.requestId)
    )
      throw new BadRequestException('Identificador de prueba inválido.');
    const phone = body.phone.replace(/^\+/, ''),
      kind = testKinds[body.type],
      key = `admin-test:${userId}:${body.requestId}`;
    return this.db.transaction(async q => {
      await q.query('SELECT pg_advisory_xact_lock(48102, $1)', [userId]);
      if (!(await isActiveWhatsappAdmin(q, userId))) throw new ForbiddenException();
      const [existing] = await q.query('SELECT id,state,phone,kind FROM whatsapp_outbox WHERE dedup_key=$1', [key]);
      if (existing) {
        if (existing.phone !== phone || existing.kind !== kind) throw new ConflictException('La prueba ya existe con otros datos.');
        return { id: existing.id, state: existing.state };
      }
      // Durable limits apply across instances and concurrent browser tabs.
      const [{ recent, hourly }] = await q.query(
        `SELECT count(*) FILTER (WHERE created_at>now()-interval '30 seconds')::int AS recent,
        count(*)::int AS hourly FROM whatsapp_outbox WHERE dedup_key LIKE $1 AND created_at>now()-interval '1 hour'`,
        [`admin-test:${userId}:%`],
      );
      if (recent || hourly >= 10) throw new HttpException('Espera 30 segundos entre pruebas. Máximo 10 por hora.', 429);
      let expiresAt = new Date(Date.now() + 10 * 60000);
      if (kind === testKinds.connection) {
        // Reply expiry originates from the signed inbound timestamp, not webhook arrival time.
        const [window] = await q.query(
          `SELECT max(expires_at) AS expires FROM whatsapp_outbox WHERE phone=$1 AND kind='reply'
          AND expires_at>now()+interval '1 minute'`,
          [phone],
        );
        if (!window?.expires)
          throw new ConflictException(
            'Primero envía un mensaje desde ese número al WhatsApp de WatSolution y vuelve a intentar la prueba.',
          );
        expiresAt = new Date(Math.min(expiresAt.getTime(), new Date(window.expires).getTime()));
      } else if (!(await this.templates.readyFor(testTemplates[kind]))) {
        throw new ConflictException(
          'Meta todavía no tiene aprobada y disponible esta plantilla. Puedes probar la conexión mientras tanto.',
        );
      }
      const id = randomUUID();
      await q.query(`INSERT INTO whatsapp_outbox(id,dedup_key,phone,kind,expires_at) VALUES($1,$2,$3,$4,$5)`, [
        id,
        key,
        phone,
        kind,
        expiresAt,
      ]);
      return { id, state: 'queued' };
    });
  }
}
