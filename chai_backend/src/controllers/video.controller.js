import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const uploadVideo = asyncHandler(async(req,res)=>{
    const {title,description} = req.body;
    const videoFile = req.file?.path;

    if(!videoFile){
        return res.status(400).json({message:"Video file is required"});
    }

    const video = await uploadOnCloudinary(videoFile,"video");

    console.log("======video",video);


}) 