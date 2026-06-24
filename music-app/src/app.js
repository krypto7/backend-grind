import express from "express";
import userRouter from "./routes/auth.route.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1", userRouter);

export default app;
