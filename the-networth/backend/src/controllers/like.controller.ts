import { Request, Response } from "express";
import mongoose from "mongoose";
import Like from "../models/likes.model.js";
import Post from "../models/post.model.js";

export const addLikes = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (typeof postId !== "string" || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({ user: userId, post: postId });
    if (existingLike) {
      return res.status(200).json({
        liked: true,
        likesCount: post.likesCount,
      });
    }

    await Like.create({ user: userId, post: postId });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true },
    ).select("likesCount");

    return res.status(201).json({
      liked: true,
      likesCount: updatedPost?.likesCount ?? post.likesCount + 1,
    });
  } catch (error) {
    console.error("Unable to like post:", error);
    return res.status(500).json({ message: "Unable to like post" });
  }
};

export const removeLike = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (typeof postId !== "string" || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId).select("likesCount");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const deletedLike = await Like.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (deletedLike) {
      await Post.updateOne(
        { _id: postId, likesCount: { $gt: 0 } },
        { $inc: { likesCount: -1 } },
      );
    }

    const updatedPost = await Post.findById(postId).select("likesCount");

    return res.status(200).json({
      liked: false,
      likesCount: updatedPost?.likesCount ?? post.likesCount,
    });
  } catch (error) {
    console.error("Unable to unlike post:", error);
    return res.status(500).json({ message: "Unable to unlike post" });
  }
};
