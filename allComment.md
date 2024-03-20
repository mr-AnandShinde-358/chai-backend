```
const getVideoComment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { videoId } = req.params;

    let { page: pageNumber = 1, limit: limitNumber = 10 } = req.query;

    if (!videoId || !isValidObjectId(videoId)) {
      throw new ApiError(400, "videoId is required or invalid");
    }

    let page = isNaN(Number(pageNumber)) ? 1 : Number(pageNumber);
    let limit = isNaN(Number(limitNumber)) ? 10 : Number(limitNumber);

    if (page < 0) {
      page = 1;
    }

    if (limit <= 0) {
      limit = 10;
    }

    try {
      const video = await Video.findById(videoId);

      if (!video) {
        await Comment.deleteMany({ video: videoId });
        return res
          .status(200)
          .json(
            new ApiResponse(
              404,
              {},
              "There is no such video and all associated comments have been deleted"
            )
          );
      }

      const allComments = await Comment.aggregate([
        {
          $match: {
            video: new mongoose.Types.ObjectId(videoId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        {
          $unwind: "$owner",
        },
        {
          $lookup: {
            from: "likes",
            let: { commentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$comment", "$$commentId"],
                  },
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "likedBy",
                  foreignField: "_id",
                  as: "likedByInfo",
                },
              },
              {
                $unwind: "$likedByInfo",
              },
              {
                $project: {
                  _id: 1,
                  userInfo: {
                    userName: "$likedByInfo.userName",
                    avatar: "$likedByInfo.avatar",
                    fullName: "$likedByInfo.fullName",
                  },
                  likedBy: 1,
                },
              },
            ],
            as: "likes",
          },
        },
        {
          $addFields: {
            likesCount: {
              $size: "$likes",
            },
            isLiked: {
              $cond: {
                if: {
                  $in: [
                    new mongoose.Types.ObjectId(req.user?._id),
                    "$likes.likedBy",
                  ],
                },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $project: {
            content: 1,
            createdAt: 1,
            owner: {
              _id: "$owner._id",
              userName: "$owner.userName",
              avatar: "$owner.avatar",
              fullName: "$owner.fullName",
            },
            likesCount: 1,
            _id: 1,
            isLiked: 1,
            userlikes: {
              $map: {
                input: "$likes",
                as: "userlike",
                in: {
                  _id: "$$userlike._id",
                  userInfo: "$$userlike.userInfo",
                  likedBy: "$$userlike.likedBy",
                },
              },
            },
          },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ]);

      if (!allComments || allComments.length === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, allComments, "No Comments in this video"));
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            allComments,
            "all comments of video fetched successfully"
          )
        );
    } catch (error: any) {
      throw new ApiError(
        500,
        error?.message || "something went wrong while fetching video comments"
      );
    }
  }
);
```