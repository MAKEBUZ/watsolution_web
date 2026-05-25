<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import type { IInvoice } from '@/shared/model/invoice.model'

// ─── Step machine: 1=select invoice | 2=bold-button | 3=result ───────────────
const step = ref(1)
const loadingInvoices = ref(false)
const loadingBold = ref(false)
const loadingResult = ref(false)
const invoices = ref<IInvoice[]>([])
const selectedInvoice = ref<IInvoice | null>(null)
const personId = ref<number | null>(null)
const fetchError = ref('')
const boldError = ref('')
const resultStatus = ref<'APPROVED' | 'REJECTED' | 'PENDING' | 'UNKNOWN'>('UNKNOWN')
let boldOrderIdCurrent = ''
let resultPollTimer: ReturnType<typeof setTimeout> | null = null

// ─── Load user invoices ───────────────────────────────────────────────────────
onMounted(async () => {
  loadingInvoices.value = true
  fetchError.value = ''
  try {
    const pr = await axios.get('api/people/me')
    personId.value = pr.data?.id ?? null
    if (personId.value) {
      const ir = await axios.get(`api/invoices/by-person/${personId.value}`)
      invoices.value = ir.data ?? []
    } else {
      fetchError.value = 'No tienes un perfil de suscriptor vinculado. Contacta al administrador.'
    }
  } catch {
    fetchError.value = 'No se pudo cargar la información. Verifica tu conexión.'
  } finally {
    loadingInvoices.value = false
  }
})

// ─── Derived ──────────────────────────────────────────────────────────────────
const effectiveStatus = (inv: IInvoice): 'PENDING' | 'OVERDUE' | 'PAID' | 'CANCELLED' => {
  if (inv.status === 'PAID') return 'PAID'
  if (inv.status === 'CANCELLED') return 'CANCELLED'
  if (inv.status === 'PENDING') {
    return new Date(inv.dueDate as any) < new Date() ? 'OVERDUE' : 'PENDING'
  }
  return 'PENDING'
}

const pendingInvoices = computed(() =>
  invoices.value
    .filter(i => effectiveStatus(i) === 'PENDING' || effectiveStatus(i) === 'OVERDUE')
    .sort((a, b) => new Date(b.issueDate as any).getTime() - new Date(a.issueDate as any).getTime()),
)

// ─── Select invoice → load Bold button ───────────────────────────────────────
const selectInvoice = async (inv: IInvoice) => {
  selectedInvoice.value = inv
  step.value = 2
  await loadBoldButton(inv)
}

const loadBoldButton = async (inv: IInvoice) => {
  loadingBold.value = true
  boldError.value = ''
  try {
    const res = await axios.get(`api/bold/hash?invoiceId=${inv.id}`)
    const { boldOrderId, hash, apiKey, amount } = res.data
    boldOrderIdCurrent = boldOrderId

    // Must reveal container before accessing it — v-else hides it while loadingBold=true
    loadingBold.value = false
    await nextTick()

    const container = document.getElementById('bold-payment-container')
    if (!container) return
    container.innerHTML = ''

    const btn = document.createElement('script')
    btn.setAttribute('data-bold-button', 'dark-L')
    btn.setAttribute('data-api-key', apiKey)
    btn.setAttribute('data-order-id', boldOrderId)
    btn.setAttribute('data-currency', 'COP')
    btn.setAttribute('data-amount', String(amount))
    btn.setAttribute('data-integrity-signature', hash)
    btn.setAttribute('data-description', `Pago Factura #${inv.id}`)
    btn.setAttribute('data-tax', 'vat-19')
    container.appendChild(btn)

    const prev = document.getElementById('bold-sdk')
    if (prev) prev.remove()
    const sdk = document.createElement('script')
    sdk.id = 'bold-sdk'
    sdk.src = `https://checkout.bold.co/library/boldPaymentButton.js?t=${Date.now()}`
    document.head.appendChild(sdk)
  } catch {
    boldError.value = 'No se pudo cargar el botón de pago. Intenta de nuevo.'
    loadingBold.value = false
  }
}

async function checkResult() {
  if (!selectedInvoice.value || !boldOrderIdCurrent) return
  loadingResult.value = true
  step.value = 3
  try {
    const res = await axios.get(`api/bold/result/${selectedInvoice.value.id}?boldOrderId=${boldOrderIdCurrent}`)
    const boldStatus: string = res.data?.boldStatus ?? 'UNKNOWN'
    if (boldStatus === 'APPROVED') {
      resultStatus.value = 'APPROVED'
      const inv = invoices.value.find(i => i.id === selectedInvoice.value!.id)
      if (inv) inv.status = 'PAID' as any
    } else if (['REJECTED', 'FAILED', 'VOIDED'].includes(boldStatus)) {
      resultStatus.value = 'REJECTED'
    } else {
      resultStatus.value = 'PENDING'
      // Bold not confirmed yet — retry once after 4s
      resultPollTimer = setTimeout(checkResult, 4000)
    }
  } catch {
    resultStatus.value = 'UNKNOWN'
  } finally {
    loadingResult.value = false
  }
}

function handleBoldMessage(event: MessageEvent) {
  const data = event.data
  if (!data || typeof data !== 'object') return
  // Bold SDK fires postMessage on modal close/payment result
  const type: string = data.type ?? data.event ?? ''
  if (
    type.toLowerCase().includes('bold') ||
    data.payment_status !== undefined ||
    data.boldStatus !== undefined ||
    data.status !== undefined
  ) {
    if (resultPollTimer) clearTimeout(resultPollTimer)
    checkResult()
  }
}

onMounted(() => { window.addEventListener('message', handleBoldMessage) })
onUnmounted(() => {
  window.removeEventListener('message', handleBoldMessage)
  if (resultPollTimer) clearTimeout(resultPollTimer)
})

const goBack = () => {
  const prev = document.getElementById('bold-sdk')
  if (prev) prev.remove()
  if (resultPollTimer) clearTimeout(resultPollTimer)
  step.value = 1
  selectedInvoice.value = null
  boldError.value = ''
  boldOrderIdCurrent = ''
  resultStatus.value = 'UNKNOWN'
}

const retryBold = () => {
  if (selectedInvoice.value) loadBoldButton(selectedInvoice.value)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (amount: any) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(amount ?? 0))

const fmtDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

const invNum = (inv: IInvoice) => {
  const y = inv.issueDate ? new Date(inv.issueDate as any).getFullYear() : new Date().getFullYear()
  return `FAC-${y}-${String(inv.id ?? 0).padStart(3, '0')}`
}
</script>

<template>
  <div class="pse-page">
    <div class="pse-wrap">

      <!-- ── Progress bar ───────────────────────────────────────────── -->
      <div class="pse-progress">
        <div
          v-for="(s, i) in ['Seleccionar Factura', 'Pagar con Bold', 'Resultado']"
          :key="i"
          :class="['pse-step', { active: step === i + 1, done: step > i + 1 }]"
        >
          <div class="pse-step__circle">
            <svg v-if="step > i + 1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="pse-step__label">{{ s }}</span>
          <div v-if="i < 2" class="pse-step__line"></div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- STEP 1 — Seleccionar Factura                                  -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-if="step === 1" class="pse-card">
        <div class="pse-card__header">
          <div class="pse-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#0077be" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z"/></svg>
            <span>WatSolution <strong>Pagos</strong></span>
          </div>
          <div class="pse-secure">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Conexión segura
          </div>
        </div>

        <h2 class="pse-card__title">Selecciona la factura a pagar</h2>
        <p class="pse-card__sub">Elige una de tus facturas pendientes para continuar con el pago.</p>

        <!-- Loading -->
        <div v-if="loadingInvoices" class="pse-loading">
          <div class="pse-spinner"></div>
          <p>Cargando tus facturas...</p>
        </div>

        <!-- Error -->
        <div v-else-if="fetchError" class="pse-alert pse-alert--error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          {{ fetchError }}
        </div>

        <!-- No pending -->
        <div v-else-if="pendingInvoices.length === 0" class="pse-empty">
          <div class="pse-empty__icon">✅</div>
          <p class="pse-empty__title">¡Sin facturas pendientes!</p>
          <p class="pse-empty__sub">No tienes facturas por pagar en este momento.</p>
        </div>

        <!-- Invoice list -->
        <div v-else class="inv-select-list">
          <button
            v-for="inv in pendingInvoices"
            :key="inv.id"
            class="inv-select-item"
            @click="selectInvoice(inv)"
          >
            <div class="inv-select-item__left">
              <div class="inv-select-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div>
                <p class="inv-select-item__num">{{ invNum(inv) }}</p>
                <p class="inv-select-item__date">Emisión: {{ fmtDate(inv.issueDate) }} · Vence: {{ fmtDate(inv.dueDate) }}</p>
              </div>
            </div>
            <div class="inv-select-item__right">
              <span
                :class="['inv-status', effectiveStatus(inv) === 'OVERDUE' ? 'inv-status--mora' : 'inv-status--pend']"
              >{{ effectiveStatus(inv) === 'OVERDUE' ? 'En Mora' : 'Pendiente' }}</span>
              <span class="inv-select-item__amount">{{ fmt(inv.amountDue) }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="inv-select-item__arrow"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- STEP 2 — Botón Bold                                           -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="step === 2" class="pse-card">
        <div class="pse-card__header">
          <div class="pse-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#0077be" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z"/></svg>
            <span>WatSolution <strong>Pagos</strong></span>
          </div>
          <div class="pse-secure">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            PCI-DSS
          </div>
        </div>

        <!-- Invoice summary -->
        <div class="pse-summary" v-if="selectedInvoice">
          <div class="pse-summary__row">
            <span>Factura</span>
            <strong>{{ invNum(selectedInvoice) }}</strong>
          </div>
          <div class="pse-summary__row">
            <span>Vencimiento</span>
            <strong :class="{ 'text-red': effectiveStatus(selectedInvoice) === 'OVERDUE' }">{{ fmtDate(selectedInvoice.dueDate) }}</strong>
          </div>
          <div class="pse-summary__row pse-summary__row--total">
            <span>Total a pagar</span>
            <strong class="pse-summary__amount">{{ fmt(selectedInvoice.amountDue) }}</strong>
          </div>
        </div>

        <!-- Bold button area -->
        <div class="bold-area">
          <div v-if="loadingBold" class="pse-loading">
            <div class="pse-spinner"></div>
            <p>Preparando pasarela de pago...</p>
          </div>

          <div v-else-if="boldError" class="pse-alert pse-alert--error">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {{ boldError }}
            <button class="btn btn--ghost btn--sm" @click="retryBold">Reintentar</button>
          </div>

          <div v-else id="bold-payment-container" class="bold-container"></div>
        </div>

        <div class="bold-footer">
          <button type="button" class="btn btn--ghost" @click="goBack">← Volver</button>
          <button type="button" class="btn btn--primary" style="margin-left:12px" @click="checkResult">Ya pagué →</button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- STEP 3 — Resultado                                             -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="step === 3" class="pse-card pse-result">
        <!-- Loading -->
        <div v-if="loadingResult" class="pse-loading">
          <div class="pse-spinner"></div>
          <p>Verificando pago con Bold...</p>
        </div>

        <!-- Approved -->
        <div v-else-if="resultStatus === 'APPROVED'" class="pse-result__body">
          <div class="pse-result__icon pse-result__icon--ok">✅</div>
          <h2 class="pse-result__title">¡Pago exitoso!</h2>
          <p class="pse-result__sub">Tu factura <strong>{{ selectedInvoice ? invNum(selectedInvoice) : '' }}</strong> ha sido marcada como pagada.</p>
          <button class="btn btn--primary" @click="goBack">Ver mis facturas</button>
        </div>

        <!-- Rejected -->
        <div v-else-if="resultStatus === 'REJECTED'" class="pse-result__body">
          <div class="pse-result__icon pse-result__icon--err">❌</div>
          <h2 class="pse-result__title">Pago rechazado</h2>
          <p class="pse-result__sub">El pago no fue aprobado. Puedes intentar nuevamente.</p>
          <button class="btn btn--primary" @click="goBack">Intentar de nuevo</button>
        </div>

        <!-- Pending / Unknown -->
        <div v-else class="pse-result__body">
          <div class="pse-result__icon">⏳</div>
          <h2 class="pse-result__title">Verificando...</h2>
          <p class="pse-result__sub">Bold aún está procesando el pago. Espera unos segundos.</p>
          <button class="btn btn--ghost" @click="checkResult" :disabled="loadingResult">Verificar ahora</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Page ──────────────────────────────────────────────────────────────────── */
.pse-page {
  min-height: 100vh;
  background: #f0f4f8;
  padding: 40px 16px 80px;
}

.pse-wrap {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Progress ──────────────────────────────────────────────────────────────── */
.pse-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: white;
  border-radius: 14px;
  padding: 16px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}

.pse-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pse-step__circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  transition: all 0.3s;
  flex-shrink: 0;
}

.pse-step.active .pse-step__circle {
  border-color: #0077be;
  background: #0077be;
  color: white;
}

.pse-step.done .pse-step__circle {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.pse-step__label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
}

.pse-step.active .pse-step__label,
.pse-step.done .pse-step__label {
  color: #1e293b;
  font-weight: 600;
}

.pse-step__line {
  width: 48px;
  height: 2px;
  background: #e2e8f0;
  margin: 0 8px;
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
.pse-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.pse-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.pse-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #1e293b;
}

.pse-logo strong { color: #0077be; }

.pse-secure {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
  background: #f0fdf4;
  padding: 4px 10px;
  border-radius: 20px;
}

.pse-card__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px;
  padding: 20px 24px 0;
}

.pse-card__sub {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0 0 20px;
  padding: 0 24px;
}

/* ── Alerts ────────────────────────────────────────────────────────────────── */
.pse-alert {
  margin: 0 24px 16px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pse-alert--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

/* ── Loading / empty ───────────────────────────────────────────────────────── */
.pse-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  gap: 16px;
  color: #64748b;
  font-size: 0.9rem;
}

.pse-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #0077be;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.pse-empty {
  text-align: center;
  padding: 48px 24px;
}

.pse-empty__icon { font-size: 2.5rem; margin-bottom: 12px; }
.pse-empty__title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
.pse-empty__sub { font-size: 0.88rem; color: #64748b; margin: 0; }

/* ── Invoice list (step 1) ─────────────────────────────────────────────────── */
.inv-select-list {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inv-select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s;
  width: 100%;
  gap: 12px;
}

.inv-select-item:hover {
  border-color: #0077be;
  box-shadow: 0 0 0 3px rgba(0,119,190,0.08);
}

.inv-select-item__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inv-select-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #eff6ff;
  color: #0077be;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.inv-select-item__num {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 3px;
  font-family: monospace;
}

.inv-select-item__date {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
}

.inv-select-item__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.inv-select-item__amount {
  font-size: 1rem;
  font-weight: 800;
  color: #1e293b;
}

.inv-select-item__arrow { color: #94a3b8; }

.inv-status {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}

.inv-status--pend { background: #fef3c7; color: #92400e; }
.inv-status--mora { background: #fee2e2; color: #991b1b; }

/* ── Summary (step 2) ──────────────────────────────────────────────────────── */
.pse-summary {
  margin: 20px 24px 0;
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
}

.pse-summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.88rem;
  color: #64748b;
}

.pse-summary__row--total {
  border-top: 1px solid #e2e8f0;
  margin-top: 6px;
  padding-top: 12px;
}

.pse-summary__amount {
  font-size: 1.2rem;
  color: #0077be;
  font-weight: 800;
}

.text-red { color: #dc2626; }

/* ── Bold button area ──────────────────────────────────────────────────────── */
.bold-area {
  padding: 24px 24px 0;
  min-height: 80px;
}

.bold-container {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.bold-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-start;
}

/* ── Buttons ───────────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn--ghost {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn--ghost:hover { background: #f1f5f9; }

.btn--sm { padding: 6px 12px; font-size: 0.8rem; }

@keyframes spin { to { transform: rotate(360deg); } }

.pse-result {
  text-align: center;
}

.pse-result__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 32px;
  gap: 14px;
}

.pse-result__icon {
  font-size: 3rem;
  line-height: 1;
}

.pse-result__title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.pse-result__sub {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 8px;
}

.btn--primary {
  background: #0077be;
  color: white;
  border: none;
}

.btn--primary:hover { background: #005f9e; }
.btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
