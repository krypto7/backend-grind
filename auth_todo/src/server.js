import dbConnection from "../../chai_backend/src/db/index.js";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const startServer = async () => {
  await dbConnection();

  app.listen(process.env.PORT, () => {
    console.log(`app running on ${process.env.PORT}`);
  });
};

startServer().catch((err) => {
  console.log("Error starting server: ", err);
});
