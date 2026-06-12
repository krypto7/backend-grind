import dbConnection from "./db/dbConnection.js";
import app from "./index.js";
import dotEnv from "dotenv";

dotEnv.config();

const runServer = async () => {
  try {
    await dbConnection();
    app.listen(process.env.PORT, () => {
      console.log(`server is running on ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("server error");
  }
};

runServer().catch((error) => console.log(error));
