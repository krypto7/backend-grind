import express from "express";
import morgan from "morgan";
import authRouter from "../routes/auth.routes.js";
import cookieParcer from "cookie-parser";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParcer());

app.use("/api/auth", authRouter);

export default app;
