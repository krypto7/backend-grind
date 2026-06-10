import {Router} from 'express';
import * as todoController from '../controllers/todo.controller.js';

const router = Router();

router.post('/create-todo', todoController.createTodo);
router.put('/edit-todo/:id', todoController.editTodo);
router.delete('/delete-todo/:id', todoController.deleteTodo);

export default router;