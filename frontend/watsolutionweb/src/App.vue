<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/Header.vue'
import AppFooter from './components/layout/Footer.vue'

const route = useRoute()
const showLayout = computed(() => !route.meta.hideLayout)
</script>

<template>
  <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
  
  <div class="app-container">
    <AppHeader v-if="showLayout" />
    
    <main id="main-content">
      <router-view />
    </main>
    
    <AppFooter v-if="showLayout" />
  </div>
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>
