import express, { Router } from 'express';
import { registerController, loginController, verifyDeviceController, refreshController, logoutController } from './auth.controller.js';
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

router.post(
  '/verify-device',
  asyncHandler(verifyDeviceController),
);

router.post(
  '/refresh',
  asyncHandler(refreshController),
);

router.post(
  '/logout',
  asyncHandler(logoutController),
);

export default router;
