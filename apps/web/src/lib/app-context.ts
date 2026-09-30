import {
  AuthService,
  AuthSession,
  WebTokenManager,
} from '@/auth/index';

import {
  createWebHttpContext,
} from './http';

export interface AppContext {
  tokenManager: WebTokenManager;
  authService: AuthService;
  authSession: AuthSession;
}

export function createAppContext(): AppContext {
  const {
    http,
    tokenManager,
  } = createWebHttpContext();

  const authService =
    new AuthService(http);

  const authSession =
    new AuthSession(
      tokenManager,
      authService,
    );

  return {
    tokenManager,
    authService,
    authSession,
  };
}
