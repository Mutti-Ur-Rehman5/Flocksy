import mongoose from "mongoose";

const quizQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:true
    },
    options:[
        { type:String, required:true }
    ],
    correctAnswer:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        enum:["generalKnowledge","science","math","moral","nature","history"],
        default:"generalKnowledge"
    },
    difficulty:{
        type:String,
        enum:["easy","medium","hard"],
        default:"easy"
    },
    starsAwarded:{
        type:Number,
        default:1
    }
},{timestamps:true})

quizQuestionSchema.index({ category: 1 })
quizQuestionSchema.index({ difficulty: 1 })

const QuizQuestion=mongoose.model("QuizQuestion",quizQuestionSchema)
export default QuizQuestion
