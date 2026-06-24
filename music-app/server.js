import app from "./src/app.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import dbConnection from "./src/db/dbConnection.js";

app.use(cookieParser());
dotenv.config();

const startServer = async () => {
  await dbConnection();
  app.listen(process.env.PORT, () => {
    console.log(`Your server running on ${process.env.PORT}`);
  });
};

startServer().catch((error) => {
  console.log("Error starting server:", error);
});
