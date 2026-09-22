import express, { Router } from 'express';
import { registerController, loginController } from './auth.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router: Router = express.Router();

router.post(
  '/register',
  asyncHandler(registerController),
);

router.post(
  '/login',
  asyncHandler(loginController),
);

export default router;
