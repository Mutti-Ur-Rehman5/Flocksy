import mongoose from "mongoose";

const kidsProfileSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    stars:{
        type:Number,
        default:0
    },
    badges:[
        {
            badgeId:{type:String, required:true},
            name:{type:String, required:true},
            icon:{type:String},
            earnedAt:{type:Date, default:Date.now}
        }
    ],
    completedStories:[
        { type:mongoose.Schema.Types.ObjectId, ref:"KidStory" }
    ],
    completedQuizzes:[
        { type:mongoose.Schema.Types.ObjectId, ref:"QuizResult" }
    ],
    drawings:[
        {
            url:{type:String},
            createdAt:{type:Date, default:Date.now}
        }
    ]
},{timestamps:true})

kidsProfileSchema.index({ userId: 1 })

const KidsProfile=mongoose.model("KidsProfile",kidsProfileSchema)
export default KidsProfile
