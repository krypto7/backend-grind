import app from "./src/app.js";
import dbConnection from "./src/db/dbConnection.js";
import dotenv from "dotenv";

dotenv.config();


const serverStart = async() =>{
  try {
    await dbConnection();
    app.listen(process.env.PORT, () => {
      console.log(`app is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

serverStart().catch((error) => {
  console.error("Unhandled error during server start:", error);
});