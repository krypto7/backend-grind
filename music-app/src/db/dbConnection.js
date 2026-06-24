import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/music_app`);
    console.log("db connnected ");
  } catch (error) {
    console.log(error);
  }
};

export default dbConnection;
