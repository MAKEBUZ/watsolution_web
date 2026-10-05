import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import Settings from './settings/settings.vue';
import ChangePassword from './change-password/change-password.vue';
import settingsMessages from '../../i18n/es/settings.json';
import passwordMessages from '../../i18n/es/password.json';
import { useAccountStore } from '@/shared/config/store/account-store';

describe('Account names are text (T-012 / WS-011)', () => {
  it.each([
    ['settings', Settings], ['password', ChangePassword],
  ] as const)('does not create HTML elements in %s title', (_name, component) => {
    const username = '<img src=x onerror="alert(1)"><strong>Nombre & apellido</strong>';
    const pinia = createPinia();
    setActivePinia(pinia);
    useAccountStore().setAuthentication({ login: username, firstName: 'Test', lastName: 'User', email: 'test@example.test' });
    const i18n = createI18n({ legacy: false, locale: 'es', missingWarn: false, fallbackWarn: false,
      messages: { es: { ...settingsMessages, ...passwordMessages } } });
    const wrapper = mount(component, { global: { plugins: [pinia, i18n], provide: { currentUsername: computed(() => username) } } });
    const title = wrapper.get('h2');
    expect(title.text()).toContain(username);
    expect(title.find('img').exists()).toBe(false);
    expect(title.find('[onerror]').exists()).toBe(false);
    wrapper.unmount();
  });
});
