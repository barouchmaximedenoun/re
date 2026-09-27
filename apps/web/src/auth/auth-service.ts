import type { HttpClient } from '@clients/http';

import type {
  AuthUser,
  LoginResult,
  RegisterResult,
  VerifyDeviceResult,
} from './auth-types.js';

export class AuthService {
  constructor(private readonly http: HttpClient) {}

  async login(
    email: string,
    password: string,
  ): Promise<LoginResult> {
    const response = await this.http.post<LoginResult>(
      '/auth/login',
      {
        email,
        password,
      },
      {
        skipAuth: true,
        skipAuthRefresh: true,
      },
    );

    return response.data;
  }

  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<RegisterResult> {
    const response = await this.http.post<RegisterResult>(
      '/auth/register',
      {
        email,
        password,
        name,
      },
      {
        skipAuth: true,
        skipAuthRefresh: true,
      },
    );

    return response.data;
  }

  async verifyDevice(
    otpChallengeId: string,
    otp: string,
  ): Promise<VerifyDeviceResult> {
    const response =
      await this.http.post<VerifyDeviceResult>(
        '/auth/verify-device',
        {
          otpChallengeId,
          otp,
        },
        {
          skipAuth: true,
          skipAuthRefresh: true,
        },
      );

    return response.data;
  }

  async logout(): Promise<void> {
    await this.http.post(
      '/auth/logout',
      undefined,
      {
        skipAuth: true,
        skipAuthRefresh: true,
      },
    );
  }

  async me(): Promise<AuthUser> {
    const response =
      await this.http.get<AuthUser>('/auth/me');

    return response.data;
  }
}