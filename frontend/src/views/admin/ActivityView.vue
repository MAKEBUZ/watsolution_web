<script setup lang="ts">
import { ref } from 'vue'
import { CreditCard, Droplets, FileText, UserPlus, Clock, CheckCircle } from 'lucide-vue-next'

const logs = ref([
  { id: 1, user: 'Maria Garcia', action: 'Pago de Factura', details: 'FAC-2026-0038', amount: '$45,200', type: 'payment', time: 'Hace 5 min' },
  { id: 2, user: 'Juan Perez', action: 'Nueva Lectura', details: '1,265 m³ - Sector Sur', type: 'reading', time: 'Hace 12 min' },
  { id: 3, user: 'Sistema', action: 'Nueva Noticia', details: 'Corte programado sector Norte', type: 'news', time: 'Hace 25 min' },
  { id: 4, user: 'Carlos Ruiz', action: 'Registro Usuario', details: 'Nuevo suscriptor: ID #104', type: 'user', time: 'Hace 1 hora' },
  { id: 5, user: 'Ana Lopez', action: 'Pago de Factura', details: 'FAC-2026-0039', amount: '$32,100', type: 'payment', time: 'Hace 2 horas' }
])

const getLogIcon = (type: string) => {
  switch (type) {
    case 'payment': return CreditCard
    case 'reading': return Droplets
    case 'news': return FileText
    case 'user': return UserPlus
    default: return Clock
  }
}

const getLogColor = (type: string) => {
  switch (type) {
    case 'payment': return '#10b981'
    case 'reading': return '#3b82f6'
    case 'news': return '#f59e0b'
    case 'user': return '#8b5cf6'
    default: return '#94a3b8'
  }
}
</script>

<template>
  <div class="activity-page">
    <header class="activity-header">
      <div>
        <h1>Actividad Reciente</h1>
        <p>Registros de eventos del sistema y acciones de usuarios.</p>
      </div>
    </header>

    <section class="logs-card" aria-label="Listado de actividad reciente">
      <div class="logs-container">
        <div v-for="log in logs" :key="log.id" class="log-entry">
          <div class="log-icon" :style="{ color: getLogColor(log.type), backgroundColor: getLogColor(log.type) + '15' }">
            <component :is="getLogIcon(log.type)" :size="18" />
          </div>
          <div class="log-info">
            <div class="log-header">
              <strong>{{ log.user }}</strong>
              <span class="log-time">{{ log.time }}</span>
            </div>
            <p class="log-action">{{ log.action }}</p>
            <div class="log-meta">
              <span class="log-details">{{ log.details }}</span>
              <div v-if="log.amount" class="log-amount-wrapper">
                <span class="log-amount">{{ log.amount }}</span>
                <CheckCircle v-if="log.type === 'payment'" class="payment-check" :size="14" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.activity-page {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: $spacing-md;

  h1 { font-size: 1.6rem; font-weight: 800; color: $color-text; margin-bottom: 4px; }
  p { color: $color-text-muted; font-size: 0.95rem; }
}

.logs-card {
  background: white;
  padding: $spacing-xl;
  border-radius: 24px;
  box-shadow: $shadow-sm;
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.log-entry {
  display: flex;
  gap: 12px;
  position: relative;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child { border-bottom: 0; }

  .log-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .log-info {
    flex: 1;
    min-width: 0;

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 2px;
      strong { font-size: 0.9rem; color: $color-text; }
      .log-time { font-size: 0.75rem; color: $color-text-muted; white-space: nowrap; }
    }

    .log-action { font-size: 0.85rem; color: $color-text; margin-bottom: 4px; }

    .log-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      .log-details { font-size: 0.8rem; color: $color-text-muted; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      
      .log-amount-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
        .log-amount { font-size: 0.85rem; font-weight: 700; color: #10b981; white-space: nowrap; }
        .payment-check { color: #10b981; flex-shrink: 0; }
      }
    }
  }
}
</style>

