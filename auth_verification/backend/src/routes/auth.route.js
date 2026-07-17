import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validator/user.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/verify", authController.verification);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", isAuthenticated, authController.logout);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/verify-otp/:email",
  validate(verifyOtpSchema),
  authController.verifyOTP,
);
router.post(
  "/change-password/:email",
  validate(resetPasswordSchema),
  authController.changePassword,
);

export default router;
