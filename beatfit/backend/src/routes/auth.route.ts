import { Router } from "express";
import {
  registrationHandler,
  loginHandler,
  verifyEmail,
} from "../controllers/auth/auth.controller";

const router = Router();

router.post("/register", registrationHandler);
router.post("/login", loginHandler);
router.get("/verify-email", verifyEmail);

export default router;
