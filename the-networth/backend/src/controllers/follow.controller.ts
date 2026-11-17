import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";

export const followUser = async (req: Request, res: Response) => {
  /*
  Follow logic:
  1.Get the logged-in user's ID.
  2.Get the target user's ID.
  3.Validate the target ID.
  4.Prevent self-following
  5.Check whether the target user exists.
  6.Check whether the relationship already exists.
  7.Create a Follow document.
  */

  const loggedInUserId = req.user?._id;
  const targetUserId = req.params.id;

  if (!mongoose.isValidObjectId(targetUserId)) {
    return res.status(400).json({
      message: "Invalid target user ID",
    });
  }

  // Prevent following yourself
  if (loggedInUserId?.toString() === targetUserId) {
    return res.status(400).json({
      message: "You cannot follow yourself",
    });
  }

  // Check whether target user exists
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    return res.status(404).json({
      message: "Target user not found",
    });
  }

  // Check existing relationship
  const existingFollow = await Follow.findOne({
    follower: loggedInUserId,
    following: targetUserId,
  });

  if (existingFollow) {
    return res.status(400).json({
      message: "You are already following this user",
    });
  }

  // Create relationship
  const follow = await Follow.create({
    follower: loggedInUserId,
    following: targetUserId,
  });

  return res.status(201).json({
    message: "User followed successfully",
    follow,
  });
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?._id;
    const followingId = req.params.id;

    if (!mongoose.isValidObjectId(followingId)) {
      return res.status(400).json({
        message: "Invalid target user ID",
      });
    }

    const unfollow = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!unfollow) {
      return res.status(404).json({
        message: "You are not following this user",
      });
    }

    return res.status(200).json({
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.max(1, Number(req.query.limit) || 10);

  const skip = (page - 1) * limit;

  const [followers, total] = await Promise.all([
    Follow.find({ following: userId })
      .populate("follower", "username firstname lastname avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Follow.countDocuments({ following: userId }),
  ]);

  return res.status(200).json({
    message: "Followers fetched successfully",
    followers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getFollowing = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.max(1, Number(req.query.limit) || 10);

  const skip = (page - 1) * limit;

  const [following, total] = await Promise.all([
    Follow.find({ following: userId })
      .populate("following", "username firstname lastname avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Follow.countDocuments({ following: userId }),
  ]);

  return res.status(200).json({
    message: "following fetched successfully",
    following,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};
