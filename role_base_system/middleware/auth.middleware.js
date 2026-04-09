const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ msg: "No token provided" });
    }

    //verify token:
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    //attach user:
    req.user = decode;

    next();
  } catch (error) {
    res.status(400).json({ msg: "Invalid token" });
  }
};

module.exports = authMiddleware;
