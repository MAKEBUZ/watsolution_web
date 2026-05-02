<script setup lang="ts">
import type { Component } from 'vue'

interface Activity {
  id: string | number
  title: string
  desc: string
  time: string
  icon: Component
  color: string
}

defineProps<{
  activities: Activity[]
}>()
</script>

<template>
  <div class="portal-card activity-card">
    <div class="card-header">
      <h3>Actividad Reciente</h3>
    </div>
    <div class="activity-timeline">
      <div v-for="activity in activities" :key="activity.id" class="activity-item">
        <div class="activity-icon" :style="{ color: activity.color, borderColor: activity.color + '30' }">
          <component :is="activity.icon" :size="16" />
        </div>
        <div class="activity-content">
          <span class="activity-title">{{ activity.title }}</span>
          <p class="activity-desc">{{ activity.desc }}</p>
          <span class="activity-time">{{ activity.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  h3 { margin-bottom: 0; }
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  position: relative;
  padding-left: 8px;

  &::before {
    content: '';
    position: absolute;
    left: 23px;
    top: 10px;
    bottom: 10px;
    width: 2px;
    background: #f1f5f9;
  }
}

.activity-item {
  display: flex;
  gap: $spacing-md;
  position: relative;
  z-index: 1;

  .activity-icon {
    width: 32px;
    height: 32px;
    background: white;
    border: 2px solid;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .activity-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    .activity-title { font-size: 0.9rem; font-weight: 700; color: $color-text; }
    .activity-desc { font-size: 0.8rem; color: $color-text-muted; line-height: 1.4; }
    .activity-time { font-size: 0.7rem; color: $color-text-muted; font-weight: 600; margin-top: 4px; }
  }
}
</style>
