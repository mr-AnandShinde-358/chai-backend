[
  {
    $lookup: {
      from: "authors",
      localField: "author_id",
      foreignField: "_id",
      as: "authors_details"
    }
  },
  {
    $addFields: {
      authors_details: {
        // $first:"$authors_details"
        $arrayElemAt:["$authors_details"]
      }
    }
  }
]

# same user multiple chanele ko  subcribe kar sakata hai aur same (chai aur code) channel ko multiple user subscribe kar sakate hai 
# how to count subscriber a for channel 
## count this document that channel entity is chai aur code
## how to count apane konse channel ko subscribe kiya hai
## check the subscriber that match user name and then check there channel name


