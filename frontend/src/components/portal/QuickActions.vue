<script setup lang="ts">
import type { Component } from 'vue'

interface Action {
  label: string
  icon: Component
  onClick?: () => void
}

defineProps<{
  title: string
  actions: Action[]
}>()
</script>

<template>
  <div class="portal-card quick-actions-section">
    <h3>{{ title }}</h3>
    <div class="actions-grid">
      <button 
        v-for="action in actions" 
        :key="action.label" 
        class="action-btn"
        @click="action.onClick"
      >
        <component :is="action.icon" :size="24" />
        <span>{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.portal-card {
  background: white;
  padding: $spacing-lg;
  border-radius: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid rgba(0, 0, 0, 0.03);

  h3 { font-size: 1.15rem; margin-bottom: $spacing-md; font-weight: 700; color: $color-text; }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: $spacing-md;

  @include tablet {
    grid-template-columns: repeat(4, 1fr);
  }
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: $spacing-lg $spacing-md;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s;
  color: $color-text;
  aspect-ratio: 1 / 1;
  width: 100%;

  span { font-size: 0.85rem; font-weight: 700; text-align: center; }
  &:hover {
    border-color: $color-primary;
    color: $color-primary;
    background: color.change($color-primary, $alpha: 0.05);
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }
}
</style>
