import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "token invalid",
      });
    }

    const token = authHeader?.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || decoded === undefined) {
      res.status(400).json({
        success: false,
        message: "token expired",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    req.userId = user._id;
    next();
  } catch (error) {}
};
