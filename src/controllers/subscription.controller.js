import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(400, "Channel Id is required");
      }
  
    const userId=req.user?._id
    const Credential ={
        
        subscriber:userId,
        channel:channelId

    } 

    try {
        
     const subscriber =   await Subscription.findOne(Credential)

     if(!subscriber){
        const  sub = await Subscription.create(Credential)
        return res 
        .status(200)
        .json(
            new ApiResponse(200,sub,"subscribe successfully")
        )
        
     }else{
        const  unsubscribe = await Subscription.deleteOne(Credential)

        if(unsubscribe.deletedCount===0){
            throw new ApiError(404,"unable to unscribe")
        }

        return res
        .json(
            new ApiResponse(200,{},"unsubscribe successfully!!!")
        )
     }

    } catch (error) {
        
    }
})

// controller to return subscriber list of a channel user list
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

   const subscribers = await Subscription.find({
        subscriber:channelId
    })

    
   
    return res.
    status(200)
    .json(
        new ApiResponse(200,subscribers,"all subscriber fetch successfully")
    )

   

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribers = await Subscription.find({
        channel:subscriberId
    })

    
   
    return res.
    status(200)
    .json(
        new ApiResponse(200,subscribers,"all subscriber fetch successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}