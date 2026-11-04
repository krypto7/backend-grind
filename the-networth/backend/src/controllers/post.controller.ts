import { Request, Response } from "express";
import Post from "../models/post.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import Like from "../models/likes.model.js";

const authorFields = "username firstname lastname avtar";

type PostDocumentForLikeStatus = {
  _id: mongoose.Types.ObjectId;
  toJSON: () => Record<string, unknown>;
};

const includeLikeByMe = async (
  posts: PostDocumentForLikeStatus[],
  userId: mongoose.Types.ObjectId,
) => {
  const likes = await Like.find({
    user: userId,
    post: { $in: posts.map((post) => post._id) },
  })
    .select("post")
    .lean();

  const likedPostIds = new Set(likes.map((like) => like.post.toString()));

  return posts.map((post) => ({
    ...post.toJSON(),
    likedByMe: likedPostIds.has(post._id.toString()),
  }));
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const files = (req.files ?? []) as Express.Multer.File[];
    const content = String(req.body?.content ?? "").trim();

    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const media = await Promise.all(
      files?.map(async (file) => {
        const uploaded = await uploadOnCloudinary(file.path);

        const mime = file.mimetype;
        const mediaType = mime.startsWith("video/")
          ? "video"
          : mime.startsWith("audio/")
            ? "audio"
            : "image";

        return {
          mediaType,
          mediaUrl: uploaded?.secure_url,
          publicId: uploaded?.public_id,
        };
      }),
    );

    if (!media) {
      return res.status(400).json({ message: "Failed to upload media" });
    }

    const post = await Post.create({
      content,
      user: user._id,
      media,
    });
    const createdPost = await Post.findById(post._id).populate(
      "user",
      authorFields,
    );

    res.status(201).json(createdPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const posts = await Post.find()
      .populate("user", authorFields)
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username firstname lastname avtar",
        },
      })
      .sort({ createdAt: -1 });

    const postWithLikeState = await includeLikeByMe(posts, userId);

    return res.status(200).json(postWithLikeState);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const posts = await Post.find({ user: id })
      .populate("user", authorFields)
      .sort({ createdAt: -1 });

    const postWithLikeState = await includeLikeByMe(posts, userId);
    return res.status(200).json(postWithLikeState);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const postDetails = async (req: Request, res: Response) => {
  const { postId }: { postId?: string } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!postId || !postId.trim()) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const postDetails = await Post.findById(postId)
      .populate("user", authorFields)
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username firstname lastname avtar",
        },
      });

    if (!postDetails) {
      return res.status(404).json({ message: "Post not found" });
    }

    const [postWithLikeState] = await includeLikeByMe([postDetails], userId);
    return res.status(200).json(postWithLikeState);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
