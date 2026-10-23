// Vue 3 runtime with precompiled templates: no Vue 2 compatibility or eval compiler.
import { computed, createApp, h, onMounted, provide, watch } from 'vue';
import { BApp } from 'bootstrap-vue-next';
import { createPinia, storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import App from './app.vue';
import router from './router';
import { initFortAwesome, initI18N } from './shared/config/config';
import { initBootstrapVue } from './shared/config/config-bootstrap-vue';
import JhiItemCountComponent from './shared/jhi-item-count.vue';
import JhiSortIndicatorComponent from './shared/sort/jhi-sort-indicator.vue';
import LoginService from './account/login.service';
import AccountService from './account/account.service';
import { createSessionGuard } from './router/session-guard';
import { setupAxiosInterceptors } from '@/shared/config/axios-interceptor';
import { useStore, useTranslationStore } from '@/store';

import '../content/scss/global.scss';
import '../content/scss/vendor.scss';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import '../content/scss/main.scss';
import '../content/scss/water-system.scss';
import TranslationService from '@/locale/translation.service';
import NoticiaService from '@/entities/noticia/noticia.service';
import ReporteService from '@/entities/reporte/reporte.service';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const pinia = createPinia();

// jhipster-needle-add-entity-service-to-main-import - JHipster will import entities services here

const i18n = initI18N();

const app = createApp({
  render: () => h(BApp, null, { default: () => h(App) }),
  setup(_props, { emit }) {
    const loginService = new LoginService({ emit });
    provide('loginService', loginService);
    const store = useStore();
    const accountService = new AccountService(store);
    const i18n = useI18n();
    const translationStore = useTranslationStore();
    const translationService = new TranslationService(i18n);

    const changeLanguage = async (newLanguage: string) => {
      if (i18n.locale.value !== newLanguage) {
        await translationService.refreshTranslation(newLanguage);
        translationStore.setCurrentLanguage(newLanguage);
      }
    };

    provide('currentLanguage', i18n.locale);
    provide('changeLanguage', changeLanguage);

    watch(
      () => store.account,
      async value => {
        if (!translationService.getLocalStoreLanguage() && value?.langKey) {
          await changeLanguage(value.langKey);
        }
      },
    );

    watch(
      () => translationStore.currentLanguage,
      value => {
        translationService.setLocale(value);
      },
    );

    onMounted(async () => {
      const lang = [translationService.getLocalStoreLanguage(), store.account?.langKey, navigator.language, 'es'].find(
        lang => lang && translationService.isLanguageSupported(lang),
      );
      await changeLanguage(lang);
    });

    const sessionGuard = createSessionGuard(store, accountService);
    router.beforeResolve(to => {
      // Make sure login modal is closed
      loginService.hideLogin();

      return sessionGuard(to);
    });

    setupAxiosInterceptors(
      error => {
        const url = error.config?.url ?? error.response?.config?.url ?? '';
        const status = error.status || error.response?.status;
        if (status === 401 && !url.includes('api/authenticate')) {
          store.clearLocalSession();
          if (router.currentRoute.value.matched.some(record => record.meta.authorities?.length)) {
            void router.replace('/login');
          }
        }
        return Promise.reject(error);
      },
      error => {
        return Promise.reject(error);
      },
    );

    const { authenticated } = storeToRefs(store);
    provide('authenticated', authenticated);
    provide(
      'currentUsername',
      computed(() => store.account?.login),
    );

    provide('translationService', translationService);
    provide('accountService', accountService);
    provide('noticiaService', () => new NoticiaService());
    provide('reporteService', () => new ReporteService());
    // jhipster-needle-add-entity-service-to-main - JHipster will import entities services here
  },
});

initBootstrapVue(app);
initFortAwesome(app);

app
  .component('jhi-item-count', JhiItemCountComponent)
  .component('jhi-sort-indicator', JhiSortIndicatorComponent)
  .use(router)
  .use(pinia)
  .use(i18n)
  .mount('#app');
