import { db } from '../db.js';

export async function findUserByEmail(
  email: string
) {
  const result = await db.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
}) {
  const result = await db.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      name
    )
    VALUES ($1, $2, $3)
    RETURNING id, email, name
    `,
    [
      data.email,
      data.passwordHash,
      data.name,
    ]
  );

  return result.rows[0];
}
