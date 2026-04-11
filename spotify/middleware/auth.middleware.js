const jwt = require("jsonwebtoken");

const authArtist = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ msg: "invalid credential" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "artist") {
      return res
        .status(403)
        .json({ msg: "You don't have access to create music!!" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "unauthorized" });
  }
};

const authUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ msg: "Unauthrized!!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "artist" && decoded.role !== "user") {
      return res
        .status(403)
        .json({ msg: "You don't have access to create music!!" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "unauthorized" });
  }
};

module.exports = { authArtist, authUser };
