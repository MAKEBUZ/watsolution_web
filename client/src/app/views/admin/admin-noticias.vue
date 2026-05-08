<template>
  <div class="p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="font-weight-bold mb-1">Gestión de Noticias</h3>
        <p class="text-muted mb-0">Publica y administra el contenido informativo del acueducto</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <font-awesome-icon icon="plus" class="mr-2" /> Nueva Noticia
      </button>
    </div>

    <!-- Search -->
    <div class="search-box mb-4" style="max-width: 440px;">
      <font-awesome-icon icon="search" class="search-icon text-muted" />
      <input
        class="search-input form-control"
        type="text"
        placeholder="Buscar por título..."
        v-model="searchQuery"
      />
    </div>

    <!-- Table -->
    <div class="card shadow-sm">
      <div v-if="isFetching" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <table v-else class="table table-hover mb-0">
        <thead class="bg-light">
          <tr>
            <th class="border-0 text-muted small font-weight-600 px-4">FECHA</th>
            <th class="border-0 text-muted small font-weight-600">TÍTULO</th>
            <th class="border-0 text-muted small font-weight-600">CATEGORÍA</th>
            <th class="border-0 text-muted small font-weight-600">ESTADO</th>
            <th class="border-0 text-muted small font-weight-600">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in filtered" :key="n.id">
            <td class="align-middle text-muted small px-4">{{ formatDate(n.publishDate) }}</td>
            <td class="align-middle font-weight-600">{{ n.title }}</td>
            <td class="align-middle">
              <span class="noticia-badge" :class="categoryClass(n.category)">{{ n.category }}</span>
            </td>
            <td class="align-middle">
              <span class="status-badge" :class="n.status === 'ACTIVE' ? 'status-active' : 'status-inactive'">
                {{ n.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="align-middle">
              <button class="btn btn-icon text-muted" @click="openEdit(n)" title="Editar">
                <font-awesome-icon icon="pencil-alt" />
              </button>
              <button class="btn btn-icon text-muted" @click="archiveNoticia(n)" title="Archivar">
                <font-awesome-icon icon="archive" />
              </button>
              <button class="btn btn-icon text-danger" @click="deleteNoticia(n.id)" title="Eliminar">
                <font-awesome-icon icon="trash" />
              </button>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="5" class="text-center text-muted py-4">No hay noticias.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <b-modal v-model="showModal" :title="editForm.id ? 'Editar Noticia' : 'Nueva Noticia'" hide-footer size="lg">
      <div class="form-group">
        <label class="font-weight-600">Título *</label>
        <input type="text" class="form-control" v-model="editForm.title" />
      </div>
      <div class="form-group">
        <label class="font-weight-600">Resumen</label>
        <textarea class="form-control" rows="2" v-model="editForm.summary"></textarea>
      </div>
      <div class="form-group">
        <label class="font-weight-600">Contenido</label>
        <textarea class="form-control" rows="4" v-model="editForm.content"></textarea>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label class="font-weight-600">Categoría</label>
            <select class="form-control" v-model="editForm.category">
              <option value="OPERATIVO">Operativo</option>
              <option value="INSTITUCIONAL">Institucional</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label class="font-weight-600">Estado</label>
            <select class="form-control" v-model="editForm.status">
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="font-weight-600">URL de Imagen</label>
        <input type="text" class="form-control" placeholder="https://..." v-model="editForm.imageUrl" />
      </div>
      <div class="form-group">
        <label class="font-weight-600">Fecha de Publicación</label>
        <input type="date" class="form-control" v-model="editForm.publishDate" />
      </div>
      <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-secondary mr-2" @click="showModal = false">Cancelar</button>
        <button class="btn btn-primary" @click="saveNoticia" :disabled="isSaving">
          <font-awesome-icon :icon="isSaving ? 'spinner' : 'save'" :spin="isSaving" class="mr-1" />
          {{ isSaving ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./admin-noticias.component.ts"></script>

<style scoped>
.font-weight-600 { font-weight: 600; }

/* Search */
.search-box { position: relative; }
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

/* Category badges */
.noticia-badge {
  display: inline-block;
  padding: 0.3em 0.75em;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.badge-urgente       { background: #fee2e2; color: #dc2626; }
.badge-operativo     { background: #fef3c7; color: #d97706; }
.badge-institucional { background: #dbeafe; color: #2563eb; }

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.25em 0.65em;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-active   { background: #dcfce7; color: #16a34a; }
.status-inactive { background: #f3f4f6; color: #6b7280; }

/* Action buttons */
.btn-icon {
  padding: 0.3rem 0.45rem;
  line-height: 1;
  background: none;
  border: none;
  font-size: 0.9rem;
}
</style>
