<template>
  <div class="result-page">
    <div class="result-wrap">

      <!-- Loading -->
      <div v-if="loading" class="result-card result-card--loading">
        <div class="result-spinner"></div>
        <p class="result-loading-text">Verificando tu pago con Bold...</p>
        <p class="result-loading-sub">Por favor espera, esto tarda unos segundos.</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="result-card">
        <div class="result-header">
          <div class="result-icon result-icon--error">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <h2>Error al verificar el pago</h2>
          <p>{{ error }}</p>
        </div>
        <div class="result-actions">
          <button class="btn btn--primary" @click="goToPagos">Volver a Pagos</button>
        </div>
      </div>

      <!-- APPROVED -->
      <div v-else-if="boldStatus === 'APPROVED'" class="result-card result-card--success">
        <div class="result-header">
          <div class="result-icon result-icon--success">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2>¡Pago Exitoso!</h2>
          <p>Tu pago fue procesado correctamente por Bold. La factura ha sido marcada como pagada.</p>
        </div>

        <div class="result-receipt">
          <div class="receipt-row">
            <span>Referencia Bold</span>
            <strong class="receipt-mono">{{ boldOrderId }}</strong>
          </div>
          <div class="receipt-row">
            <span>Estado</span>
            <span class="badge badge--success">PAGADO</span>
          </div>
          <div class="receipt-row receipt-row--total">
            <span>Factura</span>
            <strong>{{ invoiceLabel }}</strong>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn btn--outline" @click="goToPagos">Ir a Pagos</button>
          <button class="btn btn--primary" @click="goToInvoice">Ver factura</button>
        </div>
      </div>

      <!-- REJECTED / FAILED / VOIDED -->
      <div v-else-if="['REJECTED','FAILED','VOIDED'].includes(boldStatus)" class="result-card">
        <div class="result-header">
          <div class="result-icon result-icon--error">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2>Pago no aprobado</h2>
          <p>El pago fue rechazado o no se completó (estado: <strong>{{ boldStatus }}</strong>). La factura no fue modificada.</p>
        </div>

        <div class="result-receipt">
          <div class="receipt-row">
            <span>Referencia Bold</span>
            <strong class="receipt-mono">{{ boldOrderId }}</strong>
          </div>
          <div class="receipt-row">
            <span>Estado Bold</span>
            <span class="badge badge--error">{{ boldStatus }}</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn btn--primary" @click="goToPagos">Reintentar pago</button>
        </div>
      </div>

      <!-- PROCESSING / PENDING / UNKNOWN -->
      <div v-else class="result-card">
        <div class="result-header">
          <div class="result-icon result-icon--pending">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2>Pago en proceso</h2>
          <p>Tu pago está siendo procesado (estado: <strong>{{ boldStatus || 'PENDIENTE' }}</strong>). Recibirás confirmación cuando se apruebe.</p>
        </div>

        <div class="result-receipt">
          <div class="receipt-row">
            <span>Referencia Bold</span>
            <strong class="receipt-mono">{{ boldOrderId }}</strong>
          </div>
          <div class="receipt-row">
            <span>Estado</span>
            <span class="badge badge--pending">{{ boldStatus || 'PENDIENTE' }}</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn btn--outline" @click="goToPagos">Ir a Pagos</button>
          <button class="btn btn--primary" @click="goToInvoice">Ver factura</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" src="./invoice-payment-result.component.ts"></script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #f0f4f8;
  padding: 60px 16px 80px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.result-wrap {
  width: 100%;
  max-width: 520px;
}

.result-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  padding: 40px 32px;
}

.result-card--loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 32px;
}

.result-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #0077be;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.result-loading-text {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.result-loading-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.result-header {
  text-align: center;
  margin-bottom: 24px;
}

.result-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.result-icon--success {
  background: #f0fdf4;
  border: 3px solid #bbf7d0;
  color: #10b981;
}

.result-icon--error {
  background: #fef2f2;
  border: 3px solid #fecaca;
  color: #ef4444;
}

.result-icon--pending {
  background: #fefce8;
  border: 3px solid #fde68a;
  color: #f59e0b;
}

.result-header h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px;
}

.result-header p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.result-receipt {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 14px 18px;
  margin-bottom: 24px;
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
  border-top: 1px dashed #e2e8f0;
}

.receipt-mono {
  font-family: monospace;
  font-size: 0.8rem;
  color: #0077be;
  word-break: break-all;
  max-width: 240px;
  text-align: right;
}

.badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}

.badge--success { background: #dcfce7; color: #166534; }
.badge--error   { background: #fee2e2; color: #991b1b; }
.badge--pending { background: #fef3c7; color: #92400e; }

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn--primary {
  background: #0077be;
  color: white;
}

.btn--primary:hover { background: #005f99; }

.btn--outline {
  background: white;
  border: 1.5px solid #0077be;
  color: #0077be;
}

.btn--outline:hover { background: #eff6ff; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
