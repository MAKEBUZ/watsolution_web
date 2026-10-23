<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAccountStore } from '@/shared/config/store/account-store';
const route = useRoute();
const router = useRouter();
const account = useAccountStore();
const menu = ref<HTMLDetailsElement | null>(null);
const links = [
  ['Resumen', '/admin/resumen'],
  ['Actividad', '/admin/actividad'],
  ['Usuarios', '/admin/usuarios'],
  ['Facturación', '/admin/facturacion'],
  ['Noticias', '/admin/noticias'],
];
function close() {
  if (menu.value) menu.value.open = false;
}
function escape() {
  close();
  menu.value?.querySelector('summary')?.focus();
}
function logout() {
  account.logout();
  router.push('/login');
}
watch(() => route.fullPath, close);
</script>

<template>
  <details ref="menu" class="admin-mobile-nav" @keydown.esc="escape">
    <summary>WatSolution <span>Menú de administración</span></summary>
    <nav aria-label="Administración móvil">
      <router-link v-for="[label, path] in links" :key="path" :to="path" :aria-current="route.path === path ? 'page' : undefined">{{
        label
      }}</router-link>
      <router-link to="/">Volver al inicio</router-link>
      <button type="button" @click="logout">Cerrar sesión</button>
    </nav>
  </details>
</template>

<style scoped>
.admin-mobile-nav {
  display: none;
  background: #143e43;
  color: #fffdf5;
  border-bottom: 1px solid #527772;
}
summary {
  padding: 20px 18px;
  cursor: pointer;
  font-weight: 750;
}
summary span {
  font-size: 12px;
  font-weight: 400;
  margin-left: 12px;
}
nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 0 14px 14px;
}
nav a,
nav button {
  padding: 13px 12px;
  color: #fffdf5;
  border: 1px solid #527772;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  font-size: 14px;
}
nav [aria-current='page'] {
  background: #d9ede2;
  color: #143e43;
  font-weight: 700;
}
@media (max-width: 1024px) {
  .admin-mobile-nav {
    display: block;
  }
}
</style>
