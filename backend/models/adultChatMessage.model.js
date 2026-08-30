import mongoose from "mongoose";

const adultChatMessageSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    role:{
        type:String,
        enum:["user","assistant"],
        required:true
    },
    text:{
        type:String,
        required:true
    },
    flagged:{
        type:Boolean,
        default:false
    },
    flagReason:{
        type:String
    }
},{timestamps:true})

adultChatMessageSchema.index({ userId: 1 })

const AdultChatMessage=mongoose.model("AdultChatMessage",adultChatMessageSchema)
export default AdultChatMessage
