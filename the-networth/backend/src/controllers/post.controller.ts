import { Request, Response } from "express";
import Post from "../models/post.model.js";

const authorFields = "username firstname lastname avtar";

export const createPost = async (req: Request, res: Response) => {
  try {
    const content = String(req.body?.content ?? "").trim();
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const post = await Post.create({ content, user: user._id });
    const created = await Post.findById(post._id).populate("user", authorFields);

    res.status(201).json(created);
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
