import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import App from './app.vue';
import { useAccountStore } from '@/shared/config/store/account-store';
import { logoutStorageKey } from '@/shared/config/web-session';

const { route, replace } = vi.hoisted(() => ({ route: { path: '/', name: 'Home', matched: [] as any[] }, replace: vi.fn().mockResolvedValue(undefined) }));
vi.mock('vue-router', () => ({ useRoute: () => route, useRouter: () => ({ replace }) }));
describe('Logout feedback and cross-tab events', () => {
  beforeEach(() => { localStorage.clear(); route.path = '/'; route.matched = []; replace.mockClear(); setActivePinia(createPinia()); });
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
  it('unmounts protected content and navigates to login on a remote logout', async () => {
    route.path = '/admin/actividad'; route.matched = [{ meta: { authorities: ['ROLE_ADMIN'] } }];
    const store = useAccountStore(); store.setAuthentication({ id: 3, authorities: ['ROLE_ADMIN'] });
    const wrapper = render(); expect(wrapper.find('router-view-stub').exists()).toBe(true);
    localStorage.setItem(logoutStorageKey, 'confirmed:other');
    window.dispatchEvent(new StorageEvent('storage', { key: logoutStorageKey, newValue: 'confirmed:other' }));
    await nextTick();
    expect(wrapper.find('router-view-stub').exists()).toBe(false);
    expect(replace).toHaveBeenCalledWith('/login'); wrapper.unmount();
  });

});
