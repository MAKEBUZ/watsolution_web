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
  let eventSource: EventSource | null = null;

  function getToken(): string | null {
    return localStorage.getItem('jhi-authenticationToken') || sessionStorage.getItem('jhi-authenticationToken');
  }

  function getLogin(): string | null {
    return accountStore.account?.login ?? null;
  }

  async function fetchAll() {
    const login = getLogin();
    if (!login) return;
    try {
      const res = await axios.get<AppNotification[]>('api/notifications', { params: { login } });
      notifications.value = res.data;
      unreadCount.value = res.data.filter(n => !n.read).length;
    } catch {}
  }

  async function markAllRead() {
    const login = getLogin();
    if (!login) return;
    try {
      await axios.patch('api/notifications/read-all', null, { params: { login } });
      notifications.value = notifications.value.map(n => ({ ...n, read: true }));
      unreadCount.value = 0;
    } catch {}
  }

  function connect() {
    const token = getToken();
    if (!token || eventSource) return;

    eventSource = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`);

    eventSource.onmessage = (e) => {
      try {
        const notif: AppNotification = JSON.parse(e.data);
        if (!notif?.id) return;
        notifications.value = [{ ...notif, read: false }, ...notifications.value];
        unreadCount.value = notifications.value.filter(n => !n.read).length;
      } catch {}
    };

    eventSource.onerror = () => {
      eventSource?.close();
      eventSource = null;
      setTimeout(() => {
        if (getToken()) connect();
      }, 5000);
    };
  }

  function disconnect() {
    eventSource?.close();
    eventSource = null;
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
