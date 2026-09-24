import type { AxiosInstance } from 'axios';
import type { TokenProvider } from '../types.js';

export function registerAuthInterceptor(
  instance: AxiosInstance,
  getAccessToken?: TokenProvider,
): void {
  if (!getAccessToken) return;

  instance.interceptors.request.use(async (config) => {
    if ((config as unknown as { skipAuth?: boolean }).skipAuth) {
      return config;
    }

    const token = await getAccessToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  });
}