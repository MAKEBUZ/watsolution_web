import { type Ref, defineComponent, inject, nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

import InvoiceService from './invoice.service';
import { useDateFormat } from '@/shared/composables';
import { type IInvoice } from '@/shared/model/invoice.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InvoiceDetails',
  setup() {
    const dateFormat = useDateFormat();
    const invoiceService = inject('invoiceService', () => new InvoiceService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const invoice: Ref<IInvoice> = ref({});
    const boldLoading = ref(false);
    const boldError = ref('');

    const renderBoldButton = ({ boldOrderId, hash, apiKey, amount }: { boldOrderId: string; hash: string; apiKey: string; amount: number }) => {
      const container = document.getElementById('bold-button-container');
      if (!container) return;
      container.innerHTML = '';

      const btn = document.createElement('script');
      btn.setAttribute('data-bold-button', 'dark-L');
      btn.setAttribute('data-api-key', apiKey);
      btn.setAttribute('data-order-id', boldOrderId);
      btn.setAttribute('data-currency', 'COP');
      btn.setAttribute('data-amount', String(amount));
      btn.setAttribute('data-integrity-signature', hash);
      btn.setAttribute('data-redirection-url', `${window.location.origin}/invoice/${invoice.value.id}/payment-result`);
      btn.setAttribute('data-origin-url', window.location.href);
      btn.setAttribute('data-description', `Pago Factura #${invoice.value.id}`);
      btn.setAttribute('data-tax', 'vat-19');
      btn.setAttribute('data-render-mode', 'embedded');
      container.appendChild(btn);

      const prev = document.getElementById('bold-sdk');
      if (prev) prev.remove();
      const sdk = document.createElement('script');
      sdk.id = 'bold-sdk';
      sdk.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      document.head.appendChild(sdk);
    };

    const loadBoldButton = async () => {
      if (!invoice.value?.id || invoice.value.status !== 'PENDING') return;
      boldLoading.value = true;
      boldError.value = '';
      try {
        const res = await axios.get(`api/bold/hash?invoiceId=${invoice.value.id}`);
        await nextTick();
        renderBoldButton(res.data);
      } catch (err) {
        boldError.value = 'No se pudo cargar el botón de pago.';
        alertService.showHttpError(err.response);
      } finally {
        boldLoading.value = false;
      }
    };

    const retrieveInvoice = async (invoiceId: any) => {
      try {
        invoice.value = await invoiceService().find(invoiceId);
        await loadBoldButton();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    onMounted(() => {
      if (route.params?.invoiceId) {
        retrieveInvoice(route.params.invoiceId);
      }
    });

    return {
      ...dateFormat,
      alertService,
      invoice,
      boldLoading,
      boldError,

      previousState,
      t$: useI18n().t,
    };
  },
});
