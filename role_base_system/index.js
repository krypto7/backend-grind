const express = require("express");
const dbConnection = require("./db/dbConnection");

require("dotenv").config();
dbConnection();

const app = express();

app.use(express.json());

//routes
const authRoutes = require("./routes/auth.route");
const blogRoutes = require("./routes/blog.route");

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.listen(process.env.PORT || 8000);
