const express = require("express");
const dbConnection = require("./db/dbConnection");
const multer = require("multer");
const uploadFile = require("./service/storage.service");
const Post = require("./model/post.model");
require("dotenv").config();

dbConnection();

const app = express();
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

app.post("/create-post", upload.single("image"), async (req, res) => {
  const result = await uploadFile(req.file.buffer);

  const post = await Post.create({
    image: result.url,
    caption: req.body.caption,
  });

  res.status(201).json({
    msg: "post created successfully!!",
    post,
  });
});

app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.status(200).json({
    msg: "post list!!",
    posts,
  });
});

app.listen(process.env.PORT || 3000);
