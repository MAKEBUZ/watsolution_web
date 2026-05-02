import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  date: Date
  isRead: boolean
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([
    {
      id: '1',
      title: 'Factura Pendiente',
      message: 'Tu factura de Abril vence en 3 días. Realiza el pago para evitar recargos.',
      type: 'warning',
      date: new Date(2026, 3, 29, 10, 30),
      isRead: false
    },
    {
      id: '2',
      title: 'Pago Exitoso',
      message: 'Hemos recibido correctamente el pago de tu factura FAC-2026-001.',
      type: 'success',
      date: new Date(2026, 3, 28, 15, 45),
      isRead: true
    },
    {
      id: '3',
      title: 'Mantenimiento Programado',
      message: 'Habrá una interrupción del servicio el próximo domingo por mejoras en la red.',
      type: 'info',
      date: new Date(2026, 3, 27, 9, 0),
      isRead: false
    },
    {
      id: '4',
      title: 'Alerta de Consumo',
      message: 'Se ha detectado un consumo inusual en tu medidor en las últimas 24 horas.',
      type: 'error',
      date: new Date(2026, 3, 25, 18, 20),
      isRead: false
    }
  ])

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => b.date.getTime() - a.date.getTime())
  })

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.isRead = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.isRead = true)
  }

  function deleteNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clearAll() {
    notifications.value = []
  }

  return {
    notifications,
    unreadCount,
    sortedNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  }
})
