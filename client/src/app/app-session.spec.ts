import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import App from './app.vue';
import { useAccountStore } from '@/shared/config/store/account-store';
import { logoutStorageKey } from '@/shared/config/web-session';

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/', name: 'Home' }) }));
describe('Logout feedback and cross-tab events', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()); });
  afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  const render = () => mount(App, { global: { stubs: { Header: true, Footer: true, ChatBot: true, 'router-view': true } } });
  it('shows pending and failed confirmation with a retry action', async () => {
    const wrapper = render(); const store = useAccountStore();
    store.logoutStatus = 'pending'; await nextTick();
    expect(wrapper.get('[role="status"]').text()).toContain('Cerrando');
    store.logoutStatus = 'failed'; await nextTick();
    expect(wrapper.get('[role="alert"]').text()).toContain('no pudimos confirmar');
    const retry = vi.spyOn(store, 'logout').mockResolvedValue(true);
    await wrapper.get('[role="alert"] button').trigger('click');
    expect(retry).toHaveBeenCalledOnce(); wrapper.unmount();
  });
  it('clears identity after another tab closes the session and unregisters on unmount', async () => {
    const wrapper = render(); const store = useAccountStore();
    store.setAuthentication({ id: 3 });
    localStorage.setItem(logoutStorageKey, 'confirmed:other');
    window.dispatchEvent(new StorageEvent('storage', { key: logoutStorageKey, newValue: 'confirmed:other' }));
    expect(store.account).toBeNull(); expect(store.logoutStatus).toBe('confirmed');
    wrapper.unmount(); store.setAuthentication({ id: 4 });
    window.dispatchEvent(new StorageEvent('storage', { key: logoutStorageKey, newValue: 'confirmed:again' }));
    expect(store.account.id).toBe(4);
  });
});
