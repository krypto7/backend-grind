import "./src/config/env.js";
import app from "./src/app.js";
import dbConnection from "./src/db/dbConnection.js";

const startServer = async () => {
  try {
    await dbConnection();
    await app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running on ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("===error", error);
  }
};

startServer().catch((error) => error);
