const express = require("express");
require("dotenv").config();
const app = express();

app.get("/",(req,res)=>{
    res.send("Hello Nishant");
})

app.listen(3000)