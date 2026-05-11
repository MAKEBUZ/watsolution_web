<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import type { INoticia } from '@/shared/model/noticia.model'

const noticias = ref<INoticia[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')
const isFetching = ref(false)

const categories = [
  { label: 'Operativo', value: 'OPERATIVO' },
  { label: 'Institucional', value: 'INSTITUCIONAL' },
  { label: 'Urgente', value: 'URGENTE' },
]

onMounted(async () => {
  isFetching.value = true
  try {
    const res = await axios.get('api/public/noticias')
    noticias.value = res.data ?? []
  } catch {
    noticias.value = []
  } finally {
    isFetching.value = false
  }
})

const filtered = computed(() =>
  noticias.value.filter(n =>
    (!searchQuery.value || (n.title ?? '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (n.summary ?? '').toLowerCase().includes(searchQuery.value.toLowerCase())) &&
    (!selectedCategory.value || n.category === selectedCategory.value),
  ),
)

const categoryLabel = (cat?: string | null) => {
  const map: Record<string, string> = { OPERATIVO: 'Operativo', INSTITUCIONAL: 'Institucional', URGENTE: 'Urgente' }
  return map[cat ?? ''] ?? (cat ?? '')
}

const categoryColor = (cat?: string | null) => {
  if (cat === 'URGENTE') return '#ef4444'
  if (cat === 'OPERATIVO') return '#f59e0b'
  return '#0077be'
}

const formatDate = (date?: Date | null) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="cn-page">
    <!-- Hero -->
    <div class="cn-hero">
      <div class="cn-hero__inner">
        <h1 class="cn-hero__title">Centro de Noticias</h1>
        <p class="cn-hero__sub">Mantente informado sobre las novedades y el estado del servicio</p>
      </div>
    </div>

    <!-- Body -->
    <div class="cn-body">
      <!-- Sidebar filters -->
      <aside class="cn-filters">
        <div class="cn-filter-card">
          <h3>Búsqueda</h3>
          <div class="cn-search">
            <svg class="cn-search__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Buscar noticias...">
          </div>
        </div>

        <div class="cn-filter-card">
          <h3>Categorías</h3>
          <div class="cn-categories">
            <button
              :class="['cn-cat-btn', { active: selectedCategory === '' }]"
              @click="selectedCategory = ''"
            >Todas</button>
            <button
              v-for="cat in categories"
              :key="cat.value"
              :class="['cn-cat-btn', { active: selectedCategory === cat.value }]"
              @click="selectedCategory = cat.value"
            >{{ cat.label }}</button>
          </div>
        </div>
      </aside>

      <!-- News grid -->
      <main class="cn-grid">
        <div v-if="isFetching" class="cn-empty">
          <div class="cn-empty__icon">🔄</div>
          <p>Cargando noticias...</p>
        </div>

        <div v-else-if="filtered.length === 0" class="cn-empty">
          <div class="cn-empty__icon">📰</div>
          <p class="cn-empty__title">Sin noticias disponibles</p>
          <p class="cn-empty__sub">
            {{ searchQuery || selectedCategory ? 'No hay noticias que coincidan con tu búsqueda.' : 'Por el momento no hay noticias publicadas. Vuelve pronto.' }}
          </p>
          <button v-if="searchQuery || selectedCategory" class="cn-empty__reset" @click="searchQuery = ''; selectedCategory = ''">
            Ver todas las noticias
          </button>
        </div>

        <article v-for="item in filtered" :key="item.id" class="cn-card">
          <div class="cn-card__img">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" loading="lazy">
            <div v-else class="cn-card__placeholder"></div>
            <span class="cn-card__badge" :style="{ background: categoryColor(item.category) }">
              {{ categoryLabel(item.category) }}
            </span>
          </div>
          <div class="cn-card__body">
            <p class="cn-card__date">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>
              {{ formatDate(item.publishDate) }}
            </p>
            <h2 class="cn-card__title">{{ item.title }}</h2>
            <p class="cn-card__excerpt">{{ (item.summary || item.content || '').substring(0, 130) }}{{ (item.summary || item.content || '').length > 130 ? '...' : '' }}</p>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>

<style scoped>
.cn-page {
  background: #f8fafc;
  min-height: 100vh;
}

.cn-hero {
  background: linear-gradient(135deg, #0077be 0%, #004f82 100%);
  padding: 48px 24px;
  text-align: center;
  margin-bottom: 32px;
}

.cn-hero__title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px;
}

.cn-hero__sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

.cn-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 64px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .cn-body {
    grid-template-columns: 280px 1fr;
  }
}

.cn-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cn-filter-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.cn-filter-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px;
}

.cn-search {
  position: relative;
}

.cn-search__icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.cn-search input {
  width: 100%;
  padding: 8px 10px 8px 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #2c3e50;
  box-sizing: border-box;
}

.cn-search input:focus {
  outline: none;
  border-color: #0077be;
}

.cn-categories {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cn-cat-btn {
  text-align: left;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.cn-cat-btn:hover,
.cn-cat-btn.active {
  background: rgba(0, 119, 190, 0.1);
  color: #0077be;
  font-weight: 600;
}

.cn-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-content: start;
}

@media (min-width: 640px) {
  .cn-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.cn-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 64px 24px;
  background: #ffffff;
  border-radius: 16px;
  color: #64748b;
}

.cn-empty__icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.cn-empty__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.cn-empty__sub {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 20px;
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
}

.cn-empty__reset {
  background: #0077be;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cn-empty__reset:hover {
  background: #005f99;
}

.cn-card {
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.cn-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.cn-card__img {
  height: 180px;
  position: relative;
}

.cn-card__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cn-card__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
}

.cn-card__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #ffffff;
}

.cn-card__body {
  padding: 16px;
}

.cn-card__date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0 0 8px;
}

.cn-card__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px;
  line-height: 1.4;
}

.cn-card__excerpt {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}
</style>
