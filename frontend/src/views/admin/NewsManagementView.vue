<script setup lang="ts">
import { ref } from 'vue'
import { useNewsStore, type NewsItem } from '../../stores/news'
import { Plus, Edit, Trash2, Archive, Search } from 'lucide-vue-next'

const newsStore = useNewsStore()
const isModalOpen = ref(false)
const searchQuery = ref('')

const deleteNews = (id: string) => {
  if (confirm('¿Estás seguro de eliminar esta noticia?')) {
    newsStore.deleteNews(id)
  }
}
</script>

<template>
  <div class="news-mgmt">
    <div class="mgmt-header">
      <div>
        <h1>Gestión de Noticias</h1>
        <p>Publica y administra el contenido informativo del acueducto</p>
      </div>
      <button class="btn btn--primary" @click="isModalOpen = true">
        <Plus :size="20" :stroke-width="2.5" />
        <span>Nueva Noticia</span>
      </button>
    </div>

    <div class="mgmt-filters">
      <div class="search-box">
        <Search class="search-icon" :size="18" />
        <input type="text" v-model="searchQuery" placeholder="Buscar por título...">
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
          <tr v-for="item in newsStore.news" :key="item.id">
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
              <button class="btn-icon" title="Editar"><Edit :size="16" /></button>
              <button class="btn-icon" title="Archivar"><Archive :size="16" /></button>
              <button class="btn-icon btn-icon--danger" @click="deleteNews(item.id)" title="Eliminar">
                <Trash2 :size="16" />
              </button>
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

  h1 { font-size: 1.5rem; color: $color-text; }
  p { color: $color-text-muted; font-size: 0.9rem; }
}

.mgmt-filters {
  margin-bottom: $spacing-md;
  .search-box {
    max-width: 400px;
    position: relative;
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: $color-text-muted; }
    input { 
      width: 100%; 
      padding: 0 12px 0 2.5rem; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      height: 44px; // Consistent height
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

  &.operativo { background: #f59e0b; }
  &.institucional { background: $color-primary; }
  &.comunidad { background: #10b981; }
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;

  &.active { background: #dcfce7; color: #166534; }
  &.archived { background: #f1f5f9; color: #64748b; }
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
