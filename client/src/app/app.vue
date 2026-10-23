<template>
  <div
    id="app"
    class="ws-interface"
    :class="{
      'ws-entity-route': /^\/(forbidden|not-found|register|person|address|meter|invoice|account|admin\/user-management)/.test(route.path),
    }"
  >
    <div v-if="accountStore.logoutStatus === 'pending'" role="status" class="logout-feedback alert alert-info">
      Cerrando la sesión en el servidor…
    </div>
    <div v-if="accountStore.logoutStatus === 'failed'" role="alert" class="logout-feedback alert alert-warning">
      Se ocultaron tus datos, pero no pudimos confirmar el cierre en el servidor. Comprueba tu conexión y vuelve a intentarlo.
      <button type="button" class="btn btn-warning" @click="accountStore.logout()">Reintentar cierre de sesión</button>
    </div>
    <a href="#main-content" class="skip-link">Saltar al contenido</a>
    <Header v-if="!isAdminRoute" />
    <main id="main-content" tabindex="-1" :class="['main-content', { 'no-header': isAdminRoute }]">
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  margin: 0;
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
