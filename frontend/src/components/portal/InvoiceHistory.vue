<script setup lang="ts">
import { Download, FileText } from 'lucide-vue-next'

interface Invoice {
  id: string
  date: string
  amount: number
  status: string
}

defineProps<{
  invoices: Invoice[]
}>()

const emit = defineEmits<{
  (e: 'download', id: string): void
  (e: 'viewAll'): void
}>()
</script>

<template>
  <div class="portal-card history-card">
    <div class="card-header">
      <h3>Historial</h3>
      <button class="btn-text" @click="emit('viewAll')">Ver todo</button>
    </div>
    <div class="history-list">
      <div v-for="inv in invoices" :key="inv.id" class="history-item">
        <div class="item-info">
          <FileText :size="18" class="icon" />
          <div>
            <span class="id">{{ inv.id }}</span>
            <span class="date">{{ inv.date }}</span>
          </div>
        </div>
        <div class="item-actions">
          <span class="amount">${{ inv.amount.toLocaleString() }}</span>
          <button 
            class="btn-download" 
            title="Descargar PDF"
            @click="emit('download', inv.id)"
          >
            <Download :size="14" />
          </button>
        </div>
      </div>
    </div>
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
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  background: #f8fafc;
  border-radius: 14px;
  transition: all 0.2s;

  &:hover { background: #f1f5f9; }

  .item-info {
    display: flex;
    gap: 12px;
    align-items: center;
    .icon { color: $color-primary; opacity: 0.7; }
    div { display: flex; flex-direction: column; }
    .id { font-size: 0.9rem; font-weight: 700; color: $color-text; }
    .date { font-size: 0.75rem; color: $color-text-muted; }
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    .amount { font-size: 0.9rem; font-weight: 700; color: $color-text; }
    .btn-download {
      background: white;
      border: 1px solid #e2e8f0;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: $color-text-muted;
      &:hover { color: $color-primary; border-color: $color-primary; }
    }
  }
}

.btn-text {
  background: none;
  border: none;
  color: $color-primary;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  &:hover { text-decoration: underline; }
}
</style>
