import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}= req.body
    const id = req.user._id;
    if(!content){
        throw new ApiError(400,"content is required")
    }
    console.log("content is ",content)
    console.log("userid is is ",id)
   const tweet = await Tweet.create({
        content,
        owner:id
    })

    if(!tweet){
        new ApiError(501,error.message||"while creating tweet error")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200,{tweet},"created tweet successfully")
    )

    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // const id = req.user._id;
    const {userId} = req.params
    console.log(userId)

  const userTweet= await Tweet.find({
    owner:userId
  })

    if(!userTweet){
       new ApiResponse(404,{},"you don't have any tweet yet!")
    }
   

    return res 
    .status(200)
    .json(
        new ApiResponse(200,{userTweet},"Fetch user  tweet successfully")
    )

    
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content} = req.body
    const {tweetId} = req.params

    if(!content){
        throw new ApiError(400,"Please fill content")
    }
     const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
     )

     return res
     .status(200)
     .json(
        new ApiResponse(200,updatedTweet,"update tweet successfully")
     )

    

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
 
    
  const data =  await Tweet.deleteOne({_id:tweetId})
   
   if(data.deletedCount===0){
    throw new  ApiError(404,"not found Tweet")
   }

     return res
     .status(200)
     .json(
        new ApiResponse(200,{},"deleted document successfully")
     )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
