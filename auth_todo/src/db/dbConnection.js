import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
  } catch (error) {
    console.log("error in DB connection====", error);
  }
};

export default dbConnection;
