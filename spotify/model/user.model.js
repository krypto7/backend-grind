const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: {
      type: String,
      unique: String,
    },
    password: String,
    role: {
      type: String,
      enum: ["user", "artist"],
      default: "user",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("user", userSchema);
module.exports = User;
