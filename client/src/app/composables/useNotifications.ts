import { ref, onUnmounted, watch } from 'vue';
import axios from 'axios';
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

export function useNotifications() {
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
      const res = await axios.get<AppNotification[]>('/api/notifications', { params: { login } });
      notifications.value = res.data;
      unreadCount.value = res.data.filter(n => !n.read).length;
    } catch {}
  }

  async function markAllRead() {
    const login = getLogin();
    if (!login) return;
    try {
      await axios.patch('/api/notifications/read-all', null, { params: { login } });
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
        notifications.value.unshift({ ...notif, read: false });
        unreadCount.value += 1;
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
  }

  watch(
    () => accountStore.authenticated,
    (authenticated) => {
      if (authenticated) {
        fetchAll();
        connect();
      } else {
        disconnect();
        notifications.value = [];
        unreadCount.value = 0;
      }
    },
    { immediate: true },
  );

  onUnmounted(disconnect);

  return { notifications, unreadCount, markAllRead, fetchAll };
}
