import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import MeterService from './meter.service';
import { useDateFormat } from '@/shared/composables';
import { type IMeter } from '@/shared/model/meter.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'MeterDetails',
  setup() {
    const dateFormat = useDateFormat();
    const meterService = inject('meterService', () => new MeterService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const meter: Ref<IMeter> = ref({});

    const retrieveMeter = async meterId => {
      try {
        const res = await meterService().find(meterId);
        meter.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.meterId) {
      retrieveMeter(route.params.meterId);
    }

    return {
      ...dateFormat,
      alertService,
      meter,

      previousState,
      t$: useI18n().t,
    };
  },
});
