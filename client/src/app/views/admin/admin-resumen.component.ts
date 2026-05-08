import { computed, defineComponent, onMounted, ref } from 'vue';
import { Line as LineChart } from 'vue-chartjs';
import AdminService, { type IAdminStats } from '@/services/admin.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AdminResumen',
  components: { LineChart },
  setup() {
    const adminService = new AdminService();
    const stats = ref<IAdminStats | null>(null);
    const isFetching = ref(false);

    onMounted(async () => {
      isFetching.value = true;
      try {
        stats.value = await adminService.getStats();
      } finally {
        isFetching.value = false;
      }
    });

    const formatCurrency = (value?: number) => {
      if (value == null) return '$0';
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
      return `$${value.toLocaleString('es-CO')}`;
    };

    const currentMonth = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

    const chartData = computed(() => ({
      labels: ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
      datasets: [
        {
          label: 'Consumo m³',
          data: [1200, 1350, 1280, 1420, 1390, stats.value?.totalConsumption ?? 0],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    }));

    const chartOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: false } },
    };

    return { stats, isFetching, formatCurrency, currentMonth, chartData, chartOptions };
  },
});
