import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.get("/get-user", authController.getUser);
authRouter.get("/refreshToken", authController.refreshToken);
authRouter.get("/logout", authController.logOut);
authRouter.get("/logout-all", authController.logoutAll);
authRouter.post("/login", authController.login);
authRouter.get("/verify-email", authController.verifyEmail);

export default authRouter;
