import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { WHATSAPP_CONSENT, whatsappSettings } from './whatsapp-config';
import { WhatsappTemplateService } from './whatsapp-template.service';

export const codeHash = (code: string) => createHash('sha256').update(code.toUpperCase()).digest('hex');
// Every private read and send rechecks the current account-to-subscriber relationship.
export const validLinkJoin = `JOIN jhi_user u ON u.id = l.user_id AND u.activated = true
  JOIN person p ON p.id = l.person_id AND p.user_id = l.user_id::text
  WHERE l.expires_at > now() AND (SELECT count(*) FROM person p2 WHERE p2.user_id = l.user_id::text) = 1`;

@Injectable()
export class WhatsappAccountService {
  constructor(
    private readonly db: DataSource,
    private readonly templates: WhatsappTemplateService,
  ) {}

  async owner(userId: number, q: Pick<EntityManager, 'query'> = this.db) {
    if (!Number.isSafeInteger(userId) || userId < 1) throw new ForbiddenException();
    const profiles = await q.query(
      `SELECT p.id FROM person p JOIN jhi_user u ON u.id::text = p.user_id
      WHERE u.id = $1 AND u.activated = true LIMIT 2`,
      [userId],
    );
    if (profiles.length !== 1)
      throw new ForbiddenException('Tu cuenta debe tener un único perfil de suscriptor. Contacta al administrador.');
    return profiles[0].id;
  }

  async status(userId: number) {
    const personId = await this.owner(userId);
    const [link] = await this.db.query('SELECT * FROM whatsapp_link WHERE user_id = $1 AND person_id = $2', [userId, personId]);
    return {
      linked: !!link && new Date(link.expires_at).getTime() > Date.now(),
      phone: link ? `•••• ${link.phone.slice(-4)}` : null,
      expiresAt: link?.expires_at ?? null,
      notifications: !!link?.notifications,
      notificationsAvailable: await this.templates.ready(),
      businessPhone: /^\d{8,15}$/.test(process.env.WHATSAPP_BUSINESS_PHONE || '') ? process.env.WHATSAPP_BUSINESS_PHONE : null,
    };
  }

  async createCode(userId: number, phone: unknown) {
    whatsappSettings();
    if (typeof phone !== 'string' || !/^[1-9]\d{7,14}$/.test(phone))
      throw new BadRequestException('Escribe el número con código de país, sin + ni espacios.');
    return this.db.transaction(async q => {
      await q.query('SELECT pg_advisory_xact_lock(48100, $1)', [userId]);
      const personId = await this.owner(userId, q);
      const [previous] = await q.query('SELECT created_at FROM whatsapp_link_code WHERE user_id = $1', [userId]);
      if (previous && Date.now() - new Date(previous.created_at).getTime() < 60000)
        throw new ConflictException('Espera un minuto antes de generar otro código.');
      const code = randomBytes(6).toString('hex').toUpperCase();
      const expiresAt = new Date(Date.now() + 10 * 60000);
      await q.query(
        `INSERT INTO whatsapp_link_code(user_id,person_id,phone,code_hash,expires_at) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(user_id) DO UPDATE SET person_id=$2,phone=$3,code_hash=$4,expires_at=$5,created_at=now()`,
        [userId, personId, phone, codeHash(code), expiresAt],
      );
      return { code, expiresAt, message: `VINCULAR ${code}` };
    });
  }

  async complete(q: EntityManager, phone: string, code: string) {
    await q.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`wa-phone:${phone}`]);
    const [candidate] = await q.query('SELECT user_id FROM whatsapp_link_code WHERE code_hash=$1 AND phone=$2 AND expires_at>now()', [
      codeHash(code),
      phone,
    ]);
    if (!candidate) return false;
    await q.query('SELECT pg_advisory_xact_lock(48100, $1)', [candidate.user_id]);
    const [challenge] = await q.query('SELECT * FROM whatsapp_link_code WHERE code_hash=$1 AND phone=$2 AND expires_at>now() FOR UPDATE', [
      codeHash(code),
      phone,
    ]);
    if (!challenge) return false;
    const profiles = await q.query(
      'SELECT p.id FROM person p JOIN jhi_user u ON u.id::text=p.user_id WHERE u.id=$1 AND u.activated=true LIMIT 2',
      [challenge.user_id],
    );
    if (profiles.length !== 1 || profiles[0].id !== challenge.person_id) return false;
    const occupied = await q.query('SELECT id FROM whatsapp_link WHERE phone=$1 AND user_id<>$2', [phone, challenge.user_id]);
    if (occupied.length) return false;
    // Reverification resets consent and invalidates the old link's queued jobs.
    await q.query('DELETE FROM whatsapp_link WHERE user_id=$1', [challenge.user_id]);
    await q.query(`INSERT INTO whatsapp_link(id,user_id,person_id,phone,expires_at) VALUES($1,$2,$3,$4,now()+interval '90 days')`, [
      randomUUID(),
      challenge.user_id,
      challenge.person_id,
      phone,
    ]);
    await q.query('DELETE FROM whatsapp_link_code WHERE user_id=$1', [challenge.user_id]);
    return true;
  }

  async preferences(userId: number, enabled: unknown) {
    if (typeof enabled !== 'boolean') throw new BadRequestException('Selecciona si deseas recibir avisos.');
    if (enabled && !(await this.templates.ready()))
      throw new ConflictException('Los avisos están pendientes de habilitación de sus plantillas.');
    await this.db.transaction(async q => {
      await q.query('SELECT pg_advisory_xact_lock(48100, $1)', [userId]);
      const personId = await this.owner(userId, q);
      const rows = await q.query(
        `WITH changed AS (UPDATE whatsapp_link SET notifications=$3,
        consent_at=CASE WHEN $3 AND NOT notifications THEN now() ELSE consent_at END,
        consent_version=CASE WHEN $3 THEN $4 ELSE consent_version END
        WHERE user_id=$1 AND person_id=$2 AND expires_at>now() RETURNING id) SELECT id FROM changed`,
        [userId, personId, enabled, WHATSAPP_CONSENT],
      );
      if (!rows.length) throw new ConflictException('Primero vincula tu número de WhatsApp.');
      if (!enabled)
        await q.query(
          `UPDATE whatsapp_outbox SET state='cancelled',body=NULL,updated_at=now()
        WHERE link_id IN (SELECT id FROM whatsapp_link WHERE user_id=$1) AND kind<>'reply' AND state='queued'`,
          [userId],
        );
    });
    return this.status(userId);
  }

  async unlink(userId: number) {
    await this.db.transaction(async q => {
      await q.query('SELECT pg_advisory_xact_lock(48100, $1)', [userId]);
      await q.query('DELETE FROM whatsapp_link_code WHERE user_id=$1', [userId]);
      await q.query('DELETE FROM whatsapp_link WHERE user_id=$1', [userId]);
    });
    return { unlinked: true };
  }
}
