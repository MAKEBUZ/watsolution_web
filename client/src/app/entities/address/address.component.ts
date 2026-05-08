import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AddressService from './address.service';
import { type IAddress } from '@/shared/model/address.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Address',
  setup() {
    const { t: t$ } = useI18n();
    const addressService = inject('addressService', () => new AddressService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const addresses: Ref<IAddress[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveAddresss = async () => {
      isFetching.value = true;
      try {
        const res = await addressService().retrieve();
        addresses.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveAddresss();
    };

    onMounted(async () => {
      await retrieveAddresss();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IAddress) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeAddress = async () => {
      try {
        await addressService().delete(removeId.value);
        const message = t$('watsolutionApp.address.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveAddresss();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      addresses,
      handleSyncList,
      isFetching,
      retrieveAddresss,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeAddress,
      t$,
    };
  },
});
