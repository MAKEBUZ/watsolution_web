import axios from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { useAccountStore } from './account-store';
import { getAccessToken, setAccessToken, refreshAccessToken, logoutStorageKey } from '../web-session';

describe('Web logout', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()); });
  afterEach(() => { vi.restoreAllMocks(); setAccessToken(null); localStorage.clear(); });
  it('posts the cookie transport even when no access token remains', async () => {
    setAccessToken(null);
    const post = vi.fn().mockResolvedValue({ data: { revoked: true } });
    vi.spyOn(axios, 'create').mockReturnValue({ post } as any);
    const store = useAccountStore();
    await expect(store.logout()).resolves.toBe(true);
    expect(post).toHaveBeenCalledWith(expect.stringContaining('api/session/logout'), {}, {
      withCredentials: true, headers: { 'X-Session-Transport': 'web' },
    });
    expect(store.logoutStatus).toBe('confirmed');
    await expect(refreshAccessToken()).rejects.toThrow('Session explicitly closed');
    expect(post).toHaveBeenCalledTimes(1);
  });
  it('reports network failure, keeps automatic refresh blocked, and supports retry', async () => {
    const post = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: { revoked: true } });
    vi.spyOn(axios, 'create').mockReturnValue({ post } as any);
    const store = useAccountStore(); setAccessToken('expired'); store.setAuthentication({ id: 1 });
    const pending = store.logout();
    expect(store.account).toBeNull(); expect(getAccessToken()).toBeNull(); expect(store.logoutStatus).toBe('pending');
    await expect(pending).resolves.toBe(false);
    expect(store.logoutStatus).toBe('failed');
    await expect(refreshAccessToken()).rejects.toThrow();
    await expect(store.logout()).resolves.toBe(true);
    expect(store.logoutStatus).toBe('confirmed');
  });
  it('clears another tab locally without posting another logout', () => {
    const post = vi.fn(); vi.spyOn(axios, 'create').mockReturnValue({ post } as any);
    const store = useAccountStore(); setAccessToken('old'); store.setAuthentication({ id: 1 });
    localStorage.setItem(logoutStorageKey, 'confirmed:other-tab'); store.applyRemoteLogout();
    expect(store.authenticated).toBe(false); expect(getAccessToken()).toBeNull(); expect(post).not.toHaveBeenCalled();
  });
  it('does not treat an unrelated successful response as confirmation', async () => {
    vi.spyOn(axios, 'create').mockReturnValue({ post: vi.fn().mockResolvedValue({ data: '<html>fallback</html>' }) } as any);
    const store = useAccountStore();
    await expect(store.logout()).resolves.toBe(false);
    expect(store.logoutStatus).toBe('failed');
  });
  it('restores failed status after a reload and allows a fresh explicit login', () => {
    localStorage.setItem(logoutStorageKey, 'pending:reload');
    expect(useAccountStore().logoutStatus).toBe('failed');
    setAccessToken('new-login');
    expect(localStorage.getItem(logoutStorageKey)).toBeNull();
  });
});
