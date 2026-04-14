const User = require("../model/user.model");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    res.status(400).json({ msg: "all fields are required!!" });
  }

  const userExist = await User.findById({ email });

  if (userExist) {
    res.status(400).json({ msg: "user is already exist!" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashPassword,
  });

  req.status(200).json({
    msg: "user register successfully!!",
    user: user,
  });
};

module.exports = { signup };
