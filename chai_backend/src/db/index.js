import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("db connected");
  } catch (error) {
    console.log("Error:", error);
  }
};

export default dbConnection;
