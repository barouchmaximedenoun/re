import type { TokenStorage } from './token-storage.js';

export interface TokenRefreshHandler {
  (): Promise<string | null | undefined>;
}

export class TokenManager {
  private refreshPromise: Promise<string | null> | null = null;

  private refreshHandler: TokenRefreshHandler | null = null;

  public constructor(
    private readonly storage: TokenStorage,
  ) {}

  public setRefreshHandler(
    handler: TokenRefreshHandler,
  ): void {
    this.refreshHandler = handler;
  }

  public async getAccessToken(): Promise<string | null> {
    return this.storage.getAccessToken();
  }

  public async setAccessToken(
    token: string,
  ): Promise<void> {
    await this.storage.setAccessToken(token);
  }

  public async clearAccessToken(): Promise<void> {
    await this.storage.clearAccessToken();
  }

  public async refresh(): Promise<string | null | undefined> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string | null> {
    if (!this.refreshHandler) {
      throw new Error('Token refresh is not configured');
    }

    try {
      const accessToken = await this.refreshHandler();

      if (!accessToken) {
        this.clearAccessToken();
        return null;
      }

      this.setAccessToken(accessToken);

      return accessToken;
    } catch {
      this.clearAccessToken();
      return null;
    }
  }
}