import { type Request, type Response } from 'express';

import {
  getDeviceInfo,
} from '@platform/identity';

import {
  register,
  login,
} from '@platform/identity';

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

    res.json(result);
}