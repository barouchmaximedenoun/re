import { query, withTransaction } from '../db.js';

export interface RefreshToken {
  id: string;
  user_id: string;
  family_id: string;
  parent_id: string | null;
  token_hash: string;
  is_revoked: boolean;
  expires_at: Date;
  created_at: Date;
}

export async function createRefreshToken(data: {
  userId: string;
  familyId: string;
  parentId?: string | null;
  tokenHash: string;
  expiresAt: Date;
}): Promise<RefreshToken> {
  const result = await query<RefreshToken>(
    `
      INSERT INTO auth_schema.refresh_tokens (
        user_id,
        family_id,
        parent_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id,
        family_id,
        parent_id,
        token_hash,
        is_revoked,
        expires_at,
        created_at
    `,
    [
      data.userId,
      data.familyId,
      data.parentId ?? null,
      data.tokenHash,
      data.expiresAt,
    ],
  );

  return result.rows[0];
}

export async function findRefreshTokenByHash(
  tokenHash: string,
): Promise<RefreshToken | null> {
  const result = await query<RefreshToken>(
    `
      SELECT
        id,
        user_id,
        family_id,
        parent_id,
        token_hash,
        is_revoked,
        expires_at,
        created_at
      FROM auth_schema.refresh_tokens
      WHERE token_hash = $1
      LIMIT 1
    `,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(tokenId: string): Promise<void> {
  await query(
    `
      UPDATE auth_schema.refresh_tokens
      SET is_revoked = TRUE
      WHERE id = $1
    `,
    [tokenId],
  );
}

export async function revokeRefreshTokenFamily(
  familyId: string,
): Promise<void> {
  await query(
    `
      UPDATE auth_schema.refresh_tokens
      SET is_revoked = TRUE
      WHERE family_id = $1
        AND is_revoked = FALSE
    `,
    [familyId],
  );
}

export async function rotateRefreshToken(
  currentTokenId: string,
  userId: string,
  familyId: string,
  newTokenHash: string,
  expiresAt: Date,
): Promise<RefreshToken> {
  return withTransaction(async (client) => {
    const revokeResult = await client.query(
      `
        UPDATE auth_schema.refresh_tokens
        SET is_revoked = TRUE
        WHERE id = $1
          AND user_id = $2
          AND family_id = $3
          AND is_revoked = FALSE
        RETURNING id
      `,
      [currentTokenId, userId, familyId],
    );

    if (revokeResult.rowCount !== 1) {
      throw new Error('Refresh token could not be rotated');
    }

    const result = await client.query<RefreshToken>(
      `
        INSERT INTO auth_schema.refresh_tokens (
          user_id,
          family_id,
          parent_id,
          token_hash,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          user_id,
          family_id,
          parent_id,
          token_hash,
          is_revoked,
          expires_at,
          created_at
      `,
      [userId, familyId, currentTokenId, newTokenHash, expiresAt],
    );

    return result.rows[0];
  });
}
