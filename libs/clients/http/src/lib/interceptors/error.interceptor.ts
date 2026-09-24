import type { AxiosInstance } from 'axios';
import { HttpError } from '../http-error.js';
import { isAxiosError } from '../utils/is-axios-error.js';

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export function registerErrorInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (!isAxiosError(error)) {
        return Promise.reject(
          new HttpError('Unknown HTTP error', {
            statusCode: 500,
            code: 'HTTP_UNKNOWN_ERROR',
            cause: error,
          }),
        );
      }

      if (error.response) {
        const data = error.response.data as ApiErrorResponse;

        return Promise.reject(
          new HttpError(
            data?.error?.message ??
              `Request failed with status ${error.response.status}`,
            {
              statusCode: error.response.status,
              code: data?.error?.code ?? 'HTTP_ERROR',
              data: error.response.data,
              cause: error,
            },
          ),
        );
      }

      if (error.request) {
        return Promise.reject(
          new HttpError('No response received from server', {
            statusCode: 0,
            code: 'HTTP_NO_RESPONSE',
            cause: error,
          }),
        );
      }

      return Promise.reject(
        new HttpError(error.message, {
          statusCode: 0,
          code: 'HTTP_REQUEST_ERROR',
          cause: error,
        }),
      );
    },
  );
}
