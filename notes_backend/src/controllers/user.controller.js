import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const{username, email, password} = req.body;
        if(!username || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        const userExists = await User.findOne({email});

        if(userExists) {
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({ username, email, password: hashedPassword });
        
        const userData = user.toObject();
        
        delete userData.password;

        res.status(201).json({ message: "User registered successfully", user: userData });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message || error });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user){
        return res.status(400).json({message: "User not found"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid password"});
    }

    const accessToken = jwt.sign({id:user._id,role:user.role}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    const refreshToken = jwt.sign({id:user._id,role:user.role}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "7d"});

    const options = {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    };

    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);

    res.status(200).json({ message: "Login successful", user: user, accessToken, refreshToken });

}

export const logout = (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
}