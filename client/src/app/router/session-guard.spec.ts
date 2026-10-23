import { createMemoryHistory, createRouter } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { useAccountStore } from '@/shared/config/store/account-store';
import AccountService from '@/account/account.service';
import { createSessionGuard } from './session-guard';
import { logoutStorageKey, setAccessToken } from '@/shared/config/web-session';

describe('Session navigation', () => {
  beforeEach(() => { localStorage.clear(); setAccessToken(null); setActivePinia(createPinia()); });
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); setAccessToken(null); });
  const fixture = () => {
    const store = useAccountStore();
    const accounts = new AccountService(store);
    const component = { template: '<div />' };
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/', component }, { path: '/login', component }, { path: '/forbidden', component },
      { path: '/private', component, meta: { authorities: ['ROLE_ADMIN'] } },
    ] });
    router.beforeResolve(createSessionGuard(store, accounts));
    return { store, accounts, router };
  };
  it.each(['pending', 'failed', 'confirmed'] as const)('opens login and home while logout is %s without waiting for any API', async status => {
    const { store, accounts, router } = fixture();
    store.logoutStatus = status;
    const restore = vi.spyOn(store, 'initAccount').mockImplementation(() => new Promise(() => {}));
    const update = vi.spyOn(accounts, 'update').mockImplementation(() => new Promise(() => {}));
    await router.push('/login');
    expect(router.currentRoute.value.path).toBe('/login');
    await router.push('/');
    expect(router.currentRoute.value.path).toBe('/');
    expect(restore).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
  it('lets login navigation cancel a protected-page restore that is still waiting on the server', async () => {
    const { store, router } = fixture();
    let finish!: () => void;
    const restore = vi.spyOn(store, 'initAccount').mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    const pending = router.push('/private');
    await vi.waitFor(() => expect(restore).toHaveBeenCalledOnce());
    await router.push('/login');
    expect(router.currentRoute.value.path).toBe('/login');
    finish(); await pending;
    expect(router.currentRoute.value.path).toBe('/login');
  });
  it('redirects protected content to login after an explicit logout without restoring the cookie', async () => {
    const { router } = fixture();
    localStorage.setItem(logoutStorageKey, 'pending:offline');
    await router.push('/private');
    expect(router.currentRoute.value.path).toBe('/login');
    expect(router.currentRoute.value.query.redirect).toBe('/private');
  });
  it('restores identity for protected routes and still enforces roles', async () => {
    const { store, router } = fixture();
    vi.spyOn(store, 'initAccount').mockImplementation(async () => { store.setAuthentication({ authorities: ['ROLE_USER'] }); });
    await router.push('/private');
    expect(router.currentRoute.value.path).toBe('/forbidden');
    store.setAuthentication({ authorities: ['ROLE_ADMIN'] });
    await router.push('/private');
    expect(router.currentRoute.value.path).toBe('/private');
  });
});
