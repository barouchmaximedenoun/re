export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthDevice {
  id: string;
  isVerified: boolean;
}

export interface LoginOtpRequired {
  requiresOtp: true;
  otpChallengeId: string;
  otpExpiresAt: string;
  otp?: string;
}

export interface LoginSuccess {
  requiresOtp: false;
  accessToken: string;
  user: AuthUser;
  device: AuthDevice;
}

export type LoginResult = LoginOtpRequired | LoginSuccess;

export interface VerifyDeviceResult {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResult {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResult {
  id: string;
  email: string;
  name: string | null;
}