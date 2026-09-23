import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import {
  verifyAccessToken,
} from '@platform/identity';

import {
  findUserById,
} from '@infra/db';

import { UnauthorizedError } from '@platform/errors';

export type AuthenticatedRequest = Request & {
  userId: string;
};

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedError(
        'Authentication required',
        'AUTH_TOKEN_MISSING',
      );
    }

    const [scheme, token] =
      authorization.split(' ');

    if (
      scheme !== 'Bearer' ||
      !token
    ) {
      throw new UnauthorizedError(
        'Invalid authorization header',
        'AUTH_INVALID_AUTHORIZATION',
      );
    }

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError(
        'Invalid or expired access token',
        'AUTH_INVALID_ACCESS_TOKEN',
      );
    }

    const user = await findUserById(
      payload.userId,
    );

    if (!user) {
      throw new UnauthorizedError(
        'User not found',
        'AUTH_USER_NOT_FOUND',
      );
    }

    const authenticatedRequest =
      req as AuthenticatedRequest;

    authenticatedRequest.userId =
      user.id;

    next();
  } catch (error) {
    next(error);
  }
}
