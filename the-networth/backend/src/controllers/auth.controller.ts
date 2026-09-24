import User from "../models/user.model.js";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyEmail as sendVerifyEmail } from "../services/verifyEmail.js";

interface SignupBody {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

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
  const { firstname, lastname, username, email, password } = req.body;

  if (!firstname || !lastname || !email || !username || !password) {
    return res.status(401).json({
      status: false,
      msg: "all fields are required",
    });
  }

  const userExist = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });

  if (userExist) {
    return res.status(401).json({
      status: false,
      msg: "User already exist",
    });
  }

  const user = await User.create({
    firstname,
    lastname,
    email,
    password,
    username: username?.toLowerCase(),
  });

  const token = jwt.sign({ id: user?._id }, process.env.SECRET_KEY as string, {
    expiresIn: "10m",
  });
  await sendVerifyEmail(email, token);

  user.emailVerificationToken = token;

  await user.save();

  return res.status(200).json({
    status: "success",
    user: user,
    token: token,
  });
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
): Promise<Response> => {
  const { email, password } = req.body;

  console.log("dadsd===", email, password);

  if (!email || !password) {
    return res.status(401).json({
      status: false,
      msg: "all fields are required",
    });
  }


  const user = await User.findOne({ email });

  if(!user || !user.isVerified) {
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

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "strict" as const,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json({
      status: "success",
      user: loggedInUser,
      accessToken,
      refreshToken,
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

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessRefershToken(user._id.toString());

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        status: "true",
        msg: "AccessToken Refreshed",
        accessToken,
        refreshToken: newRefreshToken,
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

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
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

  if(!token) {
    return res.status(401).json({
      status: "false",
      msg: "unauthorise user",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as jwt.JwtPayload;
    const user = await User.findOne({
      _id: decoded.id,
      emailVerificationToken: token,
    });

    if(!user) {
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

export const sendOTP = async (req: Request, res: Response) => {};

export const verifyOTP = async (req: Request, res: Response) => {};

export const uploadProfileImage = async (req: Request, res: Response) => {};
export const removeProfileImage = async (req: Request, res: Response) => {};
export const EditProfileImage = async (req: Request, res: Response) => {};
