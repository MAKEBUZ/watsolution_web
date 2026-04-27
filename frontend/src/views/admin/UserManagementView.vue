<script setup lang="ts">
import { ref } from 'vue'
import { Search, UserPlus, Filter, MoreVertical, History, Shield, Trash2, Edit } from 'lucide-vue-next'

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
  <div class="user-mgmt">
    <div class="mgmt-header">
      <div>
        <h1>Gestión de Usuarios</h1>
        <p>Administra cuentas, roles y estados de los usuarios del sistema</p>
      </div>
      <button class="btn btn--primary" @click="() => {}">
        <UserPlus :size="20" :stroke-width="2.5" />
        <span>Nuevo Usuario</span>
      </button>
    </div>

    <div class="mgmt-controls">
      <div class="search-box">
        <Search class="search-icon" :size="18" />
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre, ID o email...">
      </div>
      
      <div class="filter-group">
        <div class="filter-item">
          <Filter :size="16" />
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
                <Shield v-if="user.role === 'admin'" :size="12" />
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
              <button class="btn-icon" title="Historial"><History :size="16" /></button>
              <button class="btn-icon" title="Editar"><Edit :size="16" /></button>
              <button class="btn-icon btn-icon--danger" title="Eliminar"><Trash2 :size="16" /></button>
              <button class="btn-icon"><MoreVertical :size="16" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

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
      height: 44px; // Consistent with buttons
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
    min-height: 44px; // Ensure it matches button height
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
</style>
