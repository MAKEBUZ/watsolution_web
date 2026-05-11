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
  { name: 'Portal Usuario', routeName: 'AdminPortalUsuario', icon: 'user' }
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

const users = ref([
  { id: '101', name: 'Juan Pérez', email: 'juan@email.com', status: 'activo', role: 'usuario', lastChange: '2026-04-20' },
  { id: '102', name: 'María García', email: 'maria@email.com', status: 'moroso', role: 'usuario', lastChange: '2026-04-15' },
  { id: '103', name: 'Admin Central', email: 'admin@watsolution.tech', status: 'activo', role: 'admin', lastChange: '2026-04-24' },
  { id: '104', name: 'Carlos Ruiz', email: 'carlos@email.com', status: 'suspendido', role: 'usuario', lastChange: '2026-04-10' }
])

const searchQuery = ref('')
const statusFilter = ref('todos')

const getStatusClass = (status: string) => {
  switch(status) {
    case 'activo': return 'status--active';
    case 'moroso': return 'status--debtor';
    case 'suspendido': return 'status--suspended';
    default: return '';
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
        <button class="logout-btn" @click="handleLogout">
          <font-awesome-icon icon="sign-out-alt" :size="20" />
          <span v-if="isSidebarOpen || isMobile">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <div class="admin-content-view">
        <div class="user-mgmt">
          <div class="mgmt-header">
            <div>
              <h1>Gestión de Usuarios</h1>
              <p>Administra cuentas, roles y estados de los usuarios del sistema</p>
            </div>
            <button class="btn btn--primary" @click="() => {}">
              <font-awesome-icon icon="user-plus" :size="20" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          <div class="mgmt-controls">
            <div class="search-box">
              <font-awesome-icon class="search-icon" icon="search" :size="18" />
              <input type="text" v-model="searchQuery" placeholder="Buscar por nombre, ID o email...">
            </div>

            <div class="filter-group">
              <div class="filter-item">
                <font-awesome-icon icon="filter" :size="16" />
                <select v-model="statusFilter">
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="moroso">Moroso</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>
          </div>

          <div class="table-card">
            <table class="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último Cambio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>#{{ user.id }}</td>
                  <td>
                    <div class="user-info">
                      <span class="user-name">{{ user.name }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge">
                      <font-awesome-icon v-if="user.role === 'admin'" icon="shield-alt" :size="12" />
                      {{ user.role }}
                    </span>
                  </td>
                  <td>
                    <span :class="['status-pill', getStatusClass(user.status)]">
                      {{ user.status }}
                    </span>
                  </td>
                  <td>{{ user.lastChange }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon" title="Historial"><font-awesome-icon icon="history" :size="16" /></button>
                    <button class="btn-icon" title="Editar"><font-awesome-icon icon="pencil-alt" :size="16" /></button>
                    <button class="btn-icon btn-icon--danger" title="Eliminar"><font-awesome-icon icon="trash" :size="16" /></button>
                    <button class="btn-icon"><font-awesome-icon icon="ellipsis-v" :size="16" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

.user-mgmt {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.mgmt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 { font-size: 1.5rem; color: $color-text; }
  p { color: $color-text-muted; font-size: 0.9rem; }
}

.mgmt-controls {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;

  .search-box {
    flex: 1;
    min-width: 300px;
    position: relative;
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: $color-text-muted; }
    input {
      width: 100%;
      padding: 0 12px 0 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      height: 44px;
    }
  }

  .filter-group {
    display: flex;
    gap: $spacing-sm;
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 0 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: $color-text-muted;
    min-height: 44px;
    select {
      border: none;
      padding: 0;
      background: transparent;
      font-weight: 600;
      color: $color-text;
      height: 100%;
      cursor: pointer;
    }
  }
}

.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: $shadow-sm;
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: $spacing-md;
    border-bottom: 2px solid #f1f5f9;
    color: $color-text-muted;
    font-size: 0.85rem;
    text-transform: uppercase;
    font-weight: 700;
  }

  td {
    padding: $spacing-md;
    border-bottom: 1px solid #f1f5f9;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  .user-name { font-weight: 600; color: $color-text; }
  .user-email { font-size: 0.85rem; color: $color-text-muted; }
}

.role-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pill {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;

  &.status--active { background: #dcfce7; color: #166534; }
  &.status--debtor { background: #fee2e2; color: #991b1b; }
  &.status--suspended { background: #fef3c7; color: #92400e; }
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $color-text-muted;
  transition: all 0.2s;

  &:hover { background: #f1f5f9; color: $color-primary; }
  &--danger:hover { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-size: 0.9rem;

  &--primary {
    background: $color-primary;
    color: white;
    &:hover { background: darken($color-primary, 10%); }
  }
}
</style>