import {
  findLoginAttemptByEmail,
  findUserByEmail,
  recordLoginFailure,
  resetLoginAttempts,
} from '@infra/db';
import { UnauthorizedError } from '@platform/errors';

import { signAccessToken } from './jwt.js';
import { verifyPassword } from './password.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function login(email: string, password: string) {
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

  const token = signAccessToken(user.id);

  return {
    token,

    user: {
      id: user.id,
      email: user.email,
      name: user.name,
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
