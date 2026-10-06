<template>
  <div id="app">
    <div v-if="accountStore.logoutStatus === 'pending'" role="status" class="logout-feedback alert alert-info">
      Cerrando la sesión en el servidor…
    </div>
    <div v-if="accountStore.logoutStatus === 'failed'" role="alert" class="logout-feedback alert alert-warning">
      Se ocultaron tus datos, pero no pudimos confirmar el cierre en el servidor. Comprueba tu conexión y vuelve a intentarlo.
      <button type="button" class="btn btn-warning" @click="accountStore.logout()">Reintentar cierre de sesión</button>
    </div>
    <Header v-if="!isAdminRoute" />
    <main :class="['main-content', { 'no-header': isAdminRoute }]">
      <router-view v-if="!requiresAuthentication || accountStore.authenticated"></router-view>
    </main>
    <Footer v-if="!isAdminRoute" />
    <ChatBot />
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

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Footer,
    ChatBot,
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
    watch(() => accountStore.authenticated, (authenticated, wasAuthenticated) => {
      if (wasAuthenticated && !authenticated && requiresAuthentication.value) void router.replace('/login');
    });
    const isAdminRoute = computed(() => {
      return route.path.startsWith('/admin') || route.name?.toString().startsWith('Admin') || route.name?.toString().startsWith('admin');
    });
    return {
      accountStore,
      route,
      isAdminRoute,
      requiresAuthentication,
    };
  },
});
</script>

<style>
.logout-feedback { position: fixed; top: 0; left: 0; right: 0; z-index: 10001; margin: 0; }
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
