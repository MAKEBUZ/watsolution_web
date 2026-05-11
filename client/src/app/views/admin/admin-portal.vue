<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useAccountStore } from '@/shared/config/store/account-store';
import { ref, onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const accountStore = useAccountStore();

const isSidebarOpen = ref(window.innerWidth > 1024);
const isMobile = ref(window.innerWidth <= 1024);

const isNotifOpen = ref(false);

const notifItems = [
  {
    id: 1,
    title: 'Nuevo usuario registrado',
    desc: 'Carlos Rodríguez acaba de crear una cuenta',
    time: 'Hace 5 minutos',
    type: 'user',
    read: false,
  },
  {
    id: 2,
    title: 'Pago recibido',
    desc: 'Factura FAC-2026-002 marcada como pagada',
    time: 'Hace 25 minutos',
    type: 'payment',
    read: false,
  },
  { id: 3, title: 'Reporte de fuga', desc: 'José Martínez reportó una fuga en Sector 7', time: 'Hace 1 hora', type: 'alert', read: true },
  {
    id: 4,
    title: 'Mantenimiento programado',
    desc: 'Se agenda mantenimiento para el 20 de mayo',
    time: 'Hace 3 horas',
    type: 'info',
    read: true,
  },
];

const toggleNotif = () => {
  isNotifOpen.value = !isNotifOpen.value;
};

const closeNotif = () => {
  isNotifOpen.value = false;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'user':
      return '#3b82f6';
    case 'payment':
      return '#10b981';
    case 'alert':
      return '#ef4444';
    case 'info':
      return '#f59e0b';
    default:
      return '#94a3b8';
  }
};

const menuItems = [
  { name: 'Resumen', routeName: 'AdminResumen', icon: 'tachometer-alt' },
  { name: 'Actividad', routeName: 'AdminActividad', icon: 'history' },
  { name: 'Usuarios', routeName: 'AdminUsuarios', icon: 'users' },
  { name: 'Facturación', routeName: 'AdminFacturacion', icon: 'file-invoice-dollar' },
  { name: 'Noticias', routeName: 'AdminNoticias', icon: 'newspaper' },
  { name: 'Gestión de Usuarios', routeName: 'AdminPortalUsuario', icon: 'user' },
];

const handleLogout = () => {
  accountStore.logout();
  router.push('/login');
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024;
  if (isMobile.value) {
    isSidebarOpen.value = false;
  } else {
    isSidebarOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize();
});

const portalStats = [
  { label: 'Usuarios Registrados', value: '1,284', icon: 'users', color: '#3b82f6', trend: '+5.2%' },
  { label: 'Usuarios Activos Hoy', value: '342', icon: 'user-check', color: '#10b981', trend: '+12%' },
  { label: 'Pagos este Mes', value: '$12.4M', icon: 'dollar-sign', color: '#0077be', trend: '+8.2%' },
  { label: 'Trámites Pendientes', value: '18', icon: 'clipboard-list', color: '#f59e0b', trend: '-3' },
];

const recentUsers = [
  { name: 'Carlos Rodríguez', email: 'carlos.r@email.com', status: 'Activo', date: '2026-05-10', avatar: 'CR' },
  { name: 'María Fernández', email: 'maria.f@email.com', status: 'Activo', date: '2026-05-09', avatar: 'MF' },
  { name: 'José Martínez', email: 'jose.m@email.com', status: 'Moroso', date: '2026-05-08', avatar: 'JM' },
  { name: 'Ana López', email: 'ana.l@email.com', status: 'Activo', date: '2026-05-07', avatar: 'AL' },
  { name: 'Luis García', email: 'luis.g@email.com', status: 'Suspendido', date: '2026-05-05', avatar: 'LG' },
];

const recentRequests = [
  { type: 'Reporte de Fuga', user: 'Carlos Rodríguez', date: 'Hace 2 horas', status: 'Nuevo', statusColor: '#ef4444' },
  { type: 'Reclamación', user: 'María Fernández', date: 'Hace 5 horas', status: 'En revisión', statusColor: '#f59e0b' },
  { type: 'Certificado', user: 'José Martínez', date: 'Hace 1 día', status: 'Completado', statusColor: '#10b981' },
  { type: 'Cambio de Titular', user: 'Ana López', date: 'Hace 2 días', status: 'En proceso', statusColor: '#3b82f6' },
];

const goToPortal = () => {
  router.push('/portal');
};
</script>

<template>
  <div class="admin-layout">
    <div v-if="isMobile && isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <aside :class="['admin-sidebar', { 'is-closed': !isSidebarOpen, 'is-mobile': isMobile }]">
      <div class="sidebar-header">
        <router-link to="/" class="logo-link" v-if="isSidebarOpen || !isMobile">
          <div class="logo-icons">
            <font-awesome-icon icon="tint" class="logo-icon primary" />
            <font-awesome-icon icon="tint" class="logo-icon secondary" />
          </div>
          <span class="logo-text">Wat<strong>Solution</strong></span>
        </router-link>
        <button class="toggle-btn" @click="toggleSidebar" aria-label="Alternar menú">
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
          :class="{ active: route.name === item.routeName }"
        >
          <div class="nav-icon-container">
            <font-awesome-icon :icon="item.icon" :size="22" />
          </div>
          <span v-if="isSidebarOpen || isMobile">{{ item.name }}</span>
          <font-awesome-icon v-if="isSidebarOpen && !isMobile" class="chevron" icon="chevron-right" :size="14" />
        </router-link>
      </nav>

      <div class="sidebar-extras">
        <div class="extra-btn-wrapper">
          <button class="extra-btn" @click="toggleNotif">
            <div class="extra-icon">
              <font-awesome-icon icon="bell" :size="20" />
              <span class="extra-badge" v-if="notifItems.filter(n => !n.read).length">
                {{ notifItems.filter(n => !n.read).length }}
              </span>
            </div>
            <span v-if="isSidebarOpen || isMobile">Notificaciones</span>
          </button>

          <Transition name="notif-fade">
            <div v-if="isNotifOpen && (isSidebarOpen || isMobile)" class="notif-dropdown">
              <div class="notif-dropdown__header">
                <span class="notif-dropdown__title">Notificaciones</span>
                <button class="notif-dropdown__mark" @click="closeNotif">Marcar leídas</button>
              </div>
              <div class="notif-dropdown__list">
                <div
                  v-for="n in notifItems.slice(0, 4)"
                  :key="n.id"
                  class="notif-dropdown__item"
                  :class="{ unread: !n.read }"
                  @click="closeNotif"
                >
                  <div class="notif-dropdown__dot" :style="{ backgroundColor: getTypeColor(n.type) }"></div>
                  <div class="notif-dropdown__body">
                    <p class="notif-dropdown__item-title">{{ n.title }}</p>
                    <p class="notif-dropdown__item-desc">{{ n.desc }}</p>
                    <span class="notif-dropdown__item-time">{{ n.time }}</span>
                  </div>
                </div>
              </div>
              <router-link to="/admin/notificaciones" class="notif-dropdown__footer" @click="closeNotif">
                Ver todas las notificaciones
              </router-link>
            </div>
          </Transition>
        </div>
        <router-link to="/portal" class="extra-btn">
          <div class="extra-icon">
            <font-awesome-icon icon="eye" :size="20" />
          </div>
          <span v-if="isSidebarOpen || isMobile">Vista de Usuario</span>
        </router-link>
      </div>

      <div class="sidebar-footer">
        <div class="sidebar-profile">
          <div class="avatar">
            {{ accountStore.account?.firstName?.charAt(0) || 'A' }}{{ accountStore.account?.lastName?.charAt(0) || 'D' }}
          </div>
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
        <div class="portal-dashboard">
          <header class="page-header">
            <div>
              <h1>Gestión del Portal de Usuario</h1>
              <p>Administra usuarios, trámites y métricas del portal</p>
            </div>
            <div class="header-actions">
              <button class="btn btn--outline" @click="goToPortal">
                <font-awesome-icon icon="external-link-alt" :size="16" /> Ver Portal
              </button>
              <button class="btn btn--primary"><font-awesome-icon icon="plus" :size="16" /> Nuevo Usuario</button>
            </div>
          </header>

          <div class="stats-grid">
            <div v-for="stat in portalStats" :key="stat.label" class="stat-card">
              <div class="stat-card__icon" :style="{ backgroundColor: stat.color + '15', color: stat.color }">
                <font-awesome-icon :icon="stat.icon" :size="22" />
              </div>
              <div class="stat-card__content">
                <span class="stat-card__label">{{ stat.label }}</span>
                <div class="stat-card__row">
                  <span class="stat-card__value">{{ stat.value }}</span>
                  <span class="stat-card__trend">{{ stat.trend }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="content-grid">
            <div class="panel-card">
              <div class="card-header">
                <h3>Usuarios Recientes</h3>
                <router-link to="/admin/usuarios" class="btn-text">Ver todos</router-link>
              </div>
              <div class="users-list">
                <div v-for="user in recentUsers" :key="user.email" class="user-item">
                  <div class="user-avatar">{{ user.avatar }}</div>
                  <div class="user-info">
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                  <span
                    class="user-status"
                    :class="{
                      'status-active': user.status === 'Activo',
                      'status-debtor': user.status === 'Moroso',
                      'status-suspended': user.status === 'Suspendido',
                    }"
                  >
                    {{ user.status }}
                  </span>
                </div>
              </div>
            </div>

            <div class="panel-card">
              <div class="card-header">
                <h3>Trámites Recientes</h3>
                <button class="btn-text">Ver todos</button>
              </div>
              <div class="requests-list">
                <div v-for="req in recentRequests" :key="req.type + req.user" class="request-item">
                  <div class="request-info">
                    <span class="request-type">{{ req.type }}</span>
                    <span class="request-user">{{ req.user }} · {{ req.date }}</span>
                  </div>
                  <span class="request-status" :style="{ backgroundColor: req.statusColor + '15', color: req.statusColor }">
                    {{ req.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-card actions-card">
            <div class="card-header">
              <h3>Acciones Rápidas</h3>
            </div>
            <div class="quick-actions">
              <button class="action-btn">
                <div class="action-icon" style="background: #0077be15; color: #0077be">
                  <font-awesome-icon icon="envelope" :size="20" />
                </div>
                <span>Comunicado Masivo</span>
              </button>
              <button class="action-btn">
                <div class="action-icon" style="background: #10b98115; color: #10b981">
                  <font-awesome-icon icon="file-export" :size="20" />
                </div>
                <span>Exportar Reporte</span>
              </button>
              <button class="action-btn">
                <div class="action-icon" style="background: #f59e0b15; color: #f59e0b">
                  <font-awesome-icon icon="bell" :size="20" />
                </div>
                <span>Enviar Recordatorio</span>
              </button>
              <button class="action-btn">
                <div class="action-icon" style="background: #ef444415; color: #ef4444">
                  <font-awesome-icon icon="ban" :size="20" />
                </div>
                <span>Suspensiones</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '../../../content/scss/variables' as *;
@use '../../../content/scss/mixins' as *;

$spacing-xs: 8px;
$spacing-sm: 12px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

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
  z-index: 2000;

  &.is-closed {
    width: 80px;

    .logo-text,
    .nav-item span,
    .chevron,
    .logout-btn span,
    .sidebar-profile .info {
      display: none;
    }

    .nav-item,
    .logout-btn {
      justify-content: center;
      padding: 1rem;
    }

    .sidebar-header {
      justify-content: center;
      padding: $spacing-md 0;
    }

    .sidebar-profile {
      justify-content: center;
      padding: 0.75rem;
    }
  }

  &.is-mobile {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(0);

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

  .logo-link {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;

    .logo-icons {
      position: relative;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .logo-icon {
      position: absolute;

      &.primary {
        color: $color-primary;
        font-size: 1.5rem;
        bottom: 0;
        right: 0;
      }

      &.secondary {
        color: $color-secondary;
        font-size: 1rem;
        top: 2px;
        left: 2px;
      }
    }

    .logo-text {
      font-size: 1.15rem;
      color: #94a3b8;
      font-weight: 700;
      letter-spacing: -0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      strong {
        color: $color-secondary;
      }
    }
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

  &:hover,
  &.active {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    border-left: 4px solid $color-primary;
    color: white;
    background: rgba($color-primary, 0.1);
  }

  .chevron {
    margin-left: auto;
    opacity: 0.5;
  }
}

.sidebar-extras {
  padding: $spacing-md 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.extra-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem $spacing-md;
  color: #94a3b8;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 1rem;
  text-decoration: none;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  .extra-icon {
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .extra-badge {
    position: absolute;
    top: -4px;
    right: -6px;
    background: #ef4444;
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #1e293b;
  }
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

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
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

    .name {
      font-weight: 600;
      font-size: 0.85rem;
      color: white;
      white-space: nowrap;
    }

    .role {
      font-size: 0.7rem;
      color: #94a3b8;
      white-space: nowrap;
    }
  }
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  min-width: 0;
  background-color: #f8fafc;
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

/* Portal Dashboard Content */
.portal-dashboard {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @include tablet {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  h1 {
    font-size: 1.6rem;
    font-weight: 800;
    color: $color-text;
    margin: 0;

    @include tablet {
      font-size: 1.8rem;
    }
  }

  p {
    color: $color-text-muted;
    margin: 0.25rem 0 0;
  }
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
}

.stat-card {
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 20px;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__label {
    font-size: 0.85rem;
    color: $color-text-muted;
    font-weight: 500;
  }

  &__row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  &__value {
    font-size: 1.4rem;
    font-weight: 800;
    color: $color-text;
  }

  &__trend {
    font-size: 0.8rem;
    font-weight: 600;
    color: #10b981;
  }
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @include desktop {
    grid-template-columns: 1.2fr 1fr;
  }
}

.panel-card {
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: $shadow-sm;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: $color-text;
    margin: 0;
  }
}

.btn-text {
  background: none;
  border: none;
  color: $color-primary;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

/* Users List */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 14px;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $color-primary;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  .user-name {
    font-weight: 700;
    color: $color-text;
    font-size: 0.95rem;
  }

  .user-email {
    font-size: 0.8rem;
    color: $color-text-muted;
  }
}

.user-status {
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;

  &.status-active {
    background: #dcfce7;
    color: #166534;
  }

  &.status-debtor {
    background: #fef3c7;
    color: #92400e;
  }

  &.status-suspended {
    background: #fee2e2;
    color: #991b1b;
  }
}

/* Requests List */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 14px;
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .request-type {
    font-weight: 700;
    color: $color-text;
    font-size: 0.95rem;
  }

  .request-user {
    font-size: 0.8rem;
    color: $color-text-muted;
  }
}

.request-status {
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Quick Actions */
.actions-card {
  @include desktop {
    max-width: 70%;
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @include tablet {
    grid-template-columns: repeat(4, 1fr);
  }
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #f8fafc;
  border: 1px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: white;
    border-color: #e2e8f0;
    box-shadow: $shadow-sm;
    transform: translateY(-2px);
  }

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: $color-text;
  }
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 0.95rem;

  &--primary {
    background: $color-primary;
    color: white;

    &:hover {
      background: $color-primary-dark;
    }
  }

  &--outline {
    background: transparent;
    border: 2px solid $color-primary;
    color: $color-primary;

    &:hover {
      background: $color-primary;
      color: white;
    }
  }
}

.extra-btn-wrapper {
  position: relative;
}

.notif-dropdown {
  position: absolute;
  left: 100%;
  top: 0;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  margin-left: 12px;
  z-index: 3000;
  overflow: hidden;
  color: $color-text;

  @media (max-width: 1024px) {
    position: static;
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
    box-shadow: none;
    border-radius: 12px;
    background: #0f172a;
    color: white;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;

    @media (max-width: 1024px) {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
  }

  &__title {
    font-weight: 700;
    font-size: 1rem;
  }

  &__mark {
    background: none;
    border: none;
    color: $color-primary;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;

    @media (max-width: 1024px) {
      color: $color-secondary;
    }

    &:hover {
      text-decoration: underline;
    }
  }

  &__list {
    max-height: 300px;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f8fafc;

    @media (max-width: 1024px) {
      border-bottom-color: rgba(255, 255, 255, 0.05);
    }

    &:hover {
      background: #f8fafc;

      @media (max-width: 1024px) {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    &.unread {
      background: #f0faff;

      @media (max-width: 1024px) {
        background: rgba(0, 119, 190, 0.15);
      }
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  &__item-title {
    font-weight: 700;
    font-size: 0.9rem;
    margin: 0;
  }

  &__item-desc {
    font-size: 0.8rem;
    color: $color-text-muted;
    margin: 0;
    line-height: 1.4;

    @media (max-width: 1024px) {
      color: #94a3b8;
    }
  }

  &__item-time {
    font-size: 0.75rem;
    color: #cbd5e1;
    margin-top: 2px;
  }

  &__footer {
    display: block;
    padding: 12px 16px;
    text-align: center;
    color: $color-primary;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    border-top: 1px solid #f1f5f9;
    transition: background 0.2s;

    @media (max-width: 1024px) {
      border-top-color: rgba(255, 255, 255, 0.1);
      color: $color-secondary;
    }

    &:hover {
      background: #f8fafc;

      @media (max-width: 1024px) {
        background: rgba(255, 255, 255, 0.05);
      }
    }
  }
}

.notif-fade-enter-active,
.notif-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.notif-fade-enter-from,
.notif-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
