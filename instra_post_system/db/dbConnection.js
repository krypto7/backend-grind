const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}posts`);
    console.log("db Connected!!");
  } catch (error) {
    console.log("db error", error);
  }
};
module.exports = dbConnection;
