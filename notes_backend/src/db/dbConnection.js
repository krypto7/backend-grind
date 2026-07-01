import mongoose from "mongoose";

const dbConnection = async() =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/notesDB`);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
    
}

export default dbConnection;