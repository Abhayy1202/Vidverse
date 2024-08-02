import mongoose from "mongoose";
import { Video } from "../models/videos.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const {channelId} = req.params;

  try {
    const subsCount= await Subscription.countDocuments({channel:channelId});
  
    const videoStats= await Video.aggregate([
      {$match:{owner:channelId}},
      {$lookup:{
        from:"likes",
        localField:"_id",
        foreignField:"video",
        as:"likes"}},
  
      {$group:{_id:null,
        totalViews:{$sum:"$views"},
        videoCount:{$sum:1},
      totalLikes:{$sum:{$size:"$likes"}}}}
    ])
    const videoCount = videoStats.length > 0 ? videoStats[0].videoCount : 0;
  const totalViews = videoStats.length > 0 ? videoStats[0].totalViews : 0;
  const totalLikes = videoStats.length > 0 ? videoStats[0].totalLikes : 0;
    return res.status(200)
    .json(new ApiResponse(200,{subsCount,videoCount,totalLikes,totalViews},"ChannelStats Fetched"));
  } catch (error) {
    throw new ApiError(500,"Unable to get channelStats")
  }
  
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const {channelId}=req.params;
  try {
    const videos= await Video.find({owner:channelId})
    return res.status(200).json(new ApiResponse(200,videos,"All Videos Fetched"));
  } catch (error) {
    throw new ApiError(500,"Unable to Fetch All Videos");
  }

});

export { getChannelStats, getChannelVideos };
