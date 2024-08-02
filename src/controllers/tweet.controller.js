import  { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
   const content = req.body;
   const{ userId }= req.params;

     if (!isValidObjectId(userId)) {
    throw new ApiError(400,"Invalid User")}

   if(!content){
    throw new ApiError(400,"Empty Tweet");
   }

  try {
     const tweet = await Tweet.create({
      content,
      owner: userId
     })
  
     return res
     .status(201)
     .json(new ApiResponse(200,tweet,"Tweet posted successfully"))
  } catch (error) {
    throw new ApiError(500,"Tweet Creation Failed")
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const {userId} = req.params
  if (!isValidObjectId(userId)) {
    throw new ApiError(400,"Invalid User")
  }
 try {
   const tweet = await Tweet.find({owner:userId})
   // if(!tweet?.length)
   // {
   //   return new ApiError(404,"No Tweet Present")
   // }
 
 return res
 .status(200)
 .json(new ApiResponse(200,tweet,"User Tweets fetched successfully"))
 } catch (error) {
  throw new ApiError(500,"Unable to Update Tweet")
 }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const {tweetId}= req.params
  if(!isValidObjectId(tweetId))throw new ApiError(400, "Invalid ObjectId");

  const {content} = req.body
  if(!content)throw new ApiError(400,"Nothing to Update");

  try {
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );
  
      
      return res
  .status(200)
  .json(new ApiResponse(200,tweet,"Tweet updated successfully"))
  } catch (error) {
    throw new ApiError(500,"Error in Updating Tweet")
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
const {tweetId} = req.params
if(!isValidObjectId(tweetId))throw new ApiError(400,"Invalid Tweet")
try {
    await Tweet.findByIdAndDelete(tweetId)
  
  return res.status(200)
  .json(new ApiResponse(200,null,"Tweet Deleted Successfully"))
} catch (error) {
  throw new ApiError(500,"Unable To Delete Tweet")
}
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
