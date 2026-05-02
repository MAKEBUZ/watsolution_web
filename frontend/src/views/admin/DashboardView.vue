<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { 
  LayoutDashboard, Users, FileText, Newspaper, 
  TrendingUp, LogOut, ChevronRight, Menu, X, User, History
} from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSidebarOpen = ref(window.innerWidth > 1024)
const isMobile = ref(window.innerWidth <= 1024)

const menuItems = [
  { name: 'Resumen', routeName: 'admin-summary', icon: LayoutDashboard },
  { name: 'Actividad', routeName: 'admin-activity', icon: History },
  { name: 'Usuarios', routeName: 'admin-users', icon: Users },
  { name: 'Facturación', routeName: 'admin-billing', icon: FileText },
  { name: 'Noticias', routeName: 'admin-news', icon: Newspaper },
  { name: 'Portal Usuario', routeName: 'user-portal', icon: User }
]

const handleLogout = () => {
  authStore.logout()
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
    <!-- Overlay for mobile -->
    <div 
      v-if="isMobile && isSidebarOpen" 
      class="sidebar-overlay" 
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
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
          :class="{ 'active': route.name === item.routeName || (item.routeName === 'admin-summary' && route.name === 'admin-dashboard') }"
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
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="20" />
          <span v-if="isSidebarOpen || isMobile">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <button v-if="isMobile" class="mobile-toggle" @click="toggleSidebar">
            <Menu :size="24" />
          </button>
          <h2>{{ menuItems.find(i => i.routeName === route.name)?.name || 'Panel Administrativo' }}</h2>
        </div>
        <div class="topbar-right">
          <div class="admin-profile">
            <div class="avatar">AD</div>
            <div class="info" v-if="!isMobile">
              <span class="name">{{ authStore.user?.name }}</span>
              <span class="role">Administrador Principal</span>
            </div>
          </div>
        </div>
      </header>

      <div class="admin-content-view">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.admin-layout {
  display: flex;
  min-height: calc(100vh - 80px); 
  margin-top: 80px; 
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
  top: 80px; // Sticky below global header
  height: calc(100vh - 80px);
  z-index: 100;

  &.is-closed {
    width: 80px;
    .logo-text, .nav-item span, .chevron, .logout-btn span { display: none; }
    .nav-item, .logout-btn { justify-content: center; padding: 1rem; }
    
    .sidebar-header {
      justify-content: center;
      padding: $spacing-md 0;
    }
  }

  &.is-mobile {
    position: fixed;
    left: 0;
    top: 0; // In mobile, overlay everything
    height: 100vh;
    width: 280px;
    transform: translateX(0);
    z-index: 2000; // Above global header in mobile
    
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
    background: color.change($color-primary, $alpha: 0.1);
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
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  background-color: #f8fafc;
}

.admin-topbar {
  background: white;
  padding: 0 $spacing-md;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 80;

  @include desktop {
    padding: 0 $spacing-xl;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    
    .mobile-toggle {
      background: none;
      border: none;
      color: $color-text;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  h2 { font-size: 1.1rem; color: $color-text; font-weight: 600; }
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;

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
  }

  .info {
    display: flex;
    flex-direction: column;
    .name { font-weight: 600; font-size: 0.85rem; color: $color-text; }
    .role { font-size: 0.7rem; color: $color-text-muted; }
  }
}

.admin-content-view {
  padding: $spacing-md;
  padding-bottom: $spacing-xl * 2; // Extra padding at bottom to separate from footer
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @include tablet {
    padding: $spacing-lg;
    padding-bottom: $spacing-xl * 2;
  }
}
</style>
