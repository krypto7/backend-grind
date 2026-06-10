import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("DB connected successfully !!");
  } catch (error) {
    console.log("error in DB connection====", error);
  }
};

export default dbConnection;
