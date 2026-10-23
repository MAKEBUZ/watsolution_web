import axios from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { useAccountStore } from './account-store';
import { getAccessToken, getSessionGeneration, logoutStorageKey, setAccessToken } from '../web-session';

describe('Passive session restoration', () => {
  beforeEach(() => { localStorage.clear(); setAccessToken(null); setActivePinia(createPinia()); });
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); setAccessToken(null); });
  it.each([401, 403, 503, undefined])('does not request logout or report a logout failure when restore fails (%s)', async status => {
    const post = vi.fn().mockRejectedValue({ response: status ? { status } : undefined });
    vi.spyOn(axios, 'create').mockReturnValue({ post } as any);
    const store = useAccountStore();
    const generation = getSessionGeneration();
    await store.initAccount();
    expect(store.authenticated).toBe(false);
    expect(store.logoutStatus).toBe('idle');
    expect(store.logon).toBeNull();
    expect(getSessionGeneration()).toBe(generation); // Do not invalidate a concurrent explicit login.
    expect(localStorage.getItem(logoutStorageKey)).toBeNull();
    expect(post).toHaveBeenCalledOnce();
    expect(post).toHaveBeenCalledWith(expect.stringContaining('api/session/refresh'), {}, expect.objectContaining({ timeout: 10000 }));
  });
  it.each(['pending:offline', 'confirmed:closed'])('does not refresh or retry logout on mounting a page with %s', async marker => {
    localStorage.setItem(logoutStorageKey, marker);
    const post = vi.fn(); vi.spyOn(axios, 'create').mockReturnValue({ post } as any);
    const store = useAccountStore();
    const previousStatus = store.logoutStatus;
    await store.initAccount();
    expect(post).not.toHaveBeenCalled();
    expect(store.logoutStatus).toBe(previousStatus);
    expect(localStorage.getItem(logoutStorageKey)).toBe(marker);
  });
  it('shares initialization between the header and a protected-route guard', async () => {
    let finish!: (result: any) => void;
    const post = vi.fn(() => new Promise(resolve => { finish = resolve; }));
    vi.spyOn(axios, 'create').mockReturnValue({ post } as any);
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ status: 200, data: { login: 'operator' } });
    const store = useAccountStore();
    const first = store.initAccount(), second = store.initAccount();
    await vi.waitFor(() => expect(post).toHaveBeenCalledOnce());
    finish({ data: { id_token: 'restored-access' } });
    await Promise.all([first, second]);
    expect(get).toHaveBeenCalledOnce();
    expect(store.account.login).toBe('operator');
    expect(store.logon).toBeNull();
  });
  it('discards a late restore failure after a new explicit login', async () => {
    let fail!: (error: Error) => void;
    vi.spyOn(axios, 'create').mockReturnValue({ post: () => new Promise((_resolve, reject) => { fail = reject; }) } as any);
    const store = useAccountStore();
    const pending = store.initAccount();
    await vi.waitFor(() => expect(fail).toBeTypeOf('function'));
    setAccessToken('new-login'); store.setAuthentication({ login: 'new-user' });
    fail(new Error('old refresh failed')); await pending;
    expect(store.account.login).toBe('new-user');
    expect(getAccessToken()).toBe('new-login');
    expect(store.logoutStatus).toBe('idle');
  });
  it('clears an inaccessible account locally without sending a revocation request', async () => {
    const post = vi.fn(); vi.spyOn(axios, 'create').mockReturnValue({ post } as any);
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('account unavailable'));
    const store = useAccountStore(); setAccessToken('expired'); store.setAuthentication({ login: 'old' });
    await store.loadAccountAction();
    expect(store.account).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(store.logoutStatus).toBe('idle');
    expect(post).not.toHaveBeenCalled();
  });
});
