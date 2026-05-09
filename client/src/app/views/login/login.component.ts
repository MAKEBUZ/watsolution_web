import axios from 'axios';
import { type Ref, defineComponent, inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import type AccountService from '@/account/account.service';
import { useStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  setup() {
    const router = useRouter();
    const store = useStore();
    const accountService = inject<AccountService>('accountService');

    const username: Ref<string> = ref('');
    const password: Ref<string> = ref('');
    const rememberMe: Ref<boolean> = ref(false);
    const authError: Ref<boolean> = ref(false);
    const loading: Ref<boolean> = ref(false);

    const doLogin = async () => {
      authError.value = false;
      loading.value = true;
      try {
        const result = await axios.post('api/authenticate', {
          username: username.value,
          password: password.value,
          rememberMe: rememberMe.value,
        });
        const bearerToken = result.headers.authorization;
        if (bearerToken?.startsWith('Bearer ')) {
          const jwt = bearerToken.slice(7);
          if (rememberMe.value) {
            localStorage.setItem('jhi-authenticationToken', jwt);
            sessionStorage.removeItem('jhi-authenticationToken');
          } else {
            sessionStorage.setItem('jhi-authenticationToken', jwt);
            localStorage.removeItem('jhi-authenticationToken');
          }
        }
        await accountService.retrieveAccount();
        const isAdmin = store.account?.authorities?.includes('ROLE_ADMIN');
        router.push(isAdmin ? '/admin-panel' : '/portal');
      } catch {
        authError.value = true;
      } finally {
        loading.value = false;
      }
    };

    return { username, password, rememberMe, authError, loading, doLogin };
  },
});
