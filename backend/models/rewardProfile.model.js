import mongoose from "mongoose";

const rewardProfileSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    totalStars:{
        type:Number,
        default:0
    },
    currentBadge:{
        type:String,
        default:"newcomer"
    },
    badgeHistory:[
        {
            badgeId:{type:String, required:true},
            name:{type:String, required:true},
            starsRequired:{type:Number, required:true},
            earnedAt:{type:Date, default:Date.now}
        }
    ]
},{timestamps:true})

rewardProfileSchema.index({ userId: 1 })

const RewardProfile=mongoose.model("RewardProfile",rewardProfileSchema)
export default RewardProfile
