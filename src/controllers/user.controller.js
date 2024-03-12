import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
    
    // get user details from frontend
    const {fullName,Email,username,password} = req.body
    
    // console.log("Email :",Email)
    
    
    // validation — not empty
    if ([fullName, Email, username, password].some((field) => field?.trim() === "")) 
    {
      throw new ApiError(400, "Required Fields");
    }
    
    
    // check if user already exists: username, email
    const UserExisted = await User.findOne({
        $or:[{username},{Email}]
    })
    if (UserExisted) {
        throw new ApiError(409,"User Exists Already")
    }
    
    // check for images, check for avatar
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
     coverImageLocalPath = req.files.coverImage[0].path;
    }

      if (coverImageLocalPath) {
        // upload cover image to Cloudinary
        const coverImage = await uploadCloudinary(coverImageLocalPath);
        if (!coverImage) {
          throw new ApiError(500, "Error uploading cover image to Cloudinary");
        }
      }
    
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    
    
    // upload them to cloudinary, avatar
const avatar = await uploadCloudinary(avatarLocalPath)
// const coverImage = await uploadCloudinary(coverImageLocalPath)

if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
}


// create user object — create entry in db
const user= await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url||"",
    Email,
    password,
    username: username.toLowerCase()
})

// remove password and refresh token field from response
const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
    );
    
    // check for user creation
    if(!userCreated)
    {
        throw new ApiError(500,"User register error")
    }
    
    return  res.status(201).json(
        new ApiResponse(200,userCreated,"User registered successfully")
        )
    
})

    export {registerUser}