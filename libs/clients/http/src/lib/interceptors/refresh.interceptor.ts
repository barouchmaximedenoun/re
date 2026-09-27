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

      /*
        une requête pourrait très bien ne pas envoyer de token mais quand même être autorisée 
        à utiliser le mécanisme de refresh dans certains cas futurs 
        on enleve ce code
        if (config.skipAuth) {
        return Promise.reject(error);
        et on garde le test precedent seulement 
        if (config._retry || config.skipAuthRefresh) { 
          return Promise.reject(error); 
        }
      } */

      config._retry = true;

      if (!state.promise) {
        state.promise = onTokenRefresh().finally(() => {
          state.promise = null;
        });
      }

      let newAccessToken: string | null | undefined;
      try {
        newAccessToken = await state.promise;
      } catch {
        return Promise.reject(error);
      }

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${newAccessToken}`;

      return instance.request(config);
    },
  );
}