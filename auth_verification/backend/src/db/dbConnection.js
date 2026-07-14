import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/auth-verification`);
    console.log("db connnected successfully");
  } catch (error) {
    console.log(error);
  }
};

export default dbConnection;
