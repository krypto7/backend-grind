import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: false,
        msg: "invalid accessToken",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as jwt.JwtPayload;

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(401).json({
        status: false,
        msg: "invalid accessToken",
      });
    }

     req.user = user;
    next();
  } catch {
    return res.status(401).json({
      status: false,
      msg: "invalid accessToken",
    });
  }
};
