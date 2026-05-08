import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import AddressService from './address.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { Address, type IAddress } from '@/shared/model/address.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AddressUpdate',
  setup() {
    const addressService = inject('addressService', () => new AddressService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const address: Ref<IAddress> = ref(new Address());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveAddress = async addressId => {
      try {
        const res = await addressService().find(addressId);
        address.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.addressId) {
      retrieveAddress(route.params.addressId);
    }

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      neighborhood: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      street: {},
      houseNumber: {},
      city: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      latitude: {},
      longitude: {},
    };
    const v$ = useVuelidate(validationRules, address as any);
    v$.value.$validate();

    return {
      addressService,
      alertService,
      address,
      previousState,
      isSaving,
      currentLanguage,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.address.id) {
        this.addressService()
          .update(this.address)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('watsolutionApp.address.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.addressService()
          .create(this.address)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('watsolutionApp.address.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
