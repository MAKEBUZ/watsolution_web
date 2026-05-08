<template>
  <div class="p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="font-weight-bold mb-1">Gestión de Usuarios</h3>
        <p class="text-muted mb-0">Administra cuentas, roles y estados de los usuarios del sistema</p>
      </div>
      <router-link to="/admin/user-management/new" class="btn btn-primary">
        <font-awesome-icon icon="user-plus" class="mr-2" /> Nuevo Usuario
      </router-link>
    </div>

    <!-- Search & Filter -->
    <div class="d-flex mb-4">
      <div class="search-box flex-grow-1 mr-3">
        <font-awesome-icon icon="search" class="search-icon text-muted" />
        <input
          class="search-input form-control"
          type="text"
          placeholder="Buscar por nombre, ID o email..."
          v-model="searchQuery"
        />
      </div>
      <div class="filter-select-wrap">
        <font-awesome-icon icon="filter" class="filter-icon text-muted" />
        <select class="form-control filter-select" v-model="statusFilter">
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="MOROSO">Moroso</option>
          <option value="SUSPENDIDO">Suspendido</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm">
      <div v-if="isFetching" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <table v-else class="table table-hover mb-0">
        <thead class="bg-light">
          <tr>
            <th class="border-0 text-muted small font-weight-600 px-4">ID</th>
            <th class="border-0 text-muted small font-weight-600">USUARIO</th>
            <th class="border-0 text-muted small font-weight-600">ROL</th>
            <th class="border-0 text-muted small font-weight-600">ESTADO</th>
            <th class="border-0 text-muted small font-weight-600">ÚLTIMO CAMBIO</th>
            <th class="border-0 text-muted small font-weight-600">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filtered" :key="user.id">
            <td class="align-middle text-muted px-4">#{{ user.id }}</td>
            <td class="align-middle">
              <div class="font-weight-bold" style="font-size:0.9rem;">{{ fullName(user) }}</div>
              <small class="text-muted">{{ user.email }}</small>
            </td>
            <td class="align-middle">
              <span
                class="role-badge"
                :class="user.role === 'ADMIN' ? 'role-admin' : 'role-user'"
              >
                <font-awesome-icon v-if="user.role === 'ADMIN'" icon="shield-alt" class="mr-1" />
                {{ user.role === 'ADMIN' ? 'Admin' : 'Usuario' }}
              </span>
            </td>
            <td class="align-middle">
              <span class="user-status-badge" :class="statusClass(user.userStatus)">
                {{ user.userStatus }}
              </span>
            </td>
            <td class="align-middle text-muted small">{{ formatDate(user.lastModifiedDate) }}</td>
            <td class="align-middle">
              <button class="btn btn-icon text-muted" title="Historial">
                <font-awesome-icon icon="history" />
              </button>
              <router-link
                :to="`/admin/user-management/${user.login}/edit`"
                class="btn btn-icon text-muted"
                title="Editar"
              >
                <font-awesome-icon icon="pencil-alt" />
              </router-link>
              <button class="btn btn-icon text-danger" title="Eliminar">
                <font-awesome-icon icon="trash" />
              </button>
              <button class="btn btn-icon text-muted" title="Más opciones">
                <font-awesome-icon icon="ellipsis-v" />
              </button>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="6" class="text-center text-muted py-4">No se encontraron usuarios.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" src="./admin-usuarios.component.ts"></script>

<style scoped>
/* Search */
.search-box {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  font-size: 0.85rem;
}
.search-input {
  padding-left: 36px;
  border-radius: 8px;
  border-color: #dee2e6;
}

/* Filter */
.filter-select-wrap {
  position: relative;
  min-width: 190px;
}
.filter-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  font-size: 0.8rem;
}
.filter-select {
  padding-left: 30px;
  border-radius: 8px;
  border-color: #dee2e6;
  appearance: auto;
}

/* Badges */
.user-status-badge {
  display: inline-block;
  padding: 0.3em 0.8em;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.badge-activo     { background: #dcfce7; color: #16a34a; }
.badge-moroso     { background: #fee2e2; color: #dc2626; }
.badge-suspendido { background: #fef3c7; color: #d97706; }

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25em 0.75em;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
}
.role-admin { color: #2563eb; }

/* Action buttons */
.btn-icon {
  padding: 0.3rem 0.45rem;
  line-height: 1;
  background: none;
  border: none;
  font-size: 0.85rem;
}

.font-weight-600 { font-weight: 600; }
</style>
