<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  RefreshCw,
  Activity,
  CreditCard,
  Droplets,
  Newspaper,
  ClipboardList,
  Clock3,
  AlertCircle,
  Inbox,
  UserRound,
} from 'lucide-vue-next';
import axios from 'axios';
import AdminShell from '@/core/layout/admin-shell.vue';
import Pagination from '@/shared/pagination.vue';
interface ActivityRecord {
  id: number;
  personName?: string;
  action: string;
  description: string;
  reference?: string;
  amount?: number | string;
  createdAt?: string;
}
const page = ref(0),
  total = ref(0),
  logs = ref<ActivityRecord[]>([]),
  loading = ref(true),
  loadError = ref(false),
  checkedAt = ref('');
const size = 10;
let generation = 0;
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / size)));
const kinds: Record<string, { label: string; icon: any; tone: string }> = {
  PAGO_FACTURA: { label: 'Pago registrado', icon: CreditCard, tone: 'green' },
  LECTURA_CONTADOR: { label: 'Lectura de medidor', icon: Droplets, tone: 'blue' },
  NUEVA_NOTICIA: { label: 'Noticia publicada', icon: Newspaper, tone: 'amber' },
  NUEVO_REPORTE: { label: 'Nuevo reporte', icon: ClipboardList, tone: 'purple' },
};
const kind = (action: string) => kinds[action] || { label: 'Actividad del sistema', icon: Activity, tone: 'neutral' };
async function loadActivity(target = page.value) {
  const current = ++generation;
  loading.value = true;
  loadError.value = false;
  logs.value = [];
  try {
    const { data } = await axios.get('api/admin/activity-page', { params: { page: target, size } });
    if (current !== generation) return;
    if (
      !Array.isArray(data.items) ||
      !Number.isSafeInteger(data.total) ||
      data.total < 0 ||
      data.items.some(row => !row || !Number.isSafeInteger(row.id) || typeof row.action !== 'string' || typeof row.description !== 'string')
    )
      throw new Error('Invalid activity response');
    const lastPage = Math.max(0, Math.ceil(data.total / size) - 1);
    if (target > lastPage) {
      await loadActivity(lastPage);
      return;
    }
    logs.value = data.items;
    total.value = data.total;
    page.value = target;
    checkedAt.value = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' });
  } catch {
    if (current === generation) loadError.value = true;
  } finally {
    if (current === generation) loading.value = false;
  }
}
function changePage(value: number) {
  if (!loading.value) void loadActivity(value);
}
function formatDate(value?: string, time = false) {
  if (!value || Number.isNaN(Date.parse(value))) return 'Fecha no disponible';
  return new Intl.DateTimeFormat(
    'es-CO',
    time
      ? { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' }
      : { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Bogota' },
  ).format(new Date(value));
}
function formatAmount(value: number | string) {
  return Number.isFinite(Number(value))
    ? Number(value).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    : 'Importe no disponible';
}
onMounted(() => loadActivity());
onUnmounted(() => {
  generation++;
});
</script>
<template>
  <AdminShell>
    <section class="activity-page">
      <header class="activity-header">
        <div>
          <p class="eyebrow">ADMINISTRACIÓN · HISTORIAL</p>
          <h1>Actividad reciente</h1>
          <p class="intro">Los movimientos de tu acueducto, en un solo lugar.</p>
        </div>
        <button class="refresh-button" type="button" :disabled="loading" @click="loadActivity()">
          <RefreshCw :size="17" :class="{ spinning: loading }" aria-hidden="true" /><span>{{
            loading ? 'Actualizando…' : 'Actualizar actividad'
          }}</span>
        </button>
      </header>
      <div class="activity-summary">
        <div class="summary-icon"><Activity :size="23" aria-hidden="true" /></div>
        <div>
          <span class="summary-label">Historial de movimientos</span
          ><strong>{{ loading || loadError ? '—' : total.toLocaleString('es-CO') }} <span>registros</span></strong>
        </div>
        <p v-if="checkedAt && !loading && !loadError" class="checked"><span class="status-dot"></span>Actualizado a las {{ checkedAt }}</p>
      </div>
      <section class="logs-card" aria-label="Listado de actividad reciente" :aria-busy="loading">
        <header class="list-heading">
          <div>
            <h2>Últimos movimientos</h2>
            <p>Pagos, lecturas, noticias y novedades del servicio.</p>
          </div>
          <span v-if="!loadError" class="page-badge">Página {{ page + 1 }} de {{ pageCount }}</span>
        </header>
        <div v-if="loading" class="loading-state" role="status">
          <span class="sr-only">Consultando actividad…</span>
          <div v-for="n in 5" :key="n" class="skeleton-row" aria-hidden="true">
            <i></i>
            <div><span></span><span></span></div>
          </div>
        </div>
        <div v-else-if="loadError" class="empty-state" role="alert">
          <AlertCircle :size="32" aria-hidden="true" />
          <h3>No pudimos cargar la actividad</h3>
          <p>Sin datos verificados. Revisa la conexión y pulsa «Actualizar actividad» para intentarlo de nuevo.</p>
        </div>
        <div v-else-if="!logs.length" class="empty-state" role="status">
          <Inbox :size="36" aria-hidden="true" />
          <h3>No hay actividad registrada</h3>
          <p>Los próximos movimientos del servicio aparecerán aquí.</p>
        </div>
        <ol v-else class="logs-container">
          <li v-for="log in logs" :key="log.id" class="log-entry">
            <div :class="['log-icon', kind(log.action).tone]"><component :is="kind(log.action).icon" :size="21" aria-hidden="true" /></div>
            <div class="log-body">
              <span :class="['event-label', kind(log.action).tone]">{{ kind(log.action).label }}</span>
              <h3>{{ log.description }}</h3>
              <p class="log-meta">
                <span v-if="log.personName"><UserRound :size="13" aria-hidden="true" />{{ log.personName }}</span
                ><span v-if="log.reference">Ref. {{ log.reference }}</span>
              </p>
            </div>
            <div class="log-details">
              <strong v-if="log.amount != null" class="log-amount">{{ formatAmount(log.amount) }}</strong
              ><time :datetime="log.createdAt"
                ><span>{{ formatDate(log.createdAt) }}</span
                ><span><Clock3 :size="12" aria-hidden="true" />{{ formatDate(log.createdAt, true) }}</span></time
              >
            </div>
          </li>
        </ol>
        <Pagination v-if="!loadError && total > 0" :page="page" :size="size" :total="total" :busy="loading" @change="changePage" />
      </section>
      <p v-if="checkedAt && !loading && !loadError" class="source-note">Fuente: registros de la aplicación · Hora de Colombia.</p>
    </section>
  </AdminShell>
</template>
<style scoped>
.activity-page {
  max-width: 1220px;
  margin: 0 auto;
  padding: 36px;
  color: #173e43;
}
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 1.6px;
  font-weight: 700;
  color: #597772;
  margin: 0 0 12px;
}
h1 {
  font-size: 34px;
  letter-spacing: -1.2px;
  margin: 0 0 10px;
  font-weight: 700;
}
.intro {
  color: #627772;
  margin: 0;
  font-size: 15px;
}
.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #1b6455;
  background: #1b6455;
  color: #fff;
  padding: 13px 18px;
  border-radius: 11px;
  font: inherit;
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
  box-shadow: 0 3px 8px #173e4310;
  cursor: pointer;
  transition:
    background 0.15s,
    box-shadow 0.15s;
}
.refresh-button:hover:not(:disabled) {
  background: #124b40;
  box-shadow: 0 5px 14px #173e4320;
}
.refresh-button:disabled {
  opacity: 0.65;
  cursor: wait;
}
.activity-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 26px;
  border: 1px solid #d9e5df;
  background: #eaf2ec;
  border-radius: 16px;
  margin-bottom: 24px;
}
.summary-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #d4e7d8;
  color: #25654e;
  flex-shrink: 0;
}
.summary-label {
  display: block;
  font-size: 12px;
  color: #526d63;
  margin-bottom: 4px;
}
.activity-summary strong {
  font-size: 26px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.activity-summary strong span {
  font-size: 14px;
  font-weight: 400;
  color: #526d63;
}
.checked {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 0 auto;
  font-size: 12px;
  color: #526d63;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #438563;
}
.logs-card {
  background: #fff;
  border: 1px solid #dce5df;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 7px 28px #173e4304;
}
.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 28px;
  border-bottom: 1px solid #e7ede8;
}
.list-heading h2 {
  font-size: 19px;
  font-weight: 650;
  margin: 0 0 7px;
}
.list-heading p {
  font-size: 13px;
  color: #74837b;
  margin: 0;
}
.page-badge {
  font-size: 12px;
  white-space: nowrap;
  color: #597067;
  background: #f2f6f2;
  border: 1px solid #e2e9e1;
  border-radius: 7px;
  padding: 7px 10px;
}
.logs-container {
  list-style: none;
  padding: 0;
  margin: 0;
}
.log-entry {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 18px;
  padding: 24px 28px;
  border-bottom: 1px solid #edf1ec;
  align-items: start;
}
.log-entry:last-child {
  border-bottom: 0;
}
.log-entry:hover {
  background: #fbfcf9;
}
.log-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}
.green {
  color: #287356;
  background: #eaf5ee;
}
.blue {
  color: #327b97;
  background: #eaf3f7;
}
.amber {
  color: #986a23;
  background: #fbf3e3;
}
.purple {
  color: #7765a3;
  background: #f0edf7;
}
.neutral {
  color: #5e7470;
  background: #edf2ef;
}
.event-label {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.2;
  margin-bottom: 8px;
}
.log-body h3 {
  font-size: 14px;
  line-height: 1.65;
  font-weight: 550;
  margin: 0 0 8px;
  overflow-wrap: anywhere;
  color: #254941;
}
.log-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 15px;
  margin: 0;
  font-size: 12px;
  color: #75837b;
}
.log-meta span {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  overflow-wrap: anywhere;
}
.log-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 120px;
}
.log-amount {
  font-size: 17px;
  color: #215c47;
  font-variant-numeric: tabular-nums;
}
.log-details time {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
  font-size: 12px;
  color: #6d7f75;
}
.log-details time span:last-child {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #93a096;
}
.source-note {
  font-size: 11px;
  color: #7a8d81;
  margin: 16px 4px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 65px 24px;
  color: #6e8678;
  gap: 15px;
}
.empty-state h3 {
  font-size: 18px;
  margin: 0;
  color: #345547;
}
.empty-state p {
  font-size: 14px;
  line-height: 1.7;
  max-width: 430px;
  margin: 0;
}
.loading-state {
  padding: 6px 28px;
}
.skeleton-row {
  display: flex;
  gap: 18px;
  padding: 24px 0;
  border-bottom: 1px solid #edf1ec;
}
.skeleton-row i {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #eff3ef;
}
.skeleton-row div {
  flex: 1;
}
.skeleton-row span {
  display: block;
  height: 12px;
  background: #eff3ef;
  border-radius: 5px;
  margin: 6px 0 14px;
  width: 70%;
}
.skeleton-row span:last-child {
  width: 40%;
  height: 9px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
:deep(.ws-pagination) {
  padding: 20px 28px;
}
:deep(.ws-pagination div) {
  flex-wrap: wrap;
}
:focus-visible {
  outline: 3px solid #6ba68c;
  outline-offset: 4px;
}
.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinning {
    animation: none;
  }
}
@media (max-width: 700px) {
  .activity-page {
    padding: 25px 16px;
  }
  .activity-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }
  h1 {
    font-size: 29px;
  }
  .refresh-button {
    min-height: 44px;
  }
  .activity-summary {
    padding: 18px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .checked {
    width: 100%;
    margin: 4px 0 0;
  }
  .list-heading {
    padding: 20px;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
  .log-entry {
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 12px;
    padding: 22px 20px;
  }
  .log-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
  .log-details {
    grid-column: 2;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .log-details time {
    align-items: flex-start;
  }
  .log-amount {
    font-size: 16px;
  }
  :deep(.ws-pagination) {
    padding: 18px 20px;
  }
  :deep(.ws-pagination div) {
    gap: 8px;
  }
  :deep(.ws-pagination label) {
    font-size: 12px;
  }
  :deep(.ws-pagination button),
  :deep(.ws-pagination select) {
    padding: 8px;
  }
  .source-note {
    line-height: 1.6;
  }
}
</style>
