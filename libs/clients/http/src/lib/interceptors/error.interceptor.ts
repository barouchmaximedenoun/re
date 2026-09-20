import type { AxiosInstance, AxiosError } from 'axios';
import { HttpError } from '../http-client.types.js';

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}

export function registerErrorInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error)) {
        if (error.response) {
          return Promise.reject(
            new HttpError(`Request failed with status ${error.response.status}`, {
              status: error.response.status,
              data: error.response.data,
              cause: error,
            }),
          );
        }

        if (error.request) {
          return Promise.reject(
            new HttpError('No response received from server', { cause: error }),
          );
        }

        return Promise.reject(new HttpError(error.message, { cause: error }));
      }

      const message = error instanceof Error ? error.message : 'Unknown HTTP error';
      return Promise.reject(new HttpError(message, { cause: error }));
    },
  );
}
