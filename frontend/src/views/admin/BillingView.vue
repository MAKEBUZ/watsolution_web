<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, Calculator, Printer, FileCode, Search, Save } from 'lucide-vue-next'

const invoice = ref({
  userId: '',
  userName: '',
  previousReading: 1250,
  currentReading: 1265,
  ratePerM3: 2500,
  fixedCharge: 5000,
  subsidy: 0.15, // 15%
  recharge: 0
})

const consumption = computed(() => invoice.value.currentReading - invoice.value.previousReading)
const subtotal = computed(() => (consumption.value * invoice.value.ratePerM3) + invoice.value.fixedCharge)
const discount = computed(() => subtotal.value * invoice.value.subsidy)
const total = computed(() => subtotal.value - discount.value + invoice.value.recharge)

const handleSave = () => {
  alert('Factura generada exitosamente con el consecutivo: FAC-2026-0042')
}
</script>

<template>
  <div class="billing-view">
    <div class="mgmt-header">
      <h1>Facturación Manual</h1>
      <p>Genera facturas individuales calculando automáticamente consumos y tarifas</p>
    </div>

    <div class="billing-grid">
      <!-- Formulario de Entrada -->
      <section class="billing-card billing-form">
        <h2><Calculator :size="20" /> Datos de Consumo</h2>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Buscar Usuario (Nombre o ID)</label>
            <div class="input-with-search">
              <input type="text" v-model="invoice.userName" placeholder="Ej: Juan Pérez">
              <button class="btn-search"><Search :size="18" /></button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Lectura Anterior (m³)</label>
            <input type="number" v-model="invoice.previousReading">
          </div>
          
          <div class="form-group">
            <label>Lectura Actual (m³)</label>
            <input type="number" v-model="invoice.currentReading">
          </div>

          <div class="form-group">
            <label>Tarifa por m³</label>
            <input type="number" v-model="invoice.ratePerM3">
          </div>

          <div class="form-group">
            <label>Cargo Fijo</label>
            <input type="number" v-model="invoice.fixedCharge">
          </div>

          <div class="form-group">
            <label>Subsidio (%)</label>
            <input type="number" step="0.01" v-model="invoice.subsidy">
          </div>

          <div class="form-group">
            <label>Recargos Adicionales</label>
            <input type="number" v-model="invoice.recharge">
          </div>
        </div>
      </section>

      <!-- Previsualización y Totales -->
      <section class="billing-card billing-preview">
        <h2><FileText :size="20" /> Resumen de Liquidación</h2>
        
        <div class="preview-content">
          <div class="preview-row">
            <span>Consumo del periodo:</span>
            <strong>{{ consumption }} m³</strong>
          </div>
          <div class="preview-row">
            <span>Valor Consumo:</span>
            <span>${{ (consumption * invoice.ratePerM3).toLocaleString() }}</span>
          </div>
          <div class="preview-row">
            <span>Cargo Fijo:</span>
            <span>${{ invoice.fixedCharge.toLocaleString() }}</span>
          </div>
          <hr>
          <div class="preview-row">
            <span>Subtotal:</span>
            <span>${{ subtotal.toLocaleString() }}</span>
          </div>
          <div class="preview-row discount">
            <span>Subsidio Aplicado ({{ invoice.subsidy * 100 }}%):</span>
            <span>- ${{ discount.toLocaleString() }}</span>
          </div>
          <div class="preview-row recharge">
            <span>Recargos:</span>
            <span>+ ${{ invoice.recharge.toLocaleString() }}</span>
          </div>
          <div class="preview-total">
            <span>TOTAL A PAGAR:</span>
            <strong>${{ total.toLocaleString() }}</strong>
          </div>
        </div>

        <div class="billing-actions">
          <button @click="handleSave" class="btn btn--primary">
            <Save :size="20" :stroke-width="2.5" />
            <span>Generar Factura</span>
          </button>
          <div class="export-buttons">
            <button class="btn btn--outline">
              <Printer :size="20" :stroke-width="2.5" />
              <span>PDF</span>
            </button>
            <button class="btn btn--outline">
              <FileCode :size="20" :stroke-width="2.5" />
              <span>XML</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.billing-view {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.mgmt-header {
  h1 { font-size: 1.5rem; color: $color-text; }
  p { color: $color-text-muted; font-size: 0.9rem; }
}

.billing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;

  @include desktop {
    grid-template-columns: 1.5fr 1fr;
  }
}

.billing-card {
  background: white;
  padding: $spacing-lg;
  border-radius: 16px;
  box-shadow: $shadow-sm;

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    margin-bottom: $spacing-lg;
    color: $color-primary;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;

  .full-width { grid-column: 1 / -1; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  label { font-weight: 600; font-size: 0.85rem; color: $color-text-muted; }
  input { 
    padding: 0.75rem; 
    border: 1px solid #e2e8f0; 
    border-radius: 8px; 
    font-size: 1rem;
  }
}

.input-with-search {
  display: flex;
  gap: 8px;
  input { flex: 1; }
  .btn-search {
    background: $color-primary;
    color: white;
    border: none;
    border-radius: 8px;
    width: 45px;
    cursor: pointer;
  }
}

.preview-content {
  background: #f8fafc;
  padding: $spacing-md;
  border-radius: 12px;
  margin-bottom: $spacing-lg;

  .preview-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.95rem;

    &.discount { color: #166534; font-weight: 600; }
    &.recharge { color: #991b1b; font-weight: 600; }
  }

  hr { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }

  .preview-total {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-md;
    font-size: 1.25rem;
    color: $color-text;
    strong { color: $color-primary; }
  }
}

.billing-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  .btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
  
  .export-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-sm;
  }
}
</style>
