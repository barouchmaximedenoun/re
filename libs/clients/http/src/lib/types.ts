export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD';

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeoutMs?: number;
  signal?: AbortSignal;
  withCredentials?: boolean;

  /**
   * Do not attach the access token to this request.
   * Useful for authentication endpoints such as login/register/refresh.
   */
  skipAuth?: boolean;

  /**
   * Do not attempt access-token refresh if this request receives 401.
   */
  skipAuthRefresh?: boolean;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export type TokenProvider = () =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

export type TokenRefreshHandler = () => Promise<string | null | undefined>;

export interface HttpClientOptions {
  baseURL?: string;
  defaultTimeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  withCredentials?: boolean;

  getAccessToken?: TokenProvider;
  onTokenRefresh?: TokenRefreshHandler;

  onRequestLog?: (info: {
    method: HttpMethod;
    url: string;
  }) => void;

  onResponseLog?: (info: {
    method: HttpMethod;
    url: string;
    status: number;
    durationMs: number;
  }) => void;
}

export interface HttpClient {
  get<T = unknown>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;

  post<T = unknown>(
    url: string,
    body?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;

  put<T = unknown>(
    url: string,
    body?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;

  patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;

  delete<T = unknown>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>>;
}