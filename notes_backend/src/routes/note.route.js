import {Router} from 'express';
import * as noteController from '../controllers/note.controller.js';

const router = Router();

router.post("/create", noteController.createNote);
router.get("/get-notes", noteController.getAllNotes);
router.patch("/edit-note/:id", noteController.editNote);
router.delete("/delete-note/:id", noteController.deleteNote);

export default router;