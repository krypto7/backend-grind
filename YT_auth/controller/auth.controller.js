import User from "../model/user.model.js";
import bcrypt, { hash } from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../model/session.model.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  const isUserExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExist) {
    res.status(409).json({
      msg: "user alredy exist!!",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashPassword,
  });

  const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = await Session.create({
    userId: user._id,
    refreshToken: refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    { id: user._id, sessionId: session._id },
    { id: user._id },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  });

  res.status(201).json({
    msg: "user register successfullly",
    token: accessToken,
    user: user,
  });
};

export const getMe = async (req, res) => {
  // console.log("hello");
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "access denied!!" });
  }

  const decode = jwt.verify(token, config.JWT_SECRET);

  const findUser = await User.findById(decode.id);

  res.status(200).json({
    msg: "user found",
    user: {
      username: findUser.username,
      email: findUser.email,
    },
  });
};

// export const refreshToken = async (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res.status(400).json({ msg: "refresh token not found" });
//   }
//   const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

//   const accessToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, {
//     expiresIn: "16m",
//   });

//   const newRefreshToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, {
//     expiresIn: "7d",
//   });

//   console.log("===>", newRefreshToken);

//   res.cookie("newRefreshToken", newRefreshToken, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });

//   res.status(200).json({
//     msg: "access token refresh successfullly",
//   });
// };

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ msg: "token not found" });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  const accessToken = jwt.sign(
    // { id: decoded._id, sessionId: session._id },
    { id: decoded._id },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const newRefreshToken = jwt.sign(
    // { id: decoded._id, sessionId: session._id },
    { id: decoded._id },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  });

  res.status(200).json({
    msg: "access token refresh successfullly",
    accessToken,
  });
};
