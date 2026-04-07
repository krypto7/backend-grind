const mongoose = require("mongoose");

const dbConnection = async() =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/auth-sys`);
        console.log("DB Connected!!")
    } catch (error) {
        console.log("DB-error",error)
    }
}

module.exports = dbConnection;