import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    console.log("accessToken",accessToken)
    if (!accessToken) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next(); 
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
};