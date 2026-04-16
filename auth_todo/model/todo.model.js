const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: String,
    desc: String,
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Todo = mongoose.model("todo", todoSchema);

module.exports = Todo;
