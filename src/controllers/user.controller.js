import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import fs from "fs"  // fix nantar bug
import  jwt  from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshTokens = async(userId)=>{
    try {

        const user = await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username , email
    // check for images, check for avatar
    // upload them to cloudinary,avatar check 
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for user creation
    // return res

    const {fullName,email,username,password}= req.body
    // console.log("email:",email)
  

    // if(fullName === ""){
    //     throw new ApiError(400,"full name is required")
    // }

    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")  //true
    ){
        throw new ApiError(400,"All fields are required")
    }

   const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){

        throw new ApiError(409,"User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocal = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path
    }


    // console.log(req.files)
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

   const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

   const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while rigistering the user ")
   }
   return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
   );

})


const loginUser = asyncHandler(async(req,res)=>{
    // req body => data
    //  username || email
    // find the user
    // password check
    // access and refresh Token
    // send cookies
    // res  login sull

    const {email,username,password}= req.body

    // if(!email || !username){
    if(!email && !username){
        throw new ApiError(400,"username or email is required")
    }

    // Here is an alternative of above code based on logic discusstion
    // if(!(username|| email)){
    //     throw new ApiError(400,"username or email is required")
    // }

   const user = await  User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist!")
    }

    //# imp : User :- its is mongodb ka mongoose ka ek object hai isaliye jo mongoose ke throw User ke pass jo methods hai use hum call kar sakate hai jaise ki User.findOne,User.findByIdAndUpdate aasise sab

    //# Imp :  user :- 'user' jo object hai ho findOne method se mila hai aur uske pass vahi methods hote hai jo userne define kiye hai userSchema use karake jaise ki userSchema.methods.isPasswordCorrect then user.ispasswordCorrect() we can use
    

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

   const {accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//    when you can write httpOnly:true and secure:true then not modified any one your cookies value its modified only from server 
   const options = {
    httpOnly:true,
    secure:true
   }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )
   

    
})

const logoutUser = asyncHandler(async(req,res)=>{
    // cookies delete 
    // refresh Token reset
    // message suceefully loged out
    await  User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
      )

      const options ={
        httpOnly:true,
        secure:true,
      }

      res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(
        new ApiResponse(200,{},"User logged Out")
      )

})

const refreshAccessToken =asyncHandler(async(req,res)=>{
    const incomingRefreshToken =  req.cookie.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

  try {
      const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      
     const user =  await User.findById(decodedToken?._id)
  
     if(!user){
      throw new ApiError(401,"Invalid refresh Token")
     }
  
     if(!incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
     }
  
     const options ={
      httpOnly:true,
      secure:true
     }
   const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
      new ApiResponse(
          200,
          {accessToken, refreshToken: newRefreshToken},
          "Access Token refresh"
      )
     )
  } catch (error) {
    throw new ApiError(401,error?.message|| "invalid refresh Token")
  }

})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({
        validateBeforeSave:false
    })
    
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password change successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{

    return res
    .status(200)
    .json(new ApiResponse(200,res.user,"current user fetch successfully"))
})

const updateAccountDetails= asyncHandler(async(req,res)=>{

    const {fullName,email}  = req.body

    if(!fullName||!email){
        throw new ApiError("All fields are required")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email:email
            }
        },
        {new:true}
        ).select("-password")

return res
.status(200)
.json(new ApiResponse(200,user,"Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath =  req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    // Todo : delete old image --assigment

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

  const user=  await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
        ).select("-password ")

        return res
        .status(200)
        .json(
            new ApiResponse(200,user,"avatar updated successfully")
        )
       


})

const updateUserCoverImage= asyncHandler(async(req,res)=>{
    const coverImageLocalPath =  req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file is missing")
    }

    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on CoverImage")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
        ).select("-password ")

        return res
        .status(200)
        .json(
            new ApiResponse(200,user,"coverimage updated successfully")
        )

       


})


const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing ")
    }

    const channel= await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"Subscribers"

            }
        },
        {
           
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"

            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscriberCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )
    
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    // req.user._id  // what  you can get string '65d136256415ade39ab3682c' then mongoose work behand the seance  internaly and convert in ObjectId('65d136256415ade39ab3682c')
    const user = await User.aggregate([
        {
            $match:{
                // req.user._id under aggregation pipline not work mongoose code are going derectly you need create mongoose object id 'new mongoose.Types.ObjectId(req.user._id)
                _id: new mongoose.Types.ObjectId(req.user._id)
            },
           
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }

    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
            )
    )
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser,changeCurrentPassword,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory}