<template>
  <div>
    <!-- Hero -->
    <div class="noticias-hero text-white text-center">
      <h1 class="display-4 font-weight-bold mb-2">Centro de Noticias</h1>
      <p class="lead mb-0">Mantente informado sobre las novedades y el estado del servicio</p>
    </div>

    <!-- Content -->
    <div class="container-fluid px-4 py-4" style="background: #f0f5fb; min-height: 60vh;">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-4">
          <!-- Search -->
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <h6 class="font-weight-bold mb-3">Búsqueda</h6>
              <div class="search-box">
                <font-awesome-icon icon="search" class="search-icon text-muted" />
                <input
                  type="text"
                  class="search-input form-control"
                  placeholder="Buscar noticias..."
                  v-model="searchQuery"
                />
              </div>
            </div>
          </div>

          <!-- Categories -->
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="font-weight-bold mb-3">Categorías</h6>
              <ul class="cat-list list-unstyled mb-0">
                <li
                  class="cat-item"
                  :class="{ 'cat-item-active': selectedCategory === '' }"
                  @click="selectedCategory = ''"
                >Todas</li>
                <li
                  v-for="cat in categories"
                  :key="cat"
                  class="cat-item"
                  :class="{ 'cat-item-active': selectedCategory === cat }"
                  @click="selectedCategory = cat"
                >{{ categoryLabel(cat) }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- News Grid -->
        <div class="col-lg-9">
          <div v-if="isFetching" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-else-if="!filtered.length" class="text-center py-5 text-muted">
            <font-awesome-icon icon="newspaper" class="fa-3x mb-3" />
            <p>No hay noticias disponibles.</p>
          </div>

          <div v-else class="row">
            <div class="col-md-6 mb-4" v-for="noticia in filtered" :key="noticia.id">
              <div class="card noticia-card h-100">
                <!-- Image with badge overlay -->
                <div class="noticia-img-wrap">
                  <img
                    v-if="noticia.imageUrl"
                    :src="noticia.imageUrl"
                    class="noticia-img"
                    :alt="noticia.title"
                  />
                  <div v-else class="noticia-img-placeholder d-flex align-items-center justify-content-center">
                    <font-awesome-icon icon="newspaper" class="fa-2x text-muted" />
                  </div>
                  <span class="noticia-badge" :class="categoryClass(noticia.category)">
                    {{ noticia.category }}
                  </span>
                </div>

                <!-- Body -->
                <div class="card-body">
                  <div class="d-flex align-items-center mb-2">
                    <font-awesome-icon icon="calendar" class="text-muted mr-1" style="font-size:0.72rem;" />
                    <small class="text-muted">{{ formatDate(noticia.publishDate) }}</small>
                  </div>
                  <h5 class="card-title font-weight-bold" style="font-size:1rem;">{{ noticia.title }}</h5>
                  <p class="card-text text-muted small">{{ noticia.summary }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./centro-noticias.component.ts"></script>

<style scoped>
/* Hero */
.noticias-hero {
  background: linear-gradient(160deg, #1a3a5c 0%, #1a6eb5 100%);
  padding: 4.5rem 2rem;
}

/* Search */
.search-box { position: relative; }
.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  font-size: 0.8rem;
}
.search-input {
  padding-left: 33px;
  border-radius: 8px;
}

/* Category list */
.cat-list { margin: 0; }
.cat-item {
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #374151;
  transition: background 0.15s, color 0.15s;
  margin-bottom: 2px;
}
.cat-item:hover { background: #f0f5fb; }
.cat-item-active {
  background: #2563eb;
  color: white;
  font-weight: 600;
}

/* News cards */
.noticia-card {
  border: none;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: transform 0.18s, box-shadow 0.18s;
}
.noticia-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.noticia-img-wrap { position: relative; }
.noticia-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}
.noticia-img-placeholder {
  height: 200px;
  background: #e9ecef;
}

/* Category badge over image */
.noticia-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.3em 0.75em;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.badge-urgente       { background: #fee2e2; color: #dc2626; }
.badge-operativo     { background: #fef3c7; color: #d97706; }
.badge-institucional { background: #dbeafe; color: #2563eb; }
</style>
