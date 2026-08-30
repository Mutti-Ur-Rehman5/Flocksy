import mongoose from "mongoose";

const trueFalseSchema=new mongoose.Schema({
    statement:{
        type:String,
        required:true,
        unique:true
    },
    isTrue:{
        type:Boolean,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

trueFalseSchema.index({ isActive: 1 })

const TrueFalseQuestion=mongoose.model("TrueFalseQuestion",trueFalseSchema)
export default TrueFalseQuestion
