import { Request, Response } from "express";
import Post from "../models/post.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const authorFields = "username firstname lastname avtar";

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
  try {
    const posts = await Post.find()
      .populate("user", authorFields)
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("Fetching posts for user ID:", req.params);
  try {
    const posts = await Post.find({ user: id })
      .populate("user", authorFields)
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
