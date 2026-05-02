<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Bell, Check, Trash2, Info, AlertTriangle, 
  AlertCircle, CheckCircle, ExternalLink, X 
} from 'lucide-vue-next'
import { useNotificationsStore } from '../../stores/notifications'

const router = useRouter()
const notificationStore = useNotificationsStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleMarkAsRead = (id: string, event: Event) => {
  event.stopPropagation()
  notificationStore.markAsRead(id)
}

const handleDelete = (id: string, event: Event) => {
  event.stopPropagation()
  notificationStore.deleteNotification(id)
}

const goToNotificationsPage = () => {
  closeDropdown()
  router.push('/notificaciones')
}

const getIcon = (type: string) => {
  switch (type) {
    case 'warning': return AlertTriangle
    case 'error': return AlertCircle
    case 'success': return CheckCircle
    default: return Info
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="notification-wrapper" ref="dropdownRef">
    <button 
      class="btn-icon-round" 
      :class="{ 'is-active': isOpen }"
      @click="toggleDropdown"
      aria-label="Notificaciones"
      :aria-expanded="isOpen"
    >
      <Bell :size="20" />
      <span v-if="notificationStore.unreadCount > 0" class="badge-dot">
        {{ notificationStore.unreadCount }}
      </span>
    </button>

    <Transition name="fade-slide">
      <div v-if="isOpen" class="notification-dropdown">
        <div class="dropdown-header">
          <h3>Notificaciones</h3>
          <div class="header-actions">
            <button 
              v-if="notificationStore.unreadCount > 0"
              class="btn-text-sm" 
              @click="notificationStore.markAllAsRead"
            >
              <Check :size="14" /> Todo leído
            </button>
          </div>
        </div>

        <div class="notification-list" :class="{ 'is-empty': notificationStore.notifications.length === 0 }">
          <template v-if="notificationStore.notifications.length > 0">
            <div 
              v-for="item in notificationStore.sortedNotifications.slice(0, 5)" 
              :key="item.id"
              :class="['notification-item', item.type, { 'is-unread': !item.isRead }]"
              @click="notificationStore.markAsRead(item.id)"
            >
              <div class="item-icon">
                <component :is="getIcon(item.type)" :size="16" />
              </div>
              <div class="item-content">
                <span class="item-title">{{ item.title }}</span>
                <p class="item-message">{{ item.message }}</p>
                <span class="item-date">{{ item.date.toLocaleDateString() }}</span>
              </div>
              <div class="item-actions">
                <button 
                  v-if="!item.isRead"
                  class="action-btn-mini" 
                  title="Marcar como leída"
                  @click="handleMarkAsRead(item.id, $event)"
                >
                  <Check :size="12" />
                </button>
                <button 
                  class="action-btn-mini delete" 
                  title="Eliminar"
                  @click="handleDelete(item.id, $event)"
                >
                  <X :size="12" />
                </button>
              </div>
            </div>
          </template>
          <div v-else class="empty-state">
            <Bell :size="32" class="empty-icon" />
            <p>No tienes notificaciones</p>
          </div>
        </div>

        <div class="dropdown-footer">
          <button class="btn-full-width" @click="goToNotificationsPage">
            Ver todo el historial <ExternalLink :size="14" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.notification-wrapper {
  position: relative;
  z-index: 100;
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

  &.is-active {
    border-color: $color-primary;
    color: $color-primary;
    background: color.change($color-primary, $alpha: 0.05);
  }

  .badge-dot {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 800;
    min-width: 18px;
    height: 18px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    padding: 0 4px;
  }

  &:hover { background: #f8fafc; color: $color-primary; border-color: $color-primary; }
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 360px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transform-origin: top right;

  @include mobile {
    position: fixed;
    top: 70px;
    left: 10px;
    right: 10px;
    width: auto;
  }
}

.dropdown-header {
  padding: $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;

  h3 { font-size: 1rem; font-weight: 700; color: $color-text; margin: 0; }
  .btn-text-sm {
    background: none;
    border: none;
    color: $color-primary;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    &:hover { text-decoration: underline; }
  }
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
  
  &.is-empty { padding: $spacing-lg 0; }
}

.notification-item {
  padding: $spacing-md;
  display: flex;
  gap: $spacing-md;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border-bottom: 1px solid #f8fafc;

  &:hover {
    background: #f8fafc;
    .item-actions { opacity: 1; }
  }

  &.is-unread {
    background: color.change($color-primary, $alpha: 0.02);
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: $color-primary;
    }
    .item-title { font-weight: 800; }
  }

  .item-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &.info .item-icon { background: #eff6ff; color: #3b82f6; }
  &.warning .item-icon { background: #fffbeb; color: #f59e0b; }
  &.error .item-icon { background: #fef2f2; color: #ef4444; }
  &.success .item-icon { background: #f0fdf4; color: #10b981; }

  .item-content {
    flex: 1;
    .item-title { font-size: 0.9rem; color: $color-text; display: block; margin-bottom: 2px; }
    .item-message { font-size: 0.8rem; color: $color-text-muted; margin: 0; line-height: 1.4; }
    .item-date { font-size: 0.7rem; color: #94a3b8; margin-top: 4px; display: block; font-weight: 600; }
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }
}

.action-btn-mini {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  &:hover {
    color: $color-primary;
    border-color: $color-primary;
  }
  &.delete:hover {
    color: #ef4444;
    border-color: #ef4444;
  }
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: $spacing-xl 0;
  .empty-icon { opacity: 0.3; margin-bottom: $spacing-sm; }
  p { font-size: 0.9rem; font-weight: 600; }
}

.dropdown-footer {
  padding: $spacing-md;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;

  .btn-full-width {
    width: 100%;
    padding: 10px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    color: $color-text;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    &:hover {
      background: $color-primary;
      color: white;
      border-color: $color-primary;
    }
  }
}

// Animations
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
