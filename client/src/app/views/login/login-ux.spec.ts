import { flushPromises, mount } from '@vue/test-utils';
import Login from './login.vue';
import axios from 'axios';
import { getAccessToken, setAccessToken } from '@/shared/config/web-session';

const { store, replace } = vi.hoisted(() => ({
  store: { loadAccountAction: vi.fn(), authenticated: false, account: { authorities: ['ROLE_USER'] } },
  replace: vi.fn(),
}));
vi.mock('vue-router', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/shared/config/store/account-store', () => ({ useAccountStore: () => store }));

describe('Login feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.authenticated = false;
    store.account = { authorities: ['ROLE_USER'] };
    store.loadAccountAction.mockReset();
    setAccessToken(null);
  });
  afterEach(() => vi.restoreAllMocks());

  const form = async () => {
    const wrapper = mount(Login, { global: { stubs: { 'font-awesome-icon': true, 'router-link': true } } });
    await wrapper.get('#username').setValue('  test-user  ');
    await wrapper.get('#password').setValue(' test-password ');
    await wrapper.get('.auth-privacy__check').setValue(true);
    return wrapper;
  };

  it.each([
    [401, 'Usuario o contraseña incorrectos'],
    [403, 'no permite iniciar sesión desde esta web'],
    [429, 'Demasiados intentos'],
    [500, 'servidor no está disponible'],
    [502, 'servidor no está disponible'],
  ])('explains HTTP %s without masking infrastructure errors as bad credentials', async (status, message) => {
    vi.spyOn(axios, 'post').mockRejectedValue({ isAxiosError: true, response: { status } });
    const wrapper = await form();
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain(message);
    expect(replace).not.toHaveBeenCalled();
    expect(store.loadAccountAction).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('explains a network failure', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new axios.AxiosError('Network Error', 'ERR_NETWORK'));
    const wrapper = await form();
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo conectar con el servidor');
    expect(replace).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('uses the JSON token, trims the username and preserves the exact password', async () => {
    const request = vi.spyOn(axios, 'post').mockResolvedValue({ headers: {}, data: { id_token: 'test-access' } });
    store.loadAccountAction.mockImplementation(async () => {
      expect(getAccessToken()).toBe('test-access');
      store.authenticated = true;
    });
    const wrapper = await form();
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(request).toHaveBeenCalledWith('api/authenticate', {
      username: 'test-user',
      password: ' test-password ',
      rememberMe: false,
    });
    expect(replace).toHaveBeenCalledWith('/portal');
    expect(localStorage.getItem('jhi-authenticationToken')).toBeNull();
    expect(sessionStorage.getItem('jhi-authenticationToken')).toBeNull();
    wrapper.unmount();
  });

  it('accepts the legacy bearer header and routes an authenticated administrator', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ headers: { authorization: 'Bearer test-access' }, data: {} });
    store.loadAccountAction.mockImplementation(async () => {
      store.authenticated = true;
      store.account = { authorities: ['ROLE_ADMIN'] };
    });
    const wrapper = await form();
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(getAccessToken()).toBe('test-access');
    expect(replace).toHaveBeenCalledWith('/admin');
    wrapper.unmount();
  });

  it('stays on login if the server returns no token', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ headers: {}, data: {} });
    const wrapper = await form();
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain('no devolvió una sesión válida');
    expect(store.loadAccountAction).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('stays on login when account loading fails after successful authentication', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ headers: {}, data: { id_token: 'test-access' } });
    store.loadAccountAction.mockResolvedValue(undefined);
    const wrapper = await form();
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.get('[role="alert"]').text()).toContain('No se pudo cargar tu cuenta');
    expect(replace).not.toHaveBeenCalled();
    wrapper.unmount();
  });
  it('prevents duplicate submissions and restores the action after a failure', async () => {
    let fail!: (reason: Error) => void;
    const request = vi.spyOn(axios, 'post').mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          fail = reject;
        }),
    );
    const wrapper = mount(Login, { global: { stubs: { 'font-awesome-icon': true, 'router-link': true } } });
    await wrapper.get('#username').setValue('test-user');
    await wrapper.get('#password').setValue('test-password');
    await wrapper.get('.auth-privacy__check').setValue(true);
    await wrapper.get('form').trigger('submit');
    await wrapper.get('form').trigger('submit');
    expect(request).toHaveBeenCalledTimes(1);
    expect(wrapper.get('.auth-submit').attributes('disabled')).toBeDefined();
    expect(wrapper.get('.auth-submit').text()).toBe('Ingresando…');
    fail(new Error('offline'));
    await flushPromises();
    expect(wrapper.get('[role="alert"]').exists()).toBe(true);
    expect(wrapper.get('.auth-submit').attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });
});
