import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Somethin went wrong");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  //take details from frontend
  //check validation
  //check user exist or not
  //create user obj
  //remvome password and refresh token from response
  //check for user creation
  //return response

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "all fields are required");
  }

  const userExist = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (userExist) {
    throw new ApiError(400, "user already exist");
  }

  const user = await User.create({
    username: username?.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  if (!createdUser) {
    throw new ApiError(500, "somethon went wrong");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken, refreshToken },
        "user created succesfull",
      ),
    );
});
