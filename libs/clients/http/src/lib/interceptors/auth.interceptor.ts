import type { AxiosInstance } from 'axios';
import type { TokenProvider } from '../http-client.types.js';

/**
 * Attaches an Authorization header using the injected token provider.
 * Stays decoupled from @platform/identity (or any auth source) on purpose —
 * the consumer wires the actual token source when creating the client.
 */
export function registerAuthInterceptor(instance: AxiosInstance, getAccessToken?: TokenProvider): void {
  if (!getAccessToken) return;

  instance.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
}
