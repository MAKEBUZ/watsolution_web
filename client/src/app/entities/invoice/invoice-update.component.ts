import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import InvoiceService from './invoice.service';
import { useDateFormat, useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import MeterService from '@/entities/meter/meter.service';
import { type IMeter } from '@/shared/model/meter.model';
import PersonService from '@/entities/person/person.service';
import { type IPerson } from '@/shared/model/person.model';
import { type IInvoice, Invoice } from '@/shared/model/invoice.model';
import { InvoiceStatus } from '@/shared/model/enumerations/invoice-status.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InvoiceUpdate',
  setup() {
    const invoiceService = inject('invoiceService', () => new InvoiceService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const invoice: Ref<IInvoice> = ref(new Invoice());

    const meterService = inject('meterService', () => new MeterService());

    const meters: Ref<IMeter[]> = ref([]);

    const personService = inject('personService', () => new PersonService());

    const people: Ref<IPerson[]> = ref([]);
    const invoiceStatusValues: Ref<string[]> = ref(Object.keys(InvoiceStatus));
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveInvoice = async invoiceId => {
      try {
        const res = await invoiceService().find(invoiceId);
        res.createdAt = new Date(res.createdAt);
        invoice.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.invoiceId) {
      retrieveInvoice(route.params.invoiceId);
    }

    const initRelationships = () => {
      meterService()
        .retrieve()
        .then(res => {
          meters.value = res.data;
        });
      personService()
        .retrieve()
        .then(res => {
          people.value = res.data;
        });
    };

    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      issueDate: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      dueDate: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      consumptionM3: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      amountDue: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      status: {},
      createdAt: {},
      meter: {},
      person: {},
    };
    const v$ = useVuelidate(validationRules, invoice as any);
    v$.value.$validate();

    return {
      invoiceService,
      alertService,
      invoice,
      previousState,
      invoiceStatusValues,
      isSaving,
      currentLanguage,
      meters,
      people,
      v$,
      ...useDateFormat({ entityRef: invoice }),
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.invoice.id) {
        this.invoiceService()
          .update(this.invoice)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('watsolutionApp.invoice.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.invoiceService()
          .create(this.invoice)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('watsolutionApp.invoice.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
