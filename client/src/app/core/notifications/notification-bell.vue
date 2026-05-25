<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNotifications } from '@/composables/useNotifications';

const { notifications, unreadCount, markAllRead } = useNotifications();
const open = ref(false);

const iconColor = computed(() => unreadCount.value > 0 ? '#e67e22' : 'currentColor');

function toggle() {
  open.value = !open.value;
  if (open.value && unreadCount.value > 0) {
    markAllRead();
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const typeIcon: Record<string, string> = {
  'invoice.created': '📄',
  'invoice.due_soon': '⏰',
  'invoice.overdue': '⚠️',
  'invoice.paid': '✅',
};
</script>

<template>
  <div class="notif-bell">
    <button class="notif-bell__btn" @click="toggle" aria-label="Notificaciones">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" :stroke="iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="unreadCount > 0" class="notif-bell__badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <Transition name="notif-drop">
      <div v-if="open" class="notif-bell__panel">
        <div class="notif-bell__header">
          <span class="notif-bell__title">Notificaciones</span>
        </div>
        <div class="notif-bell__list">
          <div v-if="notifications.length === 0" class="notif-bell__empty">Sin notificaciones</div>
          <div
            v-for="n in notifications"
            :key="n.id"
            class="notif-bell__item"
            :class="{ 'notif-bell__item--unread': !n.read }"
          >
            <span class="notif-bell__item-icon">{{ typeIcon[n.type] ?? '🔔' }}</span>
            <div class="notif-bell__item-body">
              <p class="notif-bell__item-title">{{ n.title }}</p>
              <p class="notif-bell__item-msg">{{ n.message }}</p>
              <p class="notif-bell__item-date">{{ formatDate(n.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="open" class="notif-bell__overlay" @click="open = false" />
  </div>
</template>

<style lang="scss" scoped>
.notif-bell {
  position: relative;

  &__btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    color: inherit;
    position: relative;
  }

  &__badge {
    position: absolute;
    top: -2px;
    right: -4px;
    background: #e74c3c;
    color: #fff;
    border-radius: 50%;
    font-size: 0.6rem;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 2px;
    line-height: 1;
  }

  &__panel {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 320px;
    max-height: 400px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &__header {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-weight: 700;
    font-size: 0.95rem;
    color: #333;
  }

  &__list {
    overflow-y: auto;
    flex: 1;
    max-height: 340px;
  }

  &__empty {
    padding: 24px 16px;
    text-align: center;
    color: #999;
    font-size: 0.9rem;
  }

  &__item {
    display: flex;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid #f7f7f7;
    transition: background 0.15s;

    &:hover {
      background: #fafafa;
    }

    &--unread {
      background: #fff8f0;
    }

    &-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    &-body {
      flex: 1;
      min-width: 0;
    }

    &-title {
      margin: 0 0 2px;
      font-weight: 600;
      font-size: 0.85rem;
      color: #222;
    }

    &-msg {
      margin: 0 0 4px;
      font-size: 0.8rem;
      color: #555;
      line-height: 1.4;
    }

    &-date {
      margin: 0;
      font-size: 0.72rem;
      color: #aaa;
    }
  }

  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 1999;
  }
}

.notif-drop-enter-active,
.notif-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.notif-drop-enter-from,
.notif-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
