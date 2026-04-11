const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "all fields are required",
      });
    }

    const userExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (userExist) {
      return res.status(409).json({
        msg: "user already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashPassword,
      role: "user",
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token);

    res.status(201).json({
      msg: "user register successfully",
      user,
    });
  } catch (error) {
    console.log("ERROR:", error); // ✅ debug
    return res.status(400).json({
      msg: error.message, // ✅ fix
    });
  }
};

const loginUser = async (req, res) => {
  const { username, email, password } = req.body;

  const user = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    return res.status(400).json({ msg: "invalid credential" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ msg: "invalid credential" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
  );

  res.cookie("token", token);

  res.status(200).json({
    msg: "User loggin successfully",
    user,
  });
};

module.exports = { registerUser, loginUser };
