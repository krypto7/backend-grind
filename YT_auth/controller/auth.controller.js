import User from "../model/user.model";
import bcrypt from "bcrypt";

const register = async(req,res)=>{
    const{username, email, password} = req.body

    const isUserExist = await User.findOne({
        $or:[
            {username},{email}
        ]
    });
    if(isUserExist){
        res.status(409).json({
            msg:"user alredy exist!!"
        })
    }

}