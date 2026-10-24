<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { formatNewsDate } from '@/shared/news-date';
import { Newspaper, ArrowLeft, CalendarDays } from 'lucide-vue-next';
const route = useRoute(),
  item = ref<any>(null),
  error = ref(''),
  loading = ref(false);
let generation = 0;
async function load() {
  const id = ++generation;
  loading.value = true;
  error.value = '';
  item.value = null;
  try {
    const { data } = await axios.get('api/public/noticias/' + route.params.id);
    if (id === generation) item.value = data;
  } catch {
    if (id === generation) error.value = 'La noticia no está disponible o no se pudo cargar.';
  } finally {
    if (id === generation) loading.value = false;
  }
}
watch(() => route.params.id, load, { immediate: true });
</script>
<template>
  <article class="news-detail">
    <router-link to="/noticias"><ArrowLeft :size="17" /> Todas las noticias</router-link>
    <p v-if="loading" role="status">Cargando noticia…</p>
    <p v-if="error" role="alert">{{ error }} <button @click="load">Reintentar</button></p>
    <template v-if="item"
      ><header>
        <span class="category"><Newspaper :size="16" /> {{ item.category }}</span>
        <h1>{{ item.title }}</h1>
        <p class="date"><CalendarDays :size="16" /> {{ formatNewsDate(item.publishDate) }}</p>
      </header>
      <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" />
      <p class="summary">{{ item.summary }}</p>
      <div class="content">{{ item.content }}</div></template
    >
  </article>
</template>
<style scoped>
.news-detail {
  max-width: 880px;
  margin: 40px auto 80px;
  padding: 24px;
  color: #193f43;
}
.news-detail > a,
.date,
.category {
  display: flex;
  align-items: center;
  gap: 8px;
}
.news-detail header {
  margin: 40px 0 24px;
}
.category {
  font-size: 12px;
  letter-spacing: 0.1em;
  color: #176b61;
}
h1 {
  font-size: clamp(28px, 5vw, 46px);
  line-height: 1.15;
  margin: 20px 0;
}
.date {
  color: #647875;
  font-size: 13px;
}
img {
  width: 100%;
  max-height: 460px;
  object-fit: cover;
  border-radius: 18px;
}
.summary {
  font-size: 21px;
  line-height: 1.6;
  margin: 28px 0;
}
.content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
  font-size: 17px;
}
</style>
