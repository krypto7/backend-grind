import Todo from "../models/todo.model.js";

export const createTodo = async (req, res) => {
  // take data from the user
  // varify the data
  //store it in db

  const { task, isCompleted } = req.boy;

  if (!task || !isCompleted) {
    return res.status(400).json({
      msg: "all field ar ",
    });
  }

  const newTask = await Todo.create({
    task,
    isCompleted,
  });

  res.status(201).json({
    msg: "task addded succesfully !!",
    task: task,
  });
};

export const editTodo = async (req, res) => {};

export const deleteTodo = async (req, res) => {};
