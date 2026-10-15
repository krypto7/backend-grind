import { Request, Response } from "express";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";
import Post from "../models/post.model.js";

export const addComment = async (req: Request, res: Response) => {
  const { postId, content } = req.body;

  if (!postId || typeof content !== "string" || !content) {
    return res
      .status(400)
      .json({ message: "Post ID and content are required" });
  }

  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({
      message: "Invalid post ID",
    });
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      message: "Post not found",
    });
  }

  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const comment = await Comment.create({
      content: content.trim(),
      user: userId,
      post: postId,
    });

    return res
      .status(201)
      .json({ message: "Comment added successfully", comment });
  } catch (error) {
    return res.status(500).json({ message: "Error adding comment" });
  }
};

export const editComment = async (req: Request, res: Response) => {
  const { commentId, content } = req.body;

  if (!commentId || typeof content !== "string" || !content) {
    return res
      .status(400)
      .json({ message: "Comment ID and content are required" });
  }

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({
      message: "Invalid comment ID",
    });
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      message: "Comment not found",
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({
      message: "Invalid comment ID",
    });
  }

  const comment = await Comment.findById(commentId);

  const userId = req.user?._id;

  if (userId?.toString() !== comment?.user.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!comment) {
    return res.status(404).json({
      message: "Comment not found",
    });
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json({ message: "Comment deleted successfully" });
};
