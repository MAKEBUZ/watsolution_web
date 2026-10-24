<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import axios from 'axios';
import AdminShell from '@/core/layout/admin-shell.vue';

const data = ref<any>(null),
  phone = ref(''),
  type = ref('connection'),
  consent = ref(false);
const loading = ref(false),
  sending = ref(false),
  error = ref(''),
  notice = ref('');
let requestId = '',
  generation = 0,
  timer: ReturnType<typeof setInterval> | undefined;
const options = [
  { value: 'connection', label: 'Prueba de conexión', template: '' },
  { value: 'created', label: 'Factura nueva', template: 'invoice.created' },
  { value: 'due', label: 'Próximo vencimiento', template: 'invoice.due_soon' },
  { value: 'paid', label: 'Pago confirmado', template: 'invoice.paid' },
];
const selected = computed(() => options.find(item => item.value === type.value)!);
const template = computed(() => data.value?.templates?.find((item: any) => item.type === selected.value.template));
const canSend = computed(
  () =>
    data.value?.configured &&
    consent.value &&
    /^\+?[1-9]\d{7,14}$/.test(phone.value) &&
    (type.value === 'connection' || template.value?.available) &&
    !sending.value,
);
const preview = computed(() =>
  type.value === 'connection'
    ? 'Prueba de conexión de WatSolution. Este mensaje confirma que el canal de WhatsApp puede enviar mensajes a este número. No corresponde a una factura ni a un pago real.'
    : template.value?.body || 'El texto aprobado por Meta aparecerá aquí cuando esté disponible.',
);
const labels: Record<string, string> = {
  queued: 'En cola',
  sending: 'Enviando',
  sent: 'Aceptado por Meta',
  delivered: 'Entregado',
  read: 'Leído',
  failed: 'Falló',
  unknown: 'Resultado sin confirmar',
  cancelled: 'Cancelado',
  expired: 'Venció sin enviar',
  APPROVED: 'Aprobada',
  PENDING: 'En revisión',
  REJECTED: 'Rechazada',
  PAUSED: 'Pausada',
  DISABLED: 'Desactivada',
  UNAVAILABLE: 'No disponible',
};
function errorMessage(e: any) {
  const message = e.response?.data?.message;
  return typeof message === 'string' ? message : 'No pudimos completar la solicitud. Revisa la conexión y vuelve a intentarlo.';
}
async function refresh(silent = false) {
  if (loading.value) return;
  loading.value = true;
  const current = generation;
  try {
    const result = await axios.get('api/admin/whatsapp');
    if (current === generation) data.value = result.data;
  } catch (e) {
    if (!silent && current === generation) error.value = errorMessage(e);
  } finally {
    if (current === generation) loading.value = false;
  }
}
async function send() {
  if (!canSend.value) return;
  sending.value = true;
  error.value = '';
  notice.value = '';
  requestId ||= crypto.randomUUID();
  const current = generation;
  try {
    await axios.post('api/admin/whatsapp/tests', { phone: phone.value, type: type.value, consent: consent.value, requestId });
    if (current !== generation) return;
    requestId = '';
    notice.value = 'Prueba registrada. El envío suele procesarse en unos segundos. Consulta su estado más abajo.';
    await refresh();
  } catch (e) {
    if (current === generation) error.value = errorMessage(e);
  } finally {
    if (current === generation) sending.value = false;
  }
}
watch([phone, type], () => {
  requestId = '';
  notice.value = '';
  consent.value = false;
});
function date(value: string) {
  return new Date(value).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
}
function kind(value: string) {
  return options.find(item => `admin.test.${item.value}` === value)?.label || 'Prueba';
}
onMounted(() => {
  void refresh();
  timer = setInterval(() => {
    if (
      data.value?.history?.some(
        (item: any) => ['queued', 'sending', 'sent'].includes(item.state) && !['read', 'failed'].includes(item.deliveryStatus),
      )
    )
      void refresh(true);
  }, 15000);
});
onUnmounted(() => {
  generation++;
  clearInterval(timer);
  data.value = null;
  phone.value = '';
});
</script>

<template>
  <AdminShell>
    <section class="wa-admin">
      <header class="wa-heading">
        <div>
          <p class="eyebrow">ADMINISTRACIÓN · COMUNICACIONES</p>
          <h1>Pruebas de WhatsApp</h1>
          <p>Comprueba los avisos de WatSolution en un número privado.</p>
        </div>
        <button class="secondary" :disabled="loading" @click="refresh()">{{ loading ? 'Consultando…' : 'Actualizar estado' }}</button>
      </header>
      <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
      <p v-if="notice" class="feedback success" role="status">{{ notice }}</p>
      <p v-if="!data && loading" role="status">Consultando el canal de WhatsApp…</p>
      <template v-if="data">
        <div class="channel">
          <span class="dot" :class="{ enabled: data.configured }"></span
          ><strong>{{ data.configured ? 'Canal configurado' : 'Canal no disponible' }}</strong
          ><span v-if="data.businessPhone">Número de WatSolution: +{{ data.businessPhone }}</span>
        </div>
        <div class="wa-grid">
          <form class="card" @submit.prevent="send">
            <h2>Enviar una prueba</h2>
            <p>Los envíos no crean facturas, pagos ni suscripciones.</p>
            <label for="wa-test-phone">Número de destino</label>
            <input
              id="wa-test-phone"
              v-model="phone"
              :disabled="sending"
              type="tel"
              inputmode="tel"
              autocomplete="off"
              placeholder="+573001234567"
              maxlength="16"
              required
              aria-describedby="wa-phone-help"
            />
            <small id="wa-phone-help">Incluye el código de país. Para Colombia: +57 seguido de 10 dígitos.</small>
            <label for="wa-test-type">Mensaje que quieres probar</label>
            <select id="wa-test-type" v-model="type" :disabled="sending">
              <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <div v-if="type === 'connection'" class="hint">
              Primero envía «Hola» desde el número de destino al WhatsApp de WatSolution. Luego podrás probar la conexión durante la ventana
              de respuesta.
              <a v-if="data.businessPhone" :href="`https://wa.me/${data.businessPhone}?text=Hola`" target="_blank" rel="noopener noreferrer"
                >Abrir WhatsApp de WatSolution ↗</a
              >
            </div>
            <div v-else class="hint">
              Se enviará el texto de la plantilla, tal como lo aprobó Meta. Úsalo con un destinatario que sepa que es una prueba.
              <strong v-if="!template?.available">Esta plantilla todavía no está disponible para enviar.</strong>
            </div>
            <label class="consent"
              ><input v-model="consent" type="checkbox" :disabled="sending" />
              <span>Este número es mío o su titular autorizó recibir esta prueba.</span></label
            >
            <button class="primary" :disabled="!canSend" type="submit">{{ sending ? 'Registrando prueba…' : 'Enviar prueba' }}</button>
            <small>Una prueba cada 30 segundos. Máximo 10 por hora.</small>
          </form>
          <div class="preview-area">
            <div class="card preview">
              <p class="eyebrow">VISTA PREVIA DEL MENSAJE</p>
              <div class="bubble">{{ preview }}</div>
              <p class="preview-caption">{{ selected.label }} · WhatsApp</p>
            </div>
            <div class="card">
              <h2>Plantillas de notificación</h2>
              <p>Meta debe aprobar cada plantilla antes de usarla.</p>
              <ul class="templates">
                <li v-for="item in data.templates" :key="item.type">
                  <span>{{ options.find(option => option.template === item.type)?.label }}</span
                  ><span class="badge" :class="{ good: item.available }">{{ labels[item.status] || item.status }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card history">
          <h2>Tus últimas pruebas</h2>
          <p>“Aceptado por Meta” aún no confirma la entrega. Los estados se actualizan cuando WhatsApp los notifica.</p>
          <p v-if="!data.history.length" class="empty">Aún no has enviado pruebas desde este panel.</p>
          <ul v-else class="history-list">
            <li v-for="item in data.history" :key="item.id">
              <div>
                <strong>{{ kind(item.kind) }}</strong
                ><span>{{ item.phone }} · {{ date(item.createdAt) }}</span>
              </div>
              <div class="result">
                <span class="badge" :class="{ good: ['delivered', 'read'].includes(item.deliveryStatus) }">{{
                  labels[item.deliveryStatus || item.state] || item.state
                }}</span
                ><small v-if="item.errorCode">{{ item.errorCode }}</small>
              </div>
            </li>
          </ul>
          <small>Si el resultado queda sin confirmar, revisa el WhatsApp del destinatario antes de repetir la prueba.</small>
        </div>
      </template>
    </section>
  </AdminShell>
</template>

<style scoped>
.wa-admin {
  max-width: 1180px;
  margin: auto;
  padding: 36px;
  color: #173e43;
}
.wa-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}
h1 {
  font-size: 32px;
  letter-spacing: -1px;
  margin: 0 0 8px;
}
h2 {
  font-size: 20px;
  margin: 0 0 10px;
}
p {
  line-height: 1.6;
  color: #536c70;
  margin: 0 0 14px;
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 1.6px;
  font-weight: 700;
}
.channel {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0 24px;
  font-size: 14px;
}
.channel > span:last-child {
  margin-left: auto;
  color: #536c70;
}
.dot {
  width: 9px;
  height: 9px;
  background: #a56630;
  border-radius: 50%;
}
.dot.enabled {
  background: #278b63;
}
.wa-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}
.card {
  background: #fff;
  border: 1px solid #d9e4e1;
  border-radius: 18px;
  padding: 26px;
  box-shadow: 0 8px 26px #173e4305;
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
label {
  font-weight: 650;
  font-size: 14px;
}
input[type='tel'],
select {
  width: 100%;
  border: 1px solid #aabfba;
  border-radius: 9px;
  padding: 13px 12px;
  background: white;
  color: #173e43;
  font: inherit;
}
small {
  font-size: 12px;
  color: #536c70;
  line-height: 1.6;
}
button {
  font: inherit;
  font-weight: 650;
  border-radius: 9px;
  padding: 12px 16px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.primary {
  background: #17634f;
  color: white;
  border: 1px solid #17634f;
}
.secondary {
  border: 1px solid #aabfba;
  background: #fff;
  color: #173e43;
}
.hint {
  background: #f0f6f3;
  padding: 14px;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1.7;
}
.hint a,
.hint strong {
  display: block;
  margin-top: 8px;
}
.hint a {
  color: #17634f;
}
.consent {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.6;
  font-weight: 400;
}
.consent input {
  margin-top: 5px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: #17634f;
}
.preview-area {
  display: grid;
  gap: 24px;
}
.preview {
  background: #edf3ef;
}
.bubble {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: #fff;
  border-radius: 0 14px 14px;
  padding: 20px;
  line-height: 1.7;
  box-shadow: 0 2px 6px #173e4310;
  font-size: 15px;
}
.preview-caption {
  font-size: 12px;
  margin: 12px 0 0;
}
.templates,
.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.templates li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 13px 0;
  border-bottom: 1px solid #eaf0ec;
  font-size: 14px;
}
.badge {
  display: inline-block;
  background: #f1f1eb;
  color: #65572e;
  padding: 6px 10px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 650;
  white-space: normal;
}
.badge.good {
  background: #e1f3e8;
  color: #166b43;
}
.history {
  margin-top: 24px;
}
.history-list li {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 0;
  border-top: 1px solid #e5ece9;
}
.history-list li > div:first-child {
  display: grid;
  gap: 5px;
}
.history-list li span:not(.badge) {
  font-size: 13px;
  color: #536c70;
}
.result {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
  text-align: right;
}
.feedback {
  padding: 15px 18px;
  border-radius: 10px;
}
.error {
  background: #fff0ec;
  color: #893b2c;
}
.success {
  background: #e1f3e8;
  color: #166b43;
}
.empty {
  padding: 20px;
  background: #f7f9f6;
  border-radius: 10px;
}
:focus-visible {
  outline: 3px solid #278b63;
  outline-offset: 3px;
}
@media (max-width: 800px) {
  .wa-grid {
    grid-template-columns: 1fr;
  }
  .wa-admin {
    padding: 22px 16px;
  }
  .wa-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  h1 {
    font-size: 28px;
  }
  .card {
    padding: 20px;
  }
  .channel > span:last-child {
    margin-left: 0;
    width: 100%;
  }
  .history-list li {
    flex-wrap: wrap;
  }
  .result {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
