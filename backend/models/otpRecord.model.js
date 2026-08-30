import mongoose from "mongoose";

const otpRecordSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    otpHash:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    },
    attemptsRemaining:{
        type:Number,
        default:3
    },
    approvalToken:{
        type:String
    },
    approvalStatus:{
        type:String,
        enum:["PENDING","APPROVED","DENIED","EXPIRED"],
        default:"PENDING"
    },
    targetEmail:{
        type:String,
        lowercase:true
    }
},{timestamps:true})

otpRecordSchema.index({ userId: 1 })
otpRecordSchema.index({ approvalToken: 1 })
otpRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const OTPRecord=mongoose.model("OTPRecord",otpRecordSchema)
export default OTPRecord
