import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


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
    console.log("email:",email)

    // if(fullName === ""){
    //     throw new ApiError(400,"full name is required")
    // }

    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")  //true
    ){
        throw new ApiError(400,"All fields are required")
    }

   const existedUser = User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    const avatarLocal = req.files?.avatar[0]?.path;
    const coverImageLocal = req.files?.coverImage[0]?.path;

    if(!avatarLocal){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocal)
    const coverImage = await uploadOnCloudinary(coverImageLocal)
    
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



export {registerUser}