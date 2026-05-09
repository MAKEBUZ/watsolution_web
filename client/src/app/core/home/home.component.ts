import { type ComputedRef, defineComponent, inject, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  setup() {
    const router = useRouter();
    const store = useStore();
    const authenticated = inject<ComputedRef<boolean>>('authenticated');

    const redirect = () => {
      if (authenticated?.value) {
        const isAdmin = store.account?.authorities?.includes('ROLE_ADMIN');
        router.replace(isAdmin ? '/admin-panel' : '/portal');
      } else {
        router.replace('/login');
      }
    };

    // Redirect immediately if auth state is already known
    redirect();

    // Also watch in case auth loads asynchronously
    watch(() => authenticated?.value, redirect);

    return {};
  },
});
