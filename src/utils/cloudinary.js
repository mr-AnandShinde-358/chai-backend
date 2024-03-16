import { v2 as cloudinary } from "cloudinary"
import { response } from "express";
import fs from "fs"



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    // upload to file on cloudnary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    console.log("file is upload on cloudinary", response.url)

    return response

  } catch (error) {
    // fs.unlinkSync(localFilePath)//remove the locally saved temporaty file as the upload operation got failed
    return null;
  }
}

const deleteFileOnServer = async(localFilePath)=>{
  console.log(localFilePath)
 fs.unlinkSync(localFilePath)
   return
}

const deleteOnCloudinaryTypeVideo = async (public_id) => {
  try {
    if (!public_id) return null
    const response = await cloudinary.uploader.destroy(public_id, { resource_type: "video" })
    console.log("file is deleted on cloudinary")
    console.log(response)
    return response
  } catch (error) {
    console.log(error)
  }
}
const deleteOnCloudinaryTypeImage = async (public_id) => {


  try {

    const response = await cloudinary.uploader.destroy(public_id)
    console.log("file is deleted on cloudinary")
    console.log(response)
    return response
  } catch (error) {
    console.log(error)
  }
}



export { uploadOnCloudinary, deleteOnCloudinaryTypeImage, deleteOnCloudinaryTypeVideo, deleteFileOnServer }

/* cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); }); */