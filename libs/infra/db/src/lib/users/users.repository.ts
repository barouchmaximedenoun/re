import { query } from '../db.js';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  is_locked: boolean;
  lock_until: Date | null;
  last_seen: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    `
      SELECT
        id,
        email,
        password_hash,
        name,
        is_locked,
        lock_until,
        last_seen,
        created_at,
        updated_at
      FROM auth_schema.users
      WHERE email = $1
    `,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
}): Promise<Pick<User, 'id' | 'email' | 'name'>> {
  const result = await query<Pick<User, 'id' | 'email' | 'name'>>(
    `
      INSERT INTO auth_schema.users (
        email,
        password_hash,
        name
      )
      VALUES ($1, $2, $3)
      RETURNING id, email, name
    `,
    [data.email, data.passwordHash, data.name],
  );

  return result.rows[0];
}

export async function findUserById(userId: string): Promise<User | null> {
  const result = await query<User>(
    `
      SELECT
        id,
        email,
        password_hash,
        name,
        is_locked,
        lock_until,
        last_seen,
        created_at,
        updated_at
      FROM auth_schema.users
      WHERE id = $1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}
