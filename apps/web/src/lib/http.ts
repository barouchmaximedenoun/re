import {
  createHttpClient,
  type HttpClient,
} from '@clients/http';

import { WebTokenManager } from '../auth/web-token-manager.js';
import type { RefreshResult } from '../auth/auth-types.js';

export interface WebHttpContext {
  http: HttpClient;
  tokenManager: WebTokenManager;
}

export function createWebHttpContext(): WebHttpContext {
  const tokenManager = new WebTokenManager();

  const http = createHttpClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,

    getAccessToken: () =>
      tokenManager.getAccessToken(),

    onTokenRefresh: () =>
      tokenManager.refresh(),
  });

  tokenManager.setRefreshHandler(async () => {
    const response = await http.post<RefreshResult>(
      '/auth/refresh',
      undefined,
      {
        skipAuth: true,
        skipAuthRefresh: true,
      },
    );

    return response.data.accessToken;
  });

  return {
    http,
    tokenManager,
  };
}