<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Chart } from 'chart.js'
import { 
  FileText, CreditCard, History, Settings, Bell, 
  MessageSquare, Download, Droplet, Calendar
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const consumptionChartRef = ref<HTMLCanvasElement | null>(null)

const recentInvoices = [
  { id: 'FAC-2026-001', date: '2026-04-01', amount: 45000, status: 'Pagada' },
  { id: 'FAC-2026-002', date: '2026-03-01', amount: 42500, status: 'Pagada' },
  { id: 'FAC-2026-003', date: '2026-02-01', amount: 48000, status: 'Pagada' }
]

onMounted(() => {
  if (consumptionChartRef.value) {
    new Chart(consumptionChartRef.value, {
      type: 'bar',
      data: {
        labels: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
        datasets: [{
          label: 'Tu Consumo (m³)',
          data: [12, 15, 14, 18, 16, 15],
          backgroundColor: '#0077be',
          borderRadius: 6
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }
})
</script>

<template>
  <div class="user-portal">
    <div class="portal-header">
      <div class="container header-content">
        <div class="user-welcome">
          <h1>Hola, {{ authStore.user?.name }}</h1>
          <p>Bienvenido a tu portal personal de watsolution</p>
        </div>
        <div class="header-actions">
          <button class="btn-icon-round"><Bell :size="20" /></button>
          <button class="btn-icon-round"><Settings :size="20" /></button>
        </div>
      </div>
    </div>

    <div class="container portal-body">
      <!-- Resumen Rápido -->
      <div class="portal-grid">
        <div class="portal-card invoice-summary">
          <div class="card-header">
            <h3>Factura Actual</h3>
            <span class="badge badge--pending">Pendiente</span>
          </div>
          <div class="invoice-amount">
            <span class="currency">$</span>
            <span class="value">45,000</span>
          </div>
          <p class="due-date"><Calendar :size="14" /> Vence: 15 de Mayo, 2026</p>
          <router-link to="/pagos" class="btn btn--primary btn--block">
            <CreditCard :size="18" /> Pagar Ahora
          </router-link>
        </div>

        <div class="portal-card consumption-chart">
          <h3>Tendencia de Consumo</h3>
          <div class="chart-wrapper">
            <canvas ref="consumptionChartRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Secciones Secundarias -->
      <div class="portal-grid secondary">
        <!-- Historial -->
        <div class="portal-card history-card">
          <div class="card-header">
            <h3>Historial de Facturas</h3>
            <button class="btn-text">Ver todo</button>
          </div>
          <div class="history-list">
            <div v-for="inv in recentInvoices" :key="inv.id" class="history-item">
              <div class="item-info">
                <FileText :size="20" class="icon" />
                <div>
                  <span class="id">{{ inv.id }}</span>
                  <span class="date">{{ inv.date }}</span>
                </div>
              </div>
              <div class="item-actions">
                <span class="amount">${{ inv.amount.toLocaleString() }}</span>
                <button class="btn-download" title="Descargar PDF"><Download :size="16" /></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="portal-card quick-actions">
          <h3>Trámites y Consultas</h3>
          <div class="actions-grid">
            <button class="action-btn">
              <Droplet :size="24" />
              <span>Reportar Fuga</span>
            </button>
            <button class="action-btn">
              <MessageSquare :size="24" />
              <span>Reclamaciones</span>
            </button>
            <button class="action-btn">
              <History :size="24" />
              <span>Certificados</span>
            </button>
            <button class="action-btn">
              <Settings :size="24" />
              <span>Mi Perfil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.user-portal {
  padding-top: 70px;
  background-color: $color-bg;
  min-height: 100vh;
}

.portal-header {
  background: white;
  padding: $spacing-xl 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: $spacing-xl;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 { font-size: 2rem; color: $color-text; }
  p { color: $color-text-muted; }
}

.header-actions {
  display: flex;
  gap: $spacing-sm;
}

.btn-icon-round {
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
  transition: all 0.3s;

  &:hover { background: #f1f5f9; color: $color-primary; border-color: $color-primary; }
}

.portal-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.portal-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;

  @include desktop { grid-template-columns: 1fr 2fr; }
  &.secondary { @include desktop { grid-template-columns: 2fr 1fr; } }
}

.portal-card {
  background: white;
  padding: $spacing-lg;
  border-radius: 24px;
  box-shadow: $shadow-sm;

  h3 { font-size: 1.25rem; margin-bottom: $spacing-md; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  h3 { margin-bottom: 0; }
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  &--pending { background: #fef3c7; color: #92400e; }
}

.invoice-summary {
  .invoice-amount {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    margin: $spacing-md 0;
    .currency { font-size: 1.5rem; font-weight: 600; color: $color-text-muted; margin-top: 4px; }
    .value { font-size: 3.5rem; font-weight: 800; color: $color-text; line-height: 1; }
  }
  .due-date {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ef4444;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: $spacing-lg;
  }
}

.chart-wrapper { height: 250px; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: #f8fafc;
  border-radius: 12px;

  .item-info {
    display: flex;
    gap: 12px;
    align-items: center;
    .icon { color: $color-primary; }
    div { display: flex; flex-direction: column; }
    .id { font-weight: 700; color: $color-text; }
    .date { font-size: 0.85rem; color: $color-text-muted; }
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    .amount { font-weight: 700; color: $color-text; }
    .btn-download {
      background: white;
      border: 1px solid #e2e8f0;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &:hover { color: $color-primary; border-color: $color-primary; }
    }
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: $spacing-md;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  color: $color-text;

  span { font-size: 0.85rem; font-weight: 600; }
  &:hover {
    border-color: $color-primary;
    color: $color-primary;
    background: color.change($color-primary, $alpha: 0.05);
  }
}

.btn-text {
  background: none;
  border: none;
  color: $color-primary;
  font-weight: 600;
  cursor: pointer;
}
</style>
