<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import { 
  Users, DollarSign, Droplets, TrendingUp, 
  Download, Filter, ArrowUpRight,
  ArrowDownRight, Calendar
} from 'lucide-vue-next'

Chart.register(...registerables)

// --- MOCK DATA ---
const stats = [
  { 
    label: 'Usuarios Activos', 
    value: '1,284', 
    icon: Users, 
    color: '#3b82f6', 
    trend: '+12.5%', 
    isPositive: true,
    description: 'Suscriptores con servicio activo'
  },
  { 
    label: 'Recaudo Mensual', 
    value: '$12.4M', 
    icon: DollarSign, 
    color: '#10b981', 
    trend: '+8.2%', 
    isPositive: true,
    description: 'Total recaudado este mes'
  },
  { 
    label: 'Consumo Total', 
    value: '4,560 m³', 
    icon: Droplets, 
    color: '#0ea5e9', 
    trend: '-2.4%', 
    isPositive: false,
    description: 'Promedio de consumo por sector'
  },
  { 
    label: 'Eficiencia Op.', 
    value: '98.2%', 
    icon: TrendingUp, 
    color: '#f59e0b', 
    trend: '+0.5%', 
    isPositive: true,
    description: 'Disponibilidad del sistema'
  }
]

// --- CHARTS ---
const consumptionChartRef = ref<HTMLCanvasElement | null>(null)
const revenueChartRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (consumptionChartRef.value) {
    new Chart(consumptionChartRef.value, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Consumo (m³)',
          data: [1200, 1350, 1100, 1500, 1400, 1600],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { display: false } },
          x: { grid: { display: false } }
        }
      }
    })
  }

  if (revenueChartRef.value) {
    new Chart(revenueChartRef.value, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Recaudo ($)',
          data: [4.5, 5.2, 4.8, 6.1, 5.9, 6.5],
          backgroundColor: '#10b981',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: '#f1f5f9' },
            ticks: { callback: (val) => `$${val}M` }
          },
          x: { grid: { display: false } }
        }
      }
    })
  }
})
</script>

<template>
  <div class="summary-dashboard">
    <!-- Header Section -->
    <header class="summary-header">
      <div class="header-info">
        <h1>Resumen Ejecutivo</h1>
        <p><Calendar :size="16" /> Periodo actual: <strong>Abril 2026</strong></p>
      </div>
      <div class="header-actions">
        <button class="btn btn--outline"><Filter :size="18" /> Filtros</button>
        <button class="btn btn--primary"><Download :size="18" /> Descargar Reporte</button>
      </div>
    </header>

    <!-- Metrics Grid -->
    <div class="metrics-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '15', color: stat.color }">
          <component :is="stat.icon" :size="24" />
        </div>
        <div class="stat-content">
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-value-group">
            <span class="stat-value">{{ stat.value }}</span>
            <span :class="['stat-trend', stat.isPositive ? 'positive' : 'negative']">
              <ArrowUpRight v-if="stat.isPositive" :size="14" />
              <ArrowDownRight v-else :size="14" />
              {{ stat.trend }}
            </span>
          </div>
          <p class="stat-desc">{{ stat.description }}</p>
        </div>
      </div>
    </div>

    <!-- Charts & Logs Layout -->
    <div class="dashboard-layout">
      <!-- Main Content Area -->
      <div class="main-stats">
        <!-- Chart: Consumption -->
        <div class="chart-card">
          <div class="card-header">
            <h3>Tendencia de Consumo</h3>
            <span class="badge">m³ / mes</span>
          </div>
          <div class="chart-container">
            <canvas ref="consumptionChartRef"></canvas>
          </div>
        </div>

        <!-- Chart: Revenue -->
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.summary-dashboard {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  padding: $spacing-sm;

  @include desktop {
    padding: 0;
  }
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
      .stat-trend {
        font-size: 0.85rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 2px;
        &.positive { color: #10b981; }
        &.negative { color: #ef4444; }
      }
    }
    .stat-desc { font-size: 0.8rem; color: $color-text-muted; }
  }
}

.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.main-stats {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
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
  box-shadow: $shadow-md;
  width: 100%;

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

    .status-label {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }

    .status-value {
      font-weight: 700;
      color: rgba(255, 255, 255, 0.9);
      font-variant-numeric: tabular-nums;
    }
    
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
</style>
