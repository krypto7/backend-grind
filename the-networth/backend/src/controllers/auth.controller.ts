import User from "../models/user.model.js";
import type { Request, Response } from "express";

interface SignupBody {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}

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

// const login = async (req: Request, res: Response) => {};

// const logout = async (req: Request, res: Response) => {};
