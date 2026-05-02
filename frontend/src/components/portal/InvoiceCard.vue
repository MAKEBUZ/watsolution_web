<script setup lang="ts">
import { Calendar, CreditCard } from 'lucide-vue-next'

defineProps<{
  amount: number | string
  dueDate: string
  status: string
  statusClass?: string
}>()
</script>

<template>
  <div class="portal-card invoice-summary">
    <div class="card-header">
      <h3>Factura Actual</h3>
      <span :class="['badge', statusClass || 'badge--pending']">{{ status }}</span>
    </div>
    <div class="invoice-amount">
      <span class="currency">$</span>
      <span class="value">{{ amount.toLocaleString() }}</span>
    </div>
    <p class="due-date"><Calendar :size="14" /> Vence: {{ dueDate }}</p>
    <router-link to="/pagos" class="btn btn--primary btn--block">
      <CreditCard :size="18" /> Pagar Ahora
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.portal-card {
  background: white;
  padding: $spacing-lg;
  border-radius: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid rgba(0, 0, 0, 0.03);

  h3 { font-size: 1.15rem; margin-bottom: $spacing-md; font-weight: 700; color: $color-text; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  h3 { margin-bottom: 0; }
  
  .badge {
    padding: 4px 12px;
    background: #f1f5f9;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    color: $color-text-muted;
    &--pending { background: #fef3c7 !important; color: #92400e !important; }
  }
}

.invoice-summary {
  .invoice-amount {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    margin: $spacing-md 0;
    .currency { font-size: 1.25rem; font-weight: 600; color: $color-text-muted; margin-top: 4px; }
    .value { font-size: 3rem; font-weight: 800; color: $color-text; line-height: 1; }
  }
  .due-date {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ef4444;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: $spacing-lg;
  }
}
</style>
