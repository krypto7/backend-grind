const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}spotify`);
    console.log("db connected!!!");
  } catch (error) {
    console.log("====>", error);
  }
};
module.exports = dbConnection;
