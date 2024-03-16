import mongoose, { Aggregate } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { deleteFileOnServer, deleteOnCloudinaryTypeImage, deleteOnCloudinaryTypeVideo, uploadOnCloudinary } from "../utils/cloudinary.js"
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllVideos = asyncHandler(async (req, res) => {
   try {
     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
     //TODO: get all videos based on query, sort, pagination

    Video.aggregate([
        {
            $match:{
                _id:userId
            }
        }
    ])
   } catch (error) {
    
   }
})

// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;


//     // const videos = await Video.find(query).sortBy(sortBy).limit(limit).sortType(sortType);
//     const videos = await Video.find().limit(limit).sort(`${sortType}:${sortBy}`)

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(200, videos, "all data fetched !")
//         )



// })

const publishVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    // get video details from frontend 
    // validate -not empty
    // check for  thumbnail or check video file 
    // upload them to cloudinary,
    // create video document 
    // rutrun res 
    try {
        const { title, description } = req.body
        const userId = req.user._id;


        if (
            [title, description].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "title or description required")
        }
        let videoFilePath

        let thumbnailPath
        if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
            videoFilePath = req.files?.videoFile[0]?.path;

        }

        if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
            thumbnailPath = req.files?.thumbnail[0]?.path;
        }
        console.log(videoFilePath, thumbnailPath)

        if (!videoFilePath) {
            throw new ApiError(400, "Video file is required")
        }

        if (!thumbnailPath) {
            throw new ApiError(400, "thumbnail file is required")
        }

        const videoFile = await uploadOnCloudinary(videoFilePath)
        const thumbnailFile = await uploadOnCloudinary(thumbnailPath)
        const duration = videoFile.duration;
        // console.log(videoFile)
        // console.log('video_duration',duration)
        // console.log(thumbnailFile)
        if (!videoFile) {
            throw new ApiError(500, "videofile uploading error")
        }

        if (!thumbnailFile) {
            throw new ApiError(500, "thumbnailFile uploading error")
        }

        const video = await Video.create({
            videoFile: {
                url: videoFile.url,
                public_id: videoFile.public_id
            },
            thumbnail: {
                url: thumbnailFile.url,
                public_id: thumbnailFile.public_id
            },
            title,
            description,
            duration,
            owner: userId

        })
        if (!video) {
            throw new ApiError(500, "Something went wrong while uploading video")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, { video }, "video uploaded successfully!")
            )

    } catch (error) {
       ApiError(401,"somthing worng while uploading video")
    }
    finally{
        let newVideoFilePath

        let newThumbnailPath
        if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
            newVideoFilePath = req.files?.videoFile[0]?.path;

        }

        if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
            newThumbnailPath = req.files?.thumbnail[0]?.path;
        }
       if(newThumbnailPath){
        await  deleteFileOnServer(newThumbnailPath)
    } 
    if(newVideoFilePath){
        await deleteFileOnServer(newVideoFilePath)
    }
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        // not do this becase videoId pass is responbility   developer 
        // if(!videoId?.trim()){
        //     throw new ApiError(400,"video id is missing ")
        // }
        //TODO: get video by id


        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(400, "Video not found")
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, { video }, "Video  fetched successfully")
            )
    } catch (error) {
        throw new ApiError(401,  error.message||"video id is invalid")
    }




})


const updateVideoDetails = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        // if(!videoId?.trim()){
        //     throw new ApiError(400,"video id is missing ")
        // }
        const { title, description } = req.body
        //TODO: update video details like title, description, thumbnail
        if (!title || !description) {
            throw new ApiError("All fields are required")
        }
        const video = await Video.findByIdAndUpdate(videoId, {
            $set: {
                title,
                description
            }
        },
            {
                new: true
            }

        )

        if (!video) {
            throw new ApiError(400, "Video not found")
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, video, "updated video title or description successfully")
            )
    } catch (error) {
        throw new ApiError(400,  error.message||"error: while updating video details ")
    }
})


const updateVideoThumbnailAndVideo = asyncHandler(async (req, res) => {

    try {
        const { videoId } = req.params
        // if(!videoId?.trim()){
        //     throw new ApiError(400,"video id is missing ")
        // }
        let videoFilePath
        let thumbnailPath
        if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
            videoFilePath = req.files?.videoFile[0]?.path;

        }

        if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
            thumbnailPath = req.files?.thumbnail[0]?.path;
        }


        if (!videoFilePath) {
            throw new ApiError(400, "Video file is required")
        }

        if (!thumbnailPath) {
            throw new ApiError(400, "thumbnail file is required")
        }

        const videoFile = await uploadOnCloudinary(videoFilePath)
        const thumbnailFile = await uploadOnCloudinary(thumbnailPath)
        const duration = videoFile.duration;

        if (!videoFile) {
            throw new ApiError(500, "videofile uploading error")
        }

        if (!thumbnailFile) {
            throw new ApiError(500, "thumbnailFile uploading error")
        }

        let oldVideoFilePublic_Id, oldThumbnailPublic_id

        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(400, "Video not found")
        }

        oldVideoFilePublic_Id = video.videoFile?.public_id;

        oldThumbnailPublic_id = video.thumbnail?.public_id;

        const updateVideo = await Video.updateMany(
            { _id: videoId }, {
            $set: {
                videoFile: {
                    url: videoFile.url,
                    public_id: videoFile.public_id
                },
                thumbnail: {
                    url: thumbnailFile.url,
                    public_id: thumbnailFile.public_id
                },
                duration
            }
        })

        if (!updateVideo) {
            throw new ApiError(401, "Update video and thumbnail error")
        }
        if (oldThumbnailPublic_id) {
            await deleteOnCloudinaryTypeImage(oldThumbnailPublic_id)
        }
        if (oldVideoFilePublic_Id) {
            await deleteOnCloudinaryTypeVideo(oldVideoFilePublic_Id)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, updateVideo, "updated video file or Thumbnail image successfully")
            )

    } catch (error) {
        throw new ApiError(401,  error.message||"error: While Update video and thumbnail files")
    }
    finally{
        let newVideoFilePath

        let newThumbnailPath
        if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
            newVideoFilePath = req.files?.videoFile[0]?.path;

        }

        if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
            newThumbnailPath = req.files?.thumbnail[0]?.path;
        }
        if(newThumbnailPath){
            await  deleteFileOnServer(newThumbnailPath)
        } 
        if(newVideoFilePath){
            await deleteFileOnServer(newVideoFilePath)
        }
    }


})

const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        //  if(!videoId?.trim()){
        //      throw new ApiError(400,"video id is missing ")
        //  }
        //TODO: delete video
        let oldVideoFilePublic_Id, oldThumbnailPublic_id

        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(400, "Video not found")
        }

        oldVideoFilePublic_Id = video.videoFile?.public_id;

        oldThumbnailPublic_id = video.thumbnail?.public_id;

        if (oldThumbnailPublic_id) {
            await deleteOnCloudinaryTypeImage(oldThumbnailPublic_id)
        }
        if (oldVideoFilePublic_Id) {
            await deleteOnCloudinaryTypeVideo(oldVideoFilePublic_Id)
        }

        await Video.deleteOne({ _id: videoId })
        // error 
        // return res.status(200,json(
        //     new ApiResponse(200,{},"deleted video successfully!!!")
        // ))

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Video deleted  successfully")
            )
    } catch (error) {
        throw new ApiError(400,  error.message||"Video deleteing error")
    }

})



const togglePublishStatus = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        // if(!videoId) {
        //     throw new ApiError(401,"video id not found")
        // }

        // if(!videoId?.trim()){
        //     throw new ApiError(400,"video id is missing ")
        // }

        // if(!username?.trim()){
        //     throw new ApiError(400,"username is missing ")
        // }

        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(400, "Video not found")
        }

        if (video.isPublished) {
            await Video.updateOne(
                { _id: videoId }, {
                $set: {
                    isPublished: false,
                }

            })
            return res.status(200).json(
                new ApiResponse(200, {}, "video now is  private")
            )
        }
        else {
            await Video.updateOne(
                { _id: videoId }, {
                $set: {
                    isPublished: true,
                }
            })
            return res.status(200).json(
                new ApiResponse(200, {}, "video now is published")
            )
        }
    } catch (error) {
        throw new ApiError(400, error.message||"toggle publish video details error")
    }




})


export { getAllVideos, publishVideo, getVideoById, updateVideoDetails, updateVideoThumbnailAndVideo, deleteVideo, togglePublishStatus }