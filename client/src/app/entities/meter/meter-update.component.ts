import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import MeterService from './meter.service';
import { useDateFormat, useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import PersonService from '@/entities/person/person.service';
import { type IPerson } from '@/shared/model/person.model';
import AddressService from '@/entities/address/address.service';
import { type IAddress } from '@/shared/model/address.model';
import { type IMeter, Meter } from '@/shared/model/meter.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'MeterUpdate',
  setup() {
    const meterService = inject('meterService', () => new MeterService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const meter: Ref<IMeter> = ref(new Meter());

    const personService = inject('personService', () => new PersonService());

    const people: Ref<IPerson[]> = ref([]);

    const addressService = inject('addressService', () => new AddressService());

    const addresses: Ref<IAddress[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveMeter = async meterId => {
      try {
        const res = await meterService().find(meterId);
        res.createdAt = new Date(res.createdAt);
        meter.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.meterId) {
      retrieveMeter(route.params.meterId);
    }

    const initRelationships = () => {
      personService()
        .retrieve()
        .then(res => {
          people.value = res.data;
        });
      addressService()
        .retrieve()
        .then(res => {
          addresses.value = res.data;
        });
    };

    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      waterMeasure: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      readingDate: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      observation: {},
      createdAt: {},
      person: {},
      address: {},
    };
    const v$ = useVuelidate(validationRules, meter as any);
    v$.value.$validate();

    return {
      meterService,
      alertService,
      meter,
      previousState,
      isSaving,
      currentLanguage,
      people,
      addresses,
      v$,
      ...useDateFormat({ entityRef: meter }),
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.meter.id) {
        this.meterService()
          .update(this.meter)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('watsolutionApp.meter.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.meterService()
          .create(this.meter)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('watsolutionApp.meter.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
