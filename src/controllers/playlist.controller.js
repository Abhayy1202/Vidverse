import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Invalid Request Body");
  }
  try {
    const playlist = await Playlist.create({
      
      name,
      description,
      owner: req.user?._id,
      videos: req.video?._id || ""
    });

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist created successfully"));
  } catch (error) {
    throw new ApiError(500, "Error Creating Playlist");
  }

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const {userId}  = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User");
  }

  const UserPlaylist = await Playlist.find({ owner: userId });
  try {
    if (UserPlaylist?.length) {
    
    return res
    .status(200)
    .json(
      new ApiResponse(200, UserPlaylist, "User Playlist fetched successfully")
    );}

  } catch (error) {
    
    throw new ApiError(404, "Playlist not found");
  }

  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid UserPlaylist");
  }

  const UserPlaylist = await Playlist.findById(playlistId).populate('videos');
  if (!UserPlaylist) {
    throw new ApiError(500, "Error in fetching playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, UserPlaylist, "Playlist fetched successfully "));
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId ,userId} = req.params;
  if (
    !isValidObjectId(userId) ||
    !isValidObjectId(playlistId) ||
    !isValidObjectId(videoId)
  ) {
    throw new ApiError(400, "Invalid ObjectId");
  }
  const video = await mongoose.model("videos").findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const playlist = await Playlist.findOne({_id:playlistId, owner:userId});
  if(!playlist){throw new ApiError(404,"Playlist Not Found")}

  if(!playlist.videos.includes(videoId))
  {
    playlist.videos.push(videoId);
    await playlist.save();
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
}); 

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ObjectId");
  }

  const playlist = await Playlist.findOneAndUpdate(
   {_id:playlistId,
     videos:videoId},
    {
      $pull: {
        videos:videoId
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
if(!isValidObjectId(playlistId))
{
  throw new ApiError(400,"Invalid objectId")
}
 try {
   await Playlist.findByIdAndDelete(playlistId)
 
   return res.status(200)
   .json(new ApiResponse(204,null,"playlist deleted successfully"))
 } catch (error) {
  
  throw new ApiError(500,"Failed to Find the Playlist")
 }
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if(!isValidObjectId(playlistId))
  {
    throw new ApiError(400,"Invalid ObjectId")
  }

  const playlist = await Playlist.findByIdAndUpdate(playlistId,
    {
      $set:{
        name:name,
        description:description
      }
    },{new:true})

    return res.status(200)
    .json(new ApiResponse(200,playlist,"Playlist Updated successfully"))
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
