const express = require("express");
const dbConnection = require("./db/dbConnection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Todo = require("./model/todo.model");
const cookieParser = require("cookie-parser");
const User = require("./model/user.model");

require("dotenv").config();

dbConnection();

const app = express();

app.use(express.json());
app.use(cookieParser());


//singup:

app.post("/signup",async(req,res)=>{
  const {username,email,password} = req.body;
  
  if(!username || !email || !password){
    return res.status(400).json({
      msg:"all fields are required!!"
    })
  }

  const userExist = await User.findOne({email});

  if(userExist){
    return res.status(400).json({
      msg:"user already exists"
    })
  }

  const hashPassword = await bcrypt.hash(password,10);

  const user = await User.create({
    username,
    email,
    password:hashPassword
  })

})


//singin:

app.post("/signin",(req,res)=>{

})

//Todo-section:

//create-todo:
app.post("/add-todo", async (req, res) => {
  const { title, desc, isCompleted } = req.body;

  if (!title || !desc) {
    return res.status(400).json({
      msg: "all fields are required",
    });
  }

  const task = await Todo.create({
    title,
    desc,
    isCompleted,
  });

  res.status(200).json({
    msg: "Task added successfully,",
    todo: task,
  });
});

//update-todo:
app.patch("/task/:id", async (req, res) => {
  const id = req.params.id;
  const { title, desc, isCompleted } = req.body;

  const update = {};

  if (title !== undefined) return;

  const updatedTask = await Todo.findByIdAndUpdate(
    id,
    {
      title,
      desc,
      isCompleted,
    },
    { new: true },
  );

  if (!updatedTask) {
    return res.status(400).json({ msg: "Task not found" });
  }

  res.status(200).json({
    msg: "task updated",
    task: updatedTask,
  });
});

//get all task:

app.get("/tasks", async (req, res) => {
  const tasks = await Todo.find();

  res.status(200).json({
    msg: "Task fetch successfully",
    tasks,
  });
});

app.listen(process.env.PORT || 8000);
