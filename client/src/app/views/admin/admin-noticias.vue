<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAccountStore } from '@/shared/config/store/account-store';

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

if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize);
  handleResize();
}

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  isArchived: boolean;
}

const news = ref<NewsItem[]>([
  { id: '1', title: 'Corte programado sector Norte', category: 'operativo', date: '2026-05-10', isArchived: false },
  { id: '2', title: 'Nueva tarifa aplicada desde Mayo 2026', category: 'institucional', date: '2026-05-08', isArchived: false },
  { id: '3', title: 'Campaña de ahorro de agua', category: 'comunidad', date: '2026-05-05', isArchived: false },
  { id: '4', title: 'Mantenimiento reactor principal', category: 'operativo', date: '2026-04-28', isArchived: true },
]);

const isModalOpen = ref(false);
const searchQuery = ref('');

const deleteNews = (id: string) => {
  if (confirm('¿Estás seguro de eliminar esta noticia?')) {
    const index = news.value.findIndex(n => n.id === id);
    if (index !== -1) {
      news.value.splice(index, 1);
    }
  }
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
        <div class="news-mgmt">
          <div class="mgmt-header">
            <div>
              <h1>Gestión de Noticias</h1>
              <p>Publica y administra el contenido informativo del acueducto</p>
            </div>
            <button class="btn btn--primary" @click="isModalOpen = true">
              <font-awesome-icon icon="plus" :size="20" />
              <span>Nueva Noticia</span>
            </button>
          </div>

          <div class="mgmt-filters">
            <div class="search-box">
              <font-awesome-icon class="search-icon" icon="search" :size="18" />
              <input type="text" v-model="searchQuery" placeholder="Buscar por título..." />
            </div>
          </div>

          <div class="mgmt-table-wrapper">
            <table class="mgmt-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in news" :key="item.id">
                  <td>{{ item.date }}</td>
                  <td class="title-cell">{{ item.title }}</td>
                  <td>
                    <span :class="['category-badge', item.category]">{{ item.category }}</span>
                  </td>
                  <td>
                    <span :class="['status-badge', item.isArchived ? 'archived' : 'active']">
                      {{ item.isArchived ? 'Archivado' : 'Activo' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button class="btn-icon" title="Editar"><font-awesome-icon icon="pencil-alt" :size="16" /></button>
                    <button class="btn-icon" title="Archivar"><font-awesome-icon icon="archive" :size="16" /></button>
                    <button class="btn-icon btn-icon--danger" @click="deleteNews(item.id)" title="Eliminar">
                      <font-awesome-icon icon="trash" :size="16" />
                    </button>
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
    .logo-text,
    .nav-item span,
    .chevron,
    .logout-btn span {
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

.admin-content-view {
  flex: 1;
  padding: $spacing-lg;
  padding-bottom: $spacing-xl * 2;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  overflow-x: hidden;
}

.news-mgmt {
  background: white;
  padding: $spacing-md;
  border-radius: 16px;
  box-shadow: $shadow-sm;
}

.mgmt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;

  h1 {
    font-size: 1.5rem;
    color: $color-text;
  }
  p {
    color: $color-text-muted;
    font-size: 0.9rem;
  }
}

.mgmt-filters {
  margin-bottom: $spacing-md;
  .search-box {
    max-width: 400px;
    position: relative;
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: $color-text-muted;
    }
    input {
      width: 100%;
      padding: 0 12px 0 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      height: 44px;
    }
  }
}

.mgmt-table-wrapper {
  overflow-x: auto;
}

.mgmt-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: $spacing-sm;
    border-bottom: 2px solid #f1f5f9;
    color: $color-text-muted;
    font-size: 0.85rem;
    text-transform: uppercase;
    font-weight: 700;
  }

  td {
    padding: $spacing-sm;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.95rem;
  }

  .title-cell {
    font-weight: 600;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.category-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;

  &.operativo {
    background: #f59e0b;
  }
  &.institucional {
    background: $color-primary;
  }
  &.comunidad {
    background: #10b981;
  }
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;

  &.active {
    background: #dcfce7;
    color: #166534;
  }
  &.archived {
    background: #f1f5f9;
    color: #64748b;
  }
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

  &:hover {
    background: #f1f5f9;
    color: $color-primary;
  }
  &--danger:hover {
    background: #fee2e2;
    color: #ef4444;
    border-color: #fca5a5;
  }
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
    &:hover {
      background: darken($color-primary, 10%);
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
