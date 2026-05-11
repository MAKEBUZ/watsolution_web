<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import type { IInvoice } from '@/shared/model/invoice.model'

const invoices = ref<IInvoice[]>([])
const loading = ref(false)
const error = ref('')
const filterStatus = ref('')
const downloadingId = ref<number | null>(null)

type EffectiveStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'

const effectiveStatus = (inv: IInvoice): EffectiveStatus => {
  if (inv.status === 'PAID') return 'PAID'
  if (inv.status === 'CANCELLED') return 'CANCELLED'
  if (inv.status === 'PENDING') {
    const due = new Date(inv.dueDate as any)
    return due < new Date() ? 'OVERDUE' : 'PENDING'
  }
  return 'PENDING'
}

const statusConfig: Record<EffectiveStatus, { label: string; color: string; bg: string }> = {
  PAID: { label: 'Pagado', color: '#065f46', bg: '#d1fae5' },
  PENDING: { label: 'Pendiente de Pago', color: '#92400e', bg: '#fef3c7' },
  OVERDUE: { label: 'En Mora', color: '#991b1b', bg: '#fee2e2' },
  CANCELLED: { label: 'Cancelado', color: '#374151', bg: '#f3f4f6' },
}

const filterOptions = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendiente de Pago' },
  { value: 'OVERDUE', label: 'En Mora' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

const filtered = computed(() => {
  if (!filterStatus.value) return invoices.value
  return invoices.value.filter(inv => effectiveStatus(inv) === filterStatus.value)
})

const summary = computed(() => ({
  total: invoices.value.length,
  pending: invoices.value.filter(i => effectiveStatus(i) === 'PENDING').length,
  overdue: invoices.value.filter(i => effectiveStatus(i) === 'OVERDUE').length,
  paid: invoices.value.filter(i => effectiveStatus(i) === 'PAID').length,
}))

const pendingAmount = computed(() =>
  invoices.value
    .filter(i => effectiveStatus(i) === 'PENDING' || effectiveStatus(i) === 'OVERDUE')
    .reduce((acc, i) => acc + Number(i.amountDue ?? 0), 0),
)

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const personRes = await axios.get('api/people/me')
    const personId = personRes.data?.id
    if (!personId) {
      error.value = 'No tienes un perfil de suscriptor vinculado a tu cuenta. Contacta al administrador.'
      return
    }
    const invRes = await axios.get(`api/invoices/by-person/${personId}`)
    invoices.value = (invRes.data ?? []).sort(
      (a: IInvoice, b: IInvoice) => new Date(b.issueDate as any).getTime() - new Date(a.issueDate as any).getTime(),
    )
  } catch {
    error.value = 'No se pudieron cargar tus facturas. Intenta de nuevo más tarde.'
  } finally {
    loading.value = false
  }
})

const formatDate = (date: any): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatAmount = (amount: any): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0))
}

const invoiceNumber = (inv: IInvoice): string => {
  const year = inv.issueDate ? new Date(inv.issueDate as any).getFullYear() : new Date().getFullYear()
  return `FAC-${year}-${String(inv.id ?? 0).padStart(3, '0')}`
}

const downloadInvoice = async (inv: IInvoice) => {
  if (!inv.id) return
  downloadingId.value = inv.id
  try {
    const res = await axios.get(`api/invoices/download/${inv.id}`)
    if (res.data?.url) {
      window.open(res.data.url, '_blank')
    }
  } catch {
    alert('No hay PDF disponible para esta factura.')
  } finally {
    downloadingId.value = null
  }
}
</script>

<template>
  <div class="mf-wrapper">
    <!-- Loading -->
    <div v-if="loading" class="mf-loading">
      <div class="mf-spinner"></div>
      <p>Cargando tus facturas...</p>
    </div>

    <!-- Error: no person linked -->
    <div v-else-if="error" class="mf-error-state">
      <div class="mf-error-state__icon">⚠️</div>
      <h3>Sin perfil de suscriptor</h3>
      <p>{{ error }}</p>
    </div>

    <template v-else>
      <!-- Summary cards -->
      <div class="mf-summary">
        <div class="mf-sum-card mf-sum-card--blue" @click="filterStatus = ''">
          <p class="mf-sum-card__label">Total Facturas</p>
          <p class="mf-sum-card__val">{{ summary.total }}</p>
        </div>
        <div class="mf-sum-card mf-sum-card--yellow" @click="filterStatus = 'PENDING'">
          <p class="mf-sum-card__label">Pendientes</p>
          <p class="mf-sum-card__val">{{ summary.pending }}</p>
        </div>
        <div class="mf-sum-card mf-sum-card--red" @click="filterStatus = 'OVERDUE'">
          <p class="mf-sum-card__label">En Mora</p>
          <p class="mf-sum-card__val">{{ summary.overdue }}</p>
        </div>
        <div class="mf-sum-card mf-sum-card--green" @click="filterStatus = 'PAID'">
          <p class="mf-sum-card__label">Pagadas</p>
          <p class="mf-sum-card__val">{{ summary.paid }}</p>
        </div>
        <div class="mf-sum-card mf-sum-card--dark">
          <p class="mf-sum-card__label">Saldo Pendiente</p>
          <p class="mf-sum-card__val mf-sum-card__val--sm">{{ formatAmount(pendingAmount) }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="mf-toolbar">
        <h2 class="mf-toolbar__title">Historial de Facturas</h2>
        <div class="mf-filters">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            :class="['mf-filter-btn', { active: filterStatus === opt.value }]"
            @click="filterStatus = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filtered.length === 0" class="mf-empty">
        <div class="mf-empty__icon">📂</div>
        <p class="mf-empty__title">No hay facturas</p>
        <p class="mf-empty__sub">
          {{ filterStatus ? 'No tienes facturas con este estado.' : 'Aún no tienes facturas registradas.' }}
        </p>
        <button v-if="filterStatus" class="mf-empty__reset" @click="filterStatus = ''">Ver todas</button>
      </div>

      <!-- Table -->
      <div v-else class="mf-table-wrap">
        <table class="mf-table">
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Emisión</th>
              <th>Vencimiento</th>
              <th>Consumo</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in filtered" :key="inv.id" :class="{ 'row--overdue': effectiveStatus(inv) === 'OVERDUE' }">
              <td>
                <span class="invoice-num">{{ invoiceNumber(inv) }}</span>
              </td>
              <td>{{ formatDate(inv.issueDate) }}</td>
              <td :class="{ 'cell--red': effectiveStatus(inv) === 'OVERDUE' }">
                {{ formatDate(inv.dueDate) }}
              </td>
              <td>{{ Number(inv.consumptionM3 ?? 0).toFixed(1) }} m³</td>
              <td><strong>{{ formatAmount(inv.amountDue) }}</strong></td>
              <td>
                <span
                  class="status-badge"
                  :style="{
                    color: statusConfig[effectiveStatus(inv)].color,
                    background: statusConfig[effectiveStatus(inv)].bg,
                  }"
                >
                  {{ statusConfig[effectiveStatus(inv)].label }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button
                    class="dl-btn"
                    :class="{ 'dl-btn--loading': downloadingId === inv.id }"
                    :disabled="downloadingId === inv.id"
                    :title="inv.pdfUrl ? 'Descargar PDF' : 'PDF no disponible'"
                    @click="downloadInvoice(inv)"
                  >
                    <svg v-if="downloadingId !== inv.id" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="spin">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    PDF
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mora alert -->
      <div v-if="summary.overdue > 0" class="mf-mora-alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="flex-shrink:0">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <span>Tienes <strong>{{ summary.overdue }}</strong> factura(s) en mora. Comunícate con nosotros para regularizar tu situación.</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mf-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Loading */
.mf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 16px;
  color: #64748b;
}

.mf-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #0077be;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Error */
.mf-error-state {
  text-align: center;
  padding: 64px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.mf-error-state__icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.mf-error-state h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.mf-error-state p {
  color: #64748b;
  font-size: 0.9rem;
  max-width: 400px;
  margin: 0 auto;
}

/* Summary cards */
.mf-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

@media (max-width: 1100px) {
  .mf-summary {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .mf-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

.mf-sum-card {
  background: white;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, transform 0.15s;
}

.mf-sum-card:hover {
  transform: translateY(-2px);
}

.mf-sum-card--blue { border-left: 4px solid #0077be; }
.mf-sum-card--yellow { border-left: 4px solid #f59e0b; }
.mf-sum-card--red { border-left: 4px solid #ef4444; }
.mf-sum-card--green { border-left: 4px solid #10b981; }
.mf-sum-card--dark { border-left: 4px solid #1e293b; cursor: default; }

.mf-sum-card__label {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.mf-sum-card__val {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1;
}

.mf-sum-card__val--sm {
  font-size: 1.1rem;
}

/* Toolbar */
.mf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background: white;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.mf-toolbar__title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.mf-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mf-filter-btn {
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.mf-filter-btn:hover {
  border-color: #0077be;
  color: #0077be;
}

.mf-filter-btn.active {
  background: #0077be;
  border-color: #0077be;
  color: white;
  font-weight: 600;
}

/* Empty */
.mf-empty {
  text-align: center;
  padding: 60px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.mf-empty__icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.mf-empty__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.mf-empty__sub {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0 0 20px;
}

.mf-empty__reset {
  background: #0077be;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

/* Table */
.mf-table-wrap {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  overflow-x: auto;
}

.mf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.mf-table thead {
  background: #f8fafc;
}

.mf-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.mf-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.mf-table tbody tr:last-child td {
  border-bottom: none;
}

.mf-table tbody tr:hover {
  background: #f8fafc;
}

.row--overdue {
  background: #fff5f5;
}

.row--overdue:hover {
  background: #fee2e2 !important;
}

.cell--red {
  color: #dc2626;
  font-weight: 600;
}

.invoice-num {
  font-family: monospace;
  font-weight: 700;
  color: #0077be;
  font-size: 0.85rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Download button */
.action-btns {
  display: flex;
  gap: 8px;
}

.dl-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.78rem;
  font-weight: 600;
  color: #0077be;
  cursor: pointer;
  transition: all 0.2s;
}

.dl-btn:hover:not(:disabled) {
  background: #0077be;
  color: white;
  border-color: #0077be;
}

.dl-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dl-btn--loading {
  color: #64748b;
}

/* Mora alert */
.mf-mora-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 0.88rem;
  color: #991b1b;
}

.mf-mora-alert strong {
  font-weight: 700;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 0.8s linear infinite;
}
</style>
