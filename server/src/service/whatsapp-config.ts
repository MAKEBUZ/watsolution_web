import { ServiceUnavailableException } from '@nestjs/common';

export const WHATSAPP_PORTAL = 'https://watsolution.online/whatsapp/';
export const WHATSAPP_CONSENT = 'invoices-v1-2026-10';
export const whatsappTemplates = () => ({
  'invoice.created': process.env.WHATSAPP_TEMPLATE_CREATED || '',
  'invoice.due_soon': process.env.WHATSAPP_TEMPLATE_DUE || '',
  'invoice.paid': process.env.WHATSAPP_TEMPLATE_PAID || '',
});
export function whatsappSettings() {
  const read = (key: string) => process.env[`WHATSAPP_${key}`]?.trim() || '';
  const result = {
    version: read('GRAPH_VERSION'),
    phoneId: read('PHONE_NUMBER_ID'),
    wabaId: read('BUSINESS_ACCOUNT_ID'),
    accessToken: read('ACCESS_TOKEN'),
    appSecret: read('APP_SECRET'),
    verifyToken: read('VERIFY_TOKEN'),
    businessPhone: read('BUSINESS_PHONE'),
    language: read('TEMPLATE_LANGUAGE') || 'es',
  };
  if (
    process.env.WHATSAPP_ENABLED !== 'true' ||
    !/^v\d+\.0$/.test(result.version) ||
    !/^\d+$/.test(result.phoneId) ||
    !/^\d+$/.test(result.wabaId) ||
    !result.accessToken ||
    !result.appSecret ||
    result.verifyToken.length < 32
  ) {
    throw new ServiceUnavailableException('WhatsApp no está disponible temporalmente.');
  }
  return result;
}
export const notificationsReady = () =>
  process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true' &&
  Object.values(whatsappTemplates()).every(name => /^[a-z][a-z0-9_]{0,511}$/.test(name));

export type WhatsappIntent = 'link' | 'unlink' | 'stop' | 'invoices' | 'consumption' | 'help';
export function whatsappIntent(text: string): WhatsappIntent {
  const value = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
  if (/^vincular\s+[a-f0-9]{12}$/i.test(value)) return 'link';
  if (/^(desvincular|desconectar)$/.test(value)) return 'unlink';
  if (/^(baja|stop|cancelar avisos|no mas avisos)$/.test(value)) return 'stop';
  if (/\b(consumo|consumi|lectura|lecturas)\b/.test(value) || value === '2') return 'consumption';
  if (/\b(factura|facturas|saldo|deuda|debo|pagar)\b/.test(value) || value === '1') return 'invoices';
  return 'help';
}
