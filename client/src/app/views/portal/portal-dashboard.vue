<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useAccountStore } from '@/shared/config/store/account-store';
import { useRouter } from 'vue-router';
import axios from 'axios';
import WaterNetwork from '@/core/water/water-network.vue';
import MisFacturas from './mis-facturas.vue';
import MiConsumo from './mi-consumo.vue';
import NotificationBell from '@/core/notifications/notification-bell.vue';
import { useNotifications } from '@/composables/useNotifications';

Chart.register(...registerables);

const accountStore = useAccountStore();
const router = useRouter();
const lineChartRef = ref<HTMLCanvasElement | null>(null);
const activeSection = ref('resumen');
let lineChart: Chart | null = null;

const isAdmin = computed(() => accountStore.account?.authorities?.includes('ROLE_ADMIN'));
const selectedSubscriber = ref<any>(null),
  subscriberSearch = ref(''),
  subscribers = ref<any[]>([]);
async function searchSubscribers() {
  try {
    subscribers.value = (
      await axios.get('api/people', { params: { search: subscriberSearch.value, size: 20, page: 0, sort: 'fullName,asc' } })
    ).data;
  } catch {
    errorMsg.value = 'No se pudieron buscar los suscriptores.';
  }
}
async function selectSubscriber(person: any) {
  selectedSubscriber.value = person;
  subscribers.value = [];
  activeSection.value = 'resumen';
  await loadDashboard();
}
const userName = computed(() => {
  const acc = accountStore.account;
  if (!acc) return 'Usuario';
  return acc.firstName || acc.login || 'Usuario';
});
const userInitial = computed(() => (userName.value[0] || 'U').toUpperCase());

const navItems = [
  { id: 'resumen', label: 'Resumen', icon: 'grid' },
  { id: 'facturas', label: 'Mis Facturas', icon: 'file-text' },
  { id: 'consumo', label: 'Mi Consumo', icon: 'droplet' },
  { id: 'notificaciones', label: 'Notificaciones', icon: 'bell' },
  { id: 'tramites', label: 'Trámites', icon: 'clipboard' },
  { id: 'soporte', label: 'Soporte', icon: 'message-square' },
];

const { notifications: allNotifs } = useNotifications();

const notifIconMap: Record<string, string> = {
  'invoice.created': '📄',
  'invoice.due_soon': '⏰',
  'invoice.overdue': '⚠️',
  'invoice.paid': '✅',
};
const notifLabelMap: Record<string, string> = {
  'invoice.created': 'Nueva factura',
  'invoice.due_soon': 'Por vencer',
  'invoice.overdue': 'Vencida',
  'invoice.paid': 'Pagada',
};
function notifIcon(type: string) {
  return notifIconMap[type] ?? '🔔';
}
function notifLabel(type: string) {
  return notifLabelMap[type] ?? type;
}

// ── State ─────────────────────────────────────────────────────────────────────
interface RecentInvoice {
  id: string;
  date: string;
  amount: string;
  statusLabel: string;
  statusClass: string;
}

const loading = ref(true);
const errorMsg = ref('');
let dashboardGeneration = 0;

// Card 1 — Factura Actual
const invoiceAmount = ref('–');
const invoiceDate = ref('');
const invoiceStatusLabel = ref('');
const invoiceStatusClass = ref('');

// Card 2 — Consumo
const consumoValue = ref('–');

// Card 3 — Estado servicio
const serviceLabel = ref('–');
const serviceIcon = ref('✅');
const serviceIconBg = ref('#d1fae5');
const serviceDetail = ref('');

// Chart data (stored so we can render after DOM is ready)
const chartLabels = ref<string[]>([]);
const chartValues = ref<number[]>([]);

const recentInvoices = ref<RecentInvoice[]>([]);

const quickActions = [
  { label: 'Reportar Fuga', desc: 'Notifica una fuga en tu sector', icon: '💧' },
  { label: 'Reclamaciones', desc: 'Haz una reclamación formal', icon: '📋' },
  { label: 'Certificados', desc: 'Descarga certificados oficiales', icon: '📄' },
  { label: 'Actualizar Datos', desc: 'Modifica tu información', icon: '👤' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: any): string {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(n: number): string {
  return `$${Number(n).toLocaleString('es-CO')}`;
}

function invoiceStatusInfo(status: string): { label: string; cls: string } {
  if (status === 'PAID') return { label: 'Pagada', cls: 'paid' };
  if (status === 'CANCELLED') return { label: 'Cancelada', cls: 'cancelled' };
  return { label: 'Pendiente', cls: 'pending' };
}

// ── Load data ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  const generation = ++dashboardGeneration;
  if (isAdmin.value && !selectedSubscriber.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  errorMsg.value = '';
  try {
    const { data } = await axios.get(
      isAdmin.value && selectedSubscriber.value ? 'api/portal/subscribers/' + selectedSubscriber.value.id : 'api/portal/dashboard',
    );
    if (generation !== dashboardGeneration) return;

    // Card 1 — last invoice (any status)
    if (data.currentInvoice) {
      const si = invoiceStatusInfo(data.currentInvoice.status);
      invoiceAmount.value = fmtCurrency(data.currentInvoice.amountDue);
      invoiceDate.value = fmtDate(data.currentInvoice.issueDate);
      invoiceStatusLabel.value = si.label;
      invoiceStatusClass.value = si.cls;
    } else {
      invoiceAmount.value = 'Sin facturas';
      invoiceDate.value = '';
      invoiceStatusLabel.value = '';
      invoiceStatusClass.value = '';
    }

    // Card 2 — latest meter reading
    consumoValue.value = `${Number(data.monthlyConsumption).toLocaleString('es-CO')} m³`;

    // Card 3 — service status
    if (data.serviceStatus === 'MOROSO') {
      serviceLabel.value = 'En mora';
      serviceIcon.value = '⚠️';
      serviceIconBg.value = '#fef3c7';
      serviceDetail.value = 'Tiene facturas vencidas';
    } else if (data.serviceStatus === 'SUSPENDIDO') {
      serviceLabel.value = 'Suspendido';
      serviceIcon.value = '🚫';
      serviceIconBg.value = '#fee2e2';
      serviceDetail.value = 'Contacte al administrador';
    } else {
      serviceLabel.value = 'Activo';
      serviceIcon.value = '✅';
      serviceIconBg.value = '#d1fae5';
      serviceDetail.value = 'Sin novedades';
    }

    // Last 5 invoices list
    recentInvoices.value = (data.invoiceHistory ?? []).map((inv: any) => {
      const si = invoiceStatusInfo(inv.status);
      return {
        id: `FAC-${String(inv.id).padStart(3, '0')}`,
        date: fmtDate(inv.issueDate),
        amount: fmtCurrency(inv.amountDue),
        statusLabel: si.label,
        statusClass: si.cls,
      };
    });

    // Store chart data and render after DOM update
    chartLabels.value = (data.consumptionTrend ?? []).map((p: any) => p.month);
    chartValues.value = (data.consumptionTrend ?? []).map((p: any) => Number(p.value));
    await nextTick();
    renderChart();
  } catch (err: any) {
    if (generation !== dashboardGeneration) return;
    const msg = err?.response?.data?.message ?? err?.message ?? 'Error al cargar datos';
    errorMsg.value = msg;
    console.error('Portal dashboard request failed');
  } finally {
    if (generation === dashboardGeneration) loading.value = false;
  }
}

// ── Chart ─────────────────────────────────────────────────────────────────────
function renderChart() {
  if (!lineChartRef.value || chartLabels.value.length === 0) return;
  lineChart?.destroy();
  lineChart = new Chart(lineChartRef.value, {
    type: 'line',
    data: {
      labels: chartLabels.value,
      datasets: [
        {
          label: 'Consumo m³',
          data: chartValues.value,
          borderColor: '#0077be',
          backgroundColor: 'rgba(0,119,190,0.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#0077be',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      animation: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? false : undefined,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } },
      },
    },
  });
}

// Re-render chart when user navigates back to Resumen tab
watch(activeSection, async val => {
  if (val === 'resumen' && chartLabels.value.length > 0) {
    await nextTick();
    renderChart();
  }
});

onMounted(() => {
  loadDashboard();
});
onUnmounted(() => {
  ++dashboardGeneration;
  lineChart?.destroy();
});
</script>

<template>
  <div class="portal-layout" :class="{ 'admin-preview': isAdmin }">
    <!-- Sidebar -->
    <aside class="portal-sidebar">
      <div class="sidebar-brand">
        <span class="sidebar-brand__text">Wat<span>Solution</span></span>
        <button class="sidebar-brand__close" @click="router.push('/')" title="Ir al inicio">✕</button>
      </div>

      <nav class="sidebar-nav" aria-label="Secciones de mi portal">
        <button
          v-for="item in navItems"
          :key="item.id"
          :class="['sidebar-nav__item', { active: activeSection === item.id }]"
          :aria-current="activeSection === item.id ? 'page' : undefined"
          @click="item.id === 'notificaciones' ? router.push('/notificaciones') : (activeSection = item.id)"
        >
          <span class="sidebar-nav__icon">
            <svg
              v-if="item.icon === 'grid'"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke-width="2" />
            </svg>
            <svg
              v-if="item.icon === 'file-text'"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z"
              />
            </svg>
            <svg
              v-if="item.icon === 'droplet'"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z" />
            </svg>
            <svg
              v-if="item.icon === 'clipboard'"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <svg
              v-if="item.icon === 'bell'"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <svg
              v-if="item.icon === 'message-square'"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </span>
          <span class="sidebar-nav__label">{{ item.label }}</span>
        </button>
      </nav>
      <div v-if="isAdmin" class="portal-admin-return">
        <router-link to="/admin/resumen" aria-label="Volver al panel de administración">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="m10 6-6 6 6 6M4 12h16" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span><strong>Volver al panel</strong><small>Administración</small></span>
        </router-link>
      </div>
    </aside>

    <!-- Main content -->
    <div class="portal-main">
      <!-- Top bar -->
      <div class="portal-topbar">
        <div class="portal-topbar__left">
          <h1 class="portal-topbar__greeting">Hola, {{ userName }}</h1>
          <p class="portal-topbar__sub">Bienvenido a tu portal personal</p>
        </div>
        <div class="portal-topbar__right">
          <NotificationBell />
          <div class="topbar-avatar">{{ userInitial }}</div>
        </div>
      </div>

      <section v-if="isAdmin" class="admin-subscriber-picker">
        <span class="admin-view-label">VISTA DE ADMINISTRADOR</span>
        <h2>Consultar portal de un suscriptor</h2>
        <form @submit.prevent="searchSubscribers">
          <input
            v-model="subscriberSearch"
            aria-label="Buscar suscriptor"
            placeholder="Nombre, documento, correo o número de suscriptor"
          /><button>Buscar</button>
        </form>
        <p v-if="selectedSubscriber">
          Consultando: <strong>{{ selectedSubscriber.fullName }}</strong>
        </p>
        <button v-for="p in subscribers" :key="p.id" @click="selectSubscriber(p)">
          {{ p.fullName }} · {{ p.documentNumber }} · {{ p.subscriberNumber }}
        </button>
        <p v-if="!selectedSubscriber">Selecciona un suscriptor para revisar sus facturas y consumo.</p>
      </section>
      <!-- Resumen section -->
      <div v-if="activeSection === 'resumen' && (!isAdmin || selectedSubscriber)" class="portal-content">
        <!-- Error banner -->
        <div v-if="errorMsg" class="error-banner" role="alert">
          ⚠️ {{ errorMsg }}
          <button type="button" class="link-btn" :disabled="loading" @click="loadDashboard">Reintentar</button>
        </div>

        <p v-if="loading" role="status">Cargando tu resumen de consumo y facturas…</p>
        <section class="service-intro" aria-labelledby="service-intro-title">
          <div class="service-intro__copy">
            <p class="ws-eyebrow">TU CONEXIÓN CON EL AGUA</p>
            <h2 id="service-intro-title">Un servicio cercano.<br /><em>Todo a tu alcance.</em></h2>
            <p>Consulta tus facturas, conoce tu consumo y encuentra ayuda para cuidar tu servicio.</p>
            <div class="portal-primary-actions">
              <button class="btn btn--primary" @click="activeSection = 'facturas'">Consultar mis facturas</button>
              <button class="btn btn--outline" @click="router.push('/pagos')">Ir a pagos</button>
            </div>
          </div>
          <div class="service-intro__art"><WaterNetwork /></div>
        </section>
        <!-- 3 KPI cards -->
        <div class="stat-cards stat-cards--3">
          <!-- Card 1: Factura Actual (latest invoice + status) -->
          <div class="stat-card">
            <div class="stat-card__icon" style="background: #e0f2fe">🧾</div>
            <div class="stat-card__info">
              <p class="stat-card__label">Factura Actual</p>
              <p class="stat-card__value" :class="{ 'stat-card__value--loading': loading }">
                {{ loading ? '···' : invoiceAmount }}
              </p>
              <div class="stat-card__row" v-if="!loading && invoiceStatusLabel">
                <span :class="['inv-badge', invoiceStatusClass]">{{ invoiceStatusLabel }}</span>
                <span class="stat-card__detail" v-if="invoiceDate">{{ invoiceDate }}</span>
              </div>
              <p class="stat-card__detail" v-else-if="!loading">Sin facturas registradas</p>
            </div>
          </div>

          <!-- Card 2: Consumo (latest meter reading) -->
          <div class="stat-card">
            <div class="stat-card__icon" style="background: #d1fae5">💧</div>
            <div class="stat-card__info">
              <p class="stat-card__label">Último Consumo</p>
              <p class="stat-card__value" :class="{ 'stat-card__value--loading': loading }">
                {{ loading ? '···' : consumoValue }}
              </p>
              <p class="stat-card__detail">Última lectura registrada</p>
            </div>
          </div>

          <!-- Card 3: Estado Servicio -->
          <div class="stat-card">
            <div class="stat-card__icon" :style="{ background: serviceIconBg }">{{ serviceIcon }}</div>
            <div class="stat-card__info">
              <p class="stat-card__label">Estado Servicio</p>
              <p class="stat-card__value" :class="{ 'stat-card__value--loading': loading }">
                {{ loading ? '···' : serviceLabel }}
              </p>
              <p class="stat-card__detail">{{ serviceDetail }}</p>
            </div>
          </div>
        </div>

        <!-- Consumption trend chart -->
        <div class="chart-card chart-card--full">
          <div class="chart-card__header">
            <h3>Tendencia de Consumo</h3>
            <span class="chart-card__badge">Últimos 6 meses</span>
          </div>
          <div class="chart-wrapper">
            <canvas ref="lineChartRef" role="img" aria-label="Tendencia de consumo en metros cúbicos"></canvas>
            <p v-if="!loading && !errorMsg && chartLabels.length === 0" class="chart-empty">
              Aún no hay lecturas para mostrar tu tendencia de consumo.
            </p>
          </div>
          <button class="chart-card__link" @click="activeSection = 'consumo'">Ver análisis completo →</button>
        </div>

        <!-- Bottom row -->
        <div class="bottom-row">
          <!-- Last 5 invoices -->
          <div class="portal-card">
            <div class="portal-card__header">
              <h3>Últimas Facturas</h3>
              <button class="link-btn" @click="activeSection = 'facturas'">Ver todas</button>
            </div>
            <div v-if="loading" class="invoice-empty">Cargando…</div>
            <div v-else-if="recentInvoices.length === 0" class="invoice-empty">No hay facturas registradas.</div>
            <div v-else class="invoice-list">
              <div v-for="inv in recentInvoices" :key="inv.id" class="invoice-item">
                <div class="invoice-item__left">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    class="invoice-icon"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p class="invoice-item__id">{{ inv.id }}</p>
                    <p class="invoice-item__date">{{ inv.date }}</p>
                  </div>
                </div>
                <div class="invoice-item__right">
                  <span class="invoice-item__amount">{{ inv.amount }}</span>
                  <span :class="['invoice-item__status', inv.statusClass]">{{ inv.statusLabel }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Trámites rápidos -->
          <div class="portal-card">
            <div class="portal-card__header">
              <h3>Trámites Rápidos</h3>
            </div>
            <div class="quick-list">
              <button v-for="action in quickActions" :key="action.label" class="quick-item">
                <div class="quick-item__left">
                  <span class="quick-item__icon">{{ action.icon }}</span>
                  <div>
                    <p class="quick-item__label">{{ action.label }}</p>
                    <p class="quick-item__desc">{{ action.desc }}</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mis Facturas section -->
      <div v-else-if="activeSection === 'facturas'" class="portal-content">
        <MisFacturas v-if="!isAdmin || selectedSubscriber" :key="selectedSubscriber?.id" :person-id="selectedSubscriber?.id" />
      </div>

      <!-- Notificaciones section -->
      <div v-else-if="activeSection === 'notificaciones'" class="portal-content">
        <div class="notif-history">
          <h2 class="notif-history__title">Mis Notificaciones</h2>
          <p class="notif-history__sub">Últimos 30 movimientos registrados en tu cuenta</p>
          <div v-if="allNotifs.length === 0" class="notif-history__empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#ccc">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p>Sin notificaciones</p>
          </div>
          <div v-else class="notif-history__list">
            <div
              v-for="n in allNotifs.slice(0, 30)"
              :key="n.id"
              class="notif-history__item"
              :class="{ 'notif-history__item--unread': !n.read }"
            >
              <span class="notif-history__icon">{{ notifIcon(n.type) }}</span>
              <div class="notif-history__body">
                <div class="notif-history__row">
                  <span class="notif-history__item-title">{{ n.title }}</span>
                  <span class="notif-history__badge" :class="`notif-history__badge--${n.type.split('.')[1]}`">{{
                    notifLabel(n.type)
                  }}</span>
                </div>
                <p class="notif-history__msg">{{ n.message }}</p>
                <p class="notif-history__date">{{ fmtDate(n.createdAt) }}</p>
              </div>
              <span v-if="!n.read" class="notif-history__dot" title="No leída" />
            </div>
          </div>
        </div>
      </div>

      <!-- Mi Consumo section -->
      <div v-else-if="activeSection === 'consumo'" class="portal-content">
        <MiConsumo v-if="!isAdmin || selectedSubscriber" :key="selectedSubscriber?.id" :person-id="selectedSubscriber?.id" />
      </div>

      <!-- Trámites section -->
      <div v-else-if="activeSection === 'tramites'" class="portal-content">
        <div class="portal-card full-width">
          <div class="portal-card__header">
            <h3>Trámites y Solicitudes</h3>
          </div>
          <div class="quick-list">
            <button v-for="action in quickActions" :key="action.label" class="quick-item">
              <div class="quick-item__left">
                <span class="quick-item__icon">{{ action.icon }}</span>
                <div>
                  <p class="quick-item__label">{{ action.label }}</p>
                  <p class="quick-item__desc">{{ action.desc }}</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Soporte section -->
      <div v-else-if="activeSection === 'soporte'" class="portal-content">
        <div class="portal-card full-width soporte-card">
          <div class="soporte-icon">💬</div>
          <h3>Centro de Soporte</h3>
          <a href="/whatsapp/">Vincular WhatsApp y gestionar avisos de facturas</a>
          <p>¿Tienes algún problema con tu servicio? Contáctanos y te ayudaremos lo antes posible.</p>
          <div class="soporte-options">
            <div class="soporte-option">
              <span class="soporte-option__icon">📞</span>
              <div>
                <p class="soporte-option__label">Línea de Atención</p>
                <p class="soporte-option__val">01 8000 123 456</p>
              </div>
            </div>
            <div class="soporte-option">
              <span class="soporte-option__icon">📧</span>
              <div>
                <p class="soporte-option__label">Correo Electrónico</p>
                <p class="soporte-option__val">soporte@watsolution.com</p>
              </div>
            </div>
            <div class="soporte-option">
              <span class="soporte-option__icon">🕘</span>
              <div>
                <p class="soporte-option__label">Horario de Atención</p>
                <p class="soporte-option__val">Lun – Vie: 8:00 am – 6:00 pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout */
.portal-layout {
  display: flex;
  align-items: flex-start;
  min-height: calc(100vh - 70px);
  background: #f8fafc;
}

/* Sidebar */
.portal-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #1a2e4a;
  min-height: calc(100vh - 70px);
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

.sidebar-brand__text {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
}

.sidebar-brand__text span {
  color: #38bdf8;
}

.sidebar-brand__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.sidebar-brand__close:hover {
  color: #ffffff;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  width: 100%;
}

.sidebar-nav__item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.sidebar-nav__item.active {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-weight: 600;
}

.sidebar-nav__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-nav__label {
  font-size: 0.92rem;
}

/* Main */
.portal-main {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

/* Top bar */
.portal-topbar {
  background: #ffffff;
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.portal-topbar__greeting {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.portal-topbar__sub {
  font-size: 0.9rem;
  color: #64748b;
  margin: 2px 0 0;
}

.portal-topbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.topbar-icon-btn:hover {
  border-color: #0077be;
  color: #0077be;
}

.topbar-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0077be;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

/* Content */
.portal-content {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Stat cards */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-cards--3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1200px) {
  .stat-cards,
  .stat-cards--3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-cards,
  .stat-cards--3 {
    grid-template-columns: 1fr;
  }
}

.stat-card__value--loading {
  color: #94a3b8;
  letter-spacing: 2px;
}

.stat-card__row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.inv-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}
.inv-badge.pending {
  background: #fef3c7;
  color: #92400e;
}
.inv-badge.paid {
  background: #d1fae5;
  color: #065f46;
}
.inv-badge.cancelled {
  background: #f1f5f9;
  color: #64748b;
}

.invoice-empty {
  font-size: 0.88rem;
  color: #94a3b8;
  text-align: center;
  padding: 16px 0;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.88rem;
  font-weight: 500;
}

.invoice-item__status.cancelled {
  background: #f1f5f9;
  color: #64748b;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.stat-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.stat-card__label {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 4px;
}

.stat-card__value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 2px;
}

.stat-card__detail {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

/* Charts */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chart-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-card__header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.chart-card__badge {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
}

.chart-card--full {
  grid-column: 1 / -1;
}

.chart-card__link {
  display: inline-block;
  margin-top: 14px;
  background: none;
  border: none;
  color: #0077be;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}

.chart-card__link:hover {
  opacity: 0.75;
}

.chart-wrapper {
  height: 220px;
}

.chart-wrapper--tall {
  height: 300px;
}

/* Bottom row */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .bottom-row {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.portal-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.portal-card.full-width {
  width: 100%;
}

.portal-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.portal-card__header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.link-btn {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0077be;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
}

/* Invoice list */
.invoice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.invoice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 12px;
}

.invoice-item__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.invoice-icon {
  color: #0077be;
  flex-shrink: 0;
}

.invoice-item__id {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.invoice-item__date {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
}

.invoice-item__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.invoice-item__amount {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
}

.invoice-item__status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}

.invoice-item__status.pending {
  background: #fef3c7;
  color: #92400e;
}

.invoice-item__status.paid {
  background: #d1fae5;
  color: #065f46;
}

/* Quick actions */
.quick-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.quick-item:hover {
  border-color: #0077be;
  background: #eff6ff;
}

.quick-item__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-item__icon {
  font-size: 1.3rem;
}

.quick-item__label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.quick-item__desc {
  font-size: 0.78rem;
  color: #64748b;
  margin: 2px 0 0;
}

/* Soporte */
.soporte-card {
  text-align: center;
  padding: 48px 32px;
}

.soporte-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.soporte-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px;
}

.soporte-card p {
  color: #64748b;
  margin: 0 0 32px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.soporte-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
}

.soporte-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.soporte-option__icon {
  font-size: 1.5rem;
}

.soporte-option__label {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 2px;
}

.soporte-option__val {
  font-size: 0.92rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Mobile: hide sidebar */
@media (max-width: 768px) {
  .portal-sidebar {
    display: none;
  }
}

.notif-history {
  max-width: 720px;

  &__title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1a2a3a;
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 0.85rem;
    color: #888;
    margin: 0 0 24px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 0;
    color: #aaa;
    font-size: 0.95rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid #eee;
    border-radius: 12px;
    overflow: hidden;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
    border-bottom: 1px solid #f5f5f5;
    background: #fff;
    transition: background 0.15s;
    position: relative;

    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background: #fafafa;
    }

    &--unread {
      background: #fff8f0;
    }
  }

  &__icon {
    font-size: 1.4rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }

  &__item-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: #1a2a3a;
  }

  &__badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    background: #e8f4fd;
    color: #0077be;

    &--paid {
      background: #d1fae5;
      color: #065f46;
    }
    &--overdue {
      background: #fee2e2;
      color: #991b1b;
    }
    &--due_soon {
      background: #fef3c7;
      color: #92400e;
    }
    &--created {
      background: #e8f4fd;
      color: #0077be;
    }
  }

  &__msg {
    margin: 0 0 4px;
    font-size: 0.82rem;
    color: #555;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    margin: 0;
    font-size: 0.75rem;
    color: #aaa;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e67e22;
    flex-shrink: 0;
    margin-top: 6px;
  }
}

.portal-layout {
  background: #f1f6f7;
}
.portal-sidebar {
  background: #123f50;
}
.portal-topbar {
  border-bottom: 1px solid #d4e4e8;
}
.portal-topbar__greeting {
  color: #123f50;
  letter-spacing: -0.035em;
}
.portal-primary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.stat-card,
.chart-card,
.portal-card {
  border: 1px solid #d4e4e8;
  box-shadow: none;
  border-radius: 18px;
}
.stat-card__value {
  color: #123f50;
  font-variant-numeric: tabular-nums;
}
.chart-wrapper {
  position: relative;
}
.chart-empty {
  position: absolute;
  inset: 40% 20px auto;
  text-align: center;
  color: #536b76;
}
.notif-history__date,
.portal-topbar__sub {
  color: #586e78;
}
@media (max-width: 768px) {
  .portal-layout {
    flex-direction: column;
  }
  .portal-main {
    width: 100%;
  }
  .portal-sidebar {
    display: block;
    width: 100%;
    min-height: 0;
    height: auto;
    position: static;
  }
  .sidebar-brand {
    display: none;
  }
  .sidebar-nav {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;
    gap: 4px;
  }
  .sidebar-nav__item {
    width: auto;
    min-height: 48px;
    flex: 0 0 auto;
    padding: 10px 14px;
  }
  .sidebar-nav__label {
    white-space: nowrap;
    font-size: 13px;
  }
  .portal-content {
    padding: 20px 16px;
  }
  .portal-topbar {
    padding: 22px 16px;
  }
  .portal-primary-actions > * {
    flex: 1 1 140px;
  }
}
</style>

<style scoped>
.portal-admin-return {
  margin-top: auto;
  padding: 24px 14px 0;
  position: sticky;
  bottom: 0;
  background: inherit;
}
.portal-admin-return a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 13px;
  color: #fff;
  background: #ffffff12;
  border: 1px solid #ffffff45;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.15s;
}
.portal-admin-return a:hover {
  background: #ffffff24;
}
.portal-admin-return a:focus-visible {
  outline: 3px solid #9ed1bb;
  outline-offset: 3px;
}
.portal-admin-return svg {
  flex-shrink: 0;
}
.portal-admin-return span {
  display: grid;
  gap: 3px;
}
.portal-admin-return strong {
  font-size: 13px;
}
.portal-admin-return small {
  font-size: 11px;
  opacity: 0.7;
}
.admin-view-label {
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.6px;
  color: #597d6c;
}
@media (max-width: 768px) {
  .portal-admin-return {
    position: fixed;
    z-index: 90;
    left: 16px;
    bottom: max(16px, env(safe-area-inset-bottom));
    margin: 0;
    padding: 0;
    background: #173f43;
    border-radius: 12px;
    box-shadow: 0 6px 22px #173f4330;
  }
  .portal-admin-return a {
    padding: 12px 16px;
  }
  .portal-admin-return small {
    display: none;
  }
  .admin-preview {
    padding-bottom: 82px;
  }
}
.admin-subscriber-picker {
  margin: 24px;
  padding: 24px;
  background: #f0f7f2;
  border: 1px solid #c9ded0;
  border-radius: 14px;
  color: #143e43;
}
.admin-subscriber-picker h2 {
  font-size: 20px;
  margin: 16px 0;
}
.admin-subscriber-picker form {
  display: flex;
  gap: 8px;
}
.admin-subscriber-picker input {
  flex: 1;
  min-width: 0;
  border: 1px solid #bad1c3;
  border-radius: 8px;
  padding: 12px;
}
.admin-subscriber-picker button {
  background: white;
  border: 1px solid #bad1c3;
  border-radius: 8px;
  color: #176b61;
  padding: 10px;
  margin: 4px;
}
.admin-subscriber-picker p {
  font-size: 13px;
  margin-top: 14px;
}
</style>
