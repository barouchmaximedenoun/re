import type { Response } from 'express';

const REFRESH_COOKIE_NAME = 'refresh_token';

export function setRefreshTokenCookie(
  res: Response,
  token: string,
  expiresAt: Date,
): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/auth',
  });
}

export function clearRefreshTokenCookie(
  res: Response,
): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth',
  });
}

export { REFRESH_COOKIE_NAME };
