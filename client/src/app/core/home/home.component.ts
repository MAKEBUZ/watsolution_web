import { type ComputedRef, defineComponent, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  setup() {
    const router = useRouter();
    const store = useStore();
    const authenticated = inject<ComputedRef<boolean>>('authenticated');

    const goToPortal = () => {
      if (authenticated?.value) {
        const isAdmin = store.account?.authorities?.includes('ROLE_ADMIN');
        router.push(isAdmin ? '/admin-panel' : '/portal');
      } else {
        router.push('/login');
      }
    };

    return { goToPortal };
  },
});
