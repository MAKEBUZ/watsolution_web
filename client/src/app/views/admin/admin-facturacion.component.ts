import { computed, defineComponent, ref } from 'vue';
import AdminService from '@/services/admin.service';
import PersonService from '@/entities/person/person.service';
import { type IPerson } from '@/shared/model/person.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AdminFacturacion',
  setup() {
    const adminService = new AdminService();
    const personService = new PersonService();

    const personSearch = ref('');
    const selectedPerson = ref<IPerson | null>(null);
    const searchResults = ref<IPerson[]>([]);
    const isSearching = ref(false);
    const isGenerating = ref(false);
    const successMsg = ref('');
    const errorMsg = ref('');

    const form = ref({
      prevReading: 0,
      currentReading: 0,
      rate: 2500,
      fixedCharge: 5000,
      subsidy: 0,    // decimal 0–1 (e.g. 0.15 = 15%)
      surcharges: 0,
    });

    const summary = computed(() => {
      const consumption = Math.max(0, form.value.currentReading - form.value.prevReading);
      const consumptionValue = consumption * form.value.rate;
      const subtotal = consumptionValue + form.value.fixedCharge;
      const subsidyApplied = subtotal * form.value.subsidy;
      const total = subtotal - subsidyApplied + form.value.surcharges;
      return { consumption, consumptionValue, subtotal, subsidyApplied, total: Math.round(total) };
    });

    const searchPeople = async () => {
      if (!personSearch.value.trim()) return;
      isSearching.value = true;
      try {
        const res = await personService.retrieve({ page: 0, size: 10, sort: 'id,ASC' });
        searchResults.value = res.data.filter((p: IPerson) =>
          (p.fullName ?? '').toLowerCase().includes(personSearch.value.toLowerCase()) ||
          (p.documentNumber ?? '').includes(personSearch.value),
        );
      } finally {
        isSearching.value = false;
      }
    };

    const selectPerson = (person: IPerson) => {
      selectedPerson.value = person;
      searchResults.value = [];
      personSearch.value = person.fullName ?? '';
    };

    const generateInvoice = async () => {
      if (!selectedPerson.value?.id) {
        errorMsg.value = 'Seleccione un suscriptor.';
        return;
      }
      isGenerating.value = true;
      errorMsg.value = '';
      successMsg.value = '';
      try {
        const result = await adminService.generateInvoice({
          personId: selectedPerson.value.id,
          prevReading: form.value.prevReading,
          currentReading: form.value.currentReading,
          rate: form.value.rate,
          fixedCharge: form.value.fixedCharge,
          subsidy: form.value.subsidy,
          surcharges: form.value.surcharges,
        });
        successMsg.value = `Factura generada exitosamente por ${formatCurrency(Number(result.amountDue))}`;
      } catch (e: any) {
        errorMsg.value = e?.response?.data?.message ?? 'Error al generar la factura.';
      } finally {
        isGenerating.value = false;
      }
    };

    const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

    return {
      personSearch, selectedPerson, searchResults, isSearching, isGenerating,
      form, summary, successMsg, errorMsg,
      searchPeople, selectPerson, generateInvoice, formatCurrency,
    };
  },
});
