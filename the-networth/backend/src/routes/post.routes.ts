import { Router } from "express";
import * as postController from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/get-posts").get(postController.getPosts);
router
  .route("/create-post")
  .post(verifyJWT, upload.array("media", 5), postController.createPost);
router.route("/get-userPosts/:id").get(verifyJWT, postController.getUserPosts);
router
  .route("/post-details/:postId")
  .get(verifyJWT, postController.postDetails);
export default router;
