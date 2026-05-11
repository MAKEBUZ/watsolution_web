<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAccountStore } from '@/shared/config/store/account-store'
import { 
  LayoutDashboard, Users, FileText, Newspaper, 
  TrendingUp, LogOut, ChevronRight, Menu, X, User
} from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const route = useRoute()
const accountStore = useAccountStore()
const isSidebarOpen = ref(true)
const isMobile = ref(false)

const menuItems = [
  { name: 'Resumen', routeName: 'admin-summary', icon: LayoutDashboard },
  { name: 'Usuarios', routeName: 'admin-users', icon: Users },
  { name: 'Facturación', routeName: 'admin-billing', icon: FileText },
  { name: 'Noticias', routeName: 'admin-news', icon: Newspaper },
  { name: 'Portal Usuario', routeName: 'AdminPortalUsuario', icon: User }
]

const handleLogout = () => {
  accountStore.logout()
  router.push('/')
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

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const closeSidebarOnMobile = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}
</script>

<template>
  <div class="admin-layout">
    <div v-if="isMobile && isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <aside :class="['admin-sidebar', { 'is-closed': !isSidebarOpen, 'is-mobile': isMobile }]">
      <div class="sidebar-header">
        <span class="logo-text" v-if="isSidebarOpen || !isMobile">Wat<strong>Solution</strong></span>
        <button class="toggle-btn" @click="toggleSidebar">
          <Menu v-if="!isSidebarOpen" :size="20" />
          <X v-else :size="20" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.routeName" 
          :to="{ name: item.routeName }"
          class="nav-item"
          :class="{ 'active': route.name === item.routeName }"
          @click="closeSidebarOnMobile"
        >
          <div class="nav-icon-container">
            <component :is="item.icon" :size="22" :stroke-width="2.5" />
          </div>
          <span v-if="isSidebarOpen || isMobile">{{ item.name }}</span>
          <ChevronRight v-if="isSidebarOpen && !isMobile" class="chevron" :size="14" />
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
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="20" />
          <span v-if="isSidebarOpen || isMobile">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <div class="admin-content-view">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../content/scss/variables' as *;
@use '../../../content/scss/mixins' as *;

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
    .logo-text, .nav-item span, .chevron, .logout-btn span { display: none; }
    .nav-item, .logout-btn { justify-content: center; padding: 1rem; }
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
    color: $color-primary-light;
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

    &:hover { background: rgba(255, 255, 255, 0.2); transform: scale(1.05); }
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
  padding: $spacing-md;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  overflow-x: hidden;

  @include tablet {
    padding: $spacing-lg;
  }
}
</style>
