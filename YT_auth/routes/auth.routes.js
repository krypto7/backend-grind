import { Router } from "express";
import * as autController from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", autController.register);
authRouter.get("/get-me", autController.getMe);
authRouter.get("/refresh-token", autController.refreshToken);

export default authRouter;
