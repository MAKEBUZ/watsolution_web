<script setup lang="ts">
import { User } from 'lucide-vue-next'
import NotificationDropdown from './NotificationDropdown.vue'

defineProps<{
  userName?: string
}>()
</script>

<template>
  <div class="portal-header">
    <div class="header-content">
      <div class="user-profile-summary">
        <div class="profile-avatar">
          <User :size="32" />
        </div>
        <div class="user-welcome">
          <h1>Hola, {{ userName }}</h1>
          <slot name="subtitle">
            <p>Suscriptor #12044 • Estrato 4</p>
          </slot>
        </div>
      </div>
      <div class="header-actions">
        <NotificationDropdown />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.portal-header {
  background: white;
  padding: $spacing-xl 0 $spacing-lg;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: $spacing-xl;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $spacing-md;
    flex-wrap: nowrap;
    width: 100%;
    margin: 0;
    padding: 0 $spacing-xl;
  }
}

.user-profile-summary {
  display: flex;
  align-items: center;
  gap: $spacing-lg;

  .profile-avatar {
    width: 72px;
    height: 72px;
    background: color.change($color-primary, $alpha: 0.08);
    color: $color-primary;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid color.change($color-primary, $alpha: 0.1);
    box-shadow: $shadow-sm;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.05);
      background: color.change($color-primary, $alpha: 0.12);
    }

    @include mobile {
      width: 56px;
      height: 56px;
    }
  }

  .user-welcome {
    h1 { 
      font-size: 2rem; 
      color: $color-text; 
      margin-bottom: 6px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    p { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      color: $color-text-muted; 
      font-size: 0.95rem;
      font-weight: 600;
      opacity: 0.8;
    }

    @include mobile {
      h1 { font-size: 1.6rem; }
    }
  }
}

.header-actions {
  display: flex;
  gap: $spacing-sm;
  margin-left: auto;
}

.btn-icon-round {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $color-text-muted;
  transition: all 0.3s;
  position: relative;

  .dot {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
  }

  &:hover { background: #f8fafc; color: $color-primary; border-color: $color-primary; }
}
</style>
