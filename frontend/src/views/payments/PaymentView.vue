<script setup lang="ts">
import { ref } from 'vue'
import { CreditCard, Landmark, CheckCircle2, Download, ArrowRight, ShieldCheck } from 'lucide-vue-next'
import { jsPDF } from 'jspdf'

const step = ref(1)
const paymentData = ref({
  bank: '',
  userType: 'persona',
  docType: 'CC',
  docNumber: '',
  amount: 45000,
  reference: 'FACT-2026-001'
})

const banks = [
  'Banco de Bogotá', 'Bancolombia', 'Davivienda', 'BBVA', 'Banco Popular', 'Nequi', 'Daviplata'
]

const handlePayment = () => {
  step.value = 2 // Simulando redirección y retorno exitoso
}

const downloadReceipt = () => {
  const doc = new jsPDF()
  doc.setFontSize(22)
  doc.text('watsolution - Comprobante de Pago', 20, 20)
  doc.setFontSize(12)
  doc.text(`Referencia: ${paymentData.value.reference}`, 20, 40)
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 50)
  doc.text(`Banco: ${paymentData.value.bank}`, 20, 60)
  doc.text(`Valor: $${paymentData.value.amount.toLocaleString()}`, 20, 70)
  doc.text(`Estado: EXITOSO`, 20, 80)
  doc.save(`recibo-${paymentData.value.reference}.pdf`)
}
</script>

<template>
  <div class="payment-view">
    <div class="container">
      <div v-if="step === 1" class="payment-form-card">
        <div class="payment-header">
          <img src="https://www.pse.com.co/images/pse_logo.png" alt="PSE Logo" class="pse-logo">
          <h1>Pagos en Línea</h1>
          <p>Completa los datos para realizar tu pago de forma segura</p>
        </div>

        <div class="payment-summary">
          <div class="summary-item">
            <span>Referencia:</span>
            <strong>{{ paymentData.reference }}</strong>
          </div>
          <div class="summary-item">
            <span>Total a pagar:</span>
            <strong class="amount">${{ paymentData.amount.toLocaleString() }}</strong>
          </div>
        </div>

        <form @submit.prevent="handlePayment" class="form-grid">
          <div class="form-group">
            <label>Tipo de Persona</label>
            <select v-model="paymentData.userType" required>
              <option value="persona">Persona Natural</option>
              <option value="empresa">Persona Jurídica</option>
            </select>
          </div>

          <div class="form-group">
            <label>Banco</label>
            <div class="input-wrapper">
              <Landmark class="input-icon" :size="18" />
              <select v-model="paymentData.bank" required>
                <option value="" disabled>Selecciona tu banco</option>
                <option v-for="bank in banks" :key="bank" :value="bank">{{ bank }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Tipo de Documento</label>
            <select v-model="paymentData.docType" required>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="NIT">NIT</option>
            </select>
          </div>

          <div class="form-group">
            <label>Número de Documento</label>
            <input type="text" v-model="paymentData.docNumber" placeholder="Ej: 12345678" required>
          </div>

          <div class="security-info">
            <ShieldCheck :size="20" />
            <p>Tus datos están protegidos con encriptación de grado bancario PCI-DSS.</p>
          </div>

          <button type="submit" class="btn btn--primary btn--block">
            Pagar con PSE <ArrowRight :size="18" />
          </button>
        </form>
      </div>

      <div v-else class="success-card">
        <div class="success-icon">
          <CheckCircle2 :size="64" />
        </div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu transacción se ha procesado correctamente.</p>
        
        <div class="receipt-details">
          <div class="detail">
            <span>CUS:</span>
            <strong>987654321</strong>
          </div>
          <div class="detail">
            <span>Fecha:</span>
            <strong>{{ new Date().toLocaleDateString() }}</strong>
          </div>
        </div>

        <div class="actions">
          <button @click="downloadReceipt" class="btn btn--outline">
            <Download :size="18" /> Descargar PDF
          </button>
          <button @click="step = 1" class="btn btn--primary">
            Finalizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.payment-view {
  padding: 100px $spacing-sm $spacing-xl;
  background: $color-bg;
  min-height: 100vh;

  @include tablet {
    padding: 120px 0 $spacing-xl;
  }
}

.payment-form-card, .success-card {
  background: white;
  padding: $spacing-md;
  border-radius: 24px;
  box-shadow: $shadow-lg;
  max-width: 600px;
  margin: 0 auto;

  @include tablet {
    padding: $spacing-lg;
  }
}

.payment-header {
  text-align: center;
  margin-bottom: $spacing-lg;
  .pse-logo { height: clamp(40px, 10vw, 60px); margin-bottom: $spacing-sm; }
  h1 { font-size: clamp(1.4rem, 4vw, 1.75rem); color: $color-text; font-weight: 800; }
  p { color: $color-text-muted; font-size: 0.95rem; }
}

.payment-summary {
  background: #f8fafc;
  padding: $spacing-md;
  border-radius: 12px;
  margin-bottom: $spacing-lg;
  display: flex;
  justify-content: space-between;
  
  .amount { color: $color-primary; font-size: 1.25rem; }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;

  @include tablet {
    grid-template-columns: 1fr 1fr;
  }

  .btn--block { grid-column: 1 / -1; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  label { font-weight: 600; font-size: 0.9rem; }
  input, select {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
  }
}

.input-wrapper {
  position: relative;
  .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: $color-text-muted; }
  select { padding-left: 2.5rem; width: 100%; }
}

.security-info {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  background: #f0fdf4;
  padding: $spacing-sm;
  border-radius: 8px;
  color: #166534;
  font-size: 0.85rem;
}

.success-card {
  text-align: center;
  .success-icon { color: #22c55e; margin-bottom: $spacing-md; }
  h1 { margin-bottom: $spacing-xs; }
  p { color: $color-text-muted; margin-bottom: $spacing-lg; }
}

.receipt-details {
  border-top: 1px dashed #e2e8f0;
  border-bottom: 1px dashed #e2e8f0;
  padding: $spacing-md 0;
  margin-bottom: $spacing-lg;
  .detail { display: flex; justify-content: space-between; margin-bottom: 8px; }
}

.actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
}
</style>
