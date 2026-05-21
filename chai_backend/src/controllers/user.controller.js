import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

  const { username, email, fullName } = req.body;
  dsd;

  if ([username, email, fullName].some((field) => field?.trim() === "")) {
    throw Error(400, "full name is required");
  }

  const userExist = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExist) {
    throw Error(400, "user already exist");
  }

  const avtarLocalpath = req?.files?.avtar[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage[0];

  if (!avtarLocalpath) {
    throw new ApiError(400, "avtar file is required");
  }

  const avtar = await uploadOnCloudinary(avtarLocalpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avtart) {
    throw new ApiError(400, "avtar file is required");
  }

  const user = await User.create({
    fullName,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowercase(),
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
