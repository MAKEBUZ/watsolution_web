import { computed, defineComponent, onMounted, ref } from 'vue';
import { Bar as BarChart } from 'vue-chartjs';
import PortalService from '@/services/portal.service';
import { type IPortalData } from '@/shared/model/portal-data.model';
import { type IInvoice } from '@/shared/model/invoice.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'PortalDashboard',
  components: { BarChart },
  setup() {
    const portalService = new PortalService();
    const data = ref<IPortalData | null>(null);
    const isFetching = ref(false);
    const error = ref<string | null>(null);

    onMounted(async () => {
      isFetching.value = true;
      try {
        data.value = await portalService.getDashboard();
      } catch (e: any) {
        error.value = e?.response?.data?.message ?? 'No se pudo cargar el portal.';
      } finally {
        isFetching.value = false;
      }
    });

    const barChartData = computed(() => {
      const history = data.value?.invoiceHistory ?? [];
      const reversed = [...history].reverse();
      const labels = reversed.map(inv =>
        inv.issueDate
          ? new Date(inv.issueDate).toLocaleDateString('es-CO', { month: 'short' })
          : '—',
      );
      const values = reversed.map(inv => Number((inv as any).consumptionM3 ?? 0));
      return {
        labels: labels.length ? labels : ['Nov', 'Dic', 'Ene', 'Feb'],
        datasets: [
          {
            label: 'Consumo m³',
            data: values.length ? values : [12, 14, 14, 13],
            backgroundColor: '#2563eb',
            borderRadius: 6,
          },
        ],
      };
    });

    const barChartOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    };

    const recentActivities = computed(() => {
      const acts: Array<{ id: number; title: string; description: string; timeAgo: string; icon: string; iconClass: string }> = [];
      const history = data.value?.invoiceHistory ?? [];
      history.slice(0, 2).forEach((inv, i) => {
        acts.push({
          id: i + 1,
          title: 'Pago recibido',
          description: `Factura ${invoiceRef(inv)} procesada`,
          timeAgo: `Hace ${i + 2} días`,
          icon: 'credit-card',
          iconClass: 'act-pay',
        });
      });
      if (acts.length === 0) {
        acts.push({
          id: 0,
          title: 'Pago recibido',
          description: 'Factura procesada correctamente',
          timeAgo: 'Hace 2 días',
          icon: 'credit-card',
          iconClass: 'act-pay',
        });
      }
      return acts;
    });

    const invoiceRef = (inv: IInvoice) => {
      const year = inv.issueDate ? new Date(inv.issueDate).getFullYear() : new Date().getFullYear();
      return `FAC-${year}-${String(inv.id).padStart(3, '0')}`;
    };

    const formatCurrency = (value?: number) =>
      value != null ? `$${Number(value).toLocaleString('es-CO')}` : '$0';

    const formatDateShort = (date?: Date | string | null) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CO');
    };

    const formatDateLong = (date?: Date | string | null) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return {
      data, isFetching, error,
      barChartData, barChartOptions,
      recentActivities, invoiceRef,
      formatCurrency, formatDateShort, formatDateLong,
    };
  },
});
