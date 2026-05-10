<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/core/layout/header.vue';
import Footer from '@/core/layout/footer.vue';

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Footer,
  },
  setup() {
    const route = useRoute();
    return {
      route,
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
}
</style>
