const express = require("express");
const dbConnection = require("./db/dbConnection");
const authRoute = require("./router/user.router");
const musicRoute = require("./router/music.router");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
dbConnection();

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/music", musicRoute);

app.listen(process.env.PORT || 3000);   
