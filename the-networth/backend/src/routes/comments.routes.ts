import { Router } from "express";
import * as commentController from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";
import { addComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/add-comment").post(verifyJWT, commentController.addComment);

export default router;
