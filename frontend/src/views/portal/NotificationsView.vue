<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Bell, Search, Filter, Trash2, Check, 
  ChevronLeft, ChevronRight, Info, AlertTriangle, 
  AlertCircle, CheckCircle, MoreVertical, X
} from 'lucide-vue-next'
import { useNotificationsStore, type NotificationType } from '../../stores/notifications'

const notificationStore = useNotificationsStore()

// State
const searchQuery = ref('')
const typeFilter = ref<NotificationType | 'all'>('all')
const readFilter = ref<'all' | 'read' | 'unread'>('all')
const currentPage = ref(1)
const itemsPerPage = 8
const selectedIds = ref<string[]>([])

// Filters
const filteredNotifications = computed(() => {
  return notificationStore.sortedNotifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = typeFilter.value === 'all' || n.type === typeFilter.value
    const matchesRead = readFilter.value === 'all' || 
                        (readFilter.value === 'read' && n.isRead) || 
                        (readFilter.value === 'unread' && !n.isRead)
    
    return matchesSearch && matchesType && matchesRead
  })
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredNotifications.value.length / itemsPerPage))
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredNotifications.value.slice(start, end)
})

// Selection
const toggleSelection = (id: string) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(i => i !== id)
  } else {
    selectedIds.value.push(id)
  }
}

const toggleSelectAll = () => {
  if (selectedIds.value.length === paginatedNotifications.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = paginatedNotifications.value.map(n => n.id)
  }
}

const deleteSelected = () => {
  selectedIds.value.forEach(id => notificationStore.deleteNotification(id))
  selectedIds.value = []
}

const markSelectedAsRead = () => {
  selectedIds.value.forEach(id => notificationStore.markAsRead(id))
  selectedIds.value = []
}

// Icons
const getIcon = (type: string) => {
  switch (type) {
    case 'warning': return AlertTriangle
    case 'error': return AlertCircle
    case 'success': return CheckCircle
    default: return Info
  }
}
</script>

<template>
  <div class="notifications-page">
    <div class="container">
      <div class="page-header">
        <div class="header-left">
          <h1>Notificaciones</h1>
          <p>Gestiona y revisa todas las alertas de tu cuenta</p>
        </div>
        <div class="header-actions">
          <button class="btn btn--outline" @click="notificationStore.markAllAsRead">
            <Check :size="18" /> Marcar todo como leído
          </button>
        </div>
      </div>

      <div class="notifications-container">
        <!-- Filters Bar -->
        <div class="filters-bar">
          <div class="search-box">
            <Search :size="18" class="search-icon" />
            <input type="text" v-model="searchQuery" placeholder="Buscar notificaciones...">
          </div>
          
          <div class="filter-group">
            <div class="filter-item">
              <label>Tipo:</label>
              <select v-model="typeFilter">
                <option value="all">Todos</option>
                <option value="info">Información</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
                <option value="success">Éxito</option>
              </select>
            </div>
            <div class="filter-item">
              <label>Estado:</label>
              <select v-model="readFilter">
                <option value="all">Todas</option>
                <option value="read">Leídas</option>
                <option value="unread">No leídas</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedIds.length > 0" class="bulk-actions">
          <span class="selection-count">{{ selectedIds.length }} seleccionadas</span>
          <div class="bulk-btns">
            <button @click="markSelectedAsRead" class="btn-bulk"><Check :size="16" /> Marcar leídas</button>
            <button @click="deleteSelected" class="btn-bulk delete"><Trash2 :size="16" /> Eliminar</button>
          </div>
        </div>

        <!-- Notifications Table/List -->
        <div class="notifications-list-container">
          <table class="notifications-table">
            <thead>
              <tr>
                <th class="col-check">
                  <input type="checkbox" @change="toggleSelectAll" :checked="selectedIds.length === paginatedNotifications.length && paginatedNotifications.length > 0">
                </th>
                <th class="col-type">Tipo</th>
                <th class="col-content">Mensaje</th>
                <th class="col-date">Fecha</th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in paginatedNotifications" :key="n.id" :class="{ 'is-unread': !n.isRead, 'is-selected': selectedIds.includes(n.id) }">
                <td>
                  <input type="checkbox" :checked="selectedIds.includes(n.id)" @change="toggleSelection(n.id)">
                </td>
                <td>
                  <div :class="['type-badge', n.type]">
                    <component :is="getIcon(n.type)" :size="14" />
                    <span>{{ n.type }}</span>
                  </div>
                </td>
                <td @click="notificationStore.markAsRead(n.id)">
                  <div class="msg-content">
                    <span class="msg-title">{{ n.title }}</span>
                    <p class="msg-text">{{ n.message }}</p>
                  </div>
                </td>
                <td>
                  <span class="date">{{ n.date.toLocaleDateString() }}</span>
                </td>
                <td>
                  <div class="row-actions">
                    <button v-if="!n.isRead" @click="notificationStore.markAsRead(n.id)" title="Marcar leída"><Check :size="16" /></button>
                    <button @click="notificationStore.deleteNotification(n.id)" class="delete" title="Eliminar"><Trash2 :size="16" /></button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedNotifications.length === 0">
                <td colspan="5" class="empty-row">
                  <div class="empty-state">
                    <Bell :size="48" class="empty-icon" />
                    <h3>No se encontraron notificaciones</h3>
                    <p>Prueba ajustando los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="currentPage === 1" @click="currentPage--" class="btn-pag">
            <ChevronLeft :size="20" />
          </button>
          <div class="pages">
            <button v-for="p in totalPages" :key="p" @click="currentPage = p" :class="{ 'active': currentPage === p }">
              {{ p }}
            </button>
          </div>
          <button :disabled="currentPage === totalPages" @click="currentPage++" class="btn-pag">
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.notifications-page {
  padding-top: 100px;
  padding-bottom: $spacing-xl;
  background-color: $color-bg;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-xl;

  h1 { font-size: 2.5rem; font-weight: 800; color: $color-text; margin-bottom: 8px; }
  p { color: $color-text-muted; font-size: 1.1rem; }

  @include mobile {
    flex-direction: column;
    gap: $spacing-md;
    h1 { font-size: 2rem; }
  }
}

.notifications-container {
  background: white;
  border-radius: 24px;
  box-shadow: $shadow-lg;
  overflow: hidden;
}

.filters-bar {
  padding: $spacing-lg;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  gap: $spacing-md;
  border-bottom: 1px solid #e2e8f0;

  @include tablet { flex-direction: column; }
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
  
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
  input {
    width: 100%;
    padding: 12px 12px 12px 42px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    font-size: 0.95rem;
    &:focus { border-color: $color-primary; outline: none; }
  }
}

.filter-group {
  display: flex;
  gap: $spacing-md;
  
  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;
    label { font-size: 0.85rem; font-weight: 700; color: $color-text-muted; }
    select {
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      font-weight: 600;
      background: white;
    }
  }
}

.bulk-actions {
  padding: 12px $spacing-lg;
  background: color.change($color-primary, $alpha: 0.05);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: $spacing-lg;

  .selection-count { font-size: 0.9rem; font-weight: 700; color: $color-primary; }
  .bulk-btns { display: flex; gap: 8px; }
}

.btn-bulk {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  &:hover { color: $color-primary; border-color: $color-primary; }
  &.delete:hover { color: #ef4444; border-color: #ef4444; }
}

.notifications-table {
  width: 100%;
  border-collapse: collapse;
  
  th {
    padding: 16px;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    background: #fcfdfe;
    border-bottom: 1px solid #f1f5f9;
  }

  td {
    padding: 20px 16px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  tr.is-unread {
    background: color.change($color-primary, $alpha: 0.02);
    .msg-title { font-weight: 800; }
  }

  tr.is-selected { background: color.change($color-primary, $alpha: 0.05); }

  .col-check { width: 40px; }
  .col-type { width: 120px; }
  .col-date { width: 120px; }
  .col-actions { width: 100px; text-align: right; }

  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: capitalize;

    &.info { background: #eff6ff; color: #3b82f6; }
    &.warning { background: #fffbeb; color: #f59e0b; }
    &.error { background: #fef2f2; color: #ef4444; }
    &.success { background: #f0fdf4; color: #10b981; }
  }

  .msg-content {
    cursor: pointer;
    .msg-title { font-size: 0.95rem; color: $color-text; display: block; margin-bottom: 4px; }
    .msg-text { font-size: 0.85rem; color: $color-text-muted; margin: 0; line-height: 1.5; }
  }

  .date { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }

  .row-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    button {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover { color: $color-primary; border-color: $color-primary; }
      &.delete:hover { color: #ef4444; border-color: #ef4444; }
    }
  }
}

.empty-row { padding: $spacing-xl !important; }

.pagination {
  padding: $spacing-lg;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-md;
  background: #f8fafc;

  .pages { display: flex; gap: 8px; }
  button {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    &:hover:not(:disabled) { border-color: $color-primary; color: $color-primary; }
    &.active { background: $color-primary; color: white; border-color: $color-primary; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
}
</style>
