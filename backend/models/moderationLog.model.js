import mongoose from "mongoose"

const moderationLogSchema=new mongoose.Schema({
    contentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Content",
        index:true
    },
    contentType:{
        type:String,
        enum:["post","loop","story","comment"],
        required:true
    },
    action:{
        type:String,
        enum:["FLAGGED","ALLOWED","REJECTED","RESTORED","DELETED","OVERTURNED"],
        required:true
    },
    reason:{
        type:String
    },
    flaggedBy:{
        type:String,
        enum:["AI","MANUAL","ADMIN"],
        default:"AI"
    },
    performedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    targetUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

moderationLogSchema.index({ contentType: 1 })
moderationLogSchema.index({ createdAt: -1 })
moderationLogSchema.index({ action: 1 })

const ModerationLog=mongoose.model("ModerationLog",moderationLogSchema)
export default ModerationLog
