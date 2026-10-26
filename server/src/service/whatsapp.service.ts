import { ForbiddenException, Injectable, Logger, Optional, ServiceUnavailableException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { WhatsappAssistantService } from './whatsapp-assistant.service';

const REPLY =
  'Hola 👋 Soy WatSolution. La conexión de prueba con WhatsApp está funcionando. Para consultar tus facturas y consumo, ingresa a tu cuenta en el portal de WatSolution.';
const DAY_MS = 24 * 60 * 60 * 1000;
const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

@Injectable()
export class WhatsappService {
  constructor(@Optional() private readonly assistant?: WhatsappAssistantService) {}
  private readonly logger = new Logger(WhatsappService.name);
  // Sufficient for a single-process test. Production requires a durable inbox/queue.
  private readonly deliveries = new Map<string, { expires: number; work: Promise<void> }>();

  private configuration() {
    if (process.env.WHATSAPP_ENABLED !== 'true') throw new ServiceUnavailableException('WhatsApp está desactivado.');
    const read = (key: string) => process.env[`WHATSAPP_${key}`]?.trim() ?? '';
    const settings = {
      version: read('GRAPH_VERSION'),
      phoneId: read('PHONE_NUMBER_ID'),
      wabaId: read('BUSINESS_ACCOUNT_ID'),
      accessToken: read('ACCESS_TOKEN'),
      appSecret: read('APP_SECRET'),
      verifyToken: read('VERIFY_TOKEN'),
      recipients: read('TEST_RECIPIENTS')
        .split(',')
        .map(value => value.trim()),
    };
    if (
      !/^v\d+\.0$/.test(settings.version) ||
      !/^\d+$/.test(settings.phoneId) ||
      !/^\d+$/.test(settings.wabaId) ||
      !settings.accessToken ||
      !settings.appSecret ||
      settings.verifyToken.length < 32 ||
      (process.env.WHATSAPP_ASSISTANT_ENABLED !== 'true' &&
        (settings.recipients.length > 5 || settings.recipients.some(value => !/^[1-9]\d{7,14}$/.test(value))))
    ) {
      throw new ServiceUnavailableException('Completa la configuración de WhatsApp en el servidor.');
    }
    return settings;
  }

  verify(mode: unknown, token: unknown, challenge: unknown): string {
    const { verifyToken } = this.configuration();
    const received = typeof token === 'string' ? Buffer.from(token) : Buffer.alloc(0);
    const expected = Buffer.from(verifyToken);
    if (
      mode !== 'subscribe' ||
      received.length !== expected.length ||
      !timingSafeEqual(received, expected) ||
      typeof challenge !== 'string' ||
      !/^\d{1,100}$/.test(challenge)
    ) {
      throw new ForbiddenException('Verificación de WhatsApp inválida.');
    }
    return challenge;
  }

  async receive(payload: unknown, rawBody: Buffer | undefined, signature: unknown): Promise<void> {
    const settings = this.configuration();
    if (!rawBody || typeof signature !== 'string' || !/^sha256=[a-fA-F0-9]{64}$/.test(signature)) {
      throw new ForbiddenException('Firma de WhatsApp inválida.');
    }
    const expected = createHmac('sha256', settings.appSecret).update(rawBody).digest();
    if (!timingSafeEqual(expected, Buffer.from(signature.slice(7), 'hex'))) {
      throw new ForbiddenException('Firma de WhatsApp inválida.');
    }
    const body = object(payload);
    if (body.object !== 'whatsapp_business_account') return;
    const work: Promise<void>[] = [];
    for (const entry of list(body.entry).map(object)) {
      if (entry.id !== settings.wabaId) continue;
      for (const change of list(entry.changes).map(object)) {
        const value = object(change.value);
        if (
          change.field !== 'messages' ||
          value.messaging_product !== 'whatsapp' ||
          object(value.metadata).phone_number_id !== settings.phoneId
        )
          continue;
        for (const message of list(value.messages).map(object)) {
          const timestamp = typeof message.timestamp === 'string' ? Number(message.timestamp) * 1000 : NaN;
          if (
            message.type !== 'text' ||
            typeof message.id !== 'string' ||
            !message.id ||
            message.id.length > 512 ||
            typeof message.from !== 'string' ||
            !/^[1-9]\d{7,14}$/.test(message.from) ||
            (process.env.WHATSAPP_ASSISTANT_ENABLED !== 'true' && !settings.recipients.includes(message.from)) ||
            !Number.isFinite(timestamp) ||
            timestamp < Date.now() - 23 * 60 * 60 * 1000 ||
            timestamp > Date.now() + 5 * 60 * 1000
          )
            continue;
          if (process.env.WHATSAPP_ASSISTANT_ENABLED === 'true') {
            if (!this.assistant) throw new ServiceUnavailableException('Asistente no disponible.');
            const text = object(message.text).body;
            if (typeof text === 'string' && text.length <= 1000)
              work.push(
                this.assistant.ingest({
                  id: message.id,
                  from: message.from,
                  timestamp,
                  text,
                }),
              );
          } else work.push(this.once(message.id, () => this.reply(message.from as string, settings)));
        }
        if (process.env.WHATSAPP_ASSISTANT_ENABLED === 'true' && this.assistant) {
          for (const status of list(value.statuses).map(object)) {
            if (
              typeof status.id !== 'string' ||
              status.id.length > 512 ||
              typeof status.recipient_id !== 'string' ||
              typeof status.status !== 'string'
            )
              continue;
            const code = object(list(status.errors)[0]).code;
            work.push(this.assistant.delivery(status.id, status.recipient_id, status.status, typeof code === 'number' ? code : undefined));
          }
        }
      }
    }
    // A provider failure returns 503, allowing Meta to retry instead of silently losing the reply.
    await Promise.all(work);
  }

  private once(id: string, send: () => Promise<void>): Promise<void> {
    const now = Date.now();
    for (const [key, item] of this.deliveries) if (item.expires <= now) this.deliveries.delete(key);
    const existing = this.deliveries.get(id);
    if (existing) return existing.work;
    if (this.deliveries.size >= 1000) return Promise.reject(new ServiceUnavailableException('Límite temporal de pruebas alcanzado.'));
    const work = send().catch(error => {
      this.deliveries.delete(id);
      throw error;
    });
    this.deliveries.set(id, { expires: now + DAY_MS, work });
    return work;
  }

  private async reply(to: string, settings: ReturnType<WhatsappService['configuration']>): Promise<void> {
    try {
      const response = await fetch(`https://graph.facebook.com/${settings.version}/${settings.phoneId}/messages`, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
        headers: { Authorization: `Bearer ${settings.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: REPLY } }),
      });
      if (!response.ok) {
        this.logger.warn(`Meta rechazó la respuesta de prueba (HTTP ${response.status}). Revisa el token y los destinatarios en Meta.`);
        throw new Error('Provider rejected message');
      }
    } catch {
      // Do not log tokens, phone numbers, message contents, or provider response bodies.
      throw new ServiceUnavailableException('No se pudo enviar la respuesta de prueba de WhatsApp.');
    }
  }
}
