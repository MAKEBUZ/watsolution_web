import { defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InvoicePaymentResult',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const loading = ref(true);
    const boldStatus = ref('');
    const invoiceStatus = ref('');
    const boldOrderId = ref('');
    const invoiceLabel = ref('');
    const error = ref('');

    onMounted(async () => {
      const invoiceId = route.params.invoiceId as string;
      boldOrderId.value = (route.query['bold-order-id'] as string) ?? '';

      invoiceLabel.value = `Factura #${invoiceId}`;

      if (!boldOrderId.value) {
        error.value = 'No se recibió referencia de pago de Bold.';
        loading.value = false;
        return;
      }

      try {
        const res = await axios.get(
          `api/bold/result/${invoiceId}?boldOrderId=${encodeURIComponent(boldOrderId.value)}`,
        );
        boldStatus.value = res.data.boldStatus;
        invoiceStatus.value = res.data.invoiceStatus;
      } catch {
        error.value = 'Error al verificar el pago. Intenta de nuevo o contacta soporte.';
      } finally {
        loading.value = false;
      }
    });

    const goToInvoice = () => {
      router.push({ name: 'InvoiceView', params: { invoiceId: route.params.invoiceId } });
    };

    const goToPagos = () => {
      router.push('/pagos');
    };

    return { loading, boldStatus, invoiceStatus, boldOrderId, invoiceLabel, error, goToInvoice, goToPagos };
  },
});
