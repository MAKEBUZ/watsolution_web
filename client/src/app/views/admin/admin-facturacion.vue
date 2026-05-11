<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAccountStore } from '@/shared/config/store/account-store'
import axios from 'axios'

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

// Person search
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedPerson = ref<any>(null)
const isSearching = ref(false)
const showDropdown = ref(false)

const searchPersons = async () => {
  const q = searchQuery.value.trim()
  if (!q) { searchResults.value = []; showDropdown.value = false; return }
  isSearching.value = true
  try {
    const res = await axios.get('api/people', { params: { page: 0, size: 20, sort: 'id,asc' } })
    const lower = q.toLowerCase()
    searchResults.value = (res.data ?? []).filter((p: any) =>
      p.fullName?.toLowerCase().includes(lower) || p.documentNumber?.includes(q)
    )
    showDropdown.value = true
  } catch {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const selectPerson = async (person: any) => {
  selectedPerson.value = person
  searchQuery.value = person.fullName
  showDropdown.value = false
  invoice.value.personId = person.id
  // Auto-load last meter reading
  try {
    const res = await axios.get(`api/meters/by-person/${person.id}`)
    const meters: any[] = res.data ?? []
    if (meters.length > 0) {
      invoice.value.currentReading = meters[0].currentReading ?? meters[0].reading ?? 0
    }
  } catch { /* no meter yet */ }
}

const invoice = ref({
  personId: null as number | null,
  currentReading: 0,
  ratePerM3: 2500,
  fixedCharge: 5000,
  subsidy: 0.15,
  recharge: 0
})

const consumption = computed(() => invoice.value.currentReading)
const subtotal = computed(() => consumption.value * invoice.value.ratePerM3 + invoice.value.fixedCharge)
const discount = computed(() => subtotal.value * invoice.value.subsidy)
const total = computed(() => subtotal.value - discount.value + invoice.value.recharge)

const isSaving = ref(false)
const saveError = ref('')
const savedInvoice = ref<any>(null)

const handleSave = async () => {
  if (!invoice.value.personId) {
    saveError.value = 'Selecciona un usuario antes de generar la factura.'
    return
  }
  saveError.value = ''
  isSaving.value = true
  try {
    const res = await axios.post('api/admin/billing/generate', {
      personId: invoice.value.personId,
      prevReading: 0,
      currentReading: invoice.value.currentReading,
      rate: invoice.value.ratePerM3,
      fixedCharge: invoice.value.fixedCharge,
      subsidy: invoice.value.subsidy,
      surcharges: invoice.value.recharge,
    })
    savedInvoice.value = res.data
  } catch (err: any) {
    saveError.value = err?.response?.data?.message ?? 'Error al generar la factura.'
  } finally {
    isSaving.value = false
  }
}

const downloadInvoice = async (invoiceId: number) => {
  try {
    const res = await axios.get(`api/invoices/download/${invoiceId}`)
    window.open(res.data.url, '_blank')
  } catch {
    alert('No se pudo obtener el enlace de descarga.')
  }
}

const resetForm = () => {
  savedInvoice.value = null
  selectedPerson.value = null
  searchQuery.value = ''
  invoice.value = { personId: null, currentReading: 0, ratePerM3: 2500, fixedCharge: 5000, subsidy: 0.15, recharge: 0 }
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
        <div class="billing-view">
          <div class="mgmt-header">
            <h1>Facturación Manual</h1>
            <p>Genera facturas individuales calculando automáticamente consumos y tarifas</p>
          </div>

          <!-- Success state -->
          <div v-if="savedInvoice" class="success-card">
            <div class="success-icon"><font-awesome-icon icon="check-circle" :size="32" /></div>
            <h2>Factura generada exitosamente</h2>
            <p class="success-ref">Consecutivo: <strong>FAC-{{ savedInvoice.id }}</strong></p>
            <p>Total: <strong>${{ Math.round(savedInvoice.amountDue).toLocaleString() }}</strong></p>
            <div class="success-actions">
              <button v-if="savedInvoice.pdfUrl" @click="downloadInvoice(savedInvoice.id)" class="btn btn--primary">
                <font-awesome-icon icon="download" :size="18" />
                <span>Descargar PDF</span>
              </button>
              <button @click="resetForm" class="btn btn--outline">
                <font-awesome-icon icon="plus" :size="18" />
                <span>Nueva Factura</span>
              </button>
            </div>
          </div>

          <div v-else class="billing-grid">
            <section class="billing-card billing-form">
              <h2><font-awesome-icon icon="calculator" :size="20" /> Datos de Consumo</h2>
              <div class="form-grid">
                <div class="form-group full-width" style="position:relative">
                  <label>Buscar Usuario (Nombre o Documento)</label>
                  <div class="input-with-search">
                    <input
                      type="text"
                      v-model="searchQuery"
                      placeholder="Ej: Juan Pérez o 1234567890"
                      @input="searchPersons"
                      @focus="searchPersons"
                      autocomplete="off"
                    >
                    <button class="btn-search" @click="searchPersons" :disabled="isSearching">
                      <font-awesome-icon :icon="isSearching ? 'spinner' : 'search'" :spin="isSearching" :size="18" />
                    </button>
                  </div>
                  <ul v-if="showDropdown && searchResults.length" class="search-dropdown">
                    <li
                      v-for="p in searchResults"
                      :key="p.id"
                      @mousedown.prevent="selectPerson(p)"
                      class="search-dropdown-item"
                    >
                      <span class="person-name">{{ p.fullName }}</span>
                      <span class="person-doc">{{ p.documentNumber }}</span>
                    </li>
                  </ul>
                  <p v-if="showDropdown && searchResults.length === 0 && !isSearching" class="no-results">Sin resultados</p>
                </div>

                <div class="form-group full-width" v-if="selectedPerson">
                  <div class="selected-person-badge">
                    <font-awesome-icon icon="user-check" />
                    {{ selectedPerson.fullName }} — {{ selectedPerson.documentNumber }}
                  </div>
                </div>

                <div class="form-group full-width">
                  <label>Lectura Actual (m³)</label>
                  <input type="number" v-model="invoice.currentReading" min="0">
                </div>

                <div class="form-group">
                  <label>Tarifa por m³</label>
                  <input type="number" v-model="invoice.ratePerM3">
                </div>

                <div class="form-group">
                  <label>Cargo Fijo</label>
                  <input type="number" v-model="invoice.fixedCharge">
                </div>

                <div class="form-group">
                  <label>Subsidio (%)</label>
                  <input type="number" step="0.01" v-model="invoice.subsidy" min="0" max="1">
                </div>

                <div class="form-group">
                  <label>Recargos Adicionales</label>
                  <input type="number" v-model="invoice.recharge">
                </div>
              </div>
            </section>

            <section class="billing-card billing-preview">
              <h2><font-awesome-icon icon="file-invoice" :size="20" /> Resumen de Liquidación</h2>

              <div class="preview-content">
                <div class="preview-row">
                  <span>Consumo del periodo:</span>
                  <strong>{{ consumption }} m³</strong>
                </div>
                <div class="preview-row">
                  <span>Valor Consumo:</span>
                  <span>${{ (consumption * invoice.ratePerM3).toLocaleString() }}</span>
                </div>
                <div class="preview-row">
                  <span>Cargo Fijo:</span>
                  <span>${{ invoice.fixedCharge.toLocaleString() }}</span>
                </div>
                <hr>
                <div class="preview-row">
                  <span>Subtotal:</span>
                  <span>${{ subtotal.toLocaleString() }}</span>
                </div>
                <div class="preview-row discount">
                  <span>Subsidio Aplicado ({{ (invoice.subsidy * 100).toFixed(0) }}%):</span>
                  <span>- ${{ Math.round(discount).toLocaleString() }}</span>
                </div>
                <div class="preview-row recharge">
                  <span>Recargos:</span>
                  <span>+ ${{ invoice.recharge.toLocaleString() }}</span>
                </div>
                <div class="preview-total">
                  <span>TOTAL A PAGAR:</span>
                  <strong>${{ Math.round(total).toLocaleString() }}</strong>
                </div>
              </div>

              <p v-if="saveError" class="save-error">{{ saveError }}</p>

              <div class="billing-actions">
                <button @click="handleSave" class="btn btn--primary" :disabled="isSaving">
                  <font-awesome-icon :icon="isSaving ? 'spinner' : 'save'" :spin="isSaving" :size="20" />
                  <span>{{ isSaving ? 'Generando...' : 'Generar Factura' }}</span>
                </button>
              </div>
            </section>
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

.billing-view {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.mgmt-header {
  h1 { font-size: 1.5rem; color: $color-text; }
  p { color: $color-text-muted; font-size: 0.9rem; }
}

.billing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;
}

.billing-card {
  background: white;
  padding: $spacing-lg;
  border-radius: 16px;
  box-shadow: $shadow-sm;

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    margin-bottom: $spacing-lg;
    color: $color-primary;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;

  .full-width { grid-column: 1 / -1; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  label { font-weight: 600; font-size: 0.85rem; color: $color-text-muted; }
  input {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
  }
}

.input-with-search {
  display: flex;
  gap: 8px;
  input { flex: 1; }
  .btn-search {
    background: $color-primary;
    color: white;
    border: none;
    border-radius: 8px;
    width: 45px;
    cursor: pointer;
  }
}

.preview-content {
  background: #f8fafc;
  padding: $spacing-md;
  border-radius: 12px;
  margin-bottom: $spacing-lg;

  .preview-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.95rem;

    &.discount { color: #166534; font-weight: 600; }
    &.recharge { color: #991b1b; font-weight: 600; }
  }

  hr { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }

  .preview-total {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-md;
    font-size: 1.25rem;
    color: $color-text;
    strong { color: $color-primary; }
  }
}

.billing-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  .btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }

  .export-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-sm;
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
    &:hover:not(:disabled) { background: darken($color-primary, 10%); }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
  }

  &--outline {
    background: transparent;
    border: 2px solid $color-primary;
    color: $color-primary;
    &:hover { background: $color-primary; color: white; }
  }
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  list-style: none;
  padding: 4px 0;
  margin: 4px 0 0;
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
}

.search-dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  &:hover { background: #f1f5f9; }

  .person-name { font-weight: 600; color: #2c3e50; font-size: 0.9rem; }
  .person-doc { font-size: 0.8rem; color: #64748b; }
}

.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  color: #64748b;
  font-size: 0.85rem;
  margin: 4px 0 0;
  z-index: 100;
}

.selected-person-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  color: $color-primary;
  font-weight: 600;
  font-size: 0.9rem;
}

.save-error {
  color: #991b1b;
  font-size: 0.85rem;
  margin-bottom: $spacing-sm;
}

.success-card {
  background: white;
  border-radius: 16px;
  box-shadow: $shadow-sm;
  padding: $spacing-xl;
  text-align: center;

  .success-icon {
    color: #16a34a;
    margin-bottom: $spacing-md;
  }

  h2 { font-size: 1.4rem; color: #16a34a; margin-bottom: $spacing-sm; }
  .success-ref { font-size: 1rem; color: $color-text-muted; margin-bottom: 4px; }
  p { color: $color-text; font-size: 1.1rem; }

  .success-actions {
    display: flex;
    justify-content: center;
    gap: $spacing-md;
    margin-top: $spacing-lg;
  }
}
</style>