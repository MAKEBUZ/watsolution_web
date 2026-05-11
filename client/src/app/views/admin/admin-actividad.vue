<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAccountStore } from '@/shared/config/store/account-store'

const router = useRouter()
const route = useRoute()
const accountStore = useAccountStore()

const isSidebarOpen = ref(window.innerWidth > 1024)
const isMobile = ref(window.innerWidth <= 1024)

const menuItems = [
  { name: 'Resumen', routeName: 'AdminResumen', icon: 'tachometer-alt' },
  { name: 'Actividad', routeName: 'AdminActividad', icon: 'history' },
  { name: 'Usuarios', routeName: 'AdminUsuarios', icon: 'users' },
  { name: 'Facturación', routeName: 'AdminFacturacion', icon: 'file-invoice-dollar' },
  { name: 'Noticias', routeName: 'AdminNoticias', icon: 'newspaper' },
]

const handleLogout = () => {
  accountStore.logout()
  router.push('/login')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024
  if (isMobile.value) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize)
  handleResize()
}

const logs = ref([
  { id: 1, user: 'Maria Garcia', action: 'Pago de Factura', details: 'FAC-2026-0038', amount: '$45,200', type: 'payment', time: 'Hace 5 min' },
  { id: 2, user: 'Juan Perez', action: 'Nueva Lectura', details: '1,265 m³ - Sector Sur', type: 'reading', time: 'Hace 12 min' },
  { id: 3, user: 'Sistema', action: 'Nueva Noticia', details: 'Corte programado sector Norte', type: 'news', time: 'Hace 25 min' },
  { id: 4, user: 'Carlos Ruiz', action: 'Registro Usuario', details: 'Nuevo suscriptor: ID #104', type: 'user', time: 'Hace 1 hora' },
  { id: 5, user: 'Ana Lopez', action: 'Pago de Factura', details: 'FAC-2026-0039', amount: '$32,100', type: 'payment', time: 'Hace 2 horas' }
])

const getLogIcon = (type: string) => {
  switch (type) {
    case 'payment': return 'credit-card'
    case 'reading': return 'tint'
    case 'news': return 'newspaper'
    case 'user': return 'user-plus'
    default: return 'clock'
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
  <div class="admin-layout">
    <div
      v-if="isMobile && isSidebarOpen"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>

    <aside :class="['admin-sidebar', { 'is-closed': !isSidebarOpen, 'is-mobile': isMobile }]">
      <div class="sidebar-header">
        <span class="logo-text" v-if="isSidebarOpen || !isMobile">Wat<strong>Solution</strong></span>
        <button class="toggle-btn" @click="toggleSidebar">
          <font-awesome-icon v-if="!isSidebarOpen" icon="bars" :size="20" />
          <font-awesome-icon v-else icon="times" :size="20" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          class="nav-item"
          :class="{ 'active': route.name === item.routeName }"
        >
          <div class="nav-icon-container">
            <font-awesome-icon :icon="item.icon" :size="22" />
          </div>
          <span v-if="isSidebarOpen || isMobile">{{ item.name }}</span>
          <font-awesome-icon v-if="isSidebarOpen && !isMobile" class="chevron" icon="chevron-right" :size="14" />
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-profile">
          <div class="avatar">{{ accountStore.account?.firstName?.charAt(0) || 'A' }}{{ accountStore.account?.lastName?.charAt(0) || 'D' }}</div>
          <div class="info" v-if="isSidebarOpen || isMobile">
            <span class="name">{{ accountStore.account?.firstName || 'Administrador' }}</span>
            <span class="role">Administrador Principal</span>
          </div>
        </div>
        <button class="home-btn" @click="router.push({ name: 'Home' })">
          <font-awesome-icon icon="home" :size="20" />
          <span v-if="isSidebarOpen || isMobile">Volver al Inicio</span>
        </button>
        <button class="logout-btn" @click="handleLogout">
          <font-awesome-icon icon="sign-out-alt" :size="20" />
          <span v-if="isSidebarOpen || isMobile">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <div class="admin-content-view">
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
                  <font-awesome-icon :icon="getLogIcon(log.type)" :size="18" />
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
                      <font-awesome-icon v-if="log.type === 'payment'" class="payment-check" icon="check-circle" :size="14" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
$spacing-xs: 8px;
$spacing-sm: 12px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$color-primary: #0077be;
$color-secondary: #00ced1;
$color-text: #2c3e50;
$color-text-muted: #64748b;
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);

.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  position: relative;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1500;
  backdrop-filter: blur(2px);
}

.admin-sidebar {
  width: 260px;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
  min-height: 0;

  &.is-closed {
    width: 80px;
    .logo-text, .nav-item span, .chevron, .logout-btn span, .home-btn span { display: none; }
    .nav-item, .logout-btn, .home-btn { justify-content: center; padding: 1rem; }
    .sidebar-header { justify-content: center; padding: $spacing-md 0; }
  }

  &.is-mobile {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(0);
    z-index: 2000;

    &.is-closed {
      transform: translateX(-100%);
      width: 280px;
    }
  }
}

.sidebar-header {
  padding: $spacing-sm $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 70px;

  .logo-text {
    font-size: 1.15rem;
    color: #94a3b8;
    font-weight: 700;
    letter-spacing: -0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    strong { color: $color-secondary; }
  }

  .toggle-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-left: $spacing-xs;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  }
}

.sidebar-nav {
  flex: 1;
  padding: $spacing-md 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-x: hidden;
  min-height: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem $spacing-md;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;

  .nav-icon-container {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &:hover, &.active {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    border-left: 4px solid $color-primary;
    color: white;
    background: rgba($color-primary, 0.1);
  }

  .chevron { margin-left: auto; opacity: 0.5; }
}

.sidebar-footer {
  padding: $spacing-md;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.home-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  white-space: nowrap;
  margin-bottom: 4px;
  &:hover { background: rgba(255, 255, 255, 0.08); color: white; }
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  background: none;
  border: none;
  color: #f87171;
  cursor: pointer;
  border-radius: 8px;
  white-space: nowrap;
  &:hover { background: rgba(239, 68, 68, 0.1); }
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  min-width: 0;
  background-color: #f8fafc;
  min-height: 0;
}

.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  margin-bottom: $spacing-sm;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);

  .avatar {
    width: 36px;
    height: 36px;
    background: $color-primary;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .name { font-weight: 600; font-size: 0.85rem; color: white; white-space: nowrap; }
    .role { font-size: 0.7rem; color: #94a3b8; white-space: nowrap; }
  }
}

.admin-content-view {
  flex: 1;
  padding: $spacing-lg;
  padding-bottom: $spacing-xl * 2;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  overflow-x: hidden;
}

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