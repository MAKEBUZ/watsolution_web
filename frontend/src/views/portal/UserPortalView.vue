<script setup lang="ts">
import { 
  CreditCard, MessageSquare, History, Settings, 
  Droplet, FileText, Download, TrendingDown, Award, Clock
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

// Componentes Modulares
import PortalHeader from '../../components/portal/PortalHeader.vue'
import PortalStats from '../../components/portal/PortalStats.vue'
import QuickActions from '../../components/portal/QuickActions.vue'
import InvoiceCard from '../../components/portal/InvoiceCard.vue'
import InvoiceHistory from '../../components/portal/InvoiceHistory.vue'
import ActivityTimeline from '../../components/portal/ActivityTimeline.vue'
import ConsumptionChart from '../../components/portal/ConsumptionChart.vue'

const authStore = useAuthStore()

// --- Mock Data ---
const userStats = [
  { label: 'Ahorro Acumulado', value: '15%', icon: TrendingDown, color: '#10b981', desc: 'vs. semestre anterior' },
  { label: 'Puntos Verdes', value: '1,250', icon: Award, color: '#f59e0b', desc: 'Canjeables por descuentos' },
  { label: 'Días sin Mora', value: '365', icon: Clock, color: '#3b82f6', desc: '¡Eres un usuario ejemplar!' }
]

const recentInvoices = [
  { id: 'FAC-2026-001', date: '2026-04-01', amount: 45000, status: 'Pagada' },
  { id: 'FAC-2026-002', date: '2026-03-01', amount: 42500, status: 'Pagada' },
  { id: 'FAC-2026-003', date: '2026-02-01', amount: 48000, status: 'Pagada' }
]

const recentActivity = [
  { id: 1, title: 'Pago recibido', desc: 'Factura FAC-2026-001 procesada', time: 'Hace 2 días', icon: CreditCard, color: '#10b981' },
  { id: 2, title: 'Reporte de fuga', desc: 'Tu reporte #882 ha sido atendido', time: 'Hace 5 días', icon: MessageSquare, color: '#3b82f6' },
  { id: 3, title: 'Nuevo Logro', desc: 'Has ganado el badge "Ahorrador de Oro"', time: 'Hace 1 semana', icon: Award, color: '#f59e0b' }
]

const quickActions = [
  { label: 'Reportar Fuga', icon: Droplet, onClick: () => console.log('Reportar Fuga') },
  { label: 'Reclamaciones', icon: MessageSquare, onClick: () => console.log('Reclamaciones') },
  { label: 'Certificados', icon: History, onClick: () => console.log('Certificados') },
  { label: 'Mi Perfil', icon: Settings, onClick: () => console.log('Mi Perfil') }
]

const chartData = {
  labels: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
  data: [12, 15, 14, 18, 16, 15]
}

const handleDownload = (id: string) => {
  console.log(`Descargando factura ${id}...`)
}
</script>

<template>
  <div class="user-portal">
    <PortalHeader :user-name="authStore.user?.name" />

    <div class="portal-body">
      <PortalStats :stats="userStats" />

      <div class="portal-main-grid">
        <!-- Columna Principal -->
        <div class="portal-column">
          <QuickActions 
            title="Trámites y Consultas" 
            :actions="quickActions" 
          />
          
          <InvoiceHistory 
            :invoices="recentInvoices" 
            @download="handleDownload" 
          />

          <ActivityTimeline :activities="recentActivity" />
        </div>

        <!-- Columna Lateral -->
        <aside class="portal-sidebar">
          <InvoiceCard 
            :amount="45000" 
            due-date="15 de Mayo, 2026" 
            status="Pendiente" 
          />

          <ConsumptionChart 
            title="Tendencia de Consumo" 
            unit="m³ / mes"
            :labels="chartData.labels"
            :data="chartData.data"
          />
        </aside>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.user-portal {
  padding-top: 70px;
  padding-bottom: $spacing-xl;
  background-color: $color-bg;
  min-height: 100vh;
}

.portal-body {
  padding-bottom: $spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.portal-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;
  width: 100%;
  margin: 0;
  padding: 0 $spacing-xl;

  @include desktop {
    grid-template-columns: 1.5fr 1fr;
    align-items: start;
    gap: $spacing-xl;
  }
}

.portal-column {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.portal-sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}
</style>
