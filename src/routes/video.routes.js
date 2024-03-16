import { Router } from 'express';
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideoDetails, updateVideoThumbnailAndVideo } from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router =  Router()

router.use(verifyJWT)

router.route("/")
        .get(getAllVideos)
        .post(
                upload.fields([
                {
                        name:"videoFile",
                        maxCount:1
                },
                {
                        name:"thumbnail",
                        maxCount:1
                }
        ]),
        publishVideo
        )

        // router
        // .route("/")
        // .get(getAllVideos)
        // .post(
        //     upload.fields([
        //         {
        //             name: "videoFile",
        //             maxCount: 1,
        //         },
        //         {
        //             name: "thumbnail",
        //             maxCount: 1,
        //         },
                
        //     ]),
        //     publishVideo
        // );
router.route("/:videoId")
        .get(getVideoById)
        .patch(updateVideoDetails)
        .delete(deleteVideo)

        

router.route("/videoFile/:videoId").patch(
        upload.fields(
                [
                        {
                                name:"videoFile",
                                maxCount:1
                        },
                        {
                                name:"thumbnail",
                                maxCount:1
                        }
                ]
        ),
        updateVideoThumbnailAndVideo
)
router.route("/togglePublishStatus/:videoId").patch(togglePublishStatus)
export default router
