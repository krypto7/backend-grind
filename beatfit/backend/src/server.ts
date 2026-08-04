import app from "./app";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

async function startServer() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(process.env.PORT, () => {
    console.log(`Server is now listening to port ${process.env.PORT}`);
  });
}

startServer().catch((err) => {
  console.log("error while startign the server");
});
