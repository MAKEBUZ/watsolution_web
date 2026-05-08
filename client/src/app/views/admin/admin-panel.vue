<template>
  <div class="admin-layout d-flex" style="min-height: calc(100vh - 60px);">
    <!-- Sidebar -->
    <nav class="admin-sidebar d-flex flex-column">
      <!-- Brand -->
      <div class="sidebar-brand d-flex align-items-center justify-content-between px-4">
        <span class="sidebar-brand-text"><span class="brand-wat">Wat</span>Solution</span>
        <button class="sidebar-close-btn" @click="$router.push('/')">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <!-- Nav Links -->
      <div class="sidebar-nav flex-grow-1 py-2">
        <router-link class="sidebar-link" to="/admin-panel/resumen">
          <font-awesome-icon icon="th-large" class="sidebar-icon" />
          <span class="flex-grow-1">Resumen</span>
          <font-awesome-icon icon="chevron-right" class="sidebar-chevron" />
        </router-link>
        <router-link class="sidebar-link" to="/admin-panel/actividad">
          <font-awesome-icon icon="clock" class="sidebar-icon" />
          <span class="flex-grow-1">Actividad</span>
          <font-awesome-icon icon="chevron-right" class="sidebar-chevron" />
        </router-link>
        <router-link class="sidebar-link" to="/admin-panel/usuarios">
          <font-awesome-icon icon="users" class="sidebar-icon" />
          <span class="flex-grow-1">Usuarios</span>
          <font-awesome-icon icon="chevron-right" class="sidebar-chevron" />
        </router-link>
        <router-link class="sidebar-link" to="/admin-panel/facturacion">
          <font-awesome-icon icon="file-invoice-dollar" class="sidebar-icon" />
          <span class="flex-grow-1">Facturación</span>
          <font-awesome-icon icon="chevron-right" class="sidebar-chevron" />
        </router-link>
        <router-link class="sidebar-link" to="/admin-panel/noticias">
          <font-awesome-icon icon="newspaper" class="sidebar-icon" />
          <span class="flex-grow-1">Noticias</span>
          <font-awesome-icon icon="chevron-right" class="sidebar-chevron" />
        </router-link>
        <router-link class="sidebar-link" to="/portal">
          <font-awesome-icon icon="user-circle" class="sidebar-icon" />
          <span class="flex-grow-1">Portal Usuario</span>
          <font-awesome-icon icon="chevron-right" class="sidebar-chevron" />
        </router-link>
      </div>

      <!-- Logout -->
      <div class="sidebar-logout-area px-3 pb-4">
        <a class="sidebar-link sidebar-link-logout" href="javascript:void(0)" @click="logout">
          <font-awesome-icon icon="sign-out-alt" class="sidebar-icon" />
          <span>Cerrar Sesión</span>
        </a>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="admin-content flex-grow-1 d-flex flex-column">
      <!-- Content Header -->
      <div class="admin-content-header d-flex align-items-center justify-content-between px-4">
        <h5 class="mb-0 font-weight-bold content-title">{{ sectionTitle }}</h5>
        <div class="d-flex align-items-center">
          <div class="admin-avatar mr-3">{{ userInitials }}</div>
          <div>
            <div class="font-weight-bold admin-name">{{ currentUsername }}</div>
            <div class="admin-role">Administrador Principal</div>
          </div>
        </div>
      </div>

      <!-- Router View -->
      <div class="flex-grow-1 overflow-auto">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./admin-panel.component.ts"></script>

<style scoped>
.admin-layout {
  background: #f0f5fb;
}

/* ── Sidebar ── */
.admin-sidebar {
  width: 230px;
  min-width: 230px;
  background: #1a2d42;
  color: white;
}

.sidebar-brand {
  height: 60px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-brand-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.3px;
}

.brand-wat {
  color: #38bdf8;
}

.sidebar-close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px;
  transition: color 0.15s;
}
.sidebar-close-btn:hover { color: white; }

/* Nav links */
.sidebar-nav {
  padding: 0.5rem 0.75rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.65rem 0.75rem;
  border-left: 3px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  border-radius: 0 8px 8px 0;
  margin-bottom: 2px;
  font-size: 0.88rem;
  transition: color 0.15s, background 0.15s;
  gap: 10px;
}
.sidebar-link:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.07);
  text-decoration: none;
}
.sidebar-link.router-link-active {
  color: #ffffff;
  border-left-color: #38bdf8;
  background: rgba(255, 255, 255, 0.09);
  font-weight: 600;
}

.sidebar-icon {
  font-size: 0.95rem;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-chevron {
  font-size: 0.7rem;
  opacity: 0.45;
  flex-shrink: 0;
}

.sidebar-link-logout {
  color: rgba(239, 68, 68, 0.8);
  border-radius: 8px;
}
.sidebar-link-logout:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.sidebar-logout-area {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 1rem;
}

/* ── Content Header ── */
.admin-content {
  background: #f0f5fb;
  overflow: hidden;
}

.admin-content-header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}

.content-title {
  font-size: 1rem;
  color: #1a2d42;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

.admin-name {
  font-size: 0.9rem;
  color: #1a2d42;
  line-height: 1.2;
}

.admin-role {
  font-size: 0.72rem;
  color: #9ca3af;
}
</style>
