import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'PagosView',
  setup() {
    const route = useRoute();

    const invoiceRef = ref((route.query.ref as string) || 'FACT-2026-001');
    const totalAmount = ref(Number(route.query.amount) || 45000);

    const form = ref({
      personType: 'natural',
      bank: '',
      docType: 'cc',
      docNumber: '',
    });

    const isPaying = ref(false);
    const errorMsg = ref('');
    const successMsg = ref('');

    const submitPayment = async () => {
      if (!form.value.bank) {
        errorMsg.value = 'Selecciona un banco para continuar.';
        return;
      }
      if (!form.value.docNumber.trim()) {
        errorMsg.value = 'Ingresa tu número de documento.';
        return;
      }
      isPaying.value = true;
      errorMsg.value = '';
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        successMsg.value = `Pago de ${formatCurrency(totalAmount.value)} procesado correctamente. Serás redirigido a tu banco.`;
      } finally {
        isPaying.value = false;
      }
    };

    const formatCurrency = (value: number) =>
      `$${Number(value).toLocaleString('es-CO')}`;

    return { invoiceRef, totalAmount, form, isPaying, errorMsg, successMsg, submitPayment, formatCurrency };
  },
});
