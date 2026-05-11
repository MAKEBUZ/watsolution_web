<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
import type { IInvoice } from '@/shared/model/invoice.model'

Chart.register(...registerables)

// ─── State ───────────────────────────────────────────────────────────────────
const invoices = ref<IInvoice[]>([])
const readings = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const periodFilter = ref<'3m' | '6m' | '12m' | 'all'>('12m')
const yearFilter = ref<number | null>(null)

const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// ─── Load data ────────────────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const personRes = await axios.get('api/people/me')
    const personId = personRes.data?.id
    if (!personId) {
      error.value = 'No tienes un perfil de suscriptor vinculado. Contacta al administrador.'
      return
    }
    const [invRes, mtrRes] = await Promise.all([
      axios.get(`api/invoices/by-person/${personId}`),
      axios.get(`api/meters/by-person/${personId}`),
    ])
    invoices.value = (invRes.data ?? []).sort(
      (a: IInvoice, b: IInvoice) =>
        new Date(a.issueDate as any).getTime() - new Date(b.issueDate as any).getTime(),
    )
    readings.value = (mtrRes.data ?? []).sort(
      (a: any, b: any) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime(),
    )
  } catch {
    error.value = 'No se pudo cargar el consumo. Intenta de nuevo más tarde.'
  } finally {
    loading.value = false
    await nextTick()
    renderChart()
  }
})

// ─── Available years ──────────────────────────────────────────────────────────
const availableYears = computed<number[]>(() => {
  const years = new Set<number>()
  invoices.value.forEach(inv => {
    if (inv.issueDate) years.add(new Date(inv.issueDate as any).getFullYear())
  })
  return Array.from(years).sort((a, b) => b - a)
})

// ─── Filtered invoices ────────────────────────────────────────────────────────
const filteredInvoices = computed<IInvoice[]>(() => {
  let list = [...invoices.value]

  if (yearFilter.value !== null) {
    list = list.filter(inv => new Date(inv.issueDate as any).getFullYear() === yearFilter.value)
  } else {
    const now = new Date()
    const cutoffMonths: Record<string, number> = { '3m': 3, '6m': 6, '12m': 12 }
    const months = cutoffMonths[periodFilter.value]
    if (months) {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1)
      list = list.filter(inv => new Date(inv.issueDate as any) >= cutoff)
    }
  }

  return list.sort(
    (a, b) => new Date(a.issueDate as any).getTime() - new Date(b.issueDate as any).getTime(),
  )
})

// ─── Stats cards ──────────────────────────────────────────────────────────────
const stats = computed(() => {
  const vals = filteredInvoices.value.map(i => Number(i.consumptionM3 ?? 0))
  if (vals.length === 0) return { avg: 0, last: 0, max: 0, min: 0 }
  return {
    avg: vals.reduce((s, v) => s + v, 0) / vals.length,
    last: vals[vals.length - 1],
    max: Math.max(...vals),
    min: Math.min(...vals),
  }
})

const consumptionLevel = computed(() => {
  const { last, avg } = stats.value
  if (avg === 0) return null
  const ratio = last / avg
  if (ratio < 0.8) return { label: 'Bajo', color: '#10b981', bg: '#d1fae5', tip: 'Excelente ahorro respecto a tu promedio.' }
  if (ratio <= 1.2) return { label: 'Normal', color: '#0077be', bg: '#dbeafe', tip: 'Consumo dentro del rango habitual.' }
  if (ratio <= 1.5) return { label: 'Alto', color: '#f59e0b', bg: '#fef3c7', tip: 'Consumo por encima de tu promedio.' }
  return { label: 'Muy Alto', color: '#dc2626', bg: '#fee2e2', tip: 'Consumo notablemente elevado. Revisa fugas.' }
})

const barPercent = computed(() => {
  const { last, max } = stats.value
  if (!max) return 0
  return Math.min(100, Math.round((last / max) * 100))
})

// ─── Chart ────────────────────────────────────────────────────────────────────
function renderChart() {
  if (!chartRef.value) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const labels = filteredInvoices.value.map(inv => {
    const d = new Date(inv.issueDate as any)
    return d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
  })
  const data = filteredInvoices.value.map(inv => Number(inv.consumptionM3 ?? 0))

  if (labels.length === 0) return

  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Consumo (m³)',
          data,
          borderColor: '#0077be',
          backgroundColor: (ctx) => {
            const canvas = ctx.chart.ctx
            const gradient = canvas.createLinearGradient(0, 0, 0, 280)
            gradient.addColorStop(0, 'rgba(0,119,190,0.25)')
            gradient.addColorStop(1, 'rgba(0,119,190,0)')
            return gradient
          },
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#0077be',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: 'Promedio',
          data: Array(labels.length).fill(
            Math.round((filteredInvoices.value.reduce((s, i) => s + Number(i.consumptionM3 ?? 0), 0) / (filteredInvoices.value.length || 1)) * 10) / 10,
          ),
          borderColor: 'rgba(100,116,139,0.5)',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { usePointStyle: true, pointStyleWidth: 10, padding: 16, font: { size: 12 } },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} m³`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            callback: val => `${val} m³`,
            font: { size: 11 },
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
    },
  })
}

watch(filteredInvoices, async () => {
  await nextTick()
  renderChart()
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

const setFilter = (f: '3m' | '6m' | '12m' | 'all') => {
  yearFilter.value = null
  periodFilter.value = f
}

const setYear = (y: number) => {
  yearFilter.value = y
}
</script>

<template>
  <div class="mc-wrapper">
    <!-- Loading -->
    <div v-if="loading" class="mc-loading">
      <div class="mc-spinner"></div>
      <p>Cargando tu consumo...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mc-error">
      <div class="mc-error__icon">⚠️</div>
      <h3>Sin datos disponibles</h3>
      <p>{{ error }}</p>
    </div>

    <template v-else>
      <!-- ── Filters ──────────────────────────────────── -->
      <div class="mc-filters">
        <div class="mc-filters__left">
          <span class="mc-filters__label">Período:</span>
          <div class="mc-period-btns">
            <button
              v-for="opt in [{ k: '3m', l: '3 meses' }, { k: '6m', l: '6 meses' }, { k: '12m', l: '1 año' }, { k: 'all', l: 'Todo' }]"
              :key="opt.k"
              :class="['mc-period-btn', { active: yearFilter === null && periodFilter === opt.k }]"
              @click="setFilter(opt.k as any)"
            >{{ opt.l }}</button>
          </div>
        </div>

        <div v-if="availableYears.length > 0" class="mc-filters__right">
          <span class="mc-filters__label">Año:</span>
          <div class="mc-year-btns">
            <button
              v-for="y in availableYears"
              :key="y"
              :class="['mc-period-btn', { active: yearFilter === y }]"
              @click="setYear(y)"
            >{{ y }}</button>
          </div>
        </div>
      </div>

      <!-- ── Stat cards ───────────────────────────────── -->
      <div class="mc-stat-cards">
        <div class="mc-stat-card mc-stat-card--last">
          <div class="mc-stat-card__icon">💧</div>
          <div>
            <p class="mc-stat-card__label">Último período</p>
            <p class="mc-stat-card__val">{{ stats.last.toFixed(1) }} <small>m³</small></p>
          </div>
        </div>

        <div class="mc-stat-card mc-stat-card--avg">
          <div class="mc-stat-card__icon">📊</div>
          <div>
            <p class="mc-stat-card__label">Promedio</p>
            <p class="mc-stat-card__val">{{ stats.avg.toFixed(1) }} <small>m³</small></p>
          </div>
        </div>

        <div class="mc-stat-card mc-stat-card--max">
          <div class="mc-stat-card__icon">🔺</div>
          <div>
            <p class="mc-stat-card__label">Máximo</p>
            <p class="mc-stat-card__val">{{ stats.max.toFixed(1) }} <small>m³</small></p>
          </div>
        </div>

        <div class="mc-stat-card mc-stat-card--min">
          <div class="mc-stat-card__icon">🔻</div>
          <div>
            <p class="mc-stat-card__label">Mínimo</p>
            <p class="mc-stat-card__val">{{ stats.min.toFixed(1) }} <small>m³</small></p>
          </div>
        </div>
      </div>

      <!-- ── Level indicator ──────────────────────────── -->
      <div v-if="consumptionLevel && stats.last > 0" class="mc-level-card">
        <div class="mc-level-card__header">
          <div>
            <p class="mc-level-card__title">Nivel de Consumo Actual</p>
            <p class="mc-level-card__sub">Basado en tu último período vs. tu promedio histórico</p>
          </div>
          <span
            class="mc-level-badge"
            :style="{ color: consumptionLevel.color, background: consumptionLevel.bg }"
          >{{ consumptionLevel.label }}</span>
        </div>

        <div class="mc-level-bar-wrap">
          <div class="mc-level-bar">
            <div
              class="mc-level-bar__fill"
              :style="{ width: barPercent + '%', background: consumptionLevel.color }"
            ></div>
          </div>
          <span class="mc-level-bar__pct">{{ barPercent }}%</span>
        </div>

        <div class="mc-level-zones">
          <span class="zone zone--green">Bajo &lt; 80%</span>
          <span class="zone zone--blue">Normal 80–120%</span>
          <span class="zone zone--orange">Alto 120–150%</span>
          <span class="zone zone--red">Muy Alto &gt;150%</span>
        </div>

        <p class="mc-level-tip">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ consumptionLevel.tip }}
        </p>
      </div>

      <!-- ── Chart ────────────────────────────────────── -->
      <div class="mc-chart-card">
        <div class="mc-chart-card__header">
          <div>
            <h3>Tendencia de Consumo</h3>
            <p class="mc-chart-card__sub">
              {{ filteredInvoices.length }} períodos — consumo en m³ por facturación
            </p>
          </div>
        </div>

        <div v-if="filteredInvoices.length === 0" class="mc-chart-empty">
          <p>📉 Sin datos para el período seleccionado.</p>
        </div>
        <div v-else class="mc-chart-wrap">
          <canvas ref="chartRef"></canvas>
        </div>
      </div>

      <!-- ── Readings table ───────────────────────────── -->
      <div class="mc-readings-card">
        <div class="mc-readings-card__header">
          <h3>Historial de Lecturas del Medidor</h3>
          <span class="mc-readings-badge">{{ readings.length }} lectura(s)</span>
        </div>

        <div v-if="readings.length === 0" class="mc-readings-empty">
          <p>🔌 No hay lecturas registradas para tu medidor.</p>
        </div>

        <div v-else class="mc-readings-wrap">
          <table class="mc-readings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha de Lectura</th>
                <th>Medición (m³)</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in readings" :key="r.id">
                <td>{{ readings.length - idx }}</td>
                <td>{{ formatDate(r.readingDate) }}</td>
                <td>
                  <span class="mc-reading-val">{{ Number(r.waterMeasure ?? 0).toFixed(2) }} m³</span>
                </td>
                <td class="mc-reading-obs">{{ r.observation || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mc-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Loading */
.mc-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 16px;
  color: #64748b;
}

.mc-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #0077be;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Error */
.mc-error {
  text-align: center;
  padding: 64px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.mc-error__icon { font-size: 3rem; margin-bottom: 16px; }
.mc-error h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
.mc-error p { color: #64748b; font-size: 0.9rem; max-width: 400px; margin: 0 auto; }

/* Filters */
.mc-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: white;
  border-radius: 14px;
  padding: 14px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.mc-filters__left,
.mc-filters__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.mc-filters__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.mc-period-btns,
.mc-year-btns {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mc-period-btn {
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.18s;
}

.mc-period-btn:hover { border-color: #0077be; color: #0077be; }
.mc-period-btn.active {
  background: #0077be;
  border-color: #0077be;
  color: white;
  font-weight: 600;
}

/* Stat cards */
.mc-stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

@media (max-width: 900px) { .mc-stat-cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .mc-stat-cards { grid-template-columns: 1fr; } }

.mc-stat-card {
  background: white;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 14px;
  border-left: 4px solid transparent;
}

.mc-stat-card--last  { border-left-color: #0077be; }
.mc-stat-card--avg   { border-left-color: #8b5cf6; }
.mc-stat-card--max   { border-left-color: #ef4444; }
.mc-stat-card--min   { border-left-color: #10b981; }

.mc-stat-card__icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.mc-stat-card__label {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.mc-stat-card__val {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1;
}

.mc-stat-card__val small {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
}

/* Level indicator */
.mc-level-card {
  background: white;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mc-level-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.mc-level-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.mc-level-card__sub {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
}

.mc-level-badge {
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.mc-level-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mc-level-bar {
  flex: 1;
  height: 10px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
}

.mc-level-bar__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s ease;
}

.mc-level-bar__pct {
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  min-width: 36px;
  text-align: right;
}

.mc-level-zones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.zone {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
}

.zone--green  { background: #d1fae5; color: #065f46; }
.zone--blue   { background: #dbeafe; color: #1e40af; }
.zone--orange { background: #fef3c7; color: #92400e; }
.zone--red    { background: #fee2e2; color: #991b1b; }

.mc-level-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #475569;
  margin: 0;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
}

/* Chart */
.mc-chart-card {
  background: white;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.mc-chart-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.mc-chart-card__header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.mc-chart-card__sub {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
}

.mc-chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.mc-chart-wrap {
  height: 280px;
}

/* Readings table */
.mc-readings-card {
  background: white;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.mc-readings-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mc-readings-card__header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.mc-readings-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0077be;
  background: #dbeafe;
  padding: 4px 12px;
  border-radius: 20px;
}

.mc-readings-empty {
  text-align: center;
  padding: 32px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.mc-readings-wrap {
  overflow-x: auto;
}

.mc-readings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.87rem;
}

.mc-readings-table thead {
  background: #f8fafc;
}

.mc-readings-table th {
  padding: 12px 14px;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
}

.mc-readings-table td {
  padding: 13px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.mc-readings-table tbody tr:last-child td { border-bottom: none; }
.mc-readings-table tbody tr:hover { background: #f8fafc; }

.mc-reading-val {
  font-weight: 700;
  color: #0077be;
  font-family: monospace;
  font-size: 0.93rem;
}

.mc-reading-obs {
  color: #64748b;
  font-size: 0.82rem;
  max-width: 300px;
}

/* Animation */
@keyframes spin { to { transform: rotate(360deg); } }
</style>
