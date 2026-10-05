import axios from 'axios';

let token: string | null = null;
let refreshing: Promise<void> | undefined;
let generation = 0;
export const logoutStorageKey = 'watsolution-logout';
export const getAccessToken = () => token;
export const getSessionGeneration = () => generation;
export function setAccessToken(value: string | null) {
  generation++;
  token = value;
  if (value) localStorage.removeItem(logoutStorageKey);
  // Remove tokens stored by older releases. Credentials now live only in memory.
  localStorage.removeItem('jhi-authenticationToken');
  sessionStorage.removeItem('jhi-authenticationToken');
}
export function refreshAccessToken(): Promise<void> {
  if (localStorage.getItem(logoutStorageKey)) return Promise.reject(new Error('Session explicitly closed'));
  const started = generation;
  const rotate = async () => {
    if (started !== generation || localStorage.getItem(logoutStorageKey)) throw new Error('Session changed');
    const result = await axios.create().post(`${SERVER_API_URL}api/session/refresh`, {}, { withCredentials: true, headers: { 'X-Session-Transport': 'web' } });
    if (started !== generation || localStorage.getItem(logoutStorageKey)) throw new Error('Session changed');
    if (typeof result.data.id_token !== 'string') throw new Error('Invalid session response');
    token = result.data.id_token;
  };
  return refreshing ??= (navigator.locks ? navigator.locks.request('watsolution-refresh', rotate) : rotate()).finally(() => { refreshing = undefined; });
}
