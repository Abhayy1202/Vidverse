import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId=req.user?._id

  if(!isValidObjectId(videoId))
  {
    throw new ApiError(400,"Invalid VideoId")
  }
  try {
    const liked=await Like.findbyId({likedby:userId,videos:videoId})
    if(liked)
       await Like.deleteOne({videos:videoId,likedby:userId})
    else
    await Like.create({videos:videoId,likedby:userId},{new:true})
  
    const isLiked = liked?false:true
  
    return res.status(200)
    .json(new ApiResponse(200,{isLiked},"VideoLike Toggled"))
  } catch (error) {
    throw new ApiError(500,"Unable to Toggle VideoLike")
  }
  //TODO: toggle like on video
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid CommentId");
  }

  try {
    const liked = await Like.findbyId({ likedby: userId, Comment: commentId });
    if (liked) await Like.deleteOne({ Comment: commentId, likedby: userId });
    else await Like.create({ Comment : commentId, likedby: userId }, { new: true });

    const isLiked = liked ? false : true;

    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked }, "CommentLike Toggled"));
  } catch (error) {
    throw new ApiError(500, "Unable to Toggle CommentLike");
  }
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId=req.user?._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid TweetId");
  }

  try {
    const liked = await Like.findbyId({ likedby: userId, tweet: tweetId });
    if (liked) await Like.deleteOne({ tweet: tweetId, likedby: userId });
    else await Like.create({ tweet: tweetId, likedby: userId }, { new: true });

    const isLiked = liked ? false : true;

    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked }, "TweetLike Toggled"));
  } catch (error) {
    throw new ApiError(500, "Unable to Toggle TweetLike");
  }
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  try {
    const likedVideo = await Like.find({likedby:userId,videos:{$exists:true}}).populate('videos')
    return res.status(200)
      .json(new ApiResponse(200,null,"Liked Videos fetched successfully"))
  } catch (error) {
    throw new ApiError(500,"Unable to Fetch LikedVideos")
  }
  
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
