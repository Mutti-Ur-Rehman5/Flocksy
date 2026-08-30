import mongoose from "mongoose";

const quizResultSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    category:{
        type:String,
        required:true
    },
    score:{
        type:Number,
        required:true
    },
    totalQuestions:{
        type:Number,
        required:true
    },
    starsEarned:{
        type:Number,
        default:0
    },
    completedAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true})

quizResultSchema.index({ userId: 1 })
quizResultSchema.index({ category: 1 })
quizResultSchema.index({ completedAt: 1 })
quizResultSchema.index({ userId: 1, completedAt: 1 })

const QuizResult=mongoose.model("QuizResult",quizResultSchema)
export default QuizResult
