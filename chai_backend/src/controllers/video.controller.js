import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const uploadVideo = asyncHandler(async(req,res)=>{
    const {title,description} = req.body;
    const video = req.file?.path;

    if(!video){
        return res.status(400).json({message:"Video file is required"});
    }

    const video = await uploadOnCloudinary(video,"video");

    console.log("======video",video);

    
}) 