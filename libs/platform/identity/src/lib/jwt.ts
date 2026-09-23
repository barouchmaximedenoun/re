import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET!;
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}
const JWT_SECRET = getJwtSecret();

export type AccessTokenPayload = {
  userId: string;
};

export function signAccessToken(userId: string): string {
  return jwt.sign(
    { userId } satisfies AccessTokenPayload,
    JWT_SECRET,
    { expiresIn: '15m' },
  );
}

export function verifyAccessToken(
  token: string,
): AccessTokenPayload {
  const payload = jwt.verify(
    token,
    JWT_SECRET,
  );

  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof payload.userId !== 'string'
  ) {
    throw new Error('Invalid access token payload');
  }

  return {
    userId: payload.userId,
  };
}