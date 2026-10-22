<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
const route = useRoute();
let requestVersion = 0;
let sdkTimeout: ReturnType<typeof setTimeout> | undefined;
import type { IInvoice } from '@/shared/model/invoice.model';

// ─── Step machine: 1=select invoice | 2=bold-button ──────────────────────────
const step = ref(1);
const loadingInvoices = ref(false);
const loadingBold = ref(false);
const invoices = ref<IInvoice[]>([]);
const selectedInvoice = ref<IInvoice | null>(null);
const personId = ref<number | null>(null);
const fetchError = ref('');
const boldError = ref('');

// ─── Load user invoices ───────────────────────────────────────────────────────
async function loadInvoices() {
  loadingInvoices.value = true;
  fetchError.value = '';
  try {
    const pr = await axios.get('api/people/me');
    personId.value = pr.data?.id ?? null;
    if (personId.value) {
      const ir = await axios.get(`api/invoices/by-person/${personId.value}`);
      invoices.value = ir.data ?? [];
      const requested = invoices.value.find(i => String(i.id) === route.query.invoiceId && i.status === 'PENDING');
      if (requested) selectedInvoice.value = requested;
    } else {
      fetchError.value = 'No tienes un perfil de suscriptor vinculado. Contacta al administrador.';
    }
  } catch {
    fetchError.value = 'No se pudo cargar la información. Verifica tu conexión.';
  } finally {
    loadingInvoices.value = false;
  }
}
onMounted(loadInvoices);
onUnmounted(() => {
  requestVersion++;
  clearTimeout(sdkTimeout);
  document.getElementById('bold-sdk')?.remove();
});

// ─── Derived ──────────────────────────────────────────────────────────────────
const effectiveStatus = (inv: IInvoice): 'PENDING' | 'OVERDUE' | 'PAID' | 'CANCELLED' => {
  if (inv.status === 'PAID') return 'PAID';
  if (inv.status === 'CANCELLED') return 'CANCELLED';
  if (inv.status === 'PENDING') {
    const due = new Date(String(inv.dueDate).slice(0, 10) + 'T23:59:59');
    return due < new Date() ? 'OVERDUE' : 'PENDING';
  }
  return 'CANCELLED';
};

const pendingInvoices = computed(() =>
  invoices.value
    .filter(i => effectiveStatus(i) === 'PENDING' || effectiveStatus(i) === 'OVERDUE')
    .sort((a, b) => new Date(b.issueDate as any).getTime() - new Date(a.issueDate as any).getTime()),
);

// ─── Select invoice → load Bold button ───────────────────────────────────────
const selectInvoice = (inv: IInvoice) => {
  selectedInvoice.value = inv;
};
const continuePayment = async () => {
  if (!selectedInvoice.value || loadingBold.value) return;
  step.value = 2;
  await loadBoldButton(selectedInvoice.value);
};
const pendingTotal = computed(() => pendingInvoices.value.reduce((sum, inv) => sum + Number(inv.amountDue || 0), 0));

const loadBoldButton = async (inv: IInvoice) => {
  const version = ++requestVersion;
  clearTimeout(sdkTimeout);
  loadingBold.value = true;
  boldError.value = '';
  try {
    const res = await axios.get(`api/bold/hash?invoiceId=${inv.id}`);
    if (version !== requestVersion) return;
    const { boldOrderId, hash, apiKey, amount } = res.data;
    if (!boldOrderId || !hash || !apiKey || !Number.isFinite(Number(amount)) || Number(amount) <= 0)
      throw new Error('Invalid payment configuration');

    // Must reveal container before accessing it — v-else hides it while loadingBold=true
    loadingBold.value = false;
    await nextTick();

    const container = document.getElementById('bold-payment-container');
    if (version !== requestVersion) return;
    if (!container) throw new Error('Payment container unavailable');
    container.innerHTML = '';

    const btn = document.createElement('script');
    btn.setAttribute('data-bold-button', 'dark-L');
    btn.setAttribute('data-api-key', apiKey);
    btn.setAttribute('data-order-id', boldOrderId);
    btn.setAttribute('data-currency', 'COP');
    btn.setAttribute('data-amount', String(amount));
    btn.setAttribute('data-integrity-signature', hash);
    btn.setAttribute('data-description', `Pago Factura #${inv.id}`);
    btn.setAttribute('data-redirection-url', `${window.location.origin}/invoice/${inv.id}/payment-result`);
    container.appendChild(btn);

    const prev = document.getElementById('bold-sdk');
    if (prev) prev.remove();
    const sdk = document.createElement('script');
    sdk.id = 'bold-sdk';
    sdk.src = `https://checkout.bold.co/library/boldPaymentButton.js?t=${Date.now()}`;
    const fail = () => {
      if (version === requestVersion) boldError.value = 'No se pudo conectar con Bold. Revisa tu conexión y vuelve a intentar.';
    };
    sdk.onerror = () => {
      clearTimeout(sdkTimeout);
      fail();
    };
    sdk.onload = () => clearTimeout(sdkTimeout);
    sdkTimeout = setTimeout(fail, 20000);
    document.head.appendChild(sdk);
  } catch {
    if (version !== requestVersion) return;
    boldError.value = 'No se pudo cargar el botón de pago. Intenta de nuevo.';
    loadingBold.value = false;
  }
};

const goBack = () => {
  requestVersion++;
  clearTimeout(sdkTimeout);
  loadingBold.value = false;
  const prev = document.getElementById('bold-sdk');
  if (prev) prev.remove();
  step.value = 1;
  selectedInvoice.value = null;
  boldError.value = '';
};

const retryBold = () => {
  if (selectedInvoice.value) loadBoldButton(selectedInvoice.value);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (amount: any) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(amount ?? 0));

const fmtDate = (date: any) => {
  if (!date) return '—';
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? `${date}T12:00:00` : date).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const invNum = (inv: IInvoice) => {
  const y = inv.issueDate ? new Date(inv.issueDate as any).getFullYear() : new Date().getFullYear();
  return `FAC-${y}-${String(inv.id ?? 0).padStart(3, '0')}`;
};
</script>

<template>
  <div class="payments-page">
    <div class="payments-wrap">
      <router-link to="/portal" class="back-link"
        ><font-awesome-icon icon="arrow-left" style="font-size: 16px" /> Volver a mi cuenta</router-link
      >
      <header class="payments-heading">
        <div>
          <p class="eyebrow">OFICINA VIRTUAL / PAGOS</p>
          <h1>Paga tu factura</h1>
          <p>Consulta tus pendientes y revisa el detalle antes de continuar.</p>
        </div>
        <span class="provider"><font-awesome-icon icon="shield-alt" style="font-size: 17px" /> Procesado por Bold</span>
      </header>
      <ol class="payment-steps" aria-label="Progreso del pago">
        <li :class="{ active: step === 1 }" :aria-current="step === 1 ? 'step' : undefined"><span>1</span> Selecciona la factura</li>
        <li :class="{ active: step === 2 }" :aria-current="step === 2 ? 'step' : undefined"><span>2</span> Revisa y paga</li>
        <li><span>3</span> Consulta el resultado</li>
      </ol>
      <div class="payment-grid">
        <section class="payment-panel" :aria-busy="loadingInvoices || loadingBold">
          <div class="panel-heading">
            <h2>{{ step === 1 ? 'Facturas pendientes' : 'Confirmación de pago' }}</h2>
            <span v-if="step === 1 && !loadingInvoices && !fetchError">{{ pendingInvoices.length }} disponibles</span>
          </div>
          <div v-if="loadingInvoices" class="payment-state" role="status">Cargando tus facturas…</div>
          <div v-else-if="fetchError" class="payment-state" role="alert">
            <font-awesome-icon icon="file-invoice" style="font-size: 30px" />
            <h3>No pudimos consultar tus facturas</h3>
            <p>{{ fetchError }}</p>
            <button class="secondary-button" @click="loadInvoices">Reintentar consulta</button>
          </div>
          <div v-else-if="!pendingInvoices.length" class="payment-state">
            <font-awesome-icon icon="check-circle" style="font-size: 34px" />
            <h3>Estás al día</h3>
            <p>No tienes facturas pendientes de pago.</p>
            <router-link to="/portal" class="secondary-button">Ir a mi cuenta</router-link>
          </div>
          <template v-else-if="step === 1">
            <p class="panel-description">Selecciona una factura para ver el resumen de pago.</p>
            <label
              v-for="inv in pendingInvoices"
              :key="inv.id"
              class="invoice-option"
              :class="{ selected: selectedInvoice?.id === inv.id }"
            >
              <input type="radio" name="invoice" :checked="selectedInvoice?.id === inv.id" @change="selectInvoice(inv)" />
              <div class="invoice-info">
                <strong>{{ invNum(inv) }}</strong
                ><span>Vence el {{ fmtDate(inv.dueDate) }}</span>
              </div>
              <div class="invoice-amount">
                <strong>{{ fmt(inv.amountDue) }}</strong
                ><span :class="['status', { overdue: effectiveStatus(inv) === 'OVERDUE' }]">{{
                  effectiveStatus(inv) === 'OVERDUE' ? 'Vencida' : 'Pendiente'
                }}</span>
              </div>
            </label>
            <div class="list-total">
              <span>Saldo pendiente total</span><strong>{{ fmt(pendingTotal) }}</strong>
            </div>
          </template>
          <template v-else>
            <div class="checkout-copy">
              <font-awesome-icon icon="shield-alt" style="font-size: 30px" />
              <h3>Continúa en la pasarela de Bold</h3>
              <p>
                Selecciona tu medio de pago en la ventana de Bold. El estado de tu factura se actualizará cuando se confirme la transacción.
              </p>
            </div>
            <div v-if="loadingBold" class="payment-state" role="status">Preparando el pago…</div>
            <div v-else-if="boldError" class="payment-error" role="alert">
              <p>{{ boldError }}</p>
              <button class="secondary-button" @click="retryBold">Reintentar conexión</button>
            </div>
            <div v-else id="bold-payment-container" class="bold-container"></div>
            <div class="checkout-back">
              <button class="text-button" @click="goBack">
                <font-awesome-icon icon="arrow-left" style="font-size: 15px" /> Elegir otra factura
              </button>
            </div>
          </template>
        </section>
        <aside class="payment-summary">
          <p class="eyebrow">DETALLE DE LA OPERACIÓN</p>
          <h2>Resumen del pago</h2>
          <template v-if="selectedInvoice"
            ><dl>
              <div>
                <dt>Factura</dt>
                <dd>{{ invNum(selectedInvoice) }}</dd>
              </div>
              <div>
                <dt>Emisión</dt>
                <dd>{{ fmtDate(selectedInvoice.issueDate) }}</dd>
              </div>
              <div>
                <dt>Vencimiento</dt>
                <dd>{{ fmtDate(selectedInvoice.dueDate) }}</dd>
              </div>
              <div>
                <dt>Moneda</dt>
                <dd>Pesos colombianos · COP</dd>
              </div>
            </dl>
            <div class="payment-total">
              <span>Total a pagar</span><strong>{{ fmt(selectedInvoice.amountDue) }}</strong>
            </div></template
          >
          <p v-else class="summary-empty">El detalle aparecerá al seleccionar una factura de la lista.</p>
          <button
            v-if="step === 1"
            class="continue-button"
            :disabled="!selectedInvoice || loadingInvoices || !!fetchError"
            @click="continuePayment"
          >
            Continuar al pago <font-awesome-icon icon="arrow-right" style="font-size: 17px" />
          </button>
          <p class="summary-note">Los datos de tu medio de pago se ingresan directamente en Bold.</p>
          <div class="payment-help">
            <h3>¿Necesitas revisar una factura?</h3>
            <p>Consulta tu historial desde el portal antes de realizar el pago.</p>
            <router-link to="/portal">Volver al portal →</router-link>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payments-page {
  background: #f5f7f8;
  min-height: calc(100vh - 70px);
  padding: 32px 24px 70px;
  color: #203240;
}
.payments-wrap {
  max-width: 1120px;
  margin: auto;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #637581;
  margin-bottom: 30px;
}
.payments-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.eyebrow {
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 600;
  color: #6d8287;
  margin: 0 0 12px;
}
.payments-heading h1 {
  font-size: 32px;
  letter-spacing: -1px;
  font-weight: 600;
  margin-bottom: 10px;
}
.payments-heading p:not(.eyebrow) {
  font-size: 14px;
  color: #75828c;
}
.provider {
  font-size: 12px;
  color: #176b61;
  display: flex;
  align-items: center;
  gap: 7px;
}
.payment-steps {
  display: flex;
  gap: 38px;
  margin: 28px 0;
  padding: 20px 0;
  border-top: 1px solid #dfe6ea;
  border-bottom: 1px solid #dfe6ea;
  list-style: none;
}
.payment-steps li {
  font-size: 12px;
  color: #7d8b95;
  display: flex;
  align-items: center;
  gap: 9px;
}
.payment-steps li span {
  display: grid;
  place-items: center;
  border: 1px solid #d5dfe3;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 11px;
}
.payment-steps li.active {
  color: #176b61;
  font-weight: 600;
}
.payment-steps li.active span {
  background: #176b61;
  border-color: #176b61;
  color: white;
}
.payment-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(290px, 1fr);
  gap: 24px;
  align-items: start;
}
.payment-panel,
.payment-summary {
  background: white;
  border: 1px solid #dfe6ea;
  border-radius: 8px;
  overflow: hidden;
}
.panel-heading {
  padding: 24px;
  border-bottom: 1px solid #e6ecef;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.panel-heading h2,
.payment-summary h2 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}
.panel-heading > span {
  font-size: 11px;
  color: #768792;
}
.panel-description {
  padding: 20px 24px 0;
  font-size: 12px;
  color: #75838e;
}
.invoice-option {
  margin: 16px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #e0e7eb;
  border-radius: 6px;
  padding: 20px 16px;
  cursor: pointer;
}
.invoice-option.selected {
  border-color: #176b61;
  background: #f5faf8;
}
.invoice-option input {
  accent-color: #176b61;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.invoice-info,
.invoice-amount {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}
.invoice-info {
  flex: 1;
}
.invoice-info span {
  font-size: 11px;
  color: #7b8993;
}
.invoice-amount {
  align-items: flex-end;
  font-variant-numeric: tabular-nums;
}
.status {
  font-size: 10px;
  border-radius: 4px;
  background: #f8f1df;
  color: #937024;
  padding: 3px 7px;
}
.status.overdue {
  background: #fbebea;
  color: #a64a42;
}
.list-total {
  display: flex;
  justify-content: space-between;
  padding: 22px 24px;
  border-top: 1px solid #edf0f2;
  font-size: 12px;
  color: #6b7b86;
}
.payment-summary {
  padding: 26px;
}
.payment-summary dl {
  margin: 25px 0;
}
.payment-summary dl div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 15px 0;
  font-size: 12px;
}
.payment-summary dt {
  color: #7c8992;
  font-weight: 400;
}
.payment-summary dd {
  margin: 0;
  text-align: right;
}
.payment-total {
  border-top: 1px solid #e2e8ec;
  padding: 22px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.payment-total span {
  font-size: 12px;
  color: #6d7d87;
}
.payment-total strong {
  font-size: 32px;
  letter-spacing: -1px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.continue-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 13px;
  border: 0;
  border-radius: 6px;
  background: #176b61;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.continue-button:disabled {
  background: #e8edef;
  color: #89959d;
  cursor: not-allowed;
}
.summary-note {
  font-size: 11px;
  line-height: 1.7;
  color: #84919a;
  margin: 16px 0 0;
}
.summary-empty {
  color: #7c8a93;
  font-size: 13px;
  line-height: 1.8;
  padding: 28px 0;
}
.payment-help {
  border-top: 1px solid #e5eaed;
  margin-top: 24px;
  padding-top: 22px;
}
.payment-help h3 {
  font-size: 12px;
  font-weight: 600;
}
.payment-help p {
  font-size: 12px;
  line-height: 1.7;
  color: #7a8994;
  margin: 10px 0;
}
.payment-help a {
  font-size: 12px;
  color: #176b61;
}
.payment-state {
  padding: 48px 24px;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 14px;
  text-align: center;
  color: #768792;
  font-size: 13px;
}
.payment-state h3,
.checkout-copy h3 {
  font-size: 17px;
  font-weight: 600;
  color: #203240;
}
.secondary-button {
  padding: 10px 16px;
  border: 1px solid #d7e0e5;
  border-radius: 5px;
  background: white;
  color: #176b61;
  font-size: 12px;
}
.checkout-copy {
  padding: 32px 28px 12px;
}
.checkout-copy svg {
  color: #176b61;
  margin-bottom: 18px;
}
.checkout-copy p {
  font-size: 13px;
  line-height: 1.8;
  color: #7b8993;
  margin-top: 12px;
}
.bold-container {
  display: flex;
  justify-content: center;
  min-height: 90px;
  padding: 20px;
}
.checkout-back {
  border-top: 1px solid #e5eaed;
  padding: 20px 28px;
}
.text-button {
  background: none;
  border: 0;
  color: #687c88;
  font-size: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.payment-error {
  padding: 24px;
  margin: 20px;
  background: #fff6f4;
  color: #a14f44;
  border-radius: 6px;
  font-size: 13px;
}
.payment-error p {
  margin-bottom: 16px;
}
@media (max-width: 760px) {
  .payments-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .payment-grid {
    grid-template-columns: 1fr;
  }
  .payment-steps {
    gap: 15px;
    justify-content: space-between;
  }
  .payment-steps li {
    font-size: 10px;
    flex-direction: column;
    text-align: center;
    flex: 1;
  }
  .payments-page {
    padding: 24px 16px;
  }
  .invoice-option {
    margin: 12px;
    padding: 14px 10px;
    gap: 9px;
  }
  .invoice-info strong,
  .invoice-amount strong {
    font-size: 12px;
  }
}
</style>
