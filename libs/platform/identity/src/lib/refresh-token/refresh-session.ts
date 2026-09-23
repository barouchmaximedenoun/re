import { signAccessToken } from '../jwt.js';
import { rotateRefreshTokenSession } from './refresh-token.service.js';

export async function refreshSession(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: {
    token: string;
    expiresAt: Date;
  }
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}> {
  const rotated = await rotateRefreshTokenSession(refreshToken);

  const accessToken = signAccessToken(rotated.user.id);

  return {
    accessToken,
    refreshToken: {
      token: rotated.token,
      expiresAt: rotated.expiresAt,
    },
    user: {
      id: rotated.user.id,
      email: rotated.user.email,
      name: rotated.user.name,
    },
  };
}
