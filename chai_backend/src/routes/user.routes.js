import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvtar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avtar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(upload.none(), loginUser);

//secured routes

router.route("/logout").get(verifyJWT, logOutUser);

router.route("/refresh-token").get(refreshAccessToken);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router
  .route("/update-user")
  .post(verifyJWT, upload.none(), updateAccountDetails);

router
  .route("/update-avtar")
  .post(verifyJWT, upload.single("avtar"), updateUserAvtar);

router
  .route("/update-coverImage")
  .post(verifyJWT, upload.single("coverImage"), updateUserAvtar);

router
  .route("/change-password")
  .post(verifyJWT, upload.none(), changeCurrentPassword);

router
  .route("/update-account")
  .patch(verifyJWT, upload.none(), changeCurrentPassword);

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
