import {
  createUserDevice,
  findLoginAttemptByEmail,
  findUserByEmail,
  findUserDevice,
  recordLoginFailure,
  resetLoginAttempts,
  updateDeviceLastLogin,
} from '@infra/db';

import { UnauthorizedError } from '@platform/errors';

import type { DeviceInfo } from './device/device.types.js';
import { createDeviceVerificationChallenge } from './device/device-verification.service.js';
import { createInitialRefreshToken } from './refresh-token/refresh-token.service.js';
import { signAccessToken } from './jwt.js';
import { verifyPassword } from './password.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function login(
  email: string,
  password: string,
  deviceInfo: DeviceInfo,
) {
  const loginAttempt = await findLoginAttemptByEmail(email);

  if (
    loginAttempt?.lock_until &&
    loginAttempt.lock_until.getTime() > Date.now()
  ) {
    throw new UnauthorizedError(
      'Invalid credentials',
      'AUTH_INVALID_CREDENTIALS',
    );
  }

  const user = await findUserByEmail(email);

  if (!user) {
    await recordFailedLogin(email);

    throw new UnauthorizedError(
      'Invalid credentials',
      'AUTH_INVALID_CREDENTIALS',
    );
  }

  const validPassword = await verifyPassword(password, user.password_hash);

  if (!validPassword) {
    await recordFailedLogin(email);

    throw new UnauthorizedError(
      'Invalid credentials',
      'AUTH_INVALID_CREDENTIALS',
    );
  }

  await resetLoginAttempts(email);

  let device = await findUserDevice(
    user.id,
    deviceInfo.ipAddress,
    deviceInfo.browserName,
    deviceInfo.osName,
  );

  if (!device) {
    device = await createUserDevice({
      userId: user.id,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      browserName: deviceInfo.browserName,
      osName: deviceInfo.osName,
    });
  }

  if (!device.is_verified) {
    await createDeviceVerificationChallenge(user.id, device.id);

    return {
      requiresOtp: true,
      device: {
        id: device.id,
        isVerified: false,
      },
    };
  }

  await updateDeviceLastLogin(device.id);

  const accessToken = signAccessToken(user.id);

  const refreshToken = await createInitialRefreshToken(user.id);

  return {
    requiresOtp: false,

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

    device: {
      id: device.id,
      isVerified: true,
    },
  };
}

async function recordFailedLogin(email: string): Promise<void> {
  const currentAttempt = await findLoginAttemptByEmail(email);

  const lockExpired =
    currentAttempt?.lock_until &&
    currentAttempt.lock_until.getTime() <= Date.now();

  const currentAttempts = lockExpired ? 0 : (currentAttempt?.attempts ?? 0);

  const nextAttempts = currentAttempts + 1;

  const lockUntil =
    nextAttempts >= MAX_LOGIN_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_DURATION_MS)
      : null;

  await recordLoginFailure(email, lockUntil);
}
