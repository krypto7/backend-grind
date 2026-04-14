const express = require("express");
const app = express();
require("dotenv").require();

app.use(express.json());



app.listen(process.env.PORT);
