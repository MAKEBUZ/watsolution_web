import { getAccessToken, setAccessToken, refreshAccessToken, getSessionGeneration } from '@/shared/config/web-session';
import axios from 'axios';

const onRequestSuccess = config => {
  config.headers ??= {};
  config._sessionGeneration = getSessionGeneration();
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.url?.includes('api/authenticate')) config.headers['X-Session-Transport'] = 'web';
  config.withCredentials = true;
  config.timeout = 30000;
  config.url = `${SERVER_API_URL}${config.url}`;
  return config;
};
const setupAxiosInterceptors = (onUnauthenticated, onServerError) => {
  const onResponseError = async err => {
    const generation = getSessionGeneration();
    if (err.config?._sessionGeneration !== undefined && err.config._sessionGeneration !== generation) return Promise.reject(err);
    const status = err.status || err.response?.status;
    if (status === 401 && !err.config?._retried && !err.config?.url?.includes('authenticate') && !err.config?.url?.includes('session/')) {
      try {
        await refreshAccessToken();
        if (generation !== getSessionGeneration()) return Promise.reject(err);
        const config = { ...err.config, _retried: true, headers: { ...err.config?.headers, Authorization: `Bearer ${getAccessToken()}` } };
        const response = await axios.create().request(config);
        if (generation !== getSessionGeneration()) throw new Error('Session changed');
        return response;
      } catch {
        if (generation !== getSessionGeneration()) return Promise.reject(err);
        setAccessToken(null);
      }
    }
    if (status === 401) return onUnauthenticated(err);
    if (status >= 500) return onServerError(err);
    return Promise.reject(err);
  };
  if (axios.interceptors) {
    axios.interceptors.request.use(onRequestSuccess);
    axios.interceptors.response.use(res => {
      if ((res.config as any)._sessionGeneration !== getSessionGeneration()) throw new Error('Session changed');
      return res;
    }, onResponseError);
  }
};
export { onRequestSuccess, setupAxiosInterceptors };
