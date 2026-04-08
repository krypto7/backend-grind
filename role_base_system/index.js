const express = require("express");
const jwt = require("jsonwebtoken");
const dbConnection = require("./db/dbConnection");
const User = require("./model/user.model");
const bcrypt = require("bcrypt");

require("dotenv").config();
dbConnection();
const app = express();

app.use(express.json());

//singup
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizeEmail = email.toLowerCase();

    //check the fields
    if (!username || !normalizeEmail || !password) {
      return res.status(400).json("all fields are required");
    }

    const userExist = await User.findOne({ email: normalizeEmail });

    if (userExist) {
      return res.status(400).json("user is already exist");
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashpassword,
    });

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      msg: "user register successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

//signin
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    //check the fields
    if (!email || !password) {
      return res.status(400).json("all fields are required");
    }

    const userExist = await User.findOne({ email });

    if (!userExist) {
      return res.status(400).json("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, userExist.password);

    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: userExist._id, role: userExist.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      msg: "loggedin successfully!!",
      token,
      user: {
        id: userExist._id,
        username: userExist.username,
        email: userExist.email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

app.listen(process.env.PORT || 3000);
