import { Router } from "express";
import * as authController from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.get("/get-user", authController.getUser);
authRouter.get("/ref-Token", authController.refreshToken);
authRouter.get("/logout", authController.logout);

export default authRouter;
