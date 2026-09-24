import User from "../models/user.model.js";
import type { Request, Response } from "express";

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

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createUser) {
    return res.status(500).json({
      status: false,
      msg: "Something went wrong",
    });
  }

  return res.status(200).json({
    status: "success",
    user: user,
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

  if (!user) {
    return res.status(401).json({
      status: false,
      msg: "Invalid email or password",
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

// const logout = async (req: Request, res: Response) => {};
