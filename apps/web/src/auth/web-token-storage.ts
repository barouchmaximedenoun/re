import type { TokenStorage } from '@clients/http';

export class WebTokenStorage implements TokenStorage {
  private accessToken: string | null = null;

  public async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  public async setAccessToken(
    token: string,
  ): Promise<void> {
    this.accessToken = token;
  }

  public async clearAccessToken(): Promise<void> {
    this.accessToken = null;
  }
}