<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useRouter, useRoute } from 'vue-router'
import { useAccountStore } from '@/shared/config/store/account-store'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'

Chart.register(...registerables)

const router = useRouter()
const route = useRoute()
const accountStore = useAccountStore()

const isSidebarOpen = ref(window.innerWidth > 1024)
const isMobile = ref(window.innerWidth <= 1024)

const menuItems = [
  { name: 'Resumen', routeName: 'AdminResumen', icon: 'tachometer-alt' },
  { name: 'Actividad', routeName: 'AdminActividad', icon: 'history' },
  { name: 'Usuarios', routeName: 'AdminUsuarios', icon: 'users' },
  { name: 'Facturación', routeName: 'AdminFacturacion', icon: 'file-invoice-dollar' },
  { name: 'Noticias', routeName: 'AdminNoticias', icon: 'newspaper' },
]

const handleLogout = () => {
  accountStore.logout()
  router.push('/login')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024
  isSidebarOpen.value = !isMobile.value
}

// ── Stats ────────────────────────────────────────────────────────────────────
interface Stat {
  label: string
  value: string
  icon: string
  color: string
  trend: string
  isPositive: boolean
  description: string
  raw: number
}

const stats = ref<Stat[]>([
  { label: 'Usuarios Activos', value: '–', icon: 'users', color: '#3b82f6', trend: '', isPositive: true, description: 'Suscriptores con servicio activo', raw: 0 },
  { label: 'Recaudo Mensual', value: '–', icon: 'dollar-sign', color: '#10b981', trend: '', isPositive: true, description: 'Total recaudado este mes', raw: 0 },
  { label: 'Consumo Total', value: '–', icon: 'tint', color: '#0ea5e9', trend: '', isPositive: true, description: 'Consumo del mes en curso', raw: 0 },
])

async function loadStats() {
  try {
    const { data } = await axios.get('api/admin/stats')
    stats.value[0].value = data.activeUsers.toLocaleString('es-CO')
    stats.value[0].raw = data.activeUsers

    const revM = (data.monthlyRevenue / 1_000_000).toFixed(1)
    stats.value[1].value = `$${revM}M`
    stats.value[1].raw = data.monthlyRevenue

    stats.value[2].value = `${parseFloat(data.totalConsumption).toLocaleString('es-CO')} m³`
    stats.value[2].raw = data.totalConsumption
  } catch {
    // keep placeholder values
  }
}

// ── Charts ───────────────────────────────────────────────────────────────────
const consumptionChartRef = ref<HTMLCanvasElement | null>(null)
const revenueChartRef = ref<HTMLCanvasElement | null>(null)
let consumptionChart: Chart | null = null
let revenueChart: Chart | null = null

async function loadCharts() {
  try {
    const { data } = await axios.get('api/admin/dashboard')
    const labels = data.consumptionTrend.map((p: any) => p.month)
    const consumptionValues = data.consumptionTrend.map((p: any) => p.value)
    const revenueValues = data.monthlyRevenue.map((p: any) => p.value / 1_000_000)

    if (consumptionChartRef.value) {
      consumptionChart?.destroy()
      consumptionChart = new Chart(consumptionChartRef.value, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Consumo (m³)',
            data: consumptionValues,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } },
          },
        },
      })
    }

    if (revenueChartRef.value) {
      revenueChart?.destroy()
      revenueChart = new Chart(revenueChartRef.value, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Recaudo ($)',
            data: revenueValues,
            backgroundColor: '#10b981',
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: { callback: (val) => `$${val}M` },
            },
            x: { grid: { display: false } },
          },
        },
      })
    }
  } catch {
    // charts remain empty on error
  }
}

// ── Tank level WebSocket ──────────────────────────────────────────────────────
interface TankLevelEvent {
  level: number
  alert: boolean
  timestamp: string
}

const tankLevel = ref(75)
const tankAlert = ref(false)
const tankTimestamp = ref('')
const tankConnected = ref(false)
let socket: Socket | null = null

function connectTankSocket() {
  const wsUrl = import.meta.env.DEV ? 'http://localhost:8080' : window.location.origin
  socket = io(`${wsUrl}/tank`, { transports: ['websocket', 'polling'] })

  socket.on('connect', () => { tankConnected.value = true })
  socket.on('disconnect', () => { tankConnected.value = false })
  socket.on('tank-level', (event: TankLevelEvent) => {
    tankLevel.value = event.level
    tankAlert.value = event.alert
    tankTimestamp.value = new Date(event.timestamp).toLocaleTimeString('es-CO')
  })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
  loadStats()
  loadCharts()
  connectTankSocket()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  socket?.disconnect()
  consumptionChart?.destroy()
  revenueChart?.destroy()
})

// Gauge fill color based on level
function tankColor(level: number): string {
  if (level < 65) return '#ef4444'
  if (level < 80) return '#f59e0b'
  return '#10b981'
}
</script>

<template>
  <div class="admin-layout">
    <div
      v-if="isMobile && isSidebarOpen"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>

    <aside :class="['admin-sidebar', { 'is-closed': !isSidebarOpen, 'is-mobile': isMobile }]">
      <div class="sidebar-header">
        <span class="logo-text" v-if="isSidebarOpen || !isMobile">Wat<strong>Solution</strong></span>
        <button class="toggle-btn" @click="toggleSidebar">
          <font-awesome-icon v-if="!isSidebarOpen" icon="bars" :size="20" />
          <font-awesome-icon v-else icon="times" :size="20" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          class="nav-item"
          :class="{ 'active': route.name === item.routeName }"
        >
          <div class="nav-icon-container">
            <font-awesome-icon :icon="item.icon" :size="22" />
          </div>
          <span v-if="isSidebarOpen || isMobile">{{ item.name }}</span>
          <font-awesome-icon v-if="isSidebarOpen && !isMobile" class="chevron" icon="chevron-right" :size="14" />
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-profile">
          <div class="avatar">{{ accountStore.account?.firstName?.charAt(0) || 'A' }}{{ accountStore.account?.lastName?.charAt(0) || 'D' }}</div>
          <div class="info" v-if="isSidebarOpen || isMobile">
            <span class="name">{{ accountStore.account?.firstName || 'Administrador' }}</span>
            <span class="role">Administrador Principal</span>
          </div>
        </div>
        <button class="home-btn" @click="router.push({ name: 'Home' })">
          <font-awesome-icon icon="home" :size="20" />
          <span v-if="isSidebarOpen || isMobile">Volver al Inicio</span>
        </button>
        <button class="logout-btn" @click="handleLogout">
          <font-awesome-icon icon="sign-out-alt" :size="20" />
          <span v-if="isSidebarOpen || isMobile">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <div class="admin-content-view">
        <div class="summary-dashboard">
          <header class="summary-header">
            <div class="header-info">
              <h1>Resumen Ejecutivo</h1>
              <p><font-awesome-icon icon="calendar" :size="16" /> Periodo actual: <strong>{{ new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) }}</strong></p>
            </div>
            <div class="header-actions">
              <button class="btn btn--outline"><font-awesome-icon icon="filter" :size="18" /> Filtros</button>
              <button class="btn btn--primary"><font-awesome-icon icon="download" :size="18" /> Descargar Reporte</button>
            </div>
          </header>

          <!-- KPI cards -->
          <div class="metrics-grid">
            <div v-for="stat in stats" :key="stat.label" class="stat-card">
              <div class="stat-icon" :style="{ backgroundColor: stat.color + '15', color: stat.color }">
                <font-awesome-icon :icon="stat.icon" :size="24" />
              </div>
              <div class="stat-content">
                <span class="stat-label">{{ stat.label }}</span>
                <div class="stat-value-group">
                  <span class="stat-value">{{ stat.value }}</span>
                </div>
                <p class="stat-desc">{{ stat.description }}</p>
              </div>
            </div>
          </div>

          <!-- Charts + Tank widget -->
          <div class="dashboard-layout">
            <div class="main-stats">
              <div class="chart-card">
                <div class="card-header">
                  <h3>Tendencia de Consumo</h3>
                  <span class="badge">m³ / mes</span>
                </div>
                <div class="chart-container">
                  <canvas ref="consumptionChartRef"></canvas>
                </div>
              </div>

              <div class="chart-card">
                <div class="card-header">
                  <h3>Recaudo Mensual</h3>
                  <span class="badge success">Millones COP</span>
                </div>
                <div class="chart-container">
                  <canvas ref="revenueChartRef"></canvas>
                </div>
              </div>
            </div>

            <!-- Right column: system status + tank -->
            <div class="side-column">
              <div class="info-card">
                <h3>Estado del Sistema</h3>
                <div class="status-list">
                  <div class="status-item">
                    <div class="status-row">
                      <span class="status-label">Presión de Red</span>
                      <span class="status-value">85%</span>
                    </div>
                    <div class="status-bar"><div class="fill" style="width: 85%"></div></div>
                  </div>
                  <div class="status-item">
                    <div class="status-row">
                      <span class="status-label">Calidad Agua</span>
                      <span class="status-value">99%</span>
                    </div>
                    <div class="status-bar"><div class="fill success" style="width: 99%"></div></div>
                  </div>
                </div>
              </div>

              <!-- Tank level widget -->
              <div class="tank-card" :class="{ 'tank-card--alert': tankAlert }">
                <div class="tank-card__header">
                  <h3>Nivel del Tanque</h3>
                  <span class="tank-connection" :class="tankConnected ? 'connected' : 'disconnected'">
                    <span class="dot"></span>
                    {{ tankConnected ? 'En vivo' : 'Conectando…' }}
                  </span>
                </div>

                <!-- Alert banner -->
                <div v-if="tankAlert" class="tank-alert-banner">
                  <font-awesome-icon icon="exclamation-triangle" />
                  Nivel crítico — por debajo del 65%
                </div>

                <!-- Gauge -->
                <div class="tank-gauge-wrap">
                  <div class="tank-body">
                    <div
                      class="tank-fill"
                      :style="{
                        height: tankLevel + '%',
                        backgroundColor: tankColor(tankLevel),
                      }"
                    ></div>
                    <div class="tank-level-label">{{ tankLevel.toFixed(1) }}%</div>
                    <div class="tank-threshold-line" title="Umbral 65%"></div>
                  </div>
                  <div class="tank-scale">
                    <span>100%</span>
                    <span>75%</span>
                    <span class="threshold-mark">65%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                </div>

                <p class="tank-timestamp" v-if="tankTimestamp">Última lectura: {{ tankTimestamp }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
$spacing-xs: 8px;
$spacing-sm: 12px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$color-primary: #0077be;
$color-secondary: #00ced1;
$color-text: #2c3e50;
$color-text-muted: #64748b;
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);

.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1500;
  backdrop-filter: blur(2px);
}

.admin-sidebar {
  width: 260px;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
  min-height: 0;

  &.is-closed {
    width: 80px;
    .logo-text, .nav-item span, .chevron, .logout-btn span, .home-btn span { display: none; }
    .nav-item, .logout-btn, .home-btn { justify-content: center; padding: 1rem; }
    .sidebar-header { justify-content: center; padding: $spacing-md 0; }
  }

  &.is-mobile {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(0);
    z-index: 2000;

    &.is-closed {
      transform: translateX(-100%);
      width: 280px;
    }
  }
}

.sidebar-header {
  padding: $spacing-sm $spacing-md;
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    strong { color: $color-secondary; }
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
    margin-left: $spacing-xs;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  }
}

.sidebar-nav {
  flex: 1;
  padding: $spacing-md 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-x: hidden;
  min-height: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem $spacing-md;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;

  .nav-icon-container {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &:hover, &.active {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    border-left: 4px solid $color-primary;
    color: white;
    background: rgba($color-primary, 0.1);
  }

  .chevron { margin-left: auto; opacity: 0.5; }
}

.sidebar-footer {
  padding: $spacing-md;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.home-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  white-space: nowrap;
  margin-bottom: 4px;
  &:hover { background: rgba(255, 255, 255, 0.08); color: white; }
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  border-radius: 8px;
  white-space: nowrap;
  &:hover { background: rgba(239, 68, 68, 0.1); }
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  min-width: 0;
  background-color: #f8fafc;
  min-height: 0;
}

.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  margin-bottom: $spacing-sm;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);

  .avatar {
    width: 36px;
    height: 36px;
    background: $color-primary;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .name { font-weight: 600; font-size: 0.85rem; color: white; white-space: nowrap; }
    .role { font-size: 0.7rem; color: #94a3b8; white-space: nowrap; }
  }
}

.admin-content-view {
  flex: 1;
  padding: $spacing-lg;
  padding-bottom: $spacing-xl * 2;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  overflow-x: hidden;
}

.summary-dashboard {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: $spacing-md;

  h1 { font-size: 1.8rem; font-weight: 800; color: $color-text; margin-bottom: 4px; }
  p {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $color-text-muted;
    font-size: 0.95rem;
    strong { color: $color-primary; }
  }

  .header-actions {
    display: flex;
    gap: $spacing-sm;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: $spacing-lg;
}

.stat-card {
  background: white;
  padding: $spacing-lg;
  border-radius: 20px;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  transition: transform 0.2s;

  &:hover { transform: translateY(-4px); }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-content {
    .stat-label { font-size: 0.9rem; color: $color-text-muted; font-weight: 500; }
    .stat-value-group {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin: 4px 0;
      .stat-value { font-size: 1.75rem; font-weight: 800; color: $color-text; }
    }
    .stat-desc { font-size: 0.8rem; color: $color-text-muted; }
  }
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: $spacing-xl;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.main-stats {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.chart-card {
  background: white;
  padding: $spacing-xl;
  border-radius: 24px;
  box-shadow: $shadow-sm;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
    h3 { font-size: 1.2rem; font-weight: 700; }
    .badge {
      padding: 4px 12px;
      background: #f1f5f9;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      color: $color-text-muted;
      &.success { background: #dcfce7; color: #166534; }
    }
  }

  .chart-container {
    height: 300px;
    position: relative;
  }
}

.info-card {
  background: #1e293b;
  color: white;
  padding: $spacing-xl;
  border-radius: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h3 { font-size: 1.1rem; margin-bottom: $spacing-lg; }

  .status-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .status-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.85rem;

    .status-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .status-label { font-weight: 600; color: rgba(255, 255, 255, 0.9); }
    .status-value { font-weight: 700; color: rgba(255, 255, 255, 0.9); font-variant-numeric: tabular-nums; }

    .status-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      overflow: hidden;
      .fill {
        height: 100%;
        background: $color-primary;
        &.success { background: #10b981; }
      }
    }
  }
}

// ── Tank widget ──────────────────────────────────────────────────────────────
.tank-card {
  background: white;
  border-radius: 24px;
  padding: $spacing-xl;
  box-shadow: $shadow-sm;
  border: 2px solid transparent;
  transition: border-color 0.3s;

  &--alert {
    border-color: #ef4444;
    animation: pulse-border 1.5s infinite;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;

    h3 { font-size: 1rem; font-weight: 700; color: $color-text; margin: 0; }
  }
}

.tank-connection {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &.connected { color: #10b981; .dot { background: #10b981; animation: blink 1.5s infinite; } }
  &.disconnected { color: #94a3b8; .dot { background: #94a3b8; } }
}

.tank-alert-banner {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: $spacing-md;
}

.tank-gauge-wrap {
  display: flex;
  align-items: flex-end;
  gap: $spacing-md;
}

.tank-body {
  flex: 1;
  height: 200px;
  background: #f1f5f9;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.tank-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: height 0.8s ease, background-color 0.5s ease;
  border-radius: 0 0 10px 10px;
}

.tank-level-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  color: $color-text;
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
  z-index: 1;
}

// The 65% threshold line — positioned at 35% from the top (= 65% from bottom)
.tank-threshold-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 65%;
  height: 2px;
  background: repeating-linear-gradient(90deg, #ef4444 0, #ef4444 6px, transparent 6px, transparent 12px);
  z-index: 2;
  opacity: 0.7;
}

.tank-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 200px;
  padding: 2px 0;
  font-size: 0.65rem;
  color: $color-text-muted;
  font-weight: 600;
  white-space: nowrap;

  .threshold-mark { color: #ef4444; font-weight: 700; }
}

.tank-timestamp {
  font-size: 0.72rem;
  color: $color-text-muted;
  margin-top: $spacing-sm;
  text-align: right;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-size: 0.9rem;

  &--primary {
    background: $color-primary;
    color: white;
    &:hover { background: darken($color-primary, 10%); }
  }

  &--outline {
    background: transparent;
    border: 2px solid $color-primary;
    color: $color-primary;
    &:hover { background: $color-primary; color: white; }
  }
}

@keyframes pulse-border {
  0%, 100% { border-color: #ef4444; }
  50% { border-color: #fca5a5; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
