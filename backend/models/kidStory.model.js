import mongoose from "mongoose";

const kidStorySchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    coverImage:{
        type:String
    },
    category:{
        type:String,
        enum:["moral","adventure","friendship","family","nature","science"],
        default:"moral"
    },
    readingLevel:{
        type:String,
        enum:["easy","medium","hard"],
        default:"easy"
    },
    starsAwarded:{
        type:Number,
        default:5
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

kidStorySchema.index({ category: 1 })
kidStorySchema.index({ isActive: 1 })

const KidStory=mongoose.model("KidStory",kidStorySchema)
export default KidStory
