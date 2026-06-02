import mongoose from "mongoose";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt, { decode } from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  console.log("=====userId-generateAccessAndRefreshTokens", userId);
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and ref token"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  //take details from frontend
  //check validation
  //check user is exist or not - email, user
  //check files - check avatar
  //upload on cloudinary, avatar
  //create user object -create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //resturn response.

  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "full name is required");
  }

  const userExist = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExist) {
    throw new ApiError(400, "user already exist");
  }

  const avtarLocalpath = req?.files?.avtar[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage[0]?.path;
  console.log("avtarLocalpath====>", avtarLocalpath);

  if (!avtarLocalpath) {
    throw new ApiError(400, "avtar file is required");
  }

  const avtar = await uploadOnCloudinary(avtarLocalpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avtar) {
    throw new ApiError(400, "avtar file is required");
  }

  console.log("username====", username);
  const user = await User.create({
    fullName,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username?.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while register  user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "user register successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  //take email and password from req.body
  //check validation
  //check user already exist or not
  //password check
  //access token and refresh token
  //send cookie
  //create user in DB

  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "invalid credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User loggedin successfully"
      )
    );
});

export const logOutUser = asyncHandler(async (req, res) => {
  //change refresh token
  //clear cookies
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "anauthorize request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    console.log("=======", incomingRefreshToken);
    console.log("=======", user?.refreshToken);

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "AccessToken Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "invalid refresh token");
  }
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req?.user._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "password changed successfully!!!"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req?.user, "currentUser"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  console.log("=====req.body", req.body);

  const { fullName, email } = req.body || {};

  if (!(fullName || email)) {
    return new ApiResponse(400, "all fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, "user updated"));
});

export const updateUserAvtar = asyncHandler(async (req, res) => {
  const avtarLocalPath = req.file?.path;

  if (!avtarLocalPath) {
    throw new ApiError(400, "avtar file missing");
  }

  const avtar = await uploadOnCloudinary(avtarLocalPath);

  if (!avtar.url) {
    throw new ApiError(400, "error while uploading avtar");
  }

  const user = await User.findByIdAndUpdate(
    req?.user._id,
    {
      $set: { avtar: avtar.url },
    },
    { new: true }
  ).select("-password");

  //Todo - delete old image - assignment
  // await oldImageRemove(avtar.public_id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user cover image updated"));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "avtar file missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "error while uploading avtar");
  }

  const user = await User.findByIdAndUpdate(
    req?.user._id,
    {
      $set: { avtar: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user cover image updated"));
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  // User.find({ username });

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedTo: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        subscribersCount: 1,
        channelSubscribedTo: 1,
        isSubscribed: 1,
        subscribedTo: 1,
        avtar: 1,
        coverImage: 1,
      },
    },
  ]);

  console.log("channler=======", channel);

  if (!channel?.length) {
    throw new ApiError(400, "channel does not exist!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

export const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avtar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0].watchHistory, "watch history successfully!!")
    );
});
