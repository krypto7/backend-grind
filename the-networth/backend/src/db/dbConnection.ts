import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/social-media`);
    console.log("db connected");
  } catch (error) {
    console.log("Error:", error);
  }
};

export default dbConnection;
