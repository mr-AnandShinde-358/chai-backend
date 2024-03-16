import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    // const video = await Comment.find({video:videoId})
    // username,userImage,content,likeCount,commentAt 

   const video =  await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userDetails"
              }
        },
        {
            $addFields: {
                username:{
                    $first:"$userDetails.username",
            }
            }
        },
        {
            $addFields: {
                userImage:{
                    $first:"$userDetails.avatar.url",
            }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likedBy"
              } 
        },{
            $addFields:{
                likedBy:{
                    $size:{$ifNull:["$likedBy",[]]}
                }
            }
        },{
            $project:{
                username:1,
                userImage:1,
                content:1,
                createdAt:1,
                likedBy:1
            }
        }
        
      
        
    ])


    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"successfully fetch all comments")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const userId = req.user?._id
    const { content } = req.body

    if (!userId) {
        throw new ApiError(404, "Please login before comment")
    }
    if (!content || String(content).trim().length === 0) {
        throw new ApiError(404, "conmenet not empty")
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })

    if (!newComment) {
        throw new ApiError(501, "server error while sending comment!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, newComment, "add comment successfully")
        )


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const {content} = req.body

    if(!content||String(content).trim().length===0){
        throw new ApiError(401,"Please enter comment || Comment is not empty!")

    }

  const updateComment = await  Comment.findByIdAndUpdate(commentId,{
        $set:{
            content
        }
           },
           {
            new:true
        }
)

if(!updateComment){
    throw new ApiError(501,"server error: while updating comment")
}

return res 
.status(200)
.json(
    new ApiResponse(200,updateComment,"comment updated successfully")
)



})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    
    const data =  await Comment.deleteOne({_id:commentId})
   
    if(data.deletedCount===0){
     throw new  ApiError(404,"not found comment ")
    }
 
      return res
      .status(200)
      .json(
         new ApiResponse(200,{},"deleted comment successfully")
      )


})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
