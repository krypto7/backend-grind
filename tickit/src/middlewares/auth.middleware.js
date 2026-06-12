import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", " ");

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findById(decodeToken?._id).select(
      "-password -refereshToken",
    );
    if (!user) {
      throw new ApiError(400, "invalid accessToken");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, "invalid accessToken");
  }
});
