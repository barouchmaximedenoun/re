import {
  createDeviceVerificationOtp,
  findValidDeviceVerificationOtpById,
  markDeviceVerificationOtpUsed,
  markDeviceVerified,
  findUserById,
} from '@infra/db';

import { UnauthorizedError } from '@platform/errors';

import { generateOtp, getOtpExpiration, hashOtp } from './otp.js';
import { createInitialRefreshToken } from '../refresh-token/refresh-token.service.js';
import { signAccessToken } from '../jwt.js';

export async function createDeviceVerificationChallenge(
  userId: string,
  deviceId: string,
): Promise<{
  challengeId: string;
  expiresAt: Date;
}> {
  const otp = generateOtp();
  const otpCodeHash = hashOtp(otp);
  const expiresAt = getOtpExpiration();

  
  const verificationOtp = await createDeviceVerificationOtp({
    userId,
    deviceId,
    otpCodeHash,
    expiresAt,
  });

  await sendDeviceVerificationOtp(userId, deviceId, otp);

  return {
    challengeId: verificationOtp.id,
    expiresAt: verificationOtp.expires_at,
  };
}

async function sendDeviceVerificationOtp(
  userId: string,
  deviceId: string,
  otp: string,
): Promise<void> {
  // Email provider will be integrated later.
  console.log('OTP for test: ', userId, deviceId, otp);
  void userId;
  void deviceId;
  void otp;
}

export async function verifyDeviceOtp(
  challengeId: string,
  otp: string,
): Promise<{
  accessToken: string;
  refreshToken: {
    token: string;
    expiresAt: Date;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}> {
  const verificationOtp = await findValidDeviceVerificationOtpById(challengeId);

  if (!verificationOtp) {
    throw new UnauthorizedError(
      'Invalid or expired verification code',
      'AUTH_INVALID_OTP',
    );
  }

  const otpCodeHash = hashOtp(otp);

  if (otpCodeHash !== verificationOtp.otp_code_hash) {
    throw new UnauthorizedError(
      'Invalid or expired verification code',
      'AUTH_INVALID_OTP',
    );
  }

  await markDeviceVerificationOtpUsed(verificationOtp.id);

  await markDeviceVerified(verificationOtp.device_id);

  const user = await findUserById(verificationOtp.user_id);

  if (!user) {
    throw new UnauthorizedError(
      'Invalid verification request',
      'AUTH_INVALID_VERIFICATION',
    );
  }

  const accessToken = signAccessToken(user.id);

  const refreshToken = await createInitialRefreshToken(user.id);

  return {
    accessToken,

    refreshToken: {
      token: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
    },

    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}
