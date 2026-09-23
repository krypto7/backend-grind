import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1/user", authRouter);

app.get("/me", (req, res) => {
  res.status(200).json({
    status: "success",
    msg: "Hello",
  });
});

export default app;
