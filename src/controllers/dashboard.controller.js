import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id
    console.log(userId)

    // all likes count
    const allLike = await Like.aggregate([
        {
            $match:{
            likeBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group:{
                _id:null,
                totalVideoLike:{
                    $sum:{
                        $cond:[
                            {$ifNull:["$video",false]},
                            1,
                            0
                        ]
                    }
                },
                totalCommentLike:{
                    $sum:{
                        $cond:[
                            {$ifNull:["$comment",false]},
                            1,
                            0
                        ]
                    }
                },
                totalTweetLike:{
                    $sum:{
                        $cond:[
                            {$ifNull:["$tweet",false]},
                            1,
                            0
                        ]
                    }
                }

            }
        },
    ])

    //  total subscribers
    const totalSubscribers = await subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count:"totalSubscribers"
        }
    ])

    // total videos

    const totalVideos = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count:"totalVideos"
        }

    ])


const allViews = await Video.aggregate([
    {
        $match:{
            owner: new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $group: {
            _id: null,
            allVideosViews: {
                $sum: "$views"
            }
        }
    }
])

const stats = {
    subscribers:totalSubscribers[0].totalSubscribers,
    totalVideos:totalVideos[0].totalVideos,
    totalVideosViews:allViews[0].allVideosViews,
    totalVideoLikes:allLike[0].totalVideoLike,
    totalCommentLike:allLike[0].totalCommentLike,
    totalTweetLike:allLike[0].totalTweetLike,

}

    return res.status(200).json(
        new ApiResponse(
            200,
            stats,
            "fetching channel stats successfullY!!"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const allVideos = await Video.find({
        owner:req.user._id
    })

    if(!allVideos){
        throw new ApiError(500,'something went wrong fetching channel all videos !')
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,allVideos,"All Videos fetched successfully !!")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }