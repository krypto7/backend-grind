import express from "express";
import cookieParser from "cookie-parser";
import todoRouter from "./routes/todo.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/todo', todoRouter)

export default app;
