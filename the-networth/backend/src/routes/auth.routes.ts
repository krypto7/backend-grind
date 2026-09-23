import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.route("/signup").post(authController.signup);

export default router;
