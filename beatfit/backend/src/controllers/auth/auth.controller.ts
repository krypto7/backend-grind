import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import User from "../../models/user.model";
import { decodePassword, hashPassword } from "../../lib/hash";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../lib/email";
import { createAccessToken, createRefreshToken } from "../../lib/token";

function getAppUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}`;
}

export const registrationHandler = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        msg: "invalid data !!",
        errors: result.error.flatten(),
      });
    }

    const { name, email, password } = result.data;

    const normalizeEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizeEmail });

    if (existingUser) {
      return res.status(400).json({
        msg: "Email is already in use! Please try with different email",
      });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      email: normalizeEmail,
      passwordHash: passwordHash,
      role: "user",
      isEmailVerified: false,
      twoFactorEnable: false,
    });

    //email verfication part

    const verifyToken = jwt.sign(
      { sub: newUser.id },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    const verifyURL = `${getAppUrl}/auth/verify-email?token=${verifyToken}`;

    await sendEmail(
      newUser.email,
      "Verify your email",
      `
            <p>please verify your email by clicking this link </p>
            <p><a href="${verifyURL}">${verifyURL}</a></p>
        `,
    );

    return res.status(201).json({
      msg: "User registered!",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.log("errror in registration ", error);
    return res.status(500).json({
      msg: "internal server error",
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = req.query.token as string | undefined;

  if (!token) {
    return res.status(400).json({
      msg: "verfication token is missing",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      sub: string;
    };

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(400).json({ msg: "user not found" });
    }

    if (user.isEmailVerified) {
      return res.json({ msg: "email is already verfified" });
    }
    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({ msg: "email is now verified!" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ msg: "internal server error" });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        msg: "invalid data !!",
        errors: result.error.flatten(),
      });
    }

    const { email, password } = result.data;

    const normalizeEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizeEmail });

    if (!user) {
      return res.status(400).json({
        msg: "invalid email or password",
      });
    }

    const ok = await decodePassword(password, user.passwordHash);

    if (!ok) {
      return res.status(400).json({
        msg: "invalid credential",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        msg: "please verify your email before loggin in",
      });
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      msg: "login successfully done",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role, 
      },
    });
  } catch (error) {}
};
