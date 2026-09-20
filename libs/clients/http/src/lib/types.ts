/**
 * Public contract for the http client. Consumers depend on these types only —
 * never on axios types directly. This keeps the door open to swapping the
 * underlying implementation (axios -> fetch/undici/etc.) without touching
 * every consumer.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class HttpError extends Error {
  readonly status?: number;
  readonly data?: unknown;
  readonly isHttpError = true as const;

  constructor(message: string, options: { status?: number; data?: unknown; cause?: unknown }) {
    super(message);
    this.name = 'HttpError';
    this.status = options.status;
    this.data = options.data;
    this.cause = options.cause;
  }
}

/**
 * Called before each request. Return a token (or null/undefined if none
 * available) to have it attached as a Bearer token. Kept as an injected hook
 * rather than a direct dependency on @platform/identity so this lib has no
 * coupling to how/where tokens are issued or stored.
 */
export type TokenProvider = () => string | null | undefined | Promise<string | null | undefined>;

export interface HttpClientOptions {
  baseURL?: string;
  defaultTimeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  getAccessToken?: TokenProvider;
  onRequestLog?: (info: { method: HttpMethod; url: string }) => void;
  onResponseLog?: (info: { method: HttpMethod; url: string; status: number; durationMs: number }) => void;
}

export interface HttpClient {
  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  put<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
}
