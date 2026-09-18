import { createUser, findUserByEmail } from '@infra/db';
import { ConflictError } from '@platform/errors';

import { hashPassword } from './password.js';

export async function register(email: string, password: string, name: string) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ConflictError(
      'Email already exists',
      'AUTH_EMAIL_ALREADY_EXISTS',
    );
  }

  const passwordHash = await hashPassword(password);

  return createUser({
    email,
    passwordHash,
    name,
  });
}
