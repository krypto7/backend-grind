const express = require("express");
const router = express.Router();
const musicController = require("../controller/music.controller");
const authMiddleware = require("../middleware/auth.middleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload-music",
  authMiddleware.authArtist,
  upload.single("music"),
  musicController.creatMusic,
);

router.post(
  "/create-album",
  authMiddleware.authArtist,
  musicController.creatAlbum,
);

router.get("/", musicController.getAllMusic);

module.exports = router;
