import Todo from "../models/todo.model.js";

export const createTodo = async (req, res) => {
  // take data from the user
  // varify the data
  //store it in db

  const { task, isCompleted } = req.body;

  if (!task || !isCompleted) {
    return res.status(400).json({
      msg: "all field are required ",
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

export const editTodo = async (req, res) => {
  const id = req.params.id;

  const {task,isCompleted} = req.body;

   if (!task || !isCompleted) {
    return res.status(400).json({
      msg: "all field ar ",
    });
  }

  const updatedTask = await Todo.findByIdAndUpdate(id,{
    task,
    isCompleted,
  },{new:true});

  res.status(200).json({
    msg: "task updated succesfully !!",
    task: updatedTask,
  });
};

export const deleteTodo = async (req, res) => {};
