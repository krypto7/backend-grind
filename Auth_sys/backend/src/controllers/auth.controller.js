import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../models/session.model.js";
import { generateOtp, getOtpHtml } from "../../utils/utils.js";
import OTP from "../models/otp.model.js";
import { sendEmail } from "../../services/email.service.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "all fields are required",
      });
    }

    const userExist = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExist) {
      return res.status(400).json({
        msg: "user is already exist",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: passwordHash,
    });

    // const session = await Session.create({
    //   user: user._id,
    //   ip: req.ip,
    //   userAgent: req.headers["user-agent"],
    // });

    // const accessToken = jwt.sign(
    //   { id: user._id, sessionId: session._id },
    //   config.JWT_SECRET,
    //   {
    //     expiresIn: "15m",
    //   },
    // );

    // const refreshToken = jwt.sign(
    //   { id: user._id, sessionId: session._id },
    //   config.REFRESH_SECRET,
    //   {
    //     expiresIn: "7d",
    //   },
    // );

    // session.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    // await session.save();

    // await res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    const otp = generateOtp();
    console.log("===>", otp);
    const html = getOtpHtml(otp);

    const otpHash = await bcrypt.hash(otp, 10);

    await OTP.create({
      email,
      otpHash,
      user: user._id,
    });

    await sendEmail(email, "OTP verificaiton", `Your OTP code is ${otp}`, html);

    await res.status(200).json({
      msg: "user register successfull",
      user: {
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("errror====>", error);
    return res.status(500).json({
      msg: "error",
      error,
    });
  }
};

export const getUser = async (req, res) => {
  const token = req.cookies.refreshToken;
  console.log("===token", token);

  if (!token) {
    return res.status(400).json({
      msg: "aunauthorized",
    });
  }

  const decode = jwt.verify(token, config.REFRESH_SECRET);

  const user = await User.findById(decode.id).select("-password");

  res.status(200).json({
    msg: "user found successfully",
    user,
  });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(400).json({
      msg: "aunauthorized",
    });
  }

  const decode = jwt.verify(token, config.REFRESH_SECRET);

  const session = await Session.findOne({
    user: decode.id,
    revoke: false,
  });

  if (!session) {
    return res.status(400).json({ msg: "session not found" });
  }

  const accessToken = jwt.sign(
    { id: decode.id, sessionId: session._id },
    config.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const newRefreshToken = jwt.sign({ id: decode.id }, config.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  session.refreshTokenHash = refreshTokenHash;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

  res.status(200).json({
    msg: "accessToken refresh successfully",
    accessToken,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "all fields are required",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      msg: "user not exist",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      msg: "invalid credential",
    });
  }

  // if (!user.isVerified) {
  //   return res.status(400).json({ msg: "user not verified!!" });
  // }

  const refreshToken = jwt.sign({ id: user._id }, config.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = await Session.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    { id: user._id, sessionId: session._id },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    msg: "user sigin successfully",
    accessToken,
  });
};

export const logOut = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(400).json({
      msg: "unauthprized",
    });
  }

  const decode = jwt.verify(token, config.REFRESH_SECRET);

  const sessions = await Session.find({
    user: decode.id,
    revoke: false,
  });

  let currentSession = null;

  //compare hash ref token:
  for (const session of sessions) {
    const isMatch = await bcrypt.compare(token, session.refreshTokenHash);

    if (isMatch) {
      currentSession = session;
      break;
    }
  }

  if (!currentSession) {
    return res.status(400).json({
      msg: "Invalid refresh token",
    });
  }

  currentSession.revoke = true;

  await currentSession.save();

  res.clearCookie("refreshToken");

  res.status(200).json({
    msg: "Logout successfully",
  });
};

export const logoutAll = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      msg: "token not found",
    });
  }

  const decoded = jwt.verify(refreshToken, config.REFRESH_SECRET);

  await Session.updateMany(
    {
      user: decoded.id,
      revoke: false,
    },
    {
      revoke: true,
    },
  );

  res.clearCookie("refreshToken");

  res.status(200).json({
    msg: "Logged out from all device successfully",
  });
};

export const verifyEmail = async (req, res) => {
  const { otp, email } = req.body;

  if (!otp || !email) {
    return res.status(400).json({ msg: "email and OTP are required" });
  }

  const otpDoc = await OTP.findOne({ email });

  if (!otpDoc) {
    return res.status(400).json({
      msg: "OTP not found",
    });
  }

  const otpValid = await bcrypt.compare(String(otp), otpDoc.otpHash);
  if (!otpValid) {
    return res.status(400).json({ msg: "invalid OTP" });
  }

  const user = await User.findByIdAndUpdate(
    otpDoc.user,
    {
      isVerified: true,
    },
    { new: true },
  );

  await OTP.deleteMany({
    user: otpDoc.user,
  });

  res.status(200).json({
    msg: "Email verify successfull",
    user: {
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
};
