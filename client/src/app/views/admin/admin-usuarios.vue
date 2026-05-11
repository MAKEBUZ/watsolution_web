<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useAccountStore } from '@/shared/config/store/account-store'
import PersonService from '@/entities/person/person.service'
import type { IPerson } from '@/shared/model/person.model'
import type { IAddress } from '@/shared/model/address.model'
import type { IMeter } from '@/shared/model/meter.model'

interface FormState extends IPerson {
  address?: IAddress
}

const router = useRouter()
const route = useRoute()
const accountStore = useAccountStore()
const personService = new PersonService()

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

// ── Data ──────────────────────────────────────────────────────────────────────
const persons = ref<IPerson[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('todos')

// ── Modal create/edit ─────────────────────────────────────────────────────────
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const saveError = ref('')
const formData = ref<FormState>({})

// ── Delete confirmation ───────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const personToDelete = ref<IPerson | null>(null)

// ── Load ──────────────────────────────────────────────────────────────────────
const loadPersons = async () => {
  isLoading.value = true
  try {
    const res = await personService.retrieve({ page: 0, size: 200, sort: 'id,asc' })
    persons.value = res.data
  } finally {
    isLoading.value = false
  }
}

onMounted(loadPersons)

// ── Filtered list ─────────────────────────────────────────────────────────────
const filteredPersons = computed(() =>
  persons.value.filter(p => {
    const matchesSearch =
      !searchQuery.value ||
      (p.fullName ?? '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (p.email ?? '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (p.documentNumber ?? '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      String(p.id ?? '').includes(searchQuery.value)
    const matchesStatus =
      statusFilter.value === 'todos' ||
      (statusFilter.value === 'activo' && p.status === 'ACTIVE') ||
      (statusFilter.value === 'inactivo' && p.status === 'INACTIVE')
    return matchesSearch && matchesStatus
  })
)

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusClass = (status?: string | null) => {
  if (status === 'ACTIVE') return 'status--active'
  return 'status--suspended'
}

const getStatusLabel = (status?: string | null) => {
  if (status === 'ACTIVE') return 'Activo'
  return 'Inactivo'
}

const formatDate = (date?: Date | string | null) => {
  if (!date) return '-'
  return new Date(date as string).toLocaleDateString('es-CO')
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
const openCreate = () => {
  isEditing.value = false
  saveError.value = ''
  formData.value = { status: 'ACTIVE', stratum: 1, address: {} }
  showModal.value = true
}

const openEdit = (person: IPerson) => {
  isEditing.value = true
  saveError.value = ''
  formData.value = { ...person, address: { ...(person.address ?? {}) } }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  saveError.value = ''
}

const saveForm = async () => {
  saving.value = true
  saveError.value = ''
  try {
    if (isEditing.value) {
      // PUT - PersonDTO con dirección anidada
      await personService.update(formData.value as IPerson)
    } else {
      // POST - DTO plano que incluye campos de dirección
      await axios.post('api/people', {
        fullName: formData.value.fullName,
        documentNumber: formData.value.documentNumber,
        phone: formData.value.phone,
        email: formData.value.email,
        subscriberNumber: formData.value.subscriberNumber,
        stratum: formData.value.stratum ?? 1,
        neighborhood: formData.value.address?.neighborhood,
        street: formData.value.address?.street,
        houseNumber: formData.value.address?.houseNumber,
        city: formData.value.address?.city,
      })
    }
    await loadPersons()
    closeModal()
  } catch (err: any) {
    saveError.value = err?.response?.data?.message ?? 'Error al guardar. Verifique los datos.'
  } finally {
    saving.value = false
  }
}

// ── Drawer historial de mediciones / facturas ─────────────────────────────────
const drawerOpen = ref(false)
const drawerPerson = ref<IPerson | null>(null)

const meters = ref<IMeter[]>([])
const loadingMeters = ref(false)

const drawerInvoices = ref<any[]>([])
const loadingInvoices = ref(false)
const updatingInvoiceId = ref<number | null>(null)

const openDrawer = async (person: IPerson) => {
  drawerPerson.value = person
  drawerOpen.value = true
  loadMeterData(person)
  loadInvoiceData(person)
}

const loadMeterData = async (person: IPerson) => {
  loadingMeters.value = true
  meters.value = []
  try {
    const res = await axios.get(`api/meters/by-person/${person.id}`)
    meters.value = res.data
  } finally {
    loadingMeters.value = false
  }
}

const loadInvoiceData = async (person: IPerson) => {
  loadingInvoices.value = true
  drawerInvoices.value = []
  try {
    const res = await axios.get(`api/invoices/by-person/${person.id}`)
    drawerInvoices.value = (res.data ?? []).sort(
      (a: any, b: any) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    )
  } finally {
    loadingInvoices.value = false
  }
}

const invoiceEffectiveStatus = (inv: any): string => {
  if (inv.status === 'PAID') return 'PAID'
  if (inv.status === 'CANCELLED') return 'CANCELLED'
  if (inv.status === 'PENDING') {
    return new Date(inv.dueDate) < new Date() ? 'OVERDUE' : 'PENDING'
  }
  return 'PENDING'
}

const invoiceStatusLabel: Record<string, string> = {
  PAID: 'Pagado', PENDING: 'Pendiente', OVERDUE: 'En Mora', CANCELLED: 'Cancelado',
}
const invoiceStatusColor: Record<string, { color: string; bg: string }> = {
  PAID:      { color: '#065f46', bg: '#d1fae5' },
  PENDING:   { color: '#92400e', bg: '#fef3c7' },
  OVERDUE:   { color: '#991b1b', bg: '#fee2e2' },
  CANCELLED: { color: '#374151', bg: '#f3f4f6' },
}

const markAsPaid = async (inv: any) => {
  if (inv.status === 'PAID') return
  updatingInvoiceId.value = inv.id
  try {
    await axios.put(`api/invoices/${inv.id}`, { ...inv, status: 'PAID' })
    const idx = drawerInvoices.value.findIndex((i: any) => i.id === inv.id)
    if (idx !== -1) drawerInvoices.value[idx] = { ...drawerInvoices.value[idx], status: 'PAID' }
  } catch {
    alert('No se pudo actualizar el estado de la factura.')
  } finally {
    updatingInvoiceId.value = null
  }
}

const fmtAmt = (amount: any) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(amount ?? 0))

const invNum = (inv: any) => {
  const y = inv.issueDate ? new Date(inv.issueDate).getFullYear() : new Date().getFullYear()
  return `FAC-${y}-${String(inv.id ?? 0).padStart(3, '0')}`
}

const closeDrawer = () => {
  drawerOpen.value = false
  drawerPerson.value = null
  meters.value = []
  drawerInvoices.value = []
}

const formatAddress = (person: IPerson) => {
  const a = person.address
  if (!a) return '-'
  const parts = [a.street, a.houseNumber, a.neighborhood, a.city].filter(Boolean)
  return parts.join(', ') || '-'
}

const confirmDelete = (person: IPerson) => {
  personToDelete.value = person
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  personToDelete.value = null
}

const executeDelete = async () => {
  if (!personToDelete.value?.id) return
  deleting.value = true
  try {
    await personService.delete(personToDelete.value.id)
    await loadPersons()
    cancelDelete()
  } finally {
    deleting.value = false
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
        <div class="user-mgmt">
          <div class="mgmt-header">
            <div>
              <h1>Gestión de Usuarios</h1>
              <p>Administra cuentas, roles y estados de los usuarios del sistema</p>
            </div>
            <button class="btn btn--primary" @click="openCreate">
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
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div class="table-card">
            <div v-if="isLoading" class="table-loading">Cargando usuarios...</div>
            <table v-else class="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredPersons.length === 0">
                  <td colspan="7" class="empty-row">No se encontraron usuarios.</td>
                </tr>
                <tr v-for="person in filteredPersons" :key="person.id">
                  <td>#{{ person.id }}</td>
                  <td>
                    <div class="user-info">
                      <span class="user-name">{{ person.fullName }}</span>
                      <span class="user-email">{{ person.email }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="doc-badge">{{ person.documentNumber || '-' }}</span>
                  </td>
                  <td>
                    <span class="address-text">{{ formatAddress(person) }}</span>
                  </td>
                  <td>
                    <span :class="['status-pill', getStatusClass(person.status)]">
                      {{ getStatusLabel(person.status) }}
                    </span>
                  </td>
                  <td>{{ formatDate(person.createdAt) }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon btn-icon--history" title="Historial de mediciones" @click="openDrawer(person)">
                      <font-awesome-icon icon="tachometer-alt" :size="15" />
                    </button>
                    <button class="btn-icon" title="Editar" @click="openEdit(person)">
                      <font-awesome-icon icon="pencil-alt" :size="15" />
                    </button>
                    <button class="btn-icon btn-icon--danger" title="Eliminar" @click="confirmDelete(person)">
                      <font-awesome-icon icon="trash" :size="15" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Create / Edit modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
          <button class="modal-close" @click="closeModal">
            <font-awesome-icon icon="times" :size="18" />
          </button>
        </div>

        <div class="modal-body">
          <!-- Error banner -->
          <div v-if="saveError" class="form-error-banner">{{ saveError }}</div>

          <!-- Datos del usuario -->
          <p class="form-section-title">Datos personales</p>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Nombre completo *</label>
              <input class="form-control" v-model="formData.fullName" placeholder="Nombre completo" required />
            </div>
            <div class="form-field">
              <label class="form-label">N° Documento *</label>
              <input class="form-control" v-model="formData.documentNumber" placeholder="Número de documento" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">
                Email *
                <span v-if="!isEditing" class="form-hint">(será el nombre de usuario)</span>
              </label>
              <input class="form-control" type="email" v-model="formData.email" placeholder="correo@ejemplo.com" required />
            </div>
            <div class="form-field">
              <label class="form-label">
                Teléfono *
                <span v-if="!isEditing" class="form-hint">(será la contraseña inicial)</span>
              </label>
              <input class="form-control" v-model="formData.phone" placeholder="Teléfono" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">N° Suscriptor</label>
              <input class="form-control" v-model="formData.subscriberNumber" placeholder="Número de suscriptor" />
            </div>
            <div class="form-field">
              <label class="form-label">Estrato</label>
              <input class="form-control" type="number" min="1" max="6" v-model.number="formData.stratum" placeholder="1 - 6" />
            </div>
          </div>
          <div v-if="isEditing" class="form-row">
            <div class="form-field">
              <label class="form-label">Estado</label>
              <select class="form-control" v-model="formData.status">
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>

          <!-- Dirección -->
          <p class="form-section-title">Dirección</p>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Barrio / Urbanización *</label>
              <input class="form-control" v-model="formData.address!.neighborhood" placeholder="Barrio" required />
            </div>
            <div class="form-field">
              <label class="form-label">Ciudad *</label>
              <input class="form-control" v-model="formData.address!.city" placeholder="Ciudad" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label class="form-label">Calle / Carrera</label>
              <input class="form-control" v-model="formData.address!.street" placeholder="Ej: Calle 12 # 34" />
            </div>
            <div class="form-field">
              <label class="form-label">N° Casa / Apto</label>
              <input class="form-control" v-model="formData.address!.houseNumber" placeholder="Ej: Casa 5 / Apto 301" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn--secondary" @click="closeModal" :disabled="saving">Cancelar</button>
          <button class="btn btn--primary" @click="saveForm" :disabled="saving">
            <font-awesome-icon v-if="saving" icon="spinner" spin />
            {{ saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear usuario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Drawer: mediciones / facturas -->
    <transition name="drawer">
      <div v-if="drawerOpen" class="drawer-overlay" @click.self="closeDrawer">
        <aside class="drawer">
          <div class="drawer-header">
            <div>
              <h2 class="drawer-title">Historial del Suscriptor</h2>
              <p class="drawer-subtitle" v-if="drawerPerson">
                {{ drawerPerson.fullName }}
                <span v-if="drawerPerson.subscriberNumber"> · #{{ drawerPerson.subscriberNumber }}</span>
              </p>
            </div>
            <button class="modal-close" @click="closeDrawer">
              <font-awesome-icon icon="times" :size="18" />
            </button>
          </div>

          <div class="drawer-body">
            <!-- ── Mediciones ──────────────────────────────────────────── -->
            <div class="drawer-section-title">
              <font-awesome-icon icon="tachometer-alt" :size="13" />
              Mediciones
            </div>
            <div v-if="loadingMeters" class="drawer-loading">
              <font-awesome-icon icon="spinner" spin />
              Cargando mediciones...
            </div>
            <div v-else-if="meters.length === 0" class="drawer-empty drawer-empty--sm">
              <p>No hay mediciones registradas.</p>
            </div>
            <div v-else class="meter-list">
              <div class="meter-item" v-for="meter in meters" :key="meter.id">
                <div class="meter-icon-col">
                  <div class="meter-icon">
                    <font-awesome-icon icon="tachometer-alt" :size="18" />
                  </div>
                </div>
                <div class="meter-data">
                  <div class="meter-measure">{{ meter.waterMeasure }} <span class="meter-unit">m³</span></div>
                  <div class="meter-date">{{ formatDate(meter.readingDate as any) }}</div>
                  <div v-if="meter.observation" class="meter-obs">{{ meter.observation }}</div>
                </div>
                <div class="meter-address" v-if="meter.address">
                  <font-awesome-icon icon="map-marker-alt" :size="12" />
                  {{ meter.address.neighborhood }}, {{ meter.address.city }}
                </div>
              </div>
            </div>

            <!-- ── Facturas ────────────────────────────────────────────── -->
            <div class="drawer-section-title drawer-section-title--mt">
              <font-awesome-icon icon="file-invoice-dollar" :size="13" />
              Facturas
              <span v-if="drawerInvoices.length" class="drawer-tab__count">{{ drawerInvoices.length }}</span>
            </div>
            <div v-if="loadingInvoices" class="drawer-loading">
              <font-awesome-icon icon="spinner" spin />
              Cargando facturas...
            </div>
            <div v-else-if="drawerInvoices.length === 0" class="drawer-empty drawer-empty--sm">
              <p>No hay facturas registradas para este suscriptor.</p>
            </div>
            <div v-else class="inv-list">
              <div
                v-for="inv in drawerInvoices"
                :key="inv.id"
                :class="['inv-item', { 'inv-item--mora': invoiceEffectiveStatus(inv) === 'OVERDUE' }]"
              >
                <div class="inv-item__top">
                  <div class="inv-item__info">
                    <span class="inv-item__num">{{ invNum(inv) }}</span>
                    <span
                      class="inv-item__badge"
                      :style="{
                        color: invoiceStatusColor[invoiceEffectiveStatus(inv)]?.color,
                        background: invoiceStatusColor[invoiceEffectiveStatus(inv)]?.bg,
                      }"
                    >{{ invoiceStatusLabel[invoiceEffectiveStatus(inv)] }}</span>
                  </div>
                  <span class="inv-item__amount">{{ fmtAmt(inv.amountDue) }}</span>
                </div>

                <div class="inv-item__meta">
                  <span>
                    <font-awesome-icon icon="calendar" :size="11" />
                    Emisión: {{ formatDate(inv.issueDate) }}
                  </span>
                  <span :class="{ 'text-red': invoiceEffectiveStatus(inv) === 'OVERDUE' }">
                    <font-awesome-icon icon="clock" :size="11" />
                    Vence: {{ formatDate(inv.dueDate) }}
                  </span>
                  <span>
                    <font-awesome-icon icon="tint" :size="11" />
                    {{ Number(inv.consumptionM3 ?? 0).toFixed(1) }} m³
                  </span>
                </div>

                <div class="inv-item__actions">
                  <button
                    v-if="inv.status !== 'PAID' && inv.status !== 'CANCELLED'"
                    class="btn-mark-paid"
                    :disabled="updatingInvoiceId === inv.id"
                    @click="markAsPaid(inv)"
                  >
                    <font-awesome-icon
                      v-if="updatingInvoiceId === inv.id"
                      icon="spinner"
                      spin
                      :size="12"
                    />
                    <font-awesome-icon v-else icon="check-circle" :size="12" />
                    {{ updatingInvoiceId === inv.id ? 'Guardando...' : 'Marcar como Pagada' }}
                  </button>
                  <span v-else-if="inv.status === 'PAID'" class="inv-paid-label">
                    <font-awesome-icon icon="check-circle" :size="12" />
                    Pagada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </transition>

    <!-- Delete confirmation -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-card modal-card--sm">
        <div class="modal-header">
          <h2>Eliminar usuario</h2>
          <button class="modal-close" @click="cancelDelete">
            <font-awesome-icon icon="times" :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar a <strong>{{ personToDelete?.fullName }}</strong>? Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary" @click="cancelDelete" :disabled="deleting">Cancelar</button>
          <button class="btn btn--danger" @click="executeDelete" :disabled="deleting">
            <font-awesome-icon v-if="deleting" icon="spinner" spin />
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
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

.table-loading {
  padding: $spacing-xl;
  text-align: center;
  color: $color-text-muted;
}

.empty-row {
  text-align: center;
  color: $color-text-muted;
  padding: $spacing-xl !important;
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
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
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
    &:hover:not(:disabled) { background: darken($color-primary, 10%); }
  }

  &--secondary {
    background: #f1f5f9;
    color: $color-text;
    &:hover:not(:disabled) { background: #e2e8f0; }
  }

  &--danger {
    background: #ef4444;
    color: white;
    &:hover:not(:disabled) { background: #dc2626; }
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

// ── Modal ─────────────────────────────────────────────────────────────────────
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  backdrop-filter: blur(3px);
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: min(640px, 100%);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;

  &--sm { width: min(420px, 100%); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid #f1f5f9;

  h2 { font-size: 1.1rem; color: $color-text; font-weight: 700; margin: 0; }
}

.modal-close {
  background: none;
  border: none;
  color: $color-text-muted;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: #f1f5f9; }
}

.modal-body {
  padding: $spacing-lg;
  overflow-y: auto;
  flex: 1;

  p { color: $color-text; line-height: 1.6; }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  border-top: 1px solid #f1f5f9;
}

.form-row {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-md;

  @media (max-width: 520px) { flex-direction: column; }
}

.form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: $color-text-muted;
}

.form-control {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: $color-text;
  background: white;
  width: 100%;

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.12);
  }
}

.form-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: $color-primary;
  margin: 0 0 $spacing-sm;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;

  & + .form-row { margin-top: 0; }
}

.form-hint {
  font-weight: 400;
  font-size: 0.75rem;
  color: $color-text-muted;
  margin-left: 4px;
}

.form-error-banner {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
  margin-bottom: $spacing-md;
}

// ── Table extras ──────────────────────────────────────────────────────────────
.doc-badge {
  font-size: 0.82rem;
  font-weight: 600;
  color: $color-text;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 5px;
  white-space: nowrap;
}

.address-text {
  font-size: 0.82rem;
  color: $color-text-muted;
  max-width: 200px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-icon--history:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

// ── Drawer ────────────────────────────────────────────────────────────────────
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 3000;
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(2px);
}

.drawer {
  width: min(460px, 96vw);
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: $spacing-lg;
  border-bottom: 1px solid #f1f5f9;
  gap: $spacing-md;
}

.drawer-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: $color-text;
  margin: 0 0 4px;
}

.drawer-subtitle {
  font-size: 0.85rem;
  color: $color-text-muted;
  margin: 0;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md $spacing-lg;
}

.drawer-loading,
.drawer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  color: $color-text-muted;
  padding: $spacing-xl * 2 0;
  text-align: center;
  font-size: 0.9rem;
}

.meter-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.meter-item {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: start;
  gap: $spacing-sm;
  padding: $spacing-md;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  background: #fafcff;
  transition: box-shadow 0.15s;

  &:hover { box-shadow: 0 2px 8px rgba(0, 119, 190, 0.1); }
}

.meter-icon-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;
}

.meter-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meter-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meter-measure {
  font-size: 1.1rem;
  font-weight: 700;
  color: $color-text;
}

.meter-unit {
  font-size: 0.8rem;
  font-weight: 500;
  color: $color-text-muted;
}

.meter-date {
  font-size: 0.8rem;
  color: $color-text-muted;
}

.meter-obs {
  font-size: 0.78rem;
  color: #64748b;
  font-style: italic;
  margin-top: 2px;
}

.meter-address {
  font-size: 0.75rem;
  color: $color-text-muted;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  padding-top: 4px;
}

// ── Drawer section titles ─────────────────────────────────────────────────────
.drawer-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: $color-primary;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: $spacing-sm;

  &--mt { margin-top: $spacing-lg; }
}

.drawer-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: $color-primary;
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  padding: 0 5px;
}

.drawer-empty--sm {
  padding: $spacing-md 0;
  font-size: 0.85rem;
}

// ── Invoice list ──────────────────────────────────────────────────────────────
.inv-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.inv-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: $spacing-md;
  background: white;
  transition: box-shadow 0.15s;

  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }

  &--mora {
    border-left: 3px solid #ef4444;
    background: #fffbfb;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: $spacing-sm;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
  }

  &__num {
    font-family: monospace;
    font-size: 0.85rem;
    font-weight: 700;
    color: $color-text;
    white-space: nowrap;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
  }

  &__amount {
    font-size: 1rem;
    font-weight: 700;
    color: $color-text;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.78rem;
    color: $color-text-muted;
    margin-bottom: 10px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.btn-mark-paid {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #eff6ff;
  color: $color-primary;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: $color-primary;
    color: white;
    border-color: $color-primary;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.inv-paid-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #065f46;
}

.text-red {
  color: #dc2626 !important;
}

// ── Drawer transition ─────────────────────────────────────────────────────────
.drawer-enter-active,
.drawer-leave-active { transition: opacity 0.25s ease; .drawer { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); } }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; .drawer { transform: translateX(100%); } }
</style>
