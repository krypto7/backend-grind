import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
});
