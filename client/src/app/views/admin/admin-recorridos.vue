<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { MapPin, Route, Search, X, ChevronUp, ChevronDown } from 'lucide-vue-next';
import AdminShell from '@/core/layout/admin-shell.vue';
import RouteMap from '@/components/mapcn/route-map.vue';
import Pagination from '@/shared/pagination.vue';
const people = ref<any[]>([]),
  selected = ref<any[]>([]),
  search = ref(''),
  page = ref(0),
  total = ref(0),
  busy = ref(false),
  error = ref('');
const candidates = ref<any[]>([]),
  locating = ref<any>(null),
  plan = ref<any>(null),
  manualLat = ref<number | null>(null),
  manualLng = ref<number | null>(null);
const size = 8;
const located = (p: any) => p.address?.latitude != null && p.address?.longitude != null;
const address = (p: any) =>
  [p.address?.street, p.address?.houseNumber, p.address?.neighborhood, p.address?.city].filter(Boolean).join(', ');
const markers = computed(() => {
  const rows = plan.value
    ? plan.value.stops.map((p: any) => ({ id: p.personId, name: p.name, longitude: p.coordinates[0], latitude: p.coordinates[1] }))
    : [...people.value, ...selected.value]
        .filter(located)
        .map(p => ({ id: p.id, name: p.fullName, longitude: Number(p.address.longitude), latitude: Number(p.address.latitude) }));
  return [...new Map(rows.map((p: any) => [p.id, p])).values()] as any[];
});
async function run(action: () => Promise<void>) {
  busy.value = true;
  error.value = '';
  try {
    await action();
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'No se pudo completar la operación. Revisa la conexión e intenta nuevamente.';
  } finally {
    busy.value = false;
  }
}
async function load() {
  await run(async () => {
    const res = await axios.get('api/people', { params: { page: page.value, size, search: search.value, sort: 'fullName,asc' } });
    people.value = res.data;
    total.value = Number(res.headers['x-total-count'] ?? res.data.length);
  });
}
function find() {
  page.value = 0;
  load();
}
function changePage(p: number) {
  page.value = p;
  load();
}
function toggle(p: any) {
  plan.value = null;
  const i = selected.value.findIndex(v => v.id === p.id);
  if (i >= 0) selected.value.splice(i, 1);
  else if (selected.value.length < 25) selected.value.push(p);
  else error.value = 'Puedes seleccionar hasta 25 viviendas por recorrido.';
}
function move(i: number, delta: number) {
  const rows = [...selected.value];
  [rows[i], rows[i + delta]] = [rows[i + delta], rows[i]];
  selected.value = rows;
  plan.value = null;
}
async function locate(p: any) {
  locating.value = p;
  candidates.value = [];
  manualLat.value = p.address?.latitude == null ? null : Number(p.address.latitude);
  manualLng.value = p.address?.longitude == null ? null : Number(p.address.longitude);
  await run(async () => {
    candidates.value = (await axios.get(`api/admin/routes/people/${p.id}/geocode`)).data;
  });
}
async function saveLocation(p: any) {
  if (!locating.value) return;
  await run(async () => {
    await axios.put(`api/admin/routes/people/${locating.value.id}/location`, { latitude: p.latitude, longitude: p.longitude });
    locating.value.address = { ...locating.value.address, latitude: p.latitude, longitude: p.longitude };
    selected.value = selected.value.map(row => (row.id === locating.value.id ? { ...row, address: { ...locating.value.address } } : row));
    plan.value = null;
    locating.value = null;
  });
}
async function generate() {
  await run(async () => {
    plan.value = (await axios.post('api/admin/routes/plan', { personIds: selected.value.map(p => p.id) })).data;
  });
}
onMounted(load);
</script>
<template>
  <AdminShell
    ><div class="routes-page">
      <header>
        <p class="eyebrow">OPERACIÓN EN CAMPO · ADMINISTRACIÓN</p>
        <h1><Route :size="30" /> Mapa y recorridos</h1>
        <p>Ubica las viviendas y prepara la próxima jornada de lecturas.</p>
      </header>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p v-if="busy" role="status">Procesando…</p>
      <div class="route-layout">
        <section class="houses">
          <form class="search" @submit.prevent="find">
            <input v-model="search" aria-label="Buscar viviendas" placeholder="Nombre, documento o suscriptor" /><button
              :disabled="busy"
              aria-label="Buscar"
            >
              <Search :size="18" />
            </button>
          </form>
          <article v-for="p in people" :key="p.id">
            <label
              ><input
                type="checkbox"
                :checked="selected.some(s => s.id === p.id)"
                :disabled="busy || !located(p)"
                @change="toggle(p)"
              /><strong>{{ p.fullName }}</strong></label
            >
            <p>{{ address(p) || 'Sin dirección registrada' }}</p>
            <div class="house-actions">
              <span :class="{ pending: !located(p) }">{{ located(p) ? 'Ubicación guardada' : 'Por ubicar' }}</span
              ><button :disabled="busy || !p.address" @click="locate(p)">
                <MapPin :size="15" /> {{ located(p) ? 'Revisar' : 'Ubicar' }}
              </button>
            </div>
          </article>
          <p v-if="!busy && !people.length">No se encontraron viviendas.</p>
          <Pagination :page="page" :total="total" :size="size" :busy="busy" @change="changePage" />
        </section>
        <section class="map-section">
          <RouteMap :stops="markers" :line="plan?.geometry.coordinates ?? []" @error="error = $event" />
          <p class="attribution">Mapa: mapcn / MapLibre · © OpenStreetMap · © CARTO. Direcciones: Nominatim. Recorridos: OSRM.</p>
          <div class="route-card">
            <h2>
              Tu recorrido <span>{{ selected.length }}/25 viviendas</span>
            </h2>
            <p>
              La primera vivienda será el inicio y la última, el destino. Se ordenan las paradas intermedias para sugerir un recorrido en
              vehículo.
            </p>
            <ol>
              <li v-for="(p, i) in selected" :key="p.id">
                <span>{{ p.fullName }}</span
                ><button :disabled="busy || i === 0" aria-label="Mover parada arriba" @click="move(i, -1)"><ChevronUp :size="16" /></button
                ><button :disabled="busy || i === selected.length - 1" aria-label="Mover parada abajo" @click="move(i, 1)">
                  <ChevronDown :size="16" /></button
                ><button :disabled="busy" aria-label="Retirar parada" @click="toggle(p)"><X :size="16" /></button>
              </li>
            </ol>
            <button class="primary" :disabled="busy || selected.length < 2" @click="generate">
              <Route :size="18" /> Generar recorrido
            </button>
            <div v-if="plan" class="result">
              <strong>{{ (plan.distance / 1000).toFixed(1) }} km · {{ Math.ceil(plan.duration / 60) }} min estimados</strong>
              <p>Tiempo de conducción; no incluye las visitas ni el tráfico en tiempo real.</p>
              <ol>
                <li v-for="s in plan.stops" :key="s.personId">{{ s.name }} — {{ s.address }}</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
      <section v-if="locating" class="location-editor" aria-label="Confirmar ubicación">
        <header>
          <h2>Ubicar: {{ locating.fullName }}</h2>
          <button :disabled="busy" @click="locating = null">Cerrar</button>
        </header>
        <p>{{ address(locating) }}</p>
        <p>Comprueba la dirección antes de guardar una coincidencia. Si no aparece, introduce las coordenadas de la vivienda.</p>
        <div v-for="(c, i) in candidates" :key="i" class="candidate">
          <span
            >{{ c.label }}<small>{{ c.latitude }}, {{ c.longitude }}</small></span
          ><button :disabled="busy" @click="saveLocation(c)">Confirmar ubicación</button>
        </div>
        <p v-if="!busy && !candidates.length">No se encontraron coincidencias.</p>
        <form @submit.prevent="saveLocation({ latitude: manualLat, longitude: manualLng })">
          <label>Latitud<input v-model.number="manualLat" type="number" step="any" min="-90" max="90" required /></label
          ><label>Longitud<input v-model.number="manualLng" type="number" step="any" min="-180" max="180" required /></label
          ><button :disabled="busy" class="primary">Guardar coordenadas</button>
        </form>
      </section>
    </div></AdminShell
  >
</template>
<style scoped>
.routes-page {
  padding: 16px;
  color: #193f43;
}
h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 30px;
}
.eyebrow {
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #176b61;
  font-weight: 700;
}
header {
  margin-bottom: 28px;
}
.route-layout {
  display: grid;
  grid-template-columns: minmax(270px, 340px) minmax(0, 1fr);
  gap: 24px;
}
.houses,
.route-card,
.location-editor {
  background: white;
  border: 1px solid #dce7e0;
  border-radius: 16px;
  padding: 20px;
}
.search {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}
input:not([type='checkbox']) {
  width: 100%;
  border: 1px solid #cbded4;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
}
article {
  padding: 18px 0;
  border-top: 1px solid #e5ede8;
}
article label {
  display: flex;
  gap: 10px;
  font-size: 14px;
}
article p {
  font-size: 12px;
  line-height: 1.6;
  color: #698079;
  margin: 10px 0;
}
.house-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.house-actions span {
  font-size: 10px;
  color: #176b61;
}
.house-actions .pending {
  color: #986517;
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid #c3d9cc;
  background: white;
  color: #176b61;
  border-radius: 7px;
  font-size: 12px;
}
button:disabled {
  opacity: 0.45;
}
.primary {
  background: #176b61;
  color: white;
  padding: 12px 18px;
}
.attribution {
  font-size: 10px;
  color: #667f76;
  margin: 10px 0 20px;
}
.route-card h2 {
  font-size: 21px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.route-card h2 span {
  font-size: 12px;
  color: #6b7d78;
}
.route-card > p,
.location-editor > p {
  font-size: 13px;
  line-height: 1.6;
}
.route-card li {
  padding: 8px;
  line-height: 1.6;
}
.route-card li span {
  display: inline-block;
  margin-right: 12px;
}
.route-card li button {
  padding: 3px;
}
.result {
  margin-top: 24px;
  padding: 16px;
  border-radius: 12px;
  background: #eff7f1;
  font-size: 13px;
}
.location-editor {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(740px, calc(100vw - 32px));
  max-height: 80dvh;
  overflow: auto;
  z-index: 2500;
  box-shadow: 0 12px 60px #193f4340;
}
.location-editor header,
.candidate {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}
.location-editor h2 {
  font-size: 20px;
}
.candidate {
  padding: 14px 0;
  border-top: 1px solid #dfe9e2;
  font-size: 13px;
}
.candidate small {
  display: block;
  color: #708278;
}
.location-editor form {
  display: flex;
  gap: 14px;
  align-items: end;
  margin-top: 20px;
}
.location-editor label {
  font-size: 12px;
}
.error {
  background: #fff0e9;
  padding: 16px;
  border-radius: 10px;
  color: #8e422c;
}
@media (max-width: 1100px) {
  .route-layout {
    grid-template-columns: 1fr;
  }
  .map-section {
    grid-row: 1;
  }
  .houses {
    max-width: 100%;
  }
  .location-editor form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
