import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/videos.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { removeCloudinary, uploadCloudinary } from "../utils/cloudinary.js";

//function to get video's old info
const getval = async (req) => {
  try {
    const video = await Video.findById(req.params?.videoId);
    return video;
  } catch (error) {
    return error;
  }
};

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNumber=parseInt(page,10);
  const pageSize=parseInt(limit,10);
  const match={owner:userId,...query};

  const sortOrder = sortType === "desc" ? -1 : 1;
 try {
   const pipeline = [
     { $match: match }, // Filter documents
     { $sort: { [sortBy]: sortOrder } }, // Sort documents
     { $skip: (pageNumber - 1) * pageSize }, // Skip documents for pagination
     { $limit: pageSize }, // Limit documents per page
     {
       $facet: {
         videos: [],
         totalCount: [{ $count: "count" }],
       },
     },
   ];
 
   const result = await Video.aggregate(pipeline);
 const videos = result[0].videos;
 const totalVideos = result[0].totalCount[0]?.count || 0;
 const totalPages = Math.ceil(totalVideos / pageSize);
 
 res.status(200)
 .json(new  ApiResponse(200,
   {videos,
   currentPage:pageNumber,
   totalVideos,
   totalPages},"All Videos Fetched Successfully"))
 } 
 
 catch (error) {
  throw new ApiError(500,"Error in Fetching Videos...")
 }

  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description,duration } = req.body;
if (!title||!description) {
  throw new ApiError(400,"Title and description can't be empty")
}
//get user info
const user = await User.findById(req.user?._id).select("username fullName avatar");
if(!user)
{
  throw new ApiError(400,"Unauthorized User request")
}
const videoLocalPath = req.files?.videoFile[0]?.path
const thumbnailLocalPath = req.files?.thumbnail[0].path 
if(!videoLocalPath)
{
  throw new ApiError(400,"Video File is required")
}
if(!thumbnailLocalPath)
{
   throw new ApiError(400, "Thumbnail is required");
}
const videoFile = await uploadCloudinary(videoLocalPath);
const thumbnail = await uploadCloudinary(thumbnailLocalPath)
const video = await Video.create({
  videoFile,
  thumbnail,
  user,
  title,
  description,
  duration
})

return res.status(200)
.json(new ApiResponse(200,video,"video published successfully"))
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400,"Invalid ObjectId")
  }

  const video = await Video.findById(videoId)
  if (!video.length) {
    throw new ApiError(500,"Server Failed to fetch video")
  }

  return res.status(200)
  .json(new ApiResponse(200,video,"Video fetched successfully"))
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ObjectId");
  }
 
  //created an object to store which fields' req is incoming for update
  let updateFields={}
  if(req.body?.new_title?.trim()!="")
  {
    updateFields.title = req.body.new_title
  }
  if(req.body?.description?.trim()!="")
  {
    updateFields.description = req.body.description
  }

  //for thumbnail update
  if(req.files?.path)
  {
   const new_ThumbnailLocalPath = req.files.path
   try {
    const new_Thumbnail = await uploadCloudinary(new_ThumbnailLocalPath);

    if(!new_Thumbnail.url){
     throw new ApiError(400,"Error while uploading new Thumbnail")
    }
    
      updateFields.thumbnail = new_Thumbnail.url
      
      //delete old from cloudinary
      const old_detail= await getval(req);
      const old_thumbnail = "";
      if(!(old_detail instanceof Error)){
        old_thumbnail = old_detail.thumbnail 
        removeCloudinary(old_thumbnail);
        
       }
   }
    catch (error) {
    throw new ApiError(500, "Internal Server Error: Thumbnail upload failed");
    }
  }
   


  //check whether updateField is empty or not
  if(Object.keys(updateFields).length>0)
  {
  const video = await Video.findByIdAndUpdate(videoId,
   updateFields,{new:true})

   return res.status(200)
   .json(new ApiResponse(200,video,"Video Updated Successfully"))
  }
  else
  {
    throw new ApiError(400,"Nothing to Update")
  }
 
  

  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ObjectId");
  }

  const video = await Video.findOneAndDelete(videoId);
  if(!video)
  {
    throw new ApiError(500,"Deletion failed")
  }

  return res.status(200)
  .json(new ApiResponse(200,null,"Video deleted Successfully"))
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ObjectId");
  }

  const video = await Video.findByIdAndUpdate(videoId,
    {
      $set:{
        ispublished: !ispublished
      }
    },{new:true})
if(!video)
{throw new ApiError(500,"Internal Server Error:Toggle Status Failed")}

return res.status(200)
.json(new ApiResponse(200,null,"Video Publish Status Changed"))
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
