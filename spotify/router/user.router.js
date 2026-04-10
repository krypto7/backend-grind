const express = require("express");
const router = express.Router();
const authContrller = require("../controller/auth.controller");

router.post("/register", authContrller.registerUser);
