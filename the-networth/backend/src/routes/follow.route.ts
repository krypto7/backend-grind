import { Router } from "express";
import * as followController from "../controllers/follow.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewale.js";

const router = Router();

router.route("/followUser/:id").post(verifyJWT, followController.followUser);
router
  .route("/unfollowUser/:id")
  .delete(verifyJWT, followController.unfollowUser);

export default router;
