<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { Bell, CheckCheck, Trash2, FileText } from 'lucide-vue-next';
import Pagination from '@/shared/pagination.vue';
import { useNotifications, type AppNotification } from '@/composables/useNotifications';
const { fetchAll } = useNotifications();
const items = ref<AppNotification[]>([]),
  total = ref(0),
  page = ref(0),
  busy = ref(false),
  error = ref('');
const size = 10;
let generation = 0;
onBeforeUnmount(() => {
  generation++;
});
async function load() {
  const current = ++generation;
  busy.value = true;
  error.value = '';
  try {
    const { data } = await axios.get('api/notifications/page', { params: { page: page.value, size } });
    if (current !== generation) return;
    items.value = data.items;
    total.value = data.total;
    if (page.value > 0 && !items.value.length) {
      page.value--;
      await load();
    }
  } catch {
    if (current === generation) error.value = 'No se pudieron cargar las notificaciones.';
  } finally {
    if (current === generation) busy.value = false;
  }
}
async function action(method: 'patch' | 'delete', path: string) {
  busy.value = true;
  error.value = '';
  try {
    await axios[method]('api/notifications/' + path);
    await Promise.all([load(), fetchAll()]);
  } catch {
    error.value = 'No se pudo completar la acción. Intenta nuevamente.';
  } finally {
    busy.value = false;
  }
}
function changePage(value: number) {
  page.value = value;
  load();
}
onMounted(load);
</script>
<template>
  <section class="notification-page">
    <router-link to="/portal">← Volver al portal</router-link>
    <header>
      <div>
        <p class="eyebrow">TU BANDEJA</p>
        <h1><Bell :size="28" /> Notificaciones</h1>
        <p>Facturas, vencimientos y novedades de tu cuenta.</p>
      </div>
      <div class="actions">
        <button :disabled="busy || !total" @click="action('patch', 'read-all')"><CheckCheck :size="16" /> Marcar todas como leídas</button
        ><button :disabled="busy || !total" @click="action('delete', 'read')"><Trash2 :size="16" /> Eliminar leídas</button>
      </div>
    </header>
    <p v-if="error" role="alert">{{ error }} <button @click="load">Reintentar</button></p>
    <p v-if="busy" role="status">Actualizando…</p>
    <div v-else-if="!items.length && !error" class="empty">
      <Bell :size="40" />
      <h2>Todo al día</h2>
      <p>No tienes notificaciones.</p>
    </div>
    <article v-for="n in items" :key="n.id" :class="{ unread: !n.read }">
      <FileText :size="24" />
      <div class="body">
        <span class="state">{{ n.read ? 'Leída' : 'Nueva' }}</span>
        <h2>{{ n.title }}</h2>
        <p>{{ n.message }}</p>
        <time>{{ new Date(n.createdAt).toLocaleString('es-CO') }}</time
        ><router-link v-if="n.invoiceId" :to="'/invoice/' + n.invoiceId + '/view'">Consultar factura</router-link>
      </div>
      <div class="actions">
        <button v-if="!n.read" :disabled="busy" @click="action('patch', n.id + '/read')"><CheckCheck :size="17" /> Marcar leída</button
        ><button :disabled="busy" :aria-label="'Eliminar: ' + n.title" @click="action('delete', String(n.id))">
          <Trash2 :size="17" /> Eliminar
        </button>
      </div>
    </article>
    <Pagination :page="page" :size="size" :total="total" :busy="busy" @change="changePage" />
  </section>
</template>
<style scoped>
.notification-page {
  max-width: 1100px;
  margin: auto;
  padding: 40px 24px 70px;
  color: #193f43;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin: 32px 0;
}
.eyebrow,
.state {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #176b61;
}
h1 {
  display: flex;
  gap: 12px;
  align-items: center;
}
h2 {
  font-size: 17px;
  margin: 8px 0;
}
article {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: white;
  border: 1px solid #dbe7e2;
  border-radius: 14px;
  margin: 12px 0;
}
.unread {
  border-left: 4px solid #176b61;
  background: #f5faf7;
}
.body {
  flex: 1;
}
.body a {
  display: block;
  margin-top: 12px;
}
time {
  font-size: 12px;
  color: #607472;
}
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
button {
  display: flex;
  gap: 7px;
  align-items: center;
  background: white;
  color: #176b61;
  padding: 9px 12px;
  border: 1px solid #bad3ca;
  border-radius: 8px;
}
button:disabled {
  opacity: 0.5;
}
.empty {
  text-align: center;
  padding: 70px;
  background: #f4f8f6;
  border-radius: 16px;
}
@media (max-width: 650px) {
  header,
  article {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
