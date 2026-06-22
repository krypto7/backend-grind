import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import todoRoute from "./routes/todo.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", authRoute);
app.use("/api/v1/todo", todoRoute);

export default app;
