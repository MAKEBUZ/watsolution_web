<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNewsStore } from '../../stores/news'
import { Search, Calendar, Tag, ChevronRight } from 'lucide-vue-next'

const newsStore = useNewsStore()
const searchQuery = ref('')
const selectedCategory = ref('todas')

const filteredNews = computed(() => {
  return newsStore.news.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'todas' || n.category === selectedCategory.value
    return matchesSearch && matchesCategory && !n.isArchived
  })
})

const categories = [
  { label: 'Todas', value: 'todas' },
  { label: 'Operativo', value: 'operativo' },
  { label: 'Institucional', value: 'institucional' },
  { label: 'Comunidad', value: 'comunidad' }
]

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<template>
  <div class="news-list-view">
    <div class="news-hero">
      <div class="container">
        <h1>Centro de Noticias</h1>
        <p>Mantente informado sobre las novedades y el estado del servicio</p>
      </div>
    </div>

    <div class="container news-content">
      <aside class="news-filters">
        <div class="filter-card">
          <h3>Búsqueda</h3>
          <div class="search-box">
            <Search class="search-icon" :size="18" />
            <input type="text" v-model="searchQuery" placeholder="Buscar noticias...">
          </div>
        </div>

        <div class="filter-card">
          <h3>Categorías</h3>
          <div class="category-list">
            <button 
              v-for="cat in categories" 
              :key="cat.value"
              :class="['category-btn', { active: selectedCategory === cat.value }]"
              @click="selectedCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>
      </aside>

      <main class="news-grid">
        <div v-if="filteredNews.length === 0" class="no-results">
          No se encontraron noticias con los criterios seleccionados.
        </div>
        
        <article v-for="item in filteredNews" :key="item.id" class="news-card">
          <div class="news-card__image">
            <img :src="item.image" :alt="item.title" loading="lazy">
            <span :class="['news-card__category', item.category]">
              {{ item.category }}
            </span>
          </div>
          <div class="news-card__body">
            <div class="news-card__meta">
              <span><Calendar :size="14" /> {{ formatDate(item.date) }}</span>
            </div>
            <h2 class="news-card__title">{{ item.title }}</h2>
            <p class="news-card__excerpt">{{ item.content.substring(0, 120) }}...</p>
            <a href="#" class="news-card__link">Leer más <ChevronRight :size="16" /></a>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.news-list-view {
  padding-top: 70px;
  background-color: $color-bg;
  min-height: 100vh;
}

.news-hero {
  background: linear-gradient(135deg, $color-primary 0%, color.adjust($color-primary, $lightness: -20%) 100%);
  color: white;
  padding: $spacing-xl 0;
  text-align: center;
  margin-bottom: $spacing-xl;

  h1 {
    font-size: 2.5rem;
    margin-bottom: $spacing-sm;
  }
}

.news-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;

  @include desktop {
    grid-template-columns: 300px 1fr;
  }
}

.news-filters {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.filter-card {
  background: white;
  padding: $spacing-md;
  border-radius: 16px;
  box-shadow: $shadow-sm;

  h3 {
    font-size: 1.1rem;
    margin-bottom: $spacing-md;
    color: $color-text;
  }
}

.search-box {
  position: relative;
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: $color-text-muted;
  }
  input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.category-btn {
  text-align: left;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: $color-text;
  cursor: pointer;
  transition: all 0.3s;

  &:hover, &.active {
    background: color.change($color-primary, $alpha: 0.1);
    color: $color-primary;
    font-weight: 600;
  }
}

.news-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }
}

.news-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-md;
  }

  &__image {
    height: 200px;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__category {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    color: white;

    &.operativo { background: #f59e0b; }
    &.institucional { background: $color-primary; }
    &.comunidad { background: #10b981; }
  }

  &__body {
    padding: $spacing-md;
  }

  &__meta {
    font-size: 0.85rem;
    color: $color-text-muted;
    display: flex;
    gap: 12px;
    margin-bottom: $spacing-xs;
    span { display: flex; align-items: center; gap: 4px; }
  }

  &__title {
    font-size: 1.25rem;
    margin-bottom: $spacing-sm;
    color: $color-text;
  }

  &__excerpt {
    font-size: 0.95rem;
    color: $color-text-muted;
    line-height: 1.5;
    margin-bottom: $spacing-md;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $color-primary;
    font-weight: 600;
    font-size: 0.9rem;
  }
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: $spacing-xl;
  background: white;
  border-radius: 16px;
  color: $color-text-muted;
}
</style>
