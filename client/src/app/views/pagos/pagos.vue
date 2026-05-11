<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { jsPDF } from 'jspdf'
import type { IInvoice } from '@/shared/model/invoice.model'

// ─── Step machine: 1=select invoice | 2=pse-form | 3=processing | 4=success ──
const step = ref(1)
const loadingInvoices = ref(false)
const processing = ref(false)
const invoices = ref<IInvoice[]>([])
const selectedInvoice = ref<IInvoice | null>(null)
const personId = ref<number | null>(null)
const fetchError = ref('')
const payError = ref('')

const banks = [
  { id: 'bogota',    name: 'Banco de Bogotá',       logo: '🏦' },
  { id: 'bancol',   name: 'Bancolombia',            logo: '🟡' },
  { id: 'davi',     name: 'Davivienda',             logo: '🔴' },
  { id: 'bbva',     name: 'BBVA Colombia',          logo: '🔵' },
  { id: 'popular',  name: 'Banco Popular',          logo: '🏛️' },
  { id: 'ocidente', name: 'Banco de Occidente',     logo: '🏢' },
  { id: 'colpatria',name: 'Scotiabank Colpatria',   logo: '🟠' },
  { id: 'av',       name: 'AV Villas',              logo: '🏠' },
  { id: 'nequi',    name: 'Nequi',                  logo: '💜' },
  { id: 'davip',    name: 'Daviplata',              logo: '🟢' },
]

const pseForm = ref({
  bank: '',
  userType: 'persona',
  docType: 'CC',
  docNumber: '',
  email: '',
})

const processingSteps = ref([
  { label: 'Validando datos de pago', done: false, active: false },
  { label: 'Conectando con la entidad bancaria', done: false, active: false },
  { label: 'Procesando autorización', done: false, active: false },
  { label: 'Confirmando transacción', done: false, active: false },
])

const transaction = ref({ cus: '', authCode: '', date: '' })

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

const selectedBank = computed(() => banks.find(b => b.id === pseForm.value.bank) ?? null)

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

// ─── Step helpers ─────────────────────────────────────────────────────────────
const selectInvoice = (inv: IInvoice) => {
  selectedInvoice.value = inv
  step.value = 2
}

const submitPSE = async () => {
  payError.value = ''
  step.value = 3
  processingSteps.value.forEach(s => { s.done = false; s.active = false })

  for (let i = 0; i < processingSteps.value.length; i++) {
    processingSteps.value[i].active = true
    await delay(900 + Math.random() * 600)
    processingSteps.value[i].done = true
    processingSteps.value[i].active = false
  }

  try {
    await axios.put(`api/invoices/${selectedInvoice.value!.id}`, {
      ...selectedInvoice.value,
      status: 'PAID',
    })
    const idx = invoices.value.findIndex(i => i.id === selectedInvoice.value!.id)
    if (idx !== -1) invoices.value[idx] = { ...invoices.value[idx], status: 'PAID' as any }

    transaction.value = {
      cus: Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000).toString(),
      authCode: Math.random().toString(36).toUpperCase().slice(2, 10),
      date: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
    }
    step.value = 4
  } catch {
    payError.value = 'El pago no pudo completarse. Intenta de nuevo.'
    step.value = 2
  }
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

const reset = () => {
  step.value = 1
  selectedInvoice.value = null
  pseForm.value = { bank: '', userType: 'persona', docType: 'CC', docNumber: '', email: '' }
  processingSteps.value.forEach(s => { s.done = false; s.active = false })
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

const downloadReceipt = () => {
  const inv = selectedInvoice.value!
  const doc = new jsPDF()

  doc.setFillColor(0, 119, 190)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('WatSolution', 20, 18)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Comprobante de Pago PSE', 20, 28)
  doc.text(`Generado: ${transaction.value.date}`, 20, 36)

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('PAGO EXITOSO', 105, 60, { align: 'center' })

  const rows = [
    ['N° Factura', invNum(inv)],
    ['CUS (Código Único)', transaction.value.cus],
    ['Código Autorización', transaction.value.authCode],
    ['Banco', selectedBank.value?.name ?? pseForm.value.bank],
    ['Tipo de persona', pseForm.value.userType === 'persona' ? 'Persona Natural' : 'Persona Jurídica'],
    ['Documento', `${pseForm.value.docType}: ${pseForm.value.docNumber}`],
    ['Fecha emisión factura', fmtDate(inv.issueDate)],
    ['Valor pagado', fmt(inv.amountDue)],
    ['Estado', 'PAGADO'],
    ['Fecha de pago', transaction.value.date],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  let y = 75
  rows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(k + ':', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(v), 90, y)
    y += 10
  })

  doc.setDrawColor(0, 119, 190)
  doc.setLineWidth(0.5)
  doc.line(20, y + 5, 190, y + 5)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('Este documento es válido como comprobante de pago. Guárdelo para su referencia.', 105, y + 14, { align: 'center' })

  doc.save(`comprobante-${invNum(inv)}.pdf`)
}
</script>

<template>
  <div class="pse-page">
    <div class="pse-wrap">

      <!-- ── Progress bar ───────────────────────────────────────────── -->
      <div v-if="step < 4" class="pse-progress">
        <div
          v-for="(s, i) in ['Seleccionar Factura', 'Datos PSE', 'Procesando']"
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
      <!-- STEP 2 — Formulario PSE                                        -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="step === 2" class="pse-card">
        <div class="pse-card__header">
          <div class="pse-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#0077be" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0c0-5-7-12-7-12z"/></svg>
            <span>Pago <strong>PSE</strong></span>
          </div>
          <div class="pse-secure">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            PCI-DSS
          </div>
        </div>

        <!-- Invoice summary -->
        <div class="pse-summary">
          <div class="pse-summary__row">
            <span>Factura</span>
            <strong>{{ invNum(selectedInvoice!) }}</strong>
          </div>
          <div class="pse-summary__row">
            <span>Vencimiento</span>
            <strong :class="{ 'text-red': effectiveStatus(selectedInvoice!) === 'OVERDUE' }">{{ fmtDate(selectedInvoice!.dueDate) }}</strong>
          </div>
          <div class="pse-summary__row pse-summary__row--total">
            <span>Total a pagar</span>
            <strong class="pse-summary__amount">{{ fmt(selectedInvoice!.amountDue) }}</strong>
          </div>
        </div>

        <!-- Error -->
        <div v-if="payError" class="pse-alert pse-alert--error">{{ payError }}</div>

        <!-- PSE Form -->
        <form @submit.prevent="submitPSE" class="pse-form">
          <p class="pse-form__section">Entidad bancaria</p>
          <div class="bank-grid">
            <button
              v-for="bank in banks"
              :key="bank.id"
              type="button"
              :class="['bank-btn', { selected: pseForm.bank === bank.id }]"
              @click="pseForm.bank = bank.id"
            >
              <span class="bank-btn__logo">{{ bank.logo }}</span>
              <span class="bank-btn__name">{{ bank.name }}</span>
            </button>
          </div>

          <p class="pse-form__section">Datos del titular</p>
          <div class="pse-row">
            <div class="pse-field">
              <label>Tipo de persona</label>
              <select v-model="pseForm.userType" required>
                <option value="persona">Persona Natural</option>
                <option value="empresa">Persona Jurídica</option>
              </select>
            </div>
            <div class="pse-field">
              <label>Tipo de documento</label>
              <select v-model="pseForm.docType" required>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="NIT">NIT</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </div>
          </div>
          <div class="pse-row">
            <div class="pse-field">
              <label>Número de documento</label>
              <input v-model="pseForm.docNumber" type="text" placeholder="Ej: 12345678" required />
            </div>
            <div class="pse-field">
              <label>Correo electrónico</label>
              <input v-model="pseForm.email" type="email" placeholder="correo@ejemplo.com" required />
            </div>
          </div>

          <div class="pse-legal">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Al hacer clic en "Ir al banco" serás redirigido de forma segura a tu entidad bancaria para completar el pago. Tu información está protegida con cifrado de 256 bits.
          </div>

          <div class="pse-form__actions">
            <button type="button" class="btn btn--ghost" @click="step = 1">← Volver</button>
            <button
              type="submit"
              class="btn btn--pse"
              :disabled="!pseForm.bank || !pseForm.docNumber || !pseForm.email"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Ir al banco — {{ fmt(selectedInvoice!.amountDue) }}
            </button>
          </div>
        </form>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- STEP 3 — Procesando                                            -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="step === 3" class="pse-card pse-card--processing">
        <div class="proc-bank">
          <span class="proc-bank__logo">{{ selectedBank?.logo ?? '🏦' }}</span>
          <div>
            <p class="proc-bank__name">{{ selectedBank?.name ?? 'Banco' }}</p>
            <p class="proc-bank__sub">Procesando pago seguro</p>
          </div>
        </div>

        <div class="proc-amount">{{ fmt(selectedInvoice!.amountDue) }}</div>
        <p class="proc-ref">Ref: {{ invNum(selectedInvoice!) }}</p>

        <div class="proc-steps">
          <div
            v-for="(s, i) in processingSteps"
            :key="i"
            :class="['proc-step', { active: s.active, done: s.done }]"
          >
            <div class="proc-step__icon">
              <svg v-if="s.done" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
              <div v-else-if="s.active" class="proc-step__spinner"></div>
              <div v-else class="proc-step__dot"></div>
            </div>
            <span>{{ s.label }}</span>
          </div>
        </div>

        <p class="proc-warn">Por favor no cierre ni recargue esta página.</p>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- STEP 4 — Éxito                                                 -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="step === 4" class="pse-card pse-card--success">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2>¡Pago Exitoso!</h2>
        <p class="success-sub">Tu transacción fue procesada correctamente por {{ selectedBank?.name }}.</p>

        <div class="success-receipt">
          <div class="receipt-row">
            <span>N° Factura</span>
            <strong>{{ invNum(selectedInvoice!) }}</strong>
          </div>
          <div class="receipt-row">
            <span>CUS (Código Único)</span>
            <strong class="receipt-cus">{{ transaction.cus }}</strong>
          </div>
          <div class="receipt-row">
            <span>Código de autorización</span>
            <strong>{{ transaction.authCode }}</strong>
          </div>
          <div class="receipt-row">
            <span>Banco</span>
            <strong>{{ selectedBank?.name }}</strong>
          </div>
          <div class="receipt-row">
            <span>Fecha y hora</span>
            <strong>{{ transaction.date }}</strong>
          </div>
          <div class="receipt-row receipt-row--total">
            <span>Valor pagado</span>
            <strong class="receipt-amount">{{ fmt(selectedInvoice!.amountDue) }}</strong>
          </div>
        </div>

        <div class="success-actions">
          <button class="btn btn--outline" @click="downloadReceipt">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Descargar comprobante
          </button>
          <button class="btn btn--primary" @click="reset">
            Pagar otra factura
          </button>
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
  width: 32px;
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

/* ── PSE Summary ───────────────────────────────────────────────────────────── */
.pse-summary {
  margin: 0 24px 20px;
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

/* ── PSE Form ──────────────────────────────────────────────────────────────── */
.pse-form {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pse-form__section {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #0077be;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

@media (min-width: 480px) { .bank-grid { grid-template-columns: repeat(2, 1fr); } }

.bank-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.18s;
  text-align: left;
}

.bank-btn:hover { border-color: #0077be; }

.bank-btn.selected {
  border-color: #0077be;
  background: #eff6ff;
}

.bank-btn__logo { font-size: 1.1rem; flex-shrink: 0; }
.bank-btn__name { font-size: 0.78rem; font-weight: 600; color: #1e293b; line-height: 1.2; }

.pse-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 480px) { .pse-row { grid-template-columns: 1fr; } }

.pse-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pse-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.pse-field input,
.pse-field select {
  height: 40px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
  background: white;
  outline: none;
  transition: border-color 0.18s;
}

.pse-field input:focus,
.pse-field select:focus { border-color: #0077be; box-shadow: 0 0 0 3px rgba(0,119,190,0.1); }

.pse-legal {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.78rem;
  color: #166534;
  line-height: 1.5;
}

.pse-form__actions {
  display: flex;
  gap: 12px;
  justify-content: space-between;
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

.btn--pse {
  flex: 1;
  background: linear-gradient(135deg, #0077be, #005f99);
  color: white;
  padding: 13px 20px;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0,119,190,0.35);
}

.btn--pse:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,119,190,0.45); }
.btn--pse:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn--ghost {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn--ghost:hover { background: #f1f5f9; }

.btn--outline {
  background: white;
  border: 1.5px solid #0077be;
  color: #0077be;
}

.btn--outline:hover { background: #eff6ff; }

.btn--primary {
  background: #0077be;
  color: white;
}

.btn--primary:hover { background: #005f99; }

/* ── Processing ────────────────────────────────────────────────────────────── */
.pse-card--processing {
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.proc-bank {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 20px;
}

.proc-bank__logo { font-size: 1.8rem; }
.proc-bank__name { font-weight: 700; color: #1e293b; margin: 0; font-size: 0.95rem; }
.proc-bank__sub { font-size: 0.78rem; color: #64748b; margin: 2px 0 0; }

.proc-amount {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
}

.proc-ref {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
  font-family: monospace;
}

.proc-steps {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 8px 0;
}

.proc-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: #94a3b8;
  transition: color 0.3s;
}

.proc-step.active { color: #0077be; font-weight: 600; }
.proc-step.done { color: #10b981; }

.proc-step__icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.proc-step.active .proc-step__icon { border-color: #0077be; }
.proc-step.done .proc-step__icon { border-color: #10b981; background: #10b981; color: white; }

.proc-step__spinner {
  width: 10px;
  height: 10px;
  border: 2px solid #0077be;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.proc-step__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e2e8f0;
}

.proc-warn {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
  text-align: center;
}

/* ── Success ───────────────────────────────────────────────────────────────── */
.pse-card--success {
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0fdf4;
  border: 3px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.pse-card--success h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.success-sub {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  max-width: 340px;
}

.success-receipt {
  width: 100%;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 16px 20px;
  text-align: left;
  margin: 4px 0;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  font-size: 0.85rem;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.receipt-row:last-child { border-bottom: none; }

.receipt-row--total {
  padding-top: 12px;
  margin-top: 4px;
  border-top: 2px dashed #e2e8f0;
}

.receipt-cus {
  font-family: monospace;
  color: #0077be;
  font-size: 0.9rem;
}

.receipt-amount {
  font-size: 1.1rem;
  color: #10b981;
  font-weight: 800;
}

.success-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
