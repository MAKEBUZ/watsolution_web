import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import PersonService from './person.service';
import { useDateFormat, useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import AddressService from '@/entities/address/address.service';
import { type IAddress } from '@/shared/model/address.model';
import { type IPerson, Person } from '@/shared/model/person.model';
import { PersonStatus } from '@/shared/model/enumerations/person-status.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'PersonUpdate',
  setup() {
    const personService = inject('personService', () => new PersonService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const person: Ref<IPerson> = ref(new Person());

    const addressService = inject('addressService', () => new AddressService());

    const addresses: Ref<IAddress[]> = ref([]);
    const personStatusValues: Ref<string[]> = ref(Object.keys(PersonStatus));
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrievePerson = async personId => {
      try {
        const res = await personService().find(personId);
        res.createdAt = new Date(res.createdAt);
        person.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.personId) {
      retrievePerson(route.params.personId);
    }

    const initRelationships = () => {
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
      fullName: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      documentNumber: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      phone: {},
      email: {},
      status: {},
      createdAt: {},
      address: {},
    };
    const v$ = useVuelidate(validationRules, person as any);
    v$.value.$validate();

    return {
      personService,
      alertService,
      person,
      previousState,
      personStatusValues,
      isSaving,
      currentLanguage,
      addresses,
      v$,
      ...useDateFormat({ entityRef: person }),
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.person.id) {
        this.personService()
          .update(this.person)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('watsolutionApp.person.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.personService()
          .create(this.person)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('watsolutionApp.person.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
