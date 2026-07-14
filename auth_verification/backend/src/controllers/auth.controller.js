import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { verifyEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import Session from "../models/session.model.js";
import { sendOtpMail } from "../services/otp.service.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!username || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user already exists!!",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "10m",
    });

    await verifyEmail(token, user.email);
    user.token = token;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "User register successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const verification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "invalid credential",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "registration tokne expired",
      });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    ((user.token = null), (user.isVerified = true));
    await user.save();

    return res.status(200).json({
      success: true,
      message: "email verify successfully",
    });
  } catch (err) {
    console.log("token expired eror====>", err);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    console.log(email, password);

    const existUser = await User.findOne({ email });

    console.log("existUser====", existUser);

    if (!existUser) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const matchPassword = await bcrypt.compare(password, existUser.password);

    if (!matchPassword) {
      return res.status(400).json({
        success: false,
        message: "incorrect password",
      });
    }

    if (!existUser.isVerified) {
      return res.status(403).json({
        success: false,
        mesage: "verify you account then login",
      });
    }

    //check for existing session and delete it.

    const existingSession = await Session.findOne({ userId: existUser.id });

    if (existingSession) {
      await Session.deleteOne({ userId: existUser.id });
    }

    //create new session
    await Session.create({ userId: existUser.id });

    //generate tokens:

    const accessToken = jwt.sign(
      { id: existUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" },
    );

    const refreshToken = jwt.sign(
      { id: existUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    existUser.isLoggedIn = true;
    await existUser.save();

    return res.status(200).json({
      success: true,
      message: `Welcome back ${existUser.username}`,
      accessToken,
      refreshToken,
      data: existUser,
    });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.userId;
    await Session.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    return res.status(200).json({ success: true, message: "user logout" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const OTP = Math.floor(100000 + Math.random() * 9000000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log("OTP=====", OTP);
    console.log("expiry=====", expiry);

    user.otp = OTP;
    user.otpExpiry = expiry;

    await user.save();

    await sendOtpMail(email, OTP);

    res.status(200).json({
      success: true,
      message: error.message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
