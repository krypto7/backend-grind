import dotenv from "dotenv";
import dbConnection from "./db/index.js";
import app from "./app.js";

dotenv.config();

dbConnection();

app.listen(process.env.PORT, () =>
  console.log(`app runningn on ${process.env.PORT}`)
);
