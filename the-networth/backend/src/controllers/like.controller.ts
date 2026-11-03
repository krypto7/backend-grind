import { Request, Response } from "express";
import mongoose from "mongoose";
import Like from "../models/likes.model.js";
import Post from "../models/post.model.js";

// const checkDuplicateId =

export const addLikes = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json({
      status: "false",
      message: "unauthorized",
    });
  }

  // Reject malformed IDs before asking MongoDB to find a post.
  if (typeof postId !== "string" || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "post not found!!" });
    }

    //user already like the post give current state
    const existLike = await Like.findOne({
      user: userId,
      post: postId,
    });

    if (existLike) {
      return res.status(200).json({
        liked: true,
        likeCount: post.likesCount,
      });
    }

    // Save who liked the post.
    await Like.create({
      user: userId,
      post: postId,
    });

    //increase the count and store on the post
    const updatedPost = await Post.findByIdAndUpdate(
      userId,
      { $inc: { likesCount: 1 } },
      { new: true },
    ).select("likesCount");

    return res.status(201).json({
      liked: true,
      likesCount: updatedPost?.likesCount ?? post.likesCount + 1,
    });
  } catch (error) {
    console.error("unable to like post", error);
    return res.status(500).json({ message: "Unable to like post" });
  }
};

const removeLike = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(400).json({
      status: "false",
      message: "unauthorized",
    });
  }

  // Reject malformed IDs before asking MongoDB to find a post.
  if (typeof postId !== "string" || !mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId).select("likesCount");
    if (!post) {
      return res.status(400).json({ message: "post not found!!" });
    }

    //user already like the post give current state
    const existLike = await Like.findOne({
      user: userId,
      post: postId,
    });

    if (existLike) {
      return res.status(200).json({
        liked: true,
        likeCount: post.likesCount,
      });
    }

    //increase the count and store on the post
    const updatedPost = await Post.findByIdAndUpdate(
      userId,
      { $inc: { likesCount: 1 } },
      { new: true },
    ).select("likesCount");

    return res.status(201).json({
      liked: true,
      likesCount: updatedPost?.likesCount ?? post.likesCount + 1,
    });
  } catch (error) {
    console.error("unable to like post", error);
    return res.status(500).json({ message: "Unable to like post" });
  }
};
