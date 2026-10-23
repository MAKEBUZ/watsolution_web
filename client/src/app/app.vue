<template>
  <div
    id="app"
    class="ws-interface"
    :class="{
      'ws-entity-route': /^\/(forbidden|not-found|register|person|address|meter|invoice|account|admin\/user-management)/.test(route.path),
    }"
  >
    <a href="#main-content" class="skip-link">Saltar al contenido</a>
    <Header v-if="!isAdminRoute" />
    <main id="main-content" tabindex="-1" :class="['main-content', { 'no-header': isAdminRoute }]">
      <div v-if="accountStore.logoutStatus === 'pending'" role="status" class="logout-feedback alert alert-info">
        Cerrando la sesión en el servidor… Tus datos ya no se muestran en este navegador.
      </div>
      <div v-if="accountStore.logoutStatus === 'failed'" role="alert" class="logout-feedback alert alert-warning">
        <span>No pudimos confirmar el cierre en el servidor. Tus datos ya no se muestran aquí. Puedes reintentarlo o volver a iniciar sesión.</span>
        <div class="logout-feedback__actions">
          <button type="button" class="btn btn-warning" @click="accountStore.logout()">Reintentar cierre de sesión</button>
          <router-link v-if="route.path !== '/login'" to="/login" class="btn btn-outline-dark">Ir a iniciar sesión</router-link>
        </div>
      </div>
      <AdminMobileNav v-if="isAdminRoute && accountStore.authenticated" />
      <router-view v-if="!requiresAuthentication || accountStore.authenticated"></router-view>
    </main>
    <Footer v-if="!isAdminRoute && !isWorkspaceRoute" />
    <ChatBot v-if="!isAdminRoute && !isWorkspaceRoute" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useAccountStore } from '@/shared/config/store/account-store';
import { logoutStorageKey } from '@/shared/config/web-session';
import { useRoute, useRouter } from 'vue-router';
import Header from '@/core/layout/header.vue';
import Footer from '@/core/layout/footer.vue';
import ChatBot from '@/core/chatbot/chatbot.vue';
import AdminMobileNav from '@/core/layout/admin-mobile-nav.vue';

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Footer,
    ChatBot,
    AdminMobileNav,
  },
  setup() {
    const accountStore = useAccountStore();
    const onStorage = (event: StorageEvent) => {
      if (event.key === logoutStorageKey && event.newValue) accountStore.applyRemoteLogout();
    };
    onMounted(() => window.addEventListener('storage', onStorage));
    onBeforeUnmount(() => window.removeEventListener('storage', onStorage));
    const route = useRoute();
    const router = useRouter();
    const requiresAuthentication = computed(() => route.matched.some(record => record.meta.authorities?.length));
    watch(
      () => accountStore.authenticated,
      (authenticated, wasAuthenticated) => {
        if (wasAuthenticated && !authenticated && requiresAuthentication.value) void router.replace('/login');
      },
    );
    const isAdminRoute = computed(() => {
      return route.path.startsWith('/admin') || route.name?.toString().startsWith('Admin') || route.name?.toString().startsWith('admin');
    });
    return {
      accountStore,
      route,
      isWorkspaceRoute: computed(() => ['/portal', '/pagos'].includes(route.path)),
      isAdminRoute,
      requiresAuthentication,
    };
  },
});
</script>

<style>
.logout-feedback {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem;
}
.logout-feedback__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-inline-start: auto;
}
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 70px;
}

.main-content.no-header {
  padding-top: 0;
}
</style>

<style src="../content/scss/workspace.scss" lang="scss"></style>
