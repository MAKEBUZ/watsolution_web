import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { validLinkJoin } from './whatsapp-account.service';
import { whatsappSettings, whatsappTemplates } from './whatsapp-config';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { isActiveWhatsappAdmin, testConnectionText, testKinds, testTemplates } from './whatsapp-admin.service';

@Injectable()
export class WhatsappWorkerService {
  private running = false;
  private readonly logger = new Logger(WhatsappWorkerService.name);
  constructor(
    private readonly db: DataSource,
    private readonly templates: WhatsappTemplateService,
  ) {}

  @Cron('*/15 * * * * *')
  async tick() {
    if (this.running || process.env.WHATSAPP_ASSISTANT_ENABLED !== 'true' || process.env.WHATSAPP_ENABLED !== 'true') return;
    this.running = true;
    try {
      whatsappSettings();
      if (await this.templates.ready()) await this.scheduleNotifications();
      // Claims are committed before contacting Meta. Interrupted/ambiguous sends are not automatically replayed.
      await this.db.query(`UPDATE whatsapp_outbox SET state='unknown',body=NULL,error_code='INTERRUPTED',updated_at=now()
        WHERE state='sending' AND updated_at<now()-interval '5 minutes'`);
      await this.db.query(
        `UPDATE whatsapp_outbox SET state='expired',body=NULL,updated_at=now() WHERE state='queued' AND expires_at<=now()`,
      );
      for (let i = 0; i < 10; i++) {
        const [job] = await this.db.query(`WITH selected AS (SELECT id FROM whatsapp_outbox WHERE state='queued'
          AND available_at<=now() AND expires_at>now() ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1),
          claimed AS (UPDATE whatsapp_outbox o SET state='sending',attempts=attempts+1,updated_at=now()
            FROM selected s WHERE o.id=s.id RETURNING o.*) SELECT * FROM claimed`);
        if (!job) break;
        await this.deliver(job);
      }
    } catch {
      this.logger.warn('WhatsApp worker pending: check database and channel configuration. No message contents logged.');
    } finally {
      this.running = false;
    }
  }

  async scheduleNotifications() {
    // Transactional invoice events include web, mobile and payment writers without changing their flows.
    const events = await this.db.query(`SELECT e.id,e.kind,e.invoice_id,l.id AS link_id,l.phone
      FROM whatsapp_invoice_event e JOIN invoice i ON i.id=e.invoice_id
      JOIN whatsapp_link l ON l.person_id=i."personId" ${validLinkJoin}
      AND l.notifications=true AND e.created_at>=l.consent_at AND e.created_at>now()-interval '24 hours'
      AND ((e.kind='invoice.created' AND i.status='PENDING') OR (e.kind='invoice.paid' AND i.status='PAID'))
      AND NOT EXISTS(SELECT 1 FROM whatsapp_outbox o WHERE o.dedup_key='event:'||e.id||':'||l.id)
      ORDER BY e.id LIMIT 100`);
    for (const row of events) await this.enqueue(row, `event:${row.id}:${row.link_id}`);
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
      new Date(),
    );
    const due = await this.db.query(
      `SELECT i.id AS invoice_id,'invoice.due_soon' AS kind,l.id AS link_id,l.phone
      FROM invoice i JOIN whatsapp_link l ON l.person_id=i."personId" ${validLinkJoin}
      AND l.notifications=true AND i.status='PENDING' AND i.due_date=$1::date+3
      AND NOT EXISTS(SELECT 1 FROM whatsapp_outbox o WHERE o.dedup_key='due:'||i.id||':'||i.due_date||':'||l.id)
      ORDER BY i.id LIMIT 100`,
      [day],
    );
    for (const row of due) {
      const [{ due_date }] = await this.db.query('SELECT due_date::text FROM invoice WHERE id=$1', [row.invoice_id]);
      await this.enqueue(row, `due:${row.invoice_id}:${due_date}:${row.link_id}`);
    }
  }

  private async enqueue(row: any, key: string) {
    await this.db.query(
      `INSERT INTO whatsapp_outbox(id,dedup_key,link_id,phone,kind,invoice_id,expires_at)
      VALUES($1,$2,$3,$4,$5,$6,now()+interval '24 hours') ON CONFLICT DO NOTHING`,
      [randomUUID(), key, row.link_id, row.phone, row.kind, row.invoice_id],
    );
  }

  private async deliver(job: any) {
    await this.db.transaction(async q => {
      let allowed = true;
      const adminTest = Object.values(testKinds).includes(job.kind);
      if (adminTest) {
        const match = /^admin-test:([1-9]\d*):[a-f0-9-]{36}$/i.exec(job.dedup_key);
        allowed = !job.link_id && !job.invoice_id && !!match && (await isActiveWhatsappAdmin(q, Number(match?.[1])));
        if (job.kind === testKinds.connection) {
          const [window] = await q.query(`SELECT 1 FROM whatsapp_outbox WHERE phone=$1 AND kind='reply' AND expires_at>now() LIMIT 1`, [
            job.phone,
          ]);
          allowed = allowed && !!window;
        } else allowed = allowed && (await this.templates.readyFor(testTemplates[job.kind]));
      } else if (job.link_id) {
        const [owner] = await q.query('SELECT user_id FROM whatsapp_link WHERE id=$1', [job.link_id]);
        if (owner) await q.query('SELECT pg_advisory_xact_lock(48100, $1)', [owner.user_id]);
        const [link] = await q.query(`SELECT l.* FROM whatsapp_link l ${validLinkJoin} AND l.id=$1 AND l.phone=$2 FOR UPDATE OF l`, [
          job.link_id,
          job.phone,
        ]);
        allowed = !!link;
        if (job.kind !== 'reply') {
          allowed = allowed && !!link?.notifications && (await this.templates.ready());
          const [invoice] = await q.query('SELECT status,"personId" AS person_id,due_date::text FROM invoice WHERE id=$1', [
            job.invoice_id,
          ]);
          allowed =
            allowed && invoice?.person_id === link?.person_id && invoice?.status === (job.kind === 'invoice.paid' ? 'PAID' : 'PENDING');
          if (job.kind === 'invoice.due_soon') {
            const today = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'America/Bogota',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(new Date());
            const [{ eligible }] = await q.query('SELECT $1::date=$2::date+3 AS eligible', [invoice?.due_date ?? null, today]);
            allowed = allowed && eligible;
          }
        }
      } else if (job.kind !== 'reply') allowed = false;
      if (!allowed || new Date(job.expires_at).getTime() <= Date.now()) {
        await q.query(`UPDATE whatsapp_outbox SET state='cancelled',body=NULL,updated_at=now() WHERE id=$1`, [job.id]);
        return;
      }
      const config = whatsappSettings();
      const content =
        job.kind === 'reply' || job.kind === testKinds.connection
          ? { type: 'text', text: { body: adminTest ? testConnectionText : job.body } }
          : {
              type: 'template',
              template: { name: whatsappTemplates()[adminTest ? testTemplates[job.kind] : job.kind], language: { code: config.language } },
            };
      let state = 'unknown',
        errorCode: string | null = 'TRANSPORT_UNKNOWN',
        providerId: string | null = null;
      try {
        const response = await fetch(`https://graph.facebook.com/${config.version}/${config.phoneId}/messages`, {
          method: 'POST',
          redirect: 'error',
          signal: AbortSignal.timeout(8000),
          headers: { Authorization: `Bearer ${config.accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messaging_product: 'whatsapp', to: job.phone, ...content }),
        });
        const data = (await response.json()) as any;
        if (response.ok && typeof data.messages?.[0]?.id === 'string') {
          state = 'sent';
          providerId = data.messages[0].id.slice(0, 512);
          errorCode = null;
        } else if (response.status === 429 && job.attempts < 5) {
          state = 'queued';
          errorCode = 'RATE_LIMIT';
        } else {
          state = response.status >= 500 ? 'unknown' : 'failed';
          errorCode = Number.isSafeInteger(data.error?.code) ? `META_${data.error.code}` : `HTTP_${response.status}`;
        }
      } catch {
        /* A timeout can follow a successful acceptance; do not blindly resend private data. */
      }
      await q.query(
        `UPDATE whatsapp_outbox SET state=$2::varchar,provider_id=$3,error_code=$4,
        body=CASE WHEN $2::varchar='queued' THEN body ELSE NULL END,available_at=now()+($5::integer*interval '1 second'),updated_at=now()
        WHERE id=$1`,
        [job.id, state, providerId, errorCode, Math.min(3600, 60 * 2 ** job.attempts)],
      );
    });
  }

  @Cron('0 3 * * *', { timeZone: 'America/Bogota' })
  async cleanup() {
    if (process.env.WHATSAPP_ASSISTANT_ENABLED !== 'true') return;
    await this.db.query(`DELETE FROM whatsapp_link_code WHERE expires_at<now();
      DELETE FROM whatsapp_inbox WHERE received_at<now()-interval '7 days';
      DELETE FROM whatsapp_outbox WHERE created_at<now()-interval '7 days';
      DELETE FROM whatsapp_invoice_event WHERE created_at<now()-interval '7 days';`);
  }
}
