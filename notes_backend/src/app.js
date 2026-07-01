import express from "express";
import authRoutes from "./routes/auth.route.js";
import noteRoutes from "./routes/note.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import cookieParser from "cookie-parser";


const app = express();

app.use(express.json());  
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/notes", authMiddleware, noteRoutes);

export default app;  