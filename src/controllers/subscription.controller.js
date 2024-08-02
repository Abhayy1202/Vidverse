import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!isValidObjectId(channelId))
  {
    throw new ApiError(400,"Invalid ChannelId")
  }

  const channel= User.findById(channelId)
  if(!channel)throw new ApiError(404 ,"Channel Not Exist");

  const existingSubscription = await Subscription.findOne({channel:channelId , subscriber:req.user?._id})

  if(existingSubscription)
  {
    await Subscription.deleteOne({channel:channelId,subscriber:req.user._id})
  }
  else{
    await Subscription.create({channel:channelId,subscriber:req.user._id})
  }
const isSubscribed=existingSubscription?true:false

return res
.status(200)
.json(new ApiResponse(200,{isSubscribed},"Subscription Toggle Successful"))
  // TODO: toggle subscription
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!isValidObjectId(channelId))throw new ApiError(400,"Invalid ChannelId")

    // const channel= await User.findById(channelId)
    // if(!channel)throw new ApiError(404,"Channel Not Exist")

   try {
     const subscriptions= await Subscription.find({channel:channelId})
     const subscriberIds= subscriptions.map(subscription=>subscription.subscriber)
     return res
     .status(200)
     .json(new ApiResponse(200,{subscriberIds},"UserSubscribers Fetch Successful"))
   } catch (error) {
    throw new ApiError(500,"UserSubscriber Fetch Failed")
   }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if(!isValidObjectId(subscriberId))throw new ApiError(400,"Invalid ObjectId")

   try {
     const channels=await Subscription.find({subscriber:subscriberId})
     const ChannelIds= channels.map(ch=>ch.channel)
     return res
     .status(200)
     .json(new ApiResponse(200, { ChannelIds },"Subscribed Channel Fetched Successfully"));
   } catch (error) {
    throw new ApiError(500,"Failed to Fetch Subscribed Channels")
   }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
