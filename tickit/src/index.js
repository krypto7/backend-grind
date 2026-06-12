import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", authRoute);

export default app;
