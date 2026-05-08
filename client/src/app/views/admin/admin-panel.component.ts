import { computed, defineComponent, inject } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AdminPanel',
  setup() {
    const store = useStore();
    const route = useRoute();
    const loginService = inject<any>('loginService');

    const currentUsername = computed(() => {
      const user = store.account;
      if (!user) return 'Administrador';
      return user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.login ?? 'Administrador';
    });

    const userInitials = computed(() => {
      const name = currentUsername.value;
      if (!name) return 'AD';
      const parts = name.trim().split(' ').filter(Boolean);
      return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name.substring(0, 2).toUpperCase();
    });

    const titleMap: Record<string, string> = {
      AdminResumen: 'Resumen',
      AdminActividad: 'Actividad',
      AdminUsuarios: 'Usuarios',
      AdminFacturacion: 'Facturación',
      AdminNoticias: 'Noticias',
    };

    const sectionTitle = computed(() => titleMap[route.name as string] ?? 'Admin');

    const logout = () => {
      if (loginService) {
        loginService.logout();
      }
    };

    return { currentUsername, userInitials, sectionTitle, logout };
  },
});
