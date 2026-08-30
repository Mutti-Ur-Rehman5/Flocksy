import mongoose from "mongoose";

const animalGameSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    emoji:{
        type:String,
        required:true
    },
    fact:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

animalGameSchema.index({ isActive: 1 })

const AnimalGame=mongoose.model("AnimalGame",animalGameSchema)
export default AnimalGame
