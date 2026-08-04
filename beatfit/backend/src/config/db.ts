import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(`${mongoUrl}beatfit`);
    console.log("db connected successfully!!");
  } catch (error) {
    console.error("Error while connecting to MongoDB:", error);
    process.exit(1);
  }
};
