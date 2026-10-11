import { Router } from "express";
import * as postController from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";

const router = Router();

router.route("/get-posts").get(postController.getPosts);
router.route("/create-post").post(verifyJWT, postController.createPost);
router.route("/get-userPosts/:id").get(verifyJWT, postController.getUserPosts);

export default router;
