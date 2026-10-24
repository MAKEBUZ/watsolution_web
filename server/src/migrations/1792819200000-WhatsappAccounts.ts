import { MigrationInterface, QueryRunner } from 'typeorm';

/** Additive; no historic invoices are turned into notification events. */
export class WhatsappAccounts1792819200000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE whatsapp_link (
        id uuid PRIMARY KEY, user_id integer NOT NULL UNIQUE REFERENCES jhi_user(id) ON DELETE CASCADE,
        person_id integer NOT NULL REFERENCES person(id) ON DELETE CASCADE,
        phone varchar(15) NOT NULL UNIQUE, verified_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz NOT NULL, notifications boolean NOT NULL DEFAULT false,
        consent_at timestamptz, consent_version varchar(30),
        CHECK (phone ~ '^[1-9][0-9]{7,14}$')
      );
      CREATE TABLE whatsapp_link_code (
        user_id integer PRIMARY KEY REFERENCES jhi_user(id) ON DELETE CASCADE,
        person_id integer NOT NULL REFERENCES person(id) ON DELETE CASCADE,
        phone varchar(15) NOT NULL, code_hash varchar(64) NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
      );
      CREATE TABLE whatsapp_inbox (
        message_id varchar(512) PRIMARY KEY, sender_hash varchar(64) NOT NULL,
        command varchar(20) NOT NULL, received_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX whatsapp_inbox_sender_time ON whatsapp_inbox(sender_hash, received_at);
      CREATE TABLE whatsapp_invoice_event (
        id bigserial PRIMARY KEY, invoice_id integer NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
        kind varchar(30) NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX whatsapp_invoice_event_time ON whatsapp_invoice_event(created_at);
      CREATE TABLE whatsapp_outbox (
        id uuid PRIMARY KEY, dedup_key varchar(700) NOT NULL UNIQUE,
        link_id uuid REFERENCES whatsapp_link(id) ON DELETE CASCADE,
        phone varchar(15) NOT NULL, kind varchar(30) NOT NULL,
        invoice_id integer REFERENCES invoice(id) ON DELETE CASCADE,
        body text, state varchar(20) NOT NULL DEFAULT 'queued', attempts integer NOT NULL DEFAULT 0,
        available_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
        provider_id varchar(512), error_code varchar(60), delivery_status varchar(20)
      );
      CREATE INDEX whatsapp_outbox_queue ON whatsapp_outbox(state, available_at);
      CREATE INDEX whatsapp_outbox_provider ON whatsapp_outbox(provider_id);
      CREATE FUNCTION whatsapp_invoice_changed() RETURNS trigger LANGUAGE plpgsql AS $fn$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          IF NEW.status <> 'CANCELLED' THEN
            INSERT INTO whatsapp_invoice_event(invoice_id, kind) VALUES (NEW.id, 'invoice.created');
          END IF;
        ELSIF NEW.status = 'PAID' AND OLD.status IS DISTINCT FROM NEW.status THEN
          INSERT INTO whatsapp_invoice_event(invoice_id, kind) VALUES (NEW.id, 'invoice.paid');
        END IF;
        RETURN NEW;
      END;
      $fn$;
      CREATE TRIGGER whatsapp_invoice_event_trigger AFTER INSERT OR UPDATE OF status ON invoice
      FOR EACH ROW EXECUTE FUNCTION whatsapp_invoice_changed();
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TRIGGER IF EXISTS whatsapp_invoice_event_trigger ON invoice;
      DROP FUNCTION IF EXISTS whatsapp_invoice_changed();
      DROP TABLE whatsapp_outbox, whatsapp_invoice_event, whatsapp_inbox, whatsapp_link_code, whatsapp_link;`);
  }
}
