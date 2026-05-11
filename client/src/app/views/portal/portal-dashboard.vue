<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import { useAccountStore } from '@/shared/config/store/account-store';

Chart.register(...registerables);

const router = useRouter();
const accountStore = useAccountStore();

const isSidebarOpen = ref(window.innerWidth > 1024);
const isMobile = ref(window.innerWidth <= 1024);
const activeTab = ref('resumen');

const portalMenu = [
  { id: 'resumen', label: 'Resumen', icon: 'tachometer-alt' },
  { id: 'facturas', label: 'Mis Facturas', icon: 'file-invoice-dollar' },
  { id: 'consumo', label: 'Mi Consumo', icon: 'tint' },
  { id: 'tramites', label: 'Trámites', icon: 'clipboard-list' },
  { id: 'soporte', label: 'Soporte', icon: 'headset' },
];

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024;
  if (isMobile.value) {
    isSidebarOpen.value = false;
  } else {
    isSidebarOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize();
});

const quickStats = [
  {
    label: 'Factura Actual',
    value: '$45,000',
    sub: 'Vence: 15 May 2026',
    icon: 'file-invoice-dollar',
    color: '#0077be',
  },
  {
    label: 'Consumo Mes',
    value: '15 m³',
    sub: '-8% vs mes anterior',
    icon: 'tint',
    color: '#00ced1',
  },
  {
    label: 'Estado Servicio',
    value: 'Activo',
    sub: 'Sin novedades',
    icon: 'check-circle',
    color: '#10b981',
  },
  {
    label: 'Próximo Pago',
    value: '12 días',
    sub: 'Configurar recordatorio',
    icon: 'calendar-alt',
    color: '#f59e0b',
  },
];

const invoices = [
  { id: 'FAC-2026-001', date: '2026-04-01', amount: 45000, status: 'Pendiente', statusColor: '#f59e0b' },
  { id: 'FAC-2026-002', date: '2026-03-01', amount: 42500, status: 'Pagada', statusColor: '#10b981' },
  { id: 'FAC-2026-003', date: '2026-02-01', amount: 48000, status: 'Pagada', statusColor: '#10b981' },
  { id: 'FAC-2026-004', date: '2026-01-01', amount: 39000, status: 'Pagada', statusColor: '#10b981' },
];

const consumptionChartRef = ref<HTMLCanvasElement | null>(null);
const comparisonChartRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (consumptionChartRef.value) {
    new Chart(consumptionChartRef.value, {
      type: 'line',
      data: {
        labels: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
        datasets: [
          {
            label: 'Tu Consumo (m³)',
            data: [12, 15, 14, 18, 16, 15],
            borderColor: '#0077be',
            backgroundColor: 'rgba(0, 119, 190, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#0077be',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  if (comparisonChartRef.value) {
    new Chart(comparisonChartRef.value, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr'],
        datasets: [
          {
            label: 'Tu consumo',
            data: [14, 18, 16, 15],
            backgroundColor: '#0077be',
            borderRadius: 6,
          },
          {
            label: 'Promedio vecinos',
            data: [16, 17, 18, 16],
            backgroundColor: '#cbd5e1',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } },
        },
      },
    });
  }
});

const notifications = [
  { text: 'Tu factura de abril ya está disponible', type: 'info', date: 'Hace 2 días' },
  { text: 'Pago recibido: Factura MAR-2026', type: 'success', date: 'Hace 5 días' },
  { text: 'Mantenimiento programado: 20 May', type: 'warning', date: 'Hace 1 semana' },
];

const tramites = [
  { title: 'Reportar Fuga', icon: 'exclamation-triangle', color: '#ef4444', desc: 'Notifica una fuga en tu sector' },
  { title: 'Reclamaciones', icon: 'comments', color: '#0077be', desc: 'Presenta una queja o reclamo' },
  { title: 'Certificado', icon: 'file-alt', color: '#10b981', desc: 'Solicita certificado de servicio' },
  { title: 'Cambio Titular', icon: 'user-edit', color: '#f59e0b', desc: 'Transfiere la cuenta' },
];
</script>

<template>
  <div class="portal-layout">
    <div v-if="isMobile && isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- Sidebar -->
    <aside :class="['portal-sidebar', { 'is-closed': !isSidebarOpen, 'is-mobile': isMobile }]">
      <div class="sidebar-header">
        <router-link to="/" class="logo-text" v-if="isSidebarOpen || !isMobile"> Wat<span>Solution</span> </router-link>
        <button class="toggle-btn" @click="toggleSidebar" aria-label="Alternar menú">
          <font-awesome-icon v-if="!isSidebarOpen" icon="bars" :size="20" />
          <font-awesome-icon v-else icon="times" :size="20" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in portalMenu"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeTab === item.id }"
          @click="
            activeTab = item.id;
            if (isMobile) isSidebarOpen = false;
          "
        >
          <div class="nav-icon-container">
            <font-awesome-icon :icon="item.icon" :size="20" />
          </div>
          <span v-if="isSidebarOpen || isMobile">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/" class="nav-item back-link">
          <div class="nav-icon-container">
            <font-awesome-icon icon="arrow-left" :size="18" />
          </div>
          <span v-if="isSidebarOpen || isMobile">Volver al Inicio</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="portal-main">
      <!-- Top Header -->
      <header class="portal-topbar">
        <div class="topbar-info">
          <h1>Hola, {{ accountStore.account?.firstName || 'Usuario' }}</h1>
          <p>Bienvenido a tu portal personal</p>
        </div>
        <div class="topbar-actions">
          <div class="notification-bell" title="Notificaciones">
            <font-awesome-icon icon="bell" :size="20" />
            <span class="notification-dot" v-if="notifications.length"></span>
          </div>
          <div class="user-avatar">
            {{ accountStore.account?.firstName?.charAt(0) || 'U' }}
          </div>
        </div>
      </header>

      <div class="portal-content">
        <!-- Quick Stats -->
        <div class="stats-grid">
          <div v-for="stat in quickStats" :key="stat.label" class="stat-card">
            <div class="stat-card__icon" :style="{ backgroundColor: stat.color + '15', color: stat.color }">
              <font-awesome-icon :icon="stat.icon" :size="22" />
            </div>
            <div class="stat-card__content">
              <span class="stat-card__label">{{ stat.label }}</span>
              <span class="stat-card__value">{{ stat.value }}</span>
              <span class="stat-card__sub">{{ stat.sub }}</span>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="dashboard-row">
          <div class="chart-card chart-card--large">
            <div class="card-header">
              <h3>Tendencia de Consumo</h3>
              <span class="badge">Últimos 6 meses</span>
            </div>
            <div class="chart-wrapper">
              <canvas ref="consumptionChartRef"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="card-header">
              <h3>Comparativa</h3>
              <span class="badge">m³ / mes</span>
            </div>
            <div class="chart-wrapper chart-wrapper--small">
              <canvas ref="comparisonChartRef"></canvas>
            </div>
          </div>
        </div>

        <!-- Invoices + Actions -->
        <div class="dashboard-row dashboard-row--alt">
          <div class="panel-card">
            <div class="card-header">
              <h3>Últimas Facturas</h3>
              <router-link to="/pagos" class="btn-text">Ver todas</router-link>
            </div>
            <div class="invoices-list">
              <div v-for="inv in invoices" :key="inv.id" class="invoice-item">
                <div class="invoice-info">
                  <div class="invoice-icon">
                    <font-awesome-icon icon="file-alt" :size="18" />
                  </div>
                  <div class="invoice-details">
                    <span class="invoice-id">{{ inv.id }}</span>
                    <span class="invoice-date">{{ new Date(inv.date).toLocaleDateString('es-CO') }}</span>
                  </div>
                </div>
                <div class="invoice-meta">
                  <span class="invoice-amount">${{ inv.amount.toLocaleString('es-CO') }}</span>
                  <span class="invoice-status" :style="{ backgroundColor: inv.statusColor + '15', color: inv.statusColor }">
                    {{ inv.status }}
                  </span>
                </div>
              </div>
            </div>
            <div class="invoice-actions-footer">
              <router-link to="/pagos" class="btn btn--primary btn--block">
                <font-awesome-icon icon="credit-card" :size="16" /> Pagar Factura Actual
              </router-link>
            </div>
          </div>

          <div class="panel-card">
            <div class="card-header">
              <h3>Trámites Rápidos</h3>
            </div>
            <div class="tramites-grid">
              <button v-for="t in tramites" :key="t.title" class="tramite-btn">
                <div class="tramite-icon" :style="{ backgroundColor: t.color + '15', color: t.color }">
                  <font-awesome-icon :icon="t.icon" :size="22" />
                </div>
                <div class="tramite-info">
                  <span class="tramite-title">{{ t.title }}</span>
                  <span class="tramite-desc">{{ t.desc }}</span>
                </div>
                <font-awesome-icon icon="chevron-right" :size="14" class="tramite-arrow" />
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="panel-card notifications-card">
          <div class="card-header">
            <h3>Notificaciones Recientes</h3>
            <button class="btn-text">Marcar todo como leído</button>
          </div>
          <div class="notifications-list">
            <div v-for="(n, i) in notifications" :key="i" class="notification-item">
              <div
                class="notification-dot-type"
                :class="{ 'dot-info': n.type === 'info', 'dot-success': n.type === 'success', 'dot-warning': n.type === 'warning' }"
              ></div>
              <div class="notification-body">
                <p class="notification-text">{{ n.text }}</p>
                <span class="notification-date">{{ n.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../content/scss/variables' as *;
@use '../../../content/scss/mixins' as *;

$sidebar-width: 260px;
$sidebar-collapsed: 80px;

.portal-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1500;
  backdrop-filter: blur(2px);
}

.portal-sidebar {
  width: $sidebar-width;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 2000;

  &.is-closed {
    width: $sidebar-collapsed;

    .logo-text,
    .nav-item span,
    .back-link span {
      display: none;
    }

    .nav-item,
    .back-link {
      justify-content: center;
      padding: 1rem;
    }

    .sidebar-header {
      justify-content: center;
      padding: 16px 0;
    }
  }

  &.is-mobile {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(0);

    &.is-closed {
      transform: translateX(-100%);
      width: 280px;
    }
  }
}

.sidebar-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 70px;

  .logo-text {
    font-size: 1.15rem;
    color: #94a3b8;
    font-weight: 700;
    letter-spacing: -0.5px;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    span {
      color: $color-secondary;
    }
  }

  .toggle-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  }
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 16px;
  color: #94a3b8;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 1rem;

  .nav-icon-container {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &:hover,
  &.active {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    border-left: 4px solid $color-primary;
    color: white;
    background: rgba($color-primary, 0.1);
  }
}

.back-link {
  text-decoration: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.sidebar-footer {
  padding: 16px 0;
  margin-top: auto;
}

.portal-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  min-width: 0;
}

.portal-topbar {
  background: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: $color-text;
    margin: 0;
  }

  p {
    color: $color-text-muted;
    margin: 0.25rem 0 0;
    font-size: 0.95rem;
  }
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-bell {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $color-text-muted;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: $color-primary;
  }
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: $color-primary;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.portal-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @include tablet {
    padding: 2rem;
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  &__icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__label {
    font-size: 0.85rem;
    color: $color-text-muted;
    font-weight: 500;
  }

  &__value {
    font-size: 1.4rem;
    font-weight: 800;
    color: $color-text;
  }

  &__sub {
    font-size: 0.8rem;
    color: $color-text-muted;
  }
}

/* Dashboard Rows */
.dashboard-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @include desktop {
    grid-template-columns: 2fr 1fr;
  }

  &--alt {
    @include desktop {
      grid-template-columns: 1.2fr 1fr;
    }
  }
}

.chart-card,
.panel-card {
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: $shadow-sm;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: $color-text;
    margin: 0;
  }
}

.badge {
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  color: $color-text-muted;
}

.chart-wrapper {
  height: 280px;
  position: relative;

  &--small {
    height: 220px;
  }
}

.btn-text {
  background: none;
  border: none;
  color: $color-primary;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

/* Invoices */
.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.invoice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 14px;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }
}

.invoice-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.invoice-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: $color-primary + '15';
  color: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invoice-details {
  display: flex;
  flex-direction: column;

  .invoice-id {
    font-weight: 700;
    color: $color-text;
    font-size: 0.95rem;
  }

  .invoice-date {
    font-size: 0.8rem;
    color: $color-text-muted;
  }
}

.invoice-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.invoice-amount {
  font-weight: 700;
  color: $color-text;
  font-size: 1rem;
}

.invoice-status {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
}

.invoice-actions-footer {
  margin-top: 1.25rem;
}

/* Tramites */
.tramites-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tramite-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;

  &:hover {
    background: white;
    border-color: #e2e8f0;
    box-shadow: $shadow-sm;
  }
}

.tramite-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tramite-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  .tramite-title {
    font-weight: 700;
    color: $color-text;
    font-size: 0.95rem;
  }

  .tramite-desc {
    font-size: 0.8rem;
    color: $color-text-muted;
  }
}

.tramite-arrow {
  color: #cbd5e1;
}

/* Notifications */
.notifications-card {
  @include desktop {
    max-width: 70%;
  }
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 14px;
}

.notification-dot-type {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;

  &.dot-info {
    background: #3b82f6;
  }

  &.dot-success {
    background: #10b981;
  }

  &.dot-warning {
    background: #f59e0b;
  }
}

.notification-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-text {
  margin: 0;
  color: $color-text;
  font-size: 0.95rem;
}

.notification-date {
  font-size: 0.8rem;
  color: $color-text-muted;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 0.95rem;

  &--primary {
    background: $color-primary;
    color: white;

    &:hover {
      background: $color-primary-dark;
    }
  }

  &--block {
    width: 100%;
  }
}
</style>
