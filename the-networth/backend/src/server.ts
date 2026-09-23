import app from "./app.js";
import dotenv from "dotenv";
import dbConnection from "./db/dbConnection.js";

dotenv.config();

const serverStart = async () => {
  try {
    await dbConnection();
    const port = Number(process.env.PORT) || 8000;

    app.listen(port, () =>
      console.log(`app running on ${port}`),
    );
  } catch (error) {
    console.log("error=====", error);
  }
};

serverStart().catch((error) => console.log("error starting server:", error));
