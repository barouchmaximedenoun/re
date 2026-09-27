import type { AuthUser } from './auth-types.js';
import { AuthService } from './auth-service.js';
import { WebTokenManager } from './token-manager.js';

export type AuthSessionStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

export interface AuthSessionState {
  status: AuthSessionStatus;
  user: AuthUser | null;
}

export class AuthSession {
  private state: AuthSessionState = {
    status: 'loading',
    user: null,
  };

  private initialized = false;

  constructor(
    private readonly tokenManager: WebTokenManager,
    private readonly authService: AuthService,
  ) {}

  getState(): AuthSessionState {
    return this.state;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<AuthSessionState> {
    if (this.initialized) {
      return this.state;
    }

    try {
      const accessToken =
        await this.tokenManager.refresh();

      if (!accessToken) {
        this.state = {
          status: 'unauthenticated',
          user: null,
        };

        return this.state;
      }

      const user = await this.authService.me();

      this.state = {
        status: 'authenticated',
        user,
      };

      return this.state;
    } catch {
      this.tokenManager.clearAccessToken();

      this.state = {
        status: 'unauthenticated',
        user: null,
      };

      return this.state;
    } finally {
      this.initialized = true;
    }
  }

  setAuthenticated(user: AuthUser): void {
    this.state = {
      status: 'authenticated',
      user,
    };
  }

  setUnauthenticated(): void {
    this.tokenManager.clearAccessToken();

    this.state = {
      status: 'unauthenticated',
      user: null,
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    const result = await this.authService.login(
      email,
      password,
    );

    if (result.requiresOtp) {
      return result;
    }

    this.tokenManager.setAccessToken(
      result.accessToken,
    );

    this.setAuthenticated(result.user);

    return result;
  }

  async verifyDevice(
    otpChallengeId: string,
    otp: string,
  ) {
    const result =
      await this.authService.verifyDevice(
        otpChallengeId,
        otp,
      );

    this.tokenManager.setAccessToken(
      result.accessToken,
    );

    this.setAuthenticated(result.user);

    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } finally {
      this.setUnauthenticated();
    }
  }
}
