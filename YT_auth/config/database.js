import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async() =>{
    await mongoose.connect(config.MONGODB_URL)
    console.log("connected to db")
}

export default connectDB;