const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    caption: {
      type: String,
    },
  },
  { timestamps: true },
);
const Post = mongoose.model("post", postSchema);
module.exports = Post;
