import { Router } from "express";
import * as todoController from "../controllers/todo.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-todo", verifyJwt, todoController.createTodo);

export default router;
