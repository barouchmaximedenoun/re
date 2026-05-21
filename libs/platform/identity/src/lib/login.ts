import { findUserByEmail } from '@infra/db';

import { verifyPassword } from './password.js';

import { signAccessToken } from './jwt.js';

export async function login(
  email: string,
  password: string
) {
  const user =
    await findUserByEmail(email);

  if (!user) {
    throw new Error(
      'Invalid credentials'
    );
  }

  const validPassword =
    await verifyPassword(
      password,
      user.password_hash
    );

  if (!validPassword) {
    throw new Error(
      'Invalid credentials'
    );
  }

  const token =
    signAccessToken(user.id);

  return {
    token,

    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}