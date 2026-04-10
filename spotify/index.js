const express = require("express");
const jwt = require("jsonwebtoken");
const dbConnection = require("./db/dbConnection");
require("dotenv").config();

const app = express();
dbConnection();

app.use(express.json());

app.listen(process.env.PORT || 3000);
