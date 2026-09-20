import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshTokenFamily,
  rotateRefreshToken,
} from '@infra/db';

import { UnauthorizedError } from '@platform/errors';

import {
  generateRefreshToken,
  getRefreshTokenExpiration,
  hashRefreshToken,
} from './refresh-token.js';

import { randomUUID } from 'node:crypto';

export async function createInitialRefreshToken(userId: string): Promise<{
  token: string;
  expiresAt: Date;
  familyId: string;
}> {
  const token = generateRefreshToken();
  const tokenHash = hashRefreshToken(token);
  const expiresAt = getRefreshTokenExpiration();

  const familyId = randomUUID();

  await createRefreshToken({
    userId,
    familyId,
    tokenHash,
    expiresAt,
  });

  return {
    token,
    expiresAt,
    familyId,
  };
}

export async function rotateRefreshTokenSession(
  token: string,
): Promise<{
  token: string;
  expiresAt: Date;
  userId: string;
}> {
  const tokenHash = hashRefreshToken(token);

  const currentToken =
    await findRefreshTokenByHash(tokenHash);

  if (!currentToken) {
    throw new UnauthorizedError(
      'Invalid refresh token',
      'AUTH_INVALID_REFRESH_TOKEN',
    );
  }

  if (
    currentToken.expires_at.getTime() <= Date.now()
  ) {
    throw new UnauthorizedError(
      'Refresh token expired',
      'AUTH_REFRESH_TOKEN_EXPIRED',
    );
  }

  if (currentToken.is_revoked) {
    await revokeRefreshTokenFamily(
      currentToken.family_id,
    );

    throw new UnauthorizedError(
      'Refresh token reuse detected',
      'AUTH_REFRESH_TOKEN_REUSE',
    );
  }

  const newToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newToken);
  const expiresAt = getRefreshTokenExpiration();

  await rotateRefreshToken(
    currentToken.id,
    currentToken.user_id,
    currentToken.family_id,
    newTokenHash,
    expiresAt,
  );

  return {
    token: newToken,
    expiresAt,
    userId: currentToken.user_id,
  };
}