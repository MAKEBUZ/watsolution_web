<template>
  <div id="app">
    <Header v-if="!isAdminRoute" />
    <main :class="['main-content', { 'no-header': isAdminRoute }]">
      <router-view></router-view>
    </main>
    <Footer v-if="!isAdminRoute && !isWorkspaceRoute" />
    <ChatBot v-if="!isAdminRoute && !isWorkspaceRoute" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
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
    const route = useRoute();
    const isAdminRoute = computed(() => {
      return route.path.startsWith('/admin') || route.name?.toString().startsWith('Admin') || route.name?.toString().startsWith('admin');
    });
    return {
      route,
      isWorkspaceRoute: computed(() => ['/portal', '/pagos'].includes(route.path)),
      isAdminRoute,
    };
  },
});
</script>

<style>
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
