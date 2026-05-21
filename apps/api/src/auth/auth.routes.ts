import express, { Router } from "express";
import { registerController, loginController } from "./auth.controller.js";

const router: Router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);

export default router;