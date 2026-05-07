import User from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../model/session.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "all fields are required",
      });
    }

    const isUserMatch = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserMatch) {
      return res.status(400).json({
        msg: "user is already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashPassword,
    });

    const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "1d",
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

    await res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await res.status(200).json({
      msg: "user register successfully",
      user,
      accessToken,
    });
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};

export const getUser = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(400).json({
      msg: "aunthorized",
    });
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(400).json({
      msg: "user unauthorized",
    });
  }

  res.status(200).json({
    msg: "user found",
    user,
  });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(400).json({
      msg: "aunthorized",
    });
  }
  const decoded = jwt.verify(token, config.JWT_SECRET);

  const accessToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, {
    expiresIn: "15m",
  });

  const session = await Session.findOne({
    user: decoded.id,
    revoke: false,
  });

  const newRefreshToken = jwt.sign({ id: decoded.id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    msg: "accessToken refresh successfully",
    accessToken,
  });
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        msg: "Token not found",
      });
    }

    // verify token
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    // find sessions
    const sessions = await Session.find({
      user: decoded.id,
      revoke: false,
    });

    let currentSession = null;

    // compare hashed token
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash,
      );

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

    // revoke session
    currentSession.revoke = true;

    await currentSession.save();

    // clear cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      msg: "Logout successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

export const logoutAll = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ msg: "token not found" });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

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

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      msg: "field must required!!",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      msg: "User not found",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      msg: "invalid credential",
    });
  }

  const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
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
    { expiresIn: "15m" },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    msg: "user sigin successfully",
    accessToken,
  });
};
