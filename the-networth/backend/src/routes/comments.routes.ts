import { Router } from "express";
import * as commentController from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";
import { addComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/add-comment").post(verifyJWT, commentController.addComment);
router.route("/edit-comment/:commentId").put(verifyJWT, commentController.editComment);
router.route("/delete-comment/:commentId").delete(verifyJWT, commentController.deleteComment);
export default router;
