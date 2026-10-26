import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { notificationsReady, whatsappSettings, whatsappTemplates } from './whatsapp-config';

@Injectable()
export class WhatsappTemplateService {
  private approved = false;
  private checkedAt = 0;
  private pending?: Promise<boolean>;
  private results: Record<string, { status: string; body: string; approved: boolean }> = {};
  async status() {
    await this.ready();
    return Object.entries(whatsappTemplates()).map(([type, name]) => ({
      type,
      name,
      status: this.results[name]?.status || 'UNAVAILABLE',
      body: this.results[name]?.body || '',
      available: notificationsReady() && !!this.results[name]?.approved,
    }));
  }
  async readyFor(type: string) {
    await this.ready();
    return notificationsReady() && !!this.results[whatsappTemplates()[type]]?.approved;
  }
  async ready(): Promise<boolean> {
    if (!notificationsReady()) return false;
    if (Date.now() - this.checkedAt < 300000) return this.approved;
    return (this.pending ??= this.check().finally(() => {
      this.pending = undefined;
    }));
  }
  private async check() {
    this.approved = false;
    this.results = {};
    try {
      const config = whatsappSettings();
      const required = new Set(Object.values(whatsappTemplates()));
      let after = '';
      for (let page = 0; page < 10 && required.size; page++) {
        const query = new URLSearchParams({
          fields: 'name,status,language,category,components',
          limit: '100',
          appsecret_proof: createHmac('sha256', config.appSecret).update(config.accessToken).digest('hex'),
        });
        if (after) query.set('after', after);
        const response = await fetch(`https://graph.facebook.com/${config.version}/${config.wabaId}/message_templates?${query}`, {
          headers: { Authorization: `Bearer ${config.accessToken}` },
          redirect: 'error',
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error('Template lookup unavailable');
        const data = (await response.json()) as any;
        for (const template of Array.isArray(data.data) ? data.data : []) {
          if (required.has(template.name) && template.language === config.language) {
            const body = template.components?.find((part: any) => part.type === 'BODY')?.text;
            this.results[template.name] = {
              status: String(template.status).slice(0, 40),
              body: typeof body === 'string' ? body.slice(0, 4096) : '',
              approved: template.status === 'APPROVED' && template.category === 'UTILITY',
            };
          }
          if (template.status === 'APPROVED' && template.category === 'UTILITY' && template.language === config.language)
            required.delete(template.name);
        }
        if (!data.paging?.next || typeof data.paging?.cursors?.after !== 'string' || data.paging.cursors.after.length > 2000) break;
        after = data.paging.cursors.after;
      }
      this.approved = required.size === 0;
    } catch {
      this.results = {};
      /* Keep notifications unavailable until the provider confirms approval. */
    }
    this.checkedAt = Date.now();
    return this.approved;
  }
}
