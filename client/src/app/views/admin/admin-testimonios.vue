<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Quote, Plus, Pencil, Trash2 } from 'lucide-vue-next';
import AdminShell from '@/core/layout/admin-shell.vue';
const items = ref<any[]>([]),
  busy = ref(false),
  error = ref(''),
  editing = ref(false);
const empty = () => ({ id: null as number | null, name: '', role: '', company: '', text: '', published: false, position: 0 });
const form = ref(empty());
async function load() {
  busy.value = true;
  try {
    items.value = (await axios.get('api/admin/testimonials')).data;
  } catch {
    error.value = 'No se pudieron cargar los testimonios.';
  } finally {
    busy.value = false;
  }
}
function edit(item?: any) {
  form.value = item ? { ...item } : empty();
  error.value = '';
  editing.value = true;
}
async function save() {
  busy.value = true;
  error.value = '';
  try {
    const { id, ...body } = form.value;
    if (id) await axios.put('api/admin/testimonials/' + id, body);
    else await axios.post('api/admin/testimonials', body);
    editing.value = false;
    await load();
  } catch {
    error.value = 'No se pudo guardar. Revisa los campos e intenta de nuevo.';
  } finally {
    busy.value = false;
  }
}
async function remove(item: any) {
  if (!window.confirm(`¿Eliminar el testimonio de ${item.name}?`)) return;
  busy.value = true;
  try {
    await axios.delete('api/admin/testimonials/' + item.id);
    await load();
  } catch {
    error.value = 'No se pudo eliminar el testimonio.';
  } finally {
    busy.value = false;
  }
}
onMounted(load);
</script>
<template>
  <AdminShell
    ><div class="testimonials-admin">
      <header>
        <div>
          <p class="eyebrow">CONTENIDO DEL INICIO</p>
          <h1>Testimonios</h1>
          <p>Administra las experiencias que aparecen en la página principal.</p>
        </div>
        <button class="primary" @click="edit()"><Plus :size="18" /> Nuevo testimonio</button>
      </header>
      <p v-if="error" role="alert">{{ error }} <button :disabled="busy" @click="load">Reintentar</button></p>
      <p v-if="busy" role="status">Actualizando…</p>
      <form v-if="editing" class="editor" @submit.prevent="save">
        <h2>{{ form.id ? 'Editar testimonio' : 'Nuevo testimonio' }}</h2>
        <div class="fields">
          <label>Nombre<input v-model="form.name" required maxlength="120" /></label
          ><label>Cargo<input v-model="form.role" maxlength="120" /></label
          ><label>Organización<input v-model="form.company" maxlength="160" /></label
          ><label>Orden de presentación<input v-model.number="form.position" type="number" min="0" max="10000" required /></label>
        </div>
        <label>Testimonio<textarea v-model="form.text" rows="5" required maxlength="3000" /></label
        ><label class="check"><input v-model="form.published" type="checkbox" /> Publicar en el inicio</label>
        <div class="actions">
          <button type="submit" class="primary" :disabled="busy">Guardar cambios</button
          ><button type="button" :disabled="busy" @click="editing = false">Cancelar</button>
        </div>
      </form>
      <div v-if="!busy && !items.length" class="empty">
        <Quote :size="36" />
        <h2>Aún no hay testimonios</h2>
        <p>Crea el primero y publícalo cuando esté listo.</p>
      </div>
      <div class="grid">
        <article v-for="item in items" :key="item.id">
          <div class="card-top">
            <Quote :size="26" /><span>{{ item.published ? 'Publicado' : 'Borrador' }}</span>
          </div>
          <blockquote>{{ item.text }}</blockquote>
          <strong>{{ item.name }}</strong>
          <p>{{ [item.role, item.company].filter(Boolean).join(' · ') }}</p>
          <div class="actions">
            <button :disabled="busy" @click="edit(item)"><Pencil :size="16" /> Editar</button
            ><button :disabled="busy" @click="remove(item)"><Trash2 :size="16" /> Eliminar</button>
          </div>
        </article>
      </div>
    </div></AdminShell
  >
</template>
<style scoped>
.testimonials-admin {
  color: #193f43;
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}
.eyebrow {
  letter-spacing: 0.13em;
  font-size: 11px;
  font-weight: 700;
  color: #176b61;
}
h1 {
  font-size: 32px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}
article,
.editor,
.empty {
  padding: 28px;
  border: 1px solid #dbe7e0;
  border-radius: 16px;
  background: white;
}
.editor {
  margin-bottom: 28px;
}
.card-top {
  display: flex;
  justify-content: space-between;
  color: #176b61;
}
.card-top span {
  font-size: 12px;
  border-radius: 20px;
  background: #e4f1e9;
  padding: 6px 12px;
}
blockquote {
  font-size: 18px;
  line-height: 1.7;
  margin: 24px 0;
  white-space: pre-wrap;
}
article p {
  font-size: 13px;
  color: #637a75;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
button {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #bdd5ca;
  background: white;
  color: #176b61;
  border-radius: 8px;
  padding: 11px 14px;
}
.primary {
  background: #176b61;
  color: white;
  border-color: #176b61;
}
label {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
  font-size: 13px;
}
input,
textarea {
  padding: 12px;
  border: 1px solid #cbdcd4;
  border-radius: 8px;
  width: 100%;
}
.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.check {
  display: flex;
  align-items: center;
}
.check input {
  width: auto;
}
.empty {
  text-align: center;
}
@media (max-width: 650px) {
  header {
    align-items: flex-start;
    flex-direction: column;
  }
  .fields {
    grid-template-columns: 1fr;
  }
  .testimonials-admin {
    padding: 10px;
  }
}
</style>
