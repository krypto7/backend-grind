import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("db connected");
  } catch (error) {
    console.log("db connection error:", error);
    throw error;
  }
};

export default dbConnection;
