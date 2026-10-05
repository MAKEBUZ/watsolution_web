import { getAccessToken, setAccessToken, refreshAccessToken } from '@/shared/config/web-session';
import { ref, watch } from 'vue';
import axios from 'axios';
import { defineStore, storeToRefs } from 'pinia';
import { useAccountStore } from '@/shared/config/store/account-store';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  invoiceId?: number;
  read: boolean;
  createdAt: string;
}

export const useNotificationStore = defineStore('notifications', () => {
  const accountStore = useAccountStore();
  const notifications = ref<AppNotification[]>([]);
  const unreadCount = ref(0);
  let poll: ReturnType<typeof setInterval> | undefined;
  let generation = 0;

  function getToken(): string | null {
    return getAccessToken();
  }

  function getLogin(): string | null {
    return accountStore.account?.login ?? null;
  }

  async function fetchAll() {
    const login = getLogin();
    if (!login) return;
    try {
      const current = generation;
      const res = await axios.get<AppNotification[]>('api/notifications');
      if (current !== generation) return;
      notifications.value = res.data;
      unreadCount.value = res.data.filter(n => !n.read).length;
    } catch {}
  }

  async function markAllRead() {
    const login = getLogin();
    if (!login) return;
    try {
      const current = generation;
      await axios.patch('api/notifications/read-all');
      if (current !== generation) return;
      notifications.value = notifications.value.map(n => ({ ...n, read: true }));
      unreadCount.value = 0;
    } catch {}
  }

  function connect() {
    clearInterval(poll);
    poll = setInterval(() => { if (getToken()) void fetchAll(); }, 30000);
  }

  function disconnect() {
    generation++;
    clearInterval(poll);
    notifications.value = [];
    unreadCount.value = 0;
  }

  watch(
    () => accountStore.authenticated,
    (authenticated) => {
      if (authenticated) {
        fetchAll();
        connect();
      } else {
        disconnect();
      }
    },
    { immediate: true },
  );

  return { notifications, unreadCount, markAllRead, fetchAll };
});

export function useNotifications() {
  const store = useNotificationStore();
  const { notifications, unreadCount } = storeToRefs(store);
  return { notifications, unreadCount, markAllRead: store.markAllRead, fetchAll: store.fetchAll };
}
