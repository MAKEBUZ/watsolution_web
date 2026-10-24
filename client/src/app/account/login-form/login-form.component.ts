import { setAccessToken } from '@/shared/config/web-session';
import axios from 'axios';
import { type Ref, defineComponent, inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type AccountService from '../account.service';
import type LoginService from '@/account/login.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  setup() {
    const authenticationError: Ref<boolean> = ref(false);
    const login: Ref<string> = ref(null);
    const password: Ref<string> = ref(null);
    const code = ref('');
    const securityCodeRequired = ref(false);
    const rememberMe: Ref<boolean> = ref(false);
    const route = useRoute();
    const router = useRouter();


    const accountService = inject<AccountService>('accountService');
    const loginService = inject<LoginService>('loginService');

    const doLogin = async () => {
      const data = {
        username: login.value,
        password: password.value,
        rememberMe: rememberMe.value,
        ...(code.value.trim() ? { code: code.value.trim() } : {}),
      };
      try {
        const result = await axios.post('api/authenticate', data);
        const bearerToken = result.headers.authorization;
        let jwt: string | null = null;
        if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
          jwt = bearerToken.slice(7, bearerToken.length);
        } else if (result.data?.id_token) {
          jwt = result.data.id_token;
        }
        if (jwt) {
          if (rememberMe.value) {
            setAccessToken(jwt);
            sessionStorage.removeItem('jhi-authenticationToken');
          } else {
            setAccessToken(jwt);
            localStorage.removeItem('jhi-authenticationToken');
          }
        }

        authenticationError.value = false;
        securityCodeRequired.value = false;
        password.value = '';
        code.value = '';
        loginService.hideLogin();
        await accountService.retrieveAccount();
        if (route.path === '/forbidden') {
          await router.replace('/');
        }
      } catch (_error: any) {
        authenticationError.value = true;
        securityCodeRequired.value = _error?.response?.data?.code === 'MFA_REQUIRED';
        code.value = '';
      }
    };
    return {
      authenticationError,
      login,
      password,
      code,
      securityCodeRequired,
      rememberMe,
      accountService,
      doLogin,
      t$: useI18n().t,
    };
  },
});
