import mongoose,{Schema}  from "mongoose";


const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // one who is subscibing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, // one to who 'subscriber' is subscibing
        ref:"User"

    }

},{
    timestamps:true
})


export const subscription = mongoose.model("Subscription",subscriptionSchema)

