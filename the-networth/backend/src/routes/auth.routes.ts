import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";

const router = Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router
  .route("/refresh")
  .get(authController.refreshAccessToken)
  .post(authController.refreshAccessToken);
router.route("/getCurrentUser").get(verifyJWT, authController.getCurrentUser);
router.route("/logout").get(verifyJWT, authController.logout);
router.route("/verify-email").get(authController.verifyEmail);

export default router;
