import { defineComponent, onMounted, ref } from 'vue';
import AdminService from '@/services/admin.service';
import { type IActivityLog } from '@/shared/model/activity-log.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AdminActividad',
  setup() {
    const adminService = new AdminService();
    const activities = ref<IActivityLog[]>([]);
    const isFetching = ref(false);

    onMounted(async () => {
      isFetching.value = true;
      try {
        activities.value = await adminService.getActivity(20);
      } finally {
        isFetching.value = false;
      }
    });

    const actionLabel = (action?: string | null) => {
      const map: Record<string, string> = {
        PAGO_FACTURA: 'Pago de Factura',
        LECTURA_CONTADOR: 'Nueva Lectura',
        NUEVA_NOTICIA: 'Nueva Noticia',
        NUEVO_REPORTE: 'Nuevo Reporte',
        SISTEMA: 'Sistema',
      };
      return map[action ?? ''] ?? action ?? '';
    };

    const actionIcon = (action?: string | null) => {
      const map: Record<string, string> = {
        PAGO_FACTURA: 'credit-card',
        LECTURA_CONTADOR: 'tint',
        NUEVA_NOTICIA: 'newspaper',
        NUEVO_REPORTE: 'exclamation-circle',
        SISTEMA: 'server',
      };
      return map[action ?? ''] ?? 'bell';
    };

    const actionColor = (action?: string | null) => {
      const map: Record<string, string> = {
        PAGO_FACTURA: 'success',
        LECTURA_CONTADOR: 'info',
        NUEVA_NOTICIA: 'warning',
        NUEVO_REPORTE: 'danger',
        SISTEMA: 'secondary',
      };
      return map[action ?? ''] ?? 'secondary';
    };

    const timeAgo = (date?: Date | null) => {
      if (!date) return '';
      const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
      if (diff < 1) return 'Hace un momento';
      if (diff < 60) return `Hace ${diff} min`;
      if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
      return `Hace ${Math.floor(diff / 1440)} días`;
    };

    return { activities, isFetching, actionLabel, actionIcon, actionColor, timeAgo };
  },
});
