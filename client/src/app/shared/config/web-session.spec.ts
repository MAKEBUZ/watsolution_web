import axios from 'axios';
import { getAccessToken, refreshAccessToken, setAccessToken } from './web-session';
describe('Memory session rotation', () => {
  afterEach(() => { vi.restoreAllMocks(); setAccessToken(null); });
  it('does not restore access after logout during refresh', async () => {
    let resolve: (value: any) => void;
    const post = vi.fn(() => new Promise(done => { resolve = done; }));
    vi.spyOn(axios, 'create').mockReturnValue({ post } as any); setAccessToken('old');
    const pending = refreshAccessToken(); await vi.waitFor(() => expect(post).toHaveBeenCalledOnce());
    setAccessToken(null); resolve!({ data: { id_token: 'late' } });
    await expect(pending).rejects.toThrow('Session changed'); expect(getAccessToken()).toBeNull();
  });
  it('coalesces concurrent refreshes without browser storage', async () => {
    const post = vi.fn().mockResolvedValue({ data: { id_token: 'rotated' } });
    vi.spyOn(axios, 'create').mockReturnValue({ post } as any); setAccessToken('old');
    await Promise.all([refreshAccessToken(), refreshAccessToken()]);
    expect(post).toHaveBeenCalledOnce(); expect(getAccessToken()).toBe('rotated');
    expect(localStorage.getItem('jhi-authenticationToken')).toBeNull(); expect(sessionStorage.getItem('jhi-authenticationToken')).toBeNull();
  });
});
