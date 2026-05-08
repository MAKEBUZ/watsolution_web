import { computed, defineComponent, onMounted, ref } from 'vue';
import AdminService, { type IUserWithStatus } from '@/services/admin.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AdminUsuarios',
  setup() {
    const adminService = new AdminService();
    const users = ref<IUserWithStatus[]>([]);
    const isFetching = ref(false);
    const searchQuery = ref('');
    const statusFilter = ref('');

    onMounted(async () => {
      isFetching.value = true;
      try {
        users.value = await adminService.getUsersWithStatus();
      } finally {
        isFetching.value = false;
      }
    });

    const filtered = computed(() =>
      users.value.filter(u => {
        const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
        const matchesSearch =
          !searchQuery.value ||
          fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (u.email ?? '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (u.login ?? '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          String(u.id).includes(searchQuery.value);
        const matchesStatus = !statusFilter.value || u.userStatus === statusFilter.value;
        return matchesSearch && matchesStatus;
      }),
    );

    const statusClass = (status: string) => {
      if (status === 'ACTIVO') return 'badge-activo';
      if (status === 'MOROSO') return 'badge-moroso';
      return 'badge-suspendido';
    };

    const formatDate = (date?: string) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CO');
    };

    const fullName = (u: IUserWithStatus) => {
      const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
      return name || u.login;
    };

    return { filtered, isFetching, searchQuery, statusFilter, statusClass, formatDate, fullName };
  },
});
