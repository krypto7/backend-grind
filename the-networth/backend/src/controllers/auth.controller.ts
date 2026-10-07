import User from "../models/user.model.js";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyEmail as sendVerifyEmail } from "../services/verifyEmail.js";
import { otpGenerate } from "../lib/otpGenerate.js";
import { sendOTP } from "../services/otpmail.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

interface SignupBody {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  avtar: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const normalizeEmail = (email: unknown): string => {
  return String(email ?? "")
    .trim()
    .toLowerCase();
};

export const normalizeOTP = (otp: unknown): string => {
  return String(otp ?? "").trim();
};

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const accessCookieOptions = {
  ...baseCookieOptions,
  maxAge: 24 * 60 * 60 * 1000,
};

const refreshCookieOptions = {
  ...baseCookieOptions,
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

const generateAccessRefershToken = async (
  userId: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = user?.generateAccessToken();
    const refreshToken = user?.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to generate tokens");
  }
};

export const signup = async (
  req: Request<{}, {}, SignupBody>,
  res: Response,
): Promise<Response> => {
  const { firstname, lastname, username, password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!firstname || !lastname || !email || !username || !password) {
    return res.status(401).json({
      status: false,
      msg: "all fields are required",
    });
  }

  const userExist = await User.findOne({ email });

  console.log("userExist", userExist);

  if (userExist) {
    return res.status(401).json({
      status: false,
      msg: "User already exist",
    });
  }

  const avtarLocalPath = req.file?.path;

  if (!avtarLocalPath) {
    return res.status(400).json({
      status: false,
      msg: "Avtar image is required",
    });
  }

  const avtar = await uploadOnCloudinary(avtarLocalPath);

  if (!avtar) {
    return res.status(500).json({
      status: false,
      msg: "Failed to upload avtar image",
    });
  }

  const user = await User.create({
    firstname,
    lastname,
    email,
    avtar: avtar.url,
    password,
    username: username?.toLowerCase(),
  });

  const otp = otpGenerate();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();
  await sendOTP(email, otp);

  return res.status(200).json({
    status: "success",
    user: user,
    otp: otp,
  });
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
): Promise<Response> => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  if (!email || !password) {
    return res.status(401).json({
      status: false,
      msg: "all fields are required",
    });
  }

  const user = await User.findOne({ email });

  if (!user || !user.isVerified) {
    return res.status(401).json({
      status: false,
      msg: "Email not verified",
    });
  }

  const isPasswordValid = await user.isPassowordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      status: false,
      msg: "Invalid email or password",
    });
  }

  const { accessToken, refreshToken } = await generateAccessRefershToken(
    user._id.toString(),
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .cookie("accessToken", accessToken, accessCookieOptions)
    .json({
      status: "success",
      user: loggedInUser,
    });
};

export const refreshAccessToken = async function (req: Request, res: Response) {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      status: "false",
      msg: "unauthorise user",
    });
  }

  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as jwt.JwtPayload;

    const user = await User.findById(decodeToken?._id);

    if (!user) {
      return res.status(401).json({
        status: "false",
        msg: "unauthorise user",
      });
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({
        status: "false",
        msg: "Refresh token is expired or used",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessRefershToken(user._id.toString());

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
      .json({
        status: "true",
        msg: "AccessToken Refreshed",
      });
  } catch (error) {
    return res.status(401).json({
      status: "false",
      msg: "somthing went wrong",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  console.log("===========", req.user);

  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      status: false,
      msg: "unauthorise user",
    });
  }

  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", baseCookieOptions)
    .clearCookie("refreshToken", baseCookieOptions)
    .json({
      status: "success",
      message: "user Logged out",
    });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken",
  );
  if (!user) {
    return res.status(400).json({
      status: "true",
      msg: "user not found",
    });
  }

  res.status(200).json({
    status: "true",
    user,
  });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    return res.status(401).json({
      status: "false",
      msg: "unauthorise user",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY as string,
    ) as jwt.JwtPayload;
    const user = await User.findOne({
      _id: decoded.id,
      emailVerificationToken: token,
    });

    if (!user) {
      return res.status(401).json({
        status: "false",
        msg: "unauthorise user",
      });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { isVerified: true },
      $unset: { emailVerificationToken: 1 },
    });

    return res.status(200).json({
      status: "true",
      msg: "email verified",
    });
  } catch (error) {
    return res.status(401).json({
      status: "false",
      msg: "unauthorise user",
    });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  const email = normalizeEmail(req.params.email || req.body?.email);

  if (!email) {
    return res.status(400).json({
      status: "false",
      msg: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "false",
        msg: "User not found",
      });
    }

    const otp = otpGenerate();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTP(email, otp);

    return res.status(200).json({
      status: "true",
      msg: "OTP resent successfully",
      otpExpiry: user.otpExpiry,
    });
  } catch (err) {
    return res.status(500).json({
      status: "false",
      msg: "Internal server error",
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const otp = normalizeOTP(req.body?.otp);
  const email = normalizeEmail(req.params.email || req.body?.email);

  if (!otp || !email) {
    return res.status(400).json({
      status: "false",
      msg: "OTP and email are required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "false",
        msg: "User not found",
      });
    }

    if (user.isVerified) {
      const verifiedUser = await User.findById(user._id).select(
        "-password -refreshToken -otp",
      );
      const { accessToken, refreshToken } = await generateAccessRefershToken(
        user._id.toString(),
      );
      return res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json({
          status: "true",
          msg: "OTP verified successfully",
          user: verifiedUser,
        });
    }

    if (!user.otp || normalizeOTP(user.otp) !== otp) {
      return res.status(400).json({
        status: "false",
        msg: "Invalid OTP",
      });
    }

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return res.status(400).json({
        status: "false",
        msg: "OTP has expired",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: { isVerified: true },
        $unset: { otp: 1, otpExpiry: 1 },
      },
      { new: true },
    ).select("-password -refreshToken -otp");

    const { accessToken, refreshToken } = await generateAccessRefershToken(
      user._id.toString(),
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        status: "true",
        msg: "OTP verified successfully",
        user: updatedUser,
      });
  } catch (err) {
    return res.status(500).json({
      status: "false",
      msg: "Internal server error",
    });
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {};
export const removeProfileImage = async (req: Request, res: Response) => {};
export const EditProfileImage = async (req: Request, res: Response) => {};
