const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require("./model/user.model");
const dbConnection = require("./db/dbConnection");

require("dotenv").config();
const app = express();

app.use(express.json());
dbConnection();

//signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json("all fields are reqeuired");
  }

  const userExist = await user.findOne({ email });

  if (userExist) {
    return res.status(400).json("user already exist");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await user.create({
    username,
    email,
    password: hashPassword,
  });

  //create token
  const token = jwt.sign(
    { userId: newUser._id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.status(201).json({
    msg: "User registered successfully",
    token,
    user: newUser,
  });
});


//signin
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("all fields are reqeuired");
  }

  const userExist = await user.findOne({ email });

  if (!userExist) {
    return res.status(404).json("user not found");
  }

  //verify password
  const isMatch = await bcrypt.compare(password, userExist.password);

  if(!isMatch){
    return res.status(400).json("password is incorrect!!");
  }

  //create token
  const token = jwt.sign(
    { userId: userExist._id, email: userExist.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  const { password: _, ...userData } = userExist._doc;

  res.status(201).json({
    msg: "Login Succefully !!",
    token,
    user: userData,
  });
});


app.listen(process.env.PORT || 3000);
