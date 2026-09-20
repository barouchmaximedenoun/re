import { findRefreshTokenByHash, revokeRefreshTokenFamily } from '@infra/db';

import { hashRefreshToken } from './refresh-token.js';

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(refreshToken);

  const currentToken = await findRefreshTokenByHash(tokenHash);

  if (!currentToken) {
    return;
  }

  await revokeRefreshTokenFamily(currentToken.family_id);
}
