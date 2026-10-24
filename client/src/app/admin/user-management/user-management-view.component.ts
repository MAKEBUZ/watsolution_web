import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import axios from 'axios';

import UserManagementService from './user-management.service';
import { useDateFormat } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'JhiUserManagementView',
  setup() {
    const route = useRoute();
    const { formatDateLong: formatDate } = useDateFormat();

    const alertService = inject('alertService', () => useAlertService(), true);
    const userManagementService = inject('userManagementService', () => new UserManagementService(), true);

    const user: Ref<any> = ref(null);
    const currentPassword = ref(''),
      recoveryLink = ref(''),
      recoveryMessage = ref('');
    const issuing = ref(false);
    async function issueRecovery() {
      if (issuing.value || !user.value?.id) return;
      issuing.value = true;
      recoveryLink.value = '';
      recoveryMessage.value = '';
      try {
        const { data } = await axios.post(`api/security/accounts/${user.value.id}/recovery`, { password: currentPassword.value });
        recoveryLink.value = `${window.location.origin}/account/reset/finish#key=${encodeURIComponent(data.key)}`;
        recoveryMessage.value =
          'Enlace de un solo uso, válido 30 minutos. Entrégalo únicamente al titular cuya identidad verificaste. El segundo factor existente se conserva.';
      } catch {
        recoveryMessage.value = 'No se pudo generar el enlace. Revisa tu contraseña y permisos.';
      } finally {
        issuing.value = false;
        currentPassword.value = '';
      }
    }

    async function loadUser(userId: string) {
      try {
        const response = await userManagementService.get(userId);
        user.value = response.data;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    }

    loadUser(route.params?.userId);

    return {
      formatDate,
      alertService,
      userManagementService,
      user,
      currentPassword,
      recoveryLink,
      recoveryMessage,
      issuing,
      issueRecovery,
      t$: useI18n().t,
    };
  },
});
