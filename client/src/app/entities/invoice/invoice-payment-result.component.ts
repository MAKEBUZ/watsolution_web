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
    const error = ref('');

    onMounted(async () => {
      const invoiceId = route.params.invoiceId as string;
      const boldOrderId = (route.query['bold-order-id'] as string) ?? '';

      if (!boldOrderId) {
        error.value = 'No se recibió referencia de pago de Bold.';
        loading.value = false;
        return;
      }

      try {
        const res = await axios.get(`api/bold/result/${invoiceId}?boldOrderId=${encodeURIComponent(boldOrderId)}`);
        boldStatus.value = res.data.boldStatus;
        invoiceStatus.value = res.data.invoiceStatus;
      } catch (err) {
        error.value = 'Error al verificar el pago. Intente de nuevo o contacte soporte.';
      } finally {
        loading.value = false;
      }
    });

    const goToInvoice = () => {
      router.push({ name: 'InvoiceView', params: { invoiceId: route.params.invoiceId } });
    };

    return { loading, boldStatus, invoiceStatus, error, goToInvoice };
  },
});
