import { signAccessToken } from '../jwt.js';
import { rotateRefreshTokenSession } from './refresh-token.service.js';

export async function refreshSession(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}> {
  const rotated = await rotateRefreshTokenSession(refreshToken);

  const accessToken = signAccessToken(rotated.userId);

  return {
    accessToken,
    refreshToken: rotated.token,
    refreshTokenExpiresAt: rotated.expiresAt,
  };
}
