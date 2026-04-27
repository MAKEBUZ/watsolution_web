<script setup lang="ts">
import Hero from '../components/home/Hero.vue'
import Features from '../components/home/Features.vue'
import Demos from '../components/home/Demos.vue'
import Testimonials from '../components/home/Testimonials.vue'
</script>

<template>
  <div class="home">
    <Hero />
    <Features />
    <Demos />
    <Testimonials />
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
}
</style>
