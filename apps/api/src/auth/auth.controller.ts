import { type Request, type Response } from "express";
import {
  register,
  login,
} from '@platform/identity';

export async function registerController(req: Request, res: Response) { 
  try {
      const {
        email,
        password,
        name,
      } = req.body;

      const result =
        await register(
          email,
          password,
          name
        );

      res.json(result);
    } catch (e: any) {
      res.status(400).json({
        error: e.message,
      });
    }
}
export async function loginController(req: Request, res: Response) { 
    try {
      const {
        email,
        password,
      } = req.body;

      const result =
        await login(
          email,
          password
        );

      res.json(result);
    } catch (e: any) {
      res.status(400).json({
        error: e.message,
      });
    }
}
