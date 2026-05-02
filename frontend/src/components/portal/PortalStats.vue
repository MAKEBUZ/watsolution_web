<script setup lang="ts">
import type { Component } from 'vue'

interface Stat {
  label: string
  value: string | number
  icon: Component
  color: string
  desc?: string
}

defineProps<{
  stats: Stat[]
}>()
</script>

<template>
  <div class="stats-row">
    <div v-for="stat in stats" :key="stat.label" class="mini-stat-card">
      <div class="stat-icon" :style="{ color: stat.color, backgroundColor: stat.color + '15' }">
        <component :is="stat.icon" :size="20" />
      </div>
      <div class="stat-info">
        <span class="value">{{ stat.value }}</span>
        <span class="label">{{ stat.label }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-md;
  margin: 0;
  width: 100%;
  padding: 0 $spacing-lg;
}

.mini-stat-card {
  background: white;
  padding: $spacing-md;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  box-shadow: $shadow-sm;
  border: 1px solid rgba(0, 0, 0, 0.03);

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    .value { font-size: 1.25rem; font-weight: 800; color: $color-text; }
    .label { font-size: 0.8rem; color: $color-text-muted; font-weight: 600; }
  }
}
</style>
