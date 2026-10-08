import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/signup").post(upload.single("avtar"), authController.signup);
router.route("/login").post(authController.login);
router
  .route("/refresh")
  .get(authController.refreshAccessToken);
router.route("/getCurrentUser").get(verifyJWT, authController.getCurrentUser);
router.route("/logout").get(verifyJWT, authController.logout);
router
  .route("/edit-profile")
  .patch(verifyJWT, upload.single("avtar"), authController.editProfile);
router.route("/verify-email").get(authController.verifyEmail);
router.route("/verify-otp/:email").post(authController.verifyOTP);
router.route("/resend-otp/:email").post(authController.resendOTP);

export default router;
