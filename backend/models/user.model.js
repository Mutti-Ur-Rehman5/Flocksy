import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
     password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String
    },
     bio:{
        type:String
    },
     profession:{
        type:String
    },
    gender:{
        type:String
    },
    followers:[
    {  type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        }
    ],
    following:[
    {  type:mongoose.Schema.Types.ObjectId,
        ref:"User"
        }
    ],
    posts:[
        { type:mongoose.Schema.Types.ObjectId,
          ref:"Post"
        }
    ],
    saved:[
         { type:mongoose.Schema.Types.ObjectId,
          ref:"Post"
        }
    ],
    loops:[
         { type:mongoose.Schema.Types.ObjectId,
          ref:"Loop"
        }
    ],
    story: { type:mongoose.Schema.Types.ObjectId,
          ref:"Story"
        },

    role:{
        type:String,
        enum:["ADULT","CHILD","ADMIN"],
        default:"ADULT"
    },
    dateOfBirth:{
        type:Date
    },
    parentEmail:{
        type:String,
        lowercase:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },

    resetOtp:{
        type:String
    } ,
    otpExpires:{
        type:Date
    } ,
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:true
    }  
},{timestamps:true})

userSchema.index({ isActive: 1 })

userSchema.index({ role: 1 })
userSchema.index({ parentEmail: 1 })

const User=mongoose.model("User",userSchema)
export default User