import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { removeCloudinary, uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log({ accessToken, refreshToken })

    user.refreshToken = refreshToken;
    //locally saved access token
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Some Problem encountered while generating Tokens");
  }
};

//function to get user's old info
const getval = async (req) => {
  try {
    const user = await User.findById(req.user?._id);
    return user;
  } catch (error) {
    return error;
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { fullName, Email, username, password } = req.body;

  // console.log("Email :",Email)

  // validation — not empty
  if (
    [fullName, Email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Required Fields");
  }

  // check if user already exists: username, email
  const UserExisted = await User.findOne({
    $or: [{ username }, { Email }],
  });
  if (UserExisted) {
    throw new ApiError(409, "User Exists Already");
  }

  // console.log(req.body);
  // console.log(req.files);

  // check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath=req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary, avatar
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create user object — create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    Email,
    password,
    username: username.toLowerCase(),
  });

  // console.log(user)

  // remove password and refresh token field from response
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!userCreated) {
    throw new ApiError(500, "User register error");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body-> data
  const { Email, username, password } = req.body;

  //check data have one of the required credential
  if (!username && !Email) {
    throw new ApiError(400, "username or email is required");
  }

  //valid User
  const validUser = await User.findOne({
    $or: [{ username }, { Email }],
  });

  if (!validUser) {
    throw new ApiError(404, "User not exist");
  }

  //validate password
  const pass_valid = await validUser.isPasswordCorrect(password);
  if (!pass_valid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  //generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    validUser._id
  );

  const loggedInUser = await User.findById(validUser._id).select(
    "-password -refreshToken"
  );

  // console.log("logged in",loggedInUser)

  //cookie only modified by server
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },

        "Logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refresh_accessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Expired Refresh Token");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { newRefreshToken, accessToken } =
      await generateAccessandRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refresh Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Failed to Refresh the Tokens");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old Password");
  }

  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, Email } = req.body;

  if (!fullName || !Email) {
    throw new ApiError(401, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        Email: Email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Update Successful"));
});

// To update Files it's better to have seperate controllers
const updateUserAvatar = asyncHandler(async (req, res) => {
  const newAvatarLocalPath = req.file?.path;
  if (!newAvatarLocalPath) {
    throw new ApiError(401, "Avatar file is missing");
  }

  const newAvatar = await uploadCloudinary(newAvatarLocalPath);
  if (!newAvatar.url) {
    throw new ApiError(400, "Error While uploading on avatar");
  }

  //getting user's old avatar info
  const old_detail = await getval(req);
  let old_avatar = "";
  if (!(old_detail instanceof Error)) {
    old_avatar = old_detail.avatar;
    console.log(old_avatar)
    removeCloudinary(old_avatar);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: newAvatar?.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar uploaded successfully"));
});

//Assignment to delete old avatar files from cloudinary
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const newCoverImageLocalPath = req.file?.path;
  if (!newCoverImageLocalPath) {
    throw new ApiError(401, "CoverImage file is missing");
  }

  const newCoverImage = await uploadCloudinary(newCoverImageLocalPath);
  if (!newCoverImage.url) {
    throw new ApiError(400, "Error While uploading on CoverImage");
  }

  //getting user's old coverImage info
  const old_detail = await getval(req);
  const old_coverImage = "";
  if (!(old_detail instanceof Error)) {
    old_coverImage = old_detail.coverImage;
    removeCloudinary(old_coverImage);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: newCoverImage?.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage uploaded successfully"));
});



const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        //get Doc that contain subscribers
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "Subscribed_By",
      },
    },
    {
      $lookup: {
        // get Doc that conatain channel I subscribed to
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "Subscribed_To",
      },
    },
    {
      $set: {
        subscribersCount: {
          $size: "$Subscribed_By",
        },

        channelSubscribedCount: {
          $size: "$Subscribed_To",
        },
        // { $cond: { if: <boolean-expression>, then: <true-case>, else: <false-case> } }
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$Subscribed_By.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "Channel Not Found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel fetched successfully")
    );
});

/**Point to remember
 * aggregation ka code as it is database pe jata hai
 * baki me mongoose behind the scene sb smbhal leta hai
 * but that's not the case with aggregation
 */
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },

      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "WatchHistory",

        pipeline: [
          //used to add subpipelines
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "Owner",

              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          }, //yha tk me owner m array of objects hai
          //to frontEnd me data kafi jayega aur user owner[0] krke data
          //retrieve krna hoga to ease that we can add another pipeline
          {
            $set: {
              owner: {
                //existing owner field overwrite hogai
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch History fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refresh_accessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
