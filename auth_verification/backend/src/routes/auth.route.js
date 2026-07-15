import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/verify", authController.verification);
router.post("/login", authController.login);
router.post("/logout", isAuthenticated, authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp/:email", authController.verifyOTP);
router.post("/change-password/:email", authController.changePassword);

export default router;
