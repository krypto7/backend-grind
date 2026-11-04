import { Router } from "express";
import * as likeController from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";

const router = Router();

router.route("/add-likes/:id").post(verifyJWT, likeController.addLikes);
router.route("/remove-likes/:id").delete(verifyJWT, likeController.removeLike);

export default router;
