import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";
import {Tweet} from "../models/tweet.model.js"
import { User } from "../models/user.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const user =req.user?._id
    //TODO: toggle like on video
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(401,"invalid video id")
    }
    const   video =  await Video.findById(videoId)

    if(!video){

        throw new ApiError(401,"video not present")

    }
    const Credential = {
        video:videoId,
        likeBy:user
    }
    try {
    
       

      const like =   await Like.findOne(Credential)

      if(!like){
        const doLike = await Like.create(Credential)
        if(!doLike){
            throw new ApiError(501,"internal server error during like")
        }
        
        return res 
        .status(200)
        .json(
            new ApiResponse(200,doLike,"liked...")
        )
      }else{
        const unlike = await Like.deleteOne(Credential)

        if(unlike.deletedCount===0){
            throw new ApiError(404,"Unable to unlike")
        }
        return res
        .json(
            new ApiResponse(200,{},"unlike...")
        )

      }
        
    } catch (error) {
      throw new ApiError(501,"internal server error douring like and unlike")
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const user =req.user?._id
   
    //TODO: toggle like on comment
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(401,"invalid comment id")
    }
   const newComment = await Comment.findById(commentId)
   if(!newComment){
    throw new ApiError(401,"comment not present")
   }

   const Credential = {
    comment:commentId,
    likeBy:user
}
try {

   

  const like =   await Like.findOne(Credential)

  if(!like){
    const doLike = await Like.create(Credential)
    if(!doLike){
        throw new ApiError(501,"internal server error during comment like")
    }
    
    return res 
    .status(200)
    .json(
        new ApiResponse(200,doLike,"liked...")
    )
  }else{
    const unlike = await Like.deleteOne(Credential)

    if(unlike.deletedCount===0){
        throw new ApiError(404,"Unable to unlike")
    }
    return res
    .json(
        new ApiResponse(200,{},"unlike...")
    )

  }
    
} catch (error) {
  throw new ApiError(501,"internal server error douring comment like and unlike")
}

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const user =req.user?._id
    //TODO: toggle like on tweet
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(401,"invalid Tweet id")
    }
   const newTweet = await Tweet.findById(tweetId)
   if(!newTweet){
    throw new ApiError(401,"Tweet not present")
   }

   const Credential = {
    tweet:tweetId,
    likeBy:user
}
try {

   

  const like =   await Like.findOne(Credential)

  if(!like){
    const doLike = await Like.create(Credential)
    if(!doLike){
        throw new ApiError(501,"internal server error during tweet like")
    }
    
    return res 
    .status(200)
    .json(
        new ApiResponse(200,doLike,"liked...")
    )
  }else{
    const unlike = await Like.deleteOne(Credential)

    if(unlike.deletedCount===0){
        throw new ApiError(404,"Unable to unlike")
    }
    return res
    .json(
        new ApiResponse(200,{},"unlike...")
    )

  }
    
} catch (error) {
  throw new ApiError(501,"internal server error douring Tweet like and unlike")
}
}
)



const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
 

  try {
    
    const likedVideos = await Like.aggregate([
      {
        $match:{
          likeBy:new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup:{
          from:"videos",
          localField:"video",
          foreignField:"_id",
          as:"likedVideos"
        }
      },
      {
        $unwind:"$likedVideos"
      },
      {
        $lookup:{
          from:"users",
          let:{owner_id:"$likedVideos.owner"},
          pipeline:[
            {
              $match:{
                $expr:{
                  $eq:["$_id","$$owner_id"]
                }
              }
            },
            {
              $project:{
                avatar:1,
                username:1,
                fullName:1,
                _id:0
              }
            }
          ],
          as:"owner"
        }
      },
      {
        $unwind:{
          path:"$owner"
        }
      },
      {
        $project:{
          _id:"$likedVideos._id",
          title:"$likedVideos.title",
          thumbnail:"$likedVideos.thumbnail",
          duration:"$likedVideos.duration",
          createdAt:"$likedVideos.createdAt",
          views:"$likedVideos.views",
          owner:{
            userName:"$owner.username",
            avatar:"$owner.avatar",
            fullName:"$owner.fullName"
          }
        }
      },
      {
        $group:{
          _id:null,
          likedVideos:{
            $push:"$$ROOT"
          }
        }
      },
      {
        $project:{
          _id:0,
          likedVideos:1,
        }
      }
    ])

    return res
    .status(200)
    .json(
      new ApiResponse(200,likedVideos,"All Liked Video fetche successfully")
    )

  } catch (error) {
    throw new ApiError(501,"internal server error while fetching liked videos")
  }


  
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}