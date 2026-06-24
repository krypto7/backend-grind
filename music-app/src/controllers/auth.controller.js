import User from "../models/user.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(500).json({
      msg: "something went wrong",
    });
  }
};

export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if ([username, email, password].some((field) => field.trim() === "")) {
    return res.status(400).json({
      msg: "all field are required",
    });
  }

  const userExist = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });

  if (userExist) {
    return res.status(400).json({
      msg: "user already exist!!",
    });
  }

  const user = await User.create({
    username,
    email,
    password,
    role,
  });

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createUser) {
    return res.status(500).json({
      msg: "someting went wrong register user",
    });
  }

  res.status(201).json({
    createUser,
    msg: "user register successfully",
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field.trim() === "")) {
      return res.status(400).json({
        msg: "all field are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "user not found!!",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        msg: "invalid crendiatialsss",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );

    console.log("===>", accessToken);
    console.log("===>", refreshToken);

    const loggedUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        msg: "user logged in",
      });
  } catch (error) {
    res.status(400).json({
      msg: "invalid credential",
      error,
    });
  }
};

export const logout = async (req, res) => {
  const token = req.cookie.accessToken;
  console.log("token====", token);
};
