import mongoose from "mongoose";

const chatMessageSchema=new mongoose.Schema({
    childId:{
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

chatMessageSchema.index({ childId: 1 })
chatMessageSchema.index({ flagged: 1 })

const ChatMessage=mongoose.model("ChatMessage",chatMessageSchema)
export default ChatMessage
