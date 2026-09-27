import { TokenManager } from "@clients/http";

export class WebTokenManager implements TokenManager {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  private refreshRequest:
    (() => Promise<string | null>) | null = null;

  setRefreshRequest(
    refreshRequest: () => Promise<string | null>,
  ): void {
    this.refreshRequest = refreshRequest;
  }

  public async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  public async setAccessToken(token: string): Promise<void> {
    this.accessToken = token;
  }

  public async clear(): Promise<void> {
    this.accessToken = null;
  }

  async refresh(): Promise<string | null> {
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
    if (!this.refreshRequest) {
      throw new Error('Token refresh is not configured');
    }

    try {
      const accessToken = await this.refreshRequest();

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
