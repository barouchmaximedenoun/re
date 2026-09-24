import type {
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios';
import type { TokenRefreshHandler } from '../types.js';
import { isAxiosError } from '../utils/is-axios-error.js';

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuth?: boolean;
  skipAuthRefresh?: boolean;
};

interface RefreshState {
  promise: Promise<string | null | undefined> | null;
}

export function registerRefreshInterceptor(
  instance: AxiosInstance,
  onTokenRefresh?: TokenRefreshHandler,
): void {
  if (!onTokenRefresh) return;

  const state: RefreshState = {
    promise: null,
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isAxiosError(error) || !error.config) {
        return Promise.reject(error);
      }

      const config = error.config as RetryableRequestConfig;

      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      if (config._retry || config.skipAuthRefresh) {
        return Promise.reject(error);
      }

      if (config.skipAuth) {
        return Promise.reject(error);
      }

      config._retry = true;

      if (!state.promise) {
        state.promise = onTokenRefresh().finally(() => {
          state.promise = null;
        });
      }

      const newAccessToken = await state.promise;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${newAccessToken}`;

      return instance.request(config);
    },
  );
}