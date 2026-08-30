import mongoose from "mongoose"

const badgeDefinitionSchema=new mongoose.Schema({
    badgeId:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    name:{
        type:String,
        required:true
    },
    starsRequired:{
        type:Number,
        required:true,
        default:0
    },
    icon:{
        type:String,
        default:"🏆"
    },
    description:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

badgeDefinitionSchema.index({ starsRequired: 1 })
badgeDefinitionSchema.index({ isActive: 1 })

const BadgeDefinition=mongoose.model("BadgeDefinition",badgeDefinitionSchema)
export default BadgeDefinition
