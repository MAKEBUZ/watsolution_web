import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { onRequestSuccess, setupAxiosInterceptors } from './axios-interceptor';
import { setAccessToken } from './web-session';
describe('Axios security boundaries', () => {
  const mock = new MockAdapter(axios);
  beforeEach(() => {
    axios.interceptors.request.clear(); axios.interceptors.response.clear(); mock.reset(); setAccessToken(null);
  });
  it('uses only memory and removes legacy persistence', () => {
    localStorage.setItem('jhi-authenticationToken', 'legacy'); sessionStorage.setItem('jhi-authenticationToken', 'legacy');
    setAccessToken('test-access');
    expect(onRequestSuccess({ url: 'api/account' }).headers.Authorization).toBe('Bearer test-access');
    expect(localStorage.getItem('jhi-authenticationToken')).toBeNull(); expect(sessionStorage.getItem('jhi-authenticationToken')).toBeNull();
  });
  it('selects HttpOnly cookie transport for web login', () => {
    const result = onRequestSuccess({ url: 'api/authenticate' });
    expect(result.headers['X-Session-Transport']).toBe('web'); expect(result.withCredentials).toBe(true); expect(result.headers.Authorization).toBeUndefined();
  });
  it('keeps the session on 403', async () => {
    const unauthenticated = vi.fn(); setupAxiosInterceptors(unauthenticated, vi.fn()); mock.onGet().reply(403);
    await expect(axios.get('api/people')).rejects.toThrow(); expect(unauthenticated).not.toHaveBeenCalled();
  });
  it('does not refresh a rejected login', async () => {
    const unauthenticated = vi.fn().mockRejectedValue(new Error('unauthenticated'));
    setupAxiosInterceptors(unauthenticated, vi.fn()); mock.onPost().reply(401);
    await expect(axios.post('api/authenticate')).rejects.toThrow(); expect(unauthenticated).toHaveBeenCalledOnce();
  });
});
