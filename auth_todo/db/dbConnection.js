const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}auth_todo`);
    console.log("db connected!");
  } catch (error) {
    console.log("db error====>", error);
  }
};
module.exports = dbConnection;
