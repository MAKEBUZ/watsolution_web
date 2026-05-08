import { computed, defineComponent, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import Ribbon from '@/core/ribbon/ribbon.vue';
import JhiFooter from '@/core/jhi-footer/jhi-footer.vue';
import JhiNavbar from '@/core/jhi-navbar/jhi-navbar.vue';
import LoginForm from '@/account/login-form/login-form.vue';

import { useAlertService } from '@/shared/alert/alert.service';

import '@/shared/config/dayjs';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'App',
  components: {
    ribbon: Ribbon,
    'jhi-navbar': JhiNavbar,
    'login-form': LoginForm,
    'jhi-footer': JhiFooter,
  },
  setup() {
    provide('alertService', useAlertService());

    const route = useRoute();
    const isAdminPanel = computed(() => route.path.startsWith('/admin-panel'));

    return {
      t$: useI18n().t,
      isAdminPanel,
    };
  },
});
