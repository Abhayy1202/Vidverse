import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

const skip = (page-1)*limit;
try {
  const comment=await Comment.find({video:videoId}).skip(skip).limit(limit);
  const totalComment = await Comment.countDocuments({video:videoId});
  
  return res.status(200).json(new ApiResponse(200,{
    comment,
    totalComment,
    totalPages: Math.ceil(totalComment / limit),
    currentPage: page,
  },"All Comment of video Fetched Successfully"));
  
} catch (error) {
  throw new ApiError(500,"Unable to Fetch VideoComments")
}
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
const comment=req.body;
const {videoId}= req.params
const userId=req.user?._id
if(!isValidObjectId(videoId))
 throw new ApiError(400,"Invalid ObjectId")

try {
  const newComment= await Comment.create({videos:videoId,owner:userId,content:comment},{new:true})
   return res.status(200).json(new ApiResponse(200,newComment,"New Comment Added"))
} catch (error) {
  throw new ApiError(500,"Unable To Add Comment")
}

});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const {commentId} = req.params
  const comment=req.body
  const userId=req.user?._id;

  if(!isValidObjectId(commentId))throw new ApiError(400,"Invalid ObjectId")
  try {
    await Comment.findByIdAndUpdate(commentId,{$set:{content:comment}},{new:true})
    return res
    .status(200)
    .json(new ApiResponse(200,null,"Comment Updated "))
  } catch (error) {
    throw new ApiError(500,"Unable to Update Comment")
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
   const { commentId } = req.params;
   const comment = req.body;
   const userId = req.user?._id;
   if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid ObjectId");
   try {
     await Comment.findByIdAndDelete(
       commentId,
       { $set: { content: comment } },
       { new: true }
     );
     return res.status(200).json(new ApiResponse(200, null, "Comment Deleted"));
   } catch (error) {
     throw new ApiError(500, "Unable to Delete Comment");
   }
});

export { getVideoComments, addComment, updateComment, deleteComment };
