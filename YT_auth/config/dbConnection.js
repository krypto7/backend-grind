import mongoose from "mongoose";
import config from "./Config.js";

const dbConnection = async () => {
  try {
    await mongoose.connect(`${config.MONGODB_URL}/YT_LAB`);
    console.log("db Connected");
  } catch (error) {
    console.log("database connection issue");
  }
};

export default dbConnection;
