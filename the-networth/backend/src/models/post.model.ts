import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  mediaType: {
    type: String,
    enum: ["image", "video", "audio"],
    default: null,
  },
  mediaUrl: {
    type: String,
    default: null,
  },
  publicId: {
    type: String,
    default: null,
  },
  size: {
    type: Number,
    default: null,
  },
});

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      type: [mediaSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

const Post = mongoose.model("Post", postSchema);

export default Post;
