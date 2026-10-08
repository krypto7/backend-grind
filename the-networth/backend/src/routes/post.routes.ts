import { Router } from "express";
import * as postController from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";

const router = Router();

router.route("/get-posts").get(postController.getPosts);
router.route("/create-post").post(verifyJWT, postController.createPost);

export default router;
