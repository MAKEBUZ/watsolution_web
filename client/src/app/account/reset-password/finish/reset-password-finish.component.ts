import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { useVuelidate } from '@vuelidate/core';
import { maxLength, minLength, required, sameAs } from '@vuelidate/validators';
import type LoginService from '@/account/login.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ResetPasswordFinish',
  validations() {
    return {
      resetAccount: {
        newPassword: {
          required,
          minLength: minLength(12),
          maxLength: maxLength(72),
        },
        confirmPassword: {
          sameAsPassword: sameAs(this.resetAccount.newPassword),
        },
      },
    };
  },
  created(): void {
    const fragment = new URLSearchParams(window.location.hash.slice(1)).get('key');
    if (fragment) {
      this.key = fragment;
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }
    if (this.$route?.query?.key !== undefined) {
      this.key = this.$route.query.key;
    }
    this.keyMissing = !this.key;
  },
  setup() {
    const loginService = inject<LoginService>('loginService');

    const doNotMatch: Ref<string> = ref(null);
    const success: Ref<string> = ref(null);
    const error: Ref<string> = ref(null);
    const keyMissing: Ref<boolean> = ref(false);
    const key: Ref<any> = ref(null);
    const resetAccount: Ref<any> = ref({
      newPassword: null,
      confirmPassword: null,
      code: '',
    });

    const openLogin = () => {
      loginService.openLogin();
    };

    return {
      openLogin,
      doNotMatch,
      success,
      error,
      keyMissing,
      key,
      resetAccount,
      v$: useVuelidate(),
      t$: useI18n().t,
    };
  },
  methods: {
    finishReset() {
      this.doNotMatch = null;
      this.success = null;
      this.error = null;
      if (this.resetAccount.newPassword !== this.resetAccount.confirmPassword) {
        this.doNotMatch = 'ERROR';
      } else {
        return axios
          .post('api/account/reset-password/finish', {
            key: this.key,
            newPassword: this.resetAccount.newPassword,
            code: this.resetAccount.code,
          })
          .then(() => {
            this.success = 'OK';
          })
          .catch(() => {
            this.success = null;
            this.error = 'ERROR';
          });
      }
    },
  },
});
