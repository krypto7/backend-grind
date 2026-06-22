import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import Todo from "../models/todo.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
export const createTodo = async (req, res) => {
  const token = req.cookies.accessToken;
  const { task, isCompleted } = req.body;
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (!token) {
    throw new ApiError(400, "Unauthorized request");
  }

  const todo = await Todo.create({
    task,
    isCompleted,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, todo, "task createad successfullty"));
};
