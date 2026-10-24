<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ page: number; size: number; total: number; busy?: boolean }>();
const emit = defineEmits<{ change: [page: number] }>();
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.size)));
</script>
<template>
  <nav class="ws-pagination" aria-label="Paginación">
    <span>{{ total ? page * size + 1 : 0 }}–{{ Math.min((page + 1) * size, total) }} de {{ total }}</span>
    <div>
      <button type="button" :disabled="busy || page === 0" @click="emit('change', page - 1)">Anterior</button>
      <label
        >Página
        <select :value="page" :disabled="busy" @change="emit('change', Number(($event.target as HTMLSelectElement).value))">
          <option v-for="n in pages" :key="n" :value="n - 1">{{ n }}</option>
        </select>
        de {{ pages }}</label
      >
      <button type="button" :disabled="busy || page + 1 >= pages" @click="emit('change', page + 1)">Siguiente</button>
    </div>
  </nav>
</template>
<style scoped>
.ws-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 8px;
  border-top: 1px solid #dde7e3;
  color: #526a69;
  font-size: 13px;
}
.ws-pagination div {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ws-pagination button,
.ws-pagination select {
  border: 1px solid #bdd3cb;
  background: white;
  color: #176b61;
  border-radius: 8px;
  padding: 9px 12px;
}
.ws-pagination button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.ws-pagination select {
  max-width: 80px;
}
</style>
