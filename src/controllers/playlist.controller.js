import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const {name, description} = req.body

    if(!name && !description){
        throw new ApiError(404,"name and description not found !")
    }
    const userId = req.user?._id;

   const newPlaylist = await Playlist.create({
        name,
        description,
        owner:userId,
    })

    if(!newPlaylist){
        throw new ApiError(404,"Fail to create Playlist")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201,newPlaylist,"Playlist created successfully")
    )

   
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
   const getPlaylist =   await Playlist.find(
        {owner:userId}
    )

    if(!getPlaylist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,getPlaylist,"Playlist Fetched successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const getPlaylistId= await Playlist.findById(
        {
            _id:playlistId
        }
    )
    if(!getPlaylistId){
        throw new ApiError(404,"Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,getPlaylistId,"fetch playlist by id succefully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

 const addNewVideo = await  Playlist.findByIdAndUpdate(
        playlistId,
    
    {
        $set:{videos:videoId}
    },
    {

        new:true
    }
)
return res
.status(200)
.json(
    new ApiResponse(200,addNewVideo,"Video Added in playlist successfully")
)

})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const removeVideoFromPlaylist = await Playlist.findOneAndUpdate({_id:playlistId},{
        $pull:{videos:videoId}
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,removeVideoFromPlaylist,"Remove video from playlist successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

   const  deletes = await Playlist.deleteOne({_id:playlistId})
   if(!deletes){
    throw new ApiError(501,"deleting playlist error")
   }
   return res
   .status(200)
   .json(
    new ApiResponse(200,deletes,"Deleted Playlist successfully")
   )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
   const updatedPlaylist =  await Playlist.findByIdAndUpdate(
        playlistId,
        {
        name,
        description
    },
    {
        new:true
    }
    )

    if(!updatedPlaylist){
        throw new ApiError(501,"updating playlist error")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"update playlist successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
