const jwt = require("jsonwebtoken");

const roleMiddleware = (...allowRoles) => {
  return (req, res, next) => {
    if (!allowRoles.includes(req.user.role)) {
      return res.status(400).json({ msg: "access denied" });
    }
    next();
  };
};
