import { Router } from "express";
import {
  getCurrentUser,
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

export default router;
