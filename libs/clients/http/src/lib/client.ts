import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  HttpClient,
  HttpClientOptions,
  HttpRequestConfig,
  HttpResponse,
} from './types.js';
import { registerAuthInterceptor } from './interceptors/auth.interceptor.js';
import { registerLoggingInterceptors } from './interceptors/logging.interceptor.js';
import { registerErrorInterceptor } from './interceptors/error.interceptor.js';
import { registerRefreshInterceptor } from "./interceptors/refresh.interceptor.js";

function toAxiosConfig(config?: HttpRequestConfig) {
  if (!config) return undefined;

  return {
    headers: config.headers,
    params: config.params,
    timeout: config.timeoutMs,
    signal: config.signal,
    withCredentials: config.withCredentials,
    skipAuth: config.skipAuth,
    skipAuthRefresh: config.skipAuthRefresh,
  };
}

function toHttpResponse<T>(axiosResponse: { data: T; status: number; headers: unknown }): HttpResponse<T> {
  return {
    data: axiosResponse.data,
    status: axiosResponse.status,
    headers: (axiosResponse.headers as Record<string, string>) ?? {},
  };
}

class AxiosHttpClient implements HttpClient {
  constructor(private readonly instance: AxiosInstance) {}

  async get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const res = await this.instance.get<T>(url, toAxiosConfig(config));
    return toHttpResponse(res);
  }

  async post<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const res = await this.instance.post<T>(url, body, toAxiosConfig(config));
    return toHttpResponse(res);
  }

  async put<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const res = await this.instance.put<T>(url, body, toAxiosConfig(config));
    return toHttpResponse(res);
  }

  async patch<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const res = await this.instance.patch<T>(url, body, toAxiosConfig(config));
    return toHttpResponse(res);
  }

  async delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const res = await this.instance.delete<T>(url, toAxiosConfig(config));
    return toHttpResponse(res);
  }
}

/**
 * Creates a configured HttpClient backed by axios. This is the only place
 * in the lib that touches axios directly — everything exported from
 * index.ts is in terms of the abstract HttpClient/HttpResponse/HttpError
 * types, so consumers (and apps/web, other libs) never import axios types.
 *
 * Usage:
 *   const http = createHttpClient({
 *     baseURL: 'https://api.example.com',
 *     getAccessToken: () => identityTokenStore.getAccessToken(),
 *   });
 */
export function createHttpClient(options: HttpClientOptions = {}): HttpClient {
  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: options.defaultTimeoutMs ?? 10_000,
    headers: options.defaultHeaders,
    withCredentials: options.withCredentials ?? false,
  });

  registerAuthInterceptor(instance, options.getAccessToken);

  registerRefreshInterceptor(
    instance,
    options.onTokenRefresh,
  );

  registerLoggingInterceptors(
    instance,
    options.onRequestLog,
    options.onResponseLog,
  );

  registerErrorInterceptor(instance);

  return new AxiosHttpClient(instance);
}
