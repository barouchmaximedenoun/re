
import { createUser, findUserByEmail } from "@infra/db";
import { hashPassword } from './password.js';

export async function register(
  email: string,
  password: string,
  name: string
) {
  const existingUser =
    await findUserByEmail(email);

  if (existingUser) {
    throw new Error(
      'Email already exists'
    );
  }

  const passwordHash =
    await hashPassword(password);

  return createUser({
    email,
    passwordHash,
    name,
  });
}