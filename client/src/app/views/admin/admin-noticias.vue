<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAccountStore } from '@/shared/config/store/account-store'
import axios from 'axios'
import type { INoticia } from '@/shared/model/noticia.model'

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

const news = ref<INoticia[]>([])
const isModalOpen = ref(false)
const saving = ref(false)
const searchQuery = ref('')

const emptyForm = (): Partial<INoticia> => ({
  title: '',
  summary: '',
  content: '',
  category: undefined,
  publishDate: new Date() as any,
  imageUrl: '',
  status: 'ACTIVE' as any,
})

const form = ref(emptyForm())

const filteredNews = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return news.value.filter(n => (n.title ?? '').toLowerCase().includes(q))
})

const loadNoticias = async () => {
  try {
    const res = await axios.get('api/noticias')
    news.value = res.data
  } catch (e) {
    console.error('Error loading noticias:', e)
  }
}

const openModal = () => {
  form.value = emptyForm()
  isModalOpen.value = true
}

const saveNoticia = async () => {
  saving.value = true
  try {
    await axios.post('api/noticias', { ...form.value, status: 'ACTIVE' })
    isModalOpen.value = false
    await loadNoticias()
  } catch (e) {
    console.error('Error saving noticia:', e)
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (item: INoticia) => {
  const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  try {
    await axios.put(`api/noticias/${item.id}`, { ...item, status: newStatus })
    await loadNoticias()
  } catch (e) {
    console.error('Error updating noticia:', e)
  }
}

const deleteNews = async (id: number | undefined) => {
  if (!id || !confirm('¿Estás seguro de eliminar esta noticia?')) return
  try {
    await axios.delete(`api/noticias/${id}`)
    await loadNoticias()
  } catch (e) {
    console.error('Error deleting noticia:', e)
  }
}

const formatDate = (dateStr: any) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  loadNoticias()
})
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
        <button class="home-btn" @click="router.push({ name: 'Home' })">
          <font-awesome-icon icon="home" :size="20" />
          <span v-if="isSidebarOpen || isMobile">Volver al Inicio</span>
        </button>
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
            <button class="btn btn--primary" @click="openModal">
              <font-awesome-icon icon="plus" :size="20" />
              <span>Nueva Noticia</span>
            </button>
          </div>

          <div class="mgmt-filters">
            <div class="search-box">
              <font-awesome-icon class="search-icon" icon="search" :size="18" />
              <input type="text" v-model="searchQuery" placeholder="Buscar por título...">
            </div>
          </div>

          <div v-if="filteredNews.length === 0" class="empty-state">
            No hay noticias publicadas aún.
          </div>

          <div class="mgmt-table-wrapper" v-else>
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
                <tr v-for="item in filteredNews" :key="item.id">
                  <td>{{ formatDate(item.publishDate) }}</td>
                  <td class="title-cell">{{ item.title }}</td>
                  <td>
                    <span :class="['category-badge', (item.category ?? '').toLowerCase()]">{{ item.category }}</span>
                  </td>
                  <td>
                    <span :class="['status-badge', item.status === 'ACTIVE' ? 'active' : 'archived']">
                      {{ item.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button
                      class="btn-icon"
                      :title="item.status === 'ACTIVE' ? 'Desactivar' : 'Activar'"
                      @click="toggleStatus(item)"
                    >
                      <font-awesome-icon :icon="item.status === 'ACTIVE' ? 'eye-slash' : 'eye'" :size="16" />
                    </button>
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

    <!-- Create modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Nueva Noticia</h2>
          <button class="modal-close" @click="isModalOpen = false">
            <font-awesome-icon icon="times" :size="18" />
          </button>
        </div>
        <form @submit.prevent="saveNoticia" class="modal-form">
          <div class="form-group">
            <label>Título *</label>
            <input v-model="form.title" type="text" required placeholder="Título de la noticia">
          </div>
          <div class="form-group">
            <label>Categoría *</label>
            <select v-model="form.category" required>
              <option value="" disabled>Seleccionar...</option>
              <option value="OPERATIVO">Operativo</option>
              <option value="INSTITUCIONAL">Institucional</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
          <div class="form-group">
            <label>Resumen</label>
            <textarea v-model="form.summary" rows="2" placeholder="Breve descripción..."></textarea>
          </div>
          <div class="form-group">
            <label>Contenido</label>
            <textarea v-model="form.content" rows="4" placeholder="Contenido completo..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha de publicación</label>
              <input v-model="form.publishDate" type="date">
            </div>
            <div class="form-group">
              <label>URL de imagen</label>
              <input v-model="form.imageUrl" type="url" placeholder="https://...">
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn--secondary" @click="isModalOpen = false">Cancelar</button>
            <button type="submit" class="btn btn--primary" :disabled="saving">
              {{ saving ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    .logo-text, .nav-item span, .chevron, .logout-btn span, .home-btn span { display: none; }
    .nav-item, .logout-btn, .home-btn { justify-content: center; padding: 1rem; }
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

.home-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  white-space: nowrap;
  margin-bottom: 4px;
  &:hover { background: rgba(255, 255, 255, 0.08); color: white; }
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
      height: 44px;
    }
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-xl;
  color: $color-text-muted;
  font-size: 0.95rem;
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
  &.urgente { background: #ef4444; }
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
    &:hover:not(:disabled) { background: darken($color-primary, 10%); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  &--secondary {
    background: #f1f5f9;
    color: $color-text;
    &:hover { background: #e2e8f0; }
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid #e2e8f0;

  h2 { font-size: 1.2rem; color: $color-text; margin: 0; }

  .modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: $color-text-muted;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { background: #f1f5f9; }
  }
}

.modal-form {
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: $color-text-muted;
  }

  input, select, textarea {
    padding: 0.6rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    color: $color-text;
    background: white;
    width: 100%;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
  }

  textarea { resize: vertical; }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1px solid #e2e8f0;
}
</style>
