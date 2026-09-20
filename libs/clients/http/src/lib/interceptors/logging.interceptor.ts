import type { AxiosInstance } from 'axios';
import type { HttpMethod, HttpClientOptions } from '../http-client.types.js';

const START_TIME_KEY = '__startTime';

export function registerLoggingInterceptors(
  instance: AxiosInstance,
  onRequestLog?: HttpClientOptions['onRequestLog'],
  onResponseLog?: HttpClientOptions['onResponseLog'],
): void {
  instance.interceptors.request.use((config) => {
    (config as unknown as Record<string, number>)[START_TIME_KEY] = Date.now();
    onRequestLog?.({
      method: (config.method?.toUpperCase() ?? 'GET') as HttpMethod,
      url: config.url ?? '',
    });
    return config;
  });

  instance.interceptors.response.use((response) => {
    const startedAt = (response.config as unknown as Record<string, number>)[START_TIME_KEY];
    onResponseLog?.({
      method: (response.config.method?.toUpperCase() ?? 'GET') as HttpMethod,
      url: response.config.url ?? '',
      status: response.status,
      durationMs: startedAt ? Date.now() - startedAt : -1,
    });
    return response;
  });
}
