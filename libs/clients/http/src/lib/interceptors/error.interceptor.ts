import type { AxiosInstance, AxiosError } from 'axios';
import { HttpError } from '../http-error.js';
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
              statusCode: error.response.status,
              code: error.response.statusText,
              cause: error,
            }),
          );
        }

        if (error.request) {
          return Promise.reject(
            new HttpError('No response received from server', { 
              statusCode: error.request.statusCode ?? 503,
              code: error.request.statusText ?? "Service Unavailable",
              cause: error 
            }),
          );
        }

        return Promise.reject(new HttpError(error.message, { 
              statusCode: 400,
              code: "Bad Regquest",
              cause: error 
            }));
      }

      const message = error instanceof Error ? error.message : 'Unknown HTTP error';
      return Promise.reject(new HttpError(message, { 
              statusCode:500,
              code: "Internal Server Error",
              cause: error 
            }));
    },
  );
}
