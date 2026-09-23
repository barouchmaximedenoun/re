import { type Request, type Response } from 'express';

import {
  register,
  login,
  verifyDeviceOtp,
  getDeviceInfo,
  logout,
  refreshSession,
} from '@platform/identity';

import { clearRefreshTokenCookie, REFRESH_COOKIE_NAME, setRefreshTokenCookie } from "./refresh-cookie";
import { UnauthorizedError } from "@platform/errors";
//import { AuthenticatedRequest } from "./auth.middleware";
import { findUserById } from "@infra/db";

export async function registerController(
  req: Request,
  res: Response,
) {
    const { email, password, name } = req.body;

    const result = await register(
      email,
      password,
      name,
    );

    res.json(result);
}

export async function loginController(
  req: Request,
  res: Response,
) {
    const { email, password } = req.body;

    const deviceInfo = getDeviceInfo({
      ip: req.ip,
      headers: req.headers,
    });

    const result = await login(
      email,
      password,
      deviceInfo,
    );

    if (result.requiresOtp) {
      res.json(result);
      return;
    }

    setRefreshTokenCookie(
      res,
      result.refreshToken.token,
      result.refreshToken.expiresAt,
    );

    res.json({
      requiresOtp: false,
      accessToken: result.accessToken,
      user: result.user,
      device: result.device,
    });
}

export async function verifyDeviceController(
  req: Request,
  res: Response,
) {
  const {
    otpChallengeId,
    otp,
  } = req.body;

  const result = await verifyDeviceOtp(
    otpChallengeId,
    otp,
  );

  setRefreshTokenCookie(
    res,
    result.refreshToken.token,
    result.refreshToken.expiresAt,
  );

  res.json({
    accessToken: result.accessToken,
    user: result.user,
  });
}

export async function refreshController(
  req: Request,
  res: Response,
) {
  const refreshToken =
    req.cookies[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    throw new UnauthorizedError(
      'Refresh token is required',
      'AUTH_REFRESH_TOKEN_MISSING',
    );
  }

  const result = await refreshSession(
    refreshToken,
  );

  setRefreshTokenCookie(
    res,
    result.refreshToken.token,
    result.refreshToken.expiresAt,
  );

  res.json({
    accessToken: result.accessToken,
    user: result.user,
  });
}

export async function logoutController(
  req: Request,
  res: Response,
) {
  const refreshToken =
    req.cookies[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await logout(refreshToken);
  }

  clearRefreshTokenCookie(res);

  res.status(204).send();
}

export async function meController(
  req: Request,
  res: Response,
) {
  /* const authenticatedRequest =
    req as AuthenticatedRequest;

  const user = await findUserById(
    authenticatedRequest.userId,
  ); */
  if (!req.userId) {
    throw new UnauthorizedError(
      'Authentication required',
      'AUTH_TOKEN_MISSING',
    );
  }

  const user = await findUserById(
    req.userId,
  );

  if (!user) {
    throw new UnauthorizedError(
      'User not found',
      'AUTH_USER_NOT_FOUND',
    );
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
