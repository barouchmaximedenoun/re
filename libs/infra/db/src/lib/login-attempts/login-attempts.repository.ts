import { query } from '../db.js';

export interface LoginAttempt {
  id: string;
  email: string;
  attempts: number;
  lock_until: Date | null;
  last_attempt: Date;
}

export async function findLoginAttemptByEmail(
  email: string,
): Promise<LoginAttempt | null> {
  const result = await query<LoginAttempt>(
    `
      SELECT
        id,
        email,
        attempts,
        lock_until,
        last_attempt
      FROM auth_schema.login_attempts
      WHERE email = $1
    `,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function recordLoginFailure(
  email: string,
  lockUntil: Date | null,
): Promise<LoginAttempt> {
  const result = await query<LoginAttempt>(
    `
      INSERT INTO auth_schema.login_attempts (
        email,
        attempts,
        lock_until,
        last_attempt
      )
      VALUES ($1, 1, $2, now())
      ON CONFLICT (email)
      DO UPDATE SET
        attempts = auth_schema.login_attempts.attempts + 1,
        lock_until = EXCLUDED.lock_until,
        last_attempt = now()
      RETURNING
        id,
        email,
        attempts,
        lock_until,
        last_attempt
    `,
    [email, lockUntil],
  );

  return result.rows[0];
}

export async function resetLoginAttempts(email: string): Promise<void> {
  await query(
    `
      DELETE FROM auth_schema.login_attempts
      WHERE email = $1
    `,
    [email],
  );
}
