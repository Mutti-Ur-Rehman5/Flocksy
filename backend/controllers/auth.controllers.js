import sendMail from "../config/Mail.js"
import genToken from "../config/token.js"
import { cookieOptions } from "../config/cookie.js"
import User from "../models/user.model.js"
import KidsProfile from "../models/kidsProfile.model.js"
import bcrypt from "bcryptjs"
export const signUp=async (req,res)=>{
    try {
        const {name,email,password,userName}=req.body
        const findByEmail=await User.findOne({email})
        if(findByEmail){
            return res.status(400).json({message:"Email already exist !"})
        }
         const findByUserName=await User.findOne({userName})
        if(findByUserName){
            return res.status(400).json({message:"UserName already exist !"})
        }

        if(password.length<6){
            return res.status(400).json({message:"password must be atleast 6 characters "})
        }

        const hashedPassword=await bcrypt.hash(password,10)

        const user=await User.create({
            name,
            userName,
            email,
            password:hashedPassword
        })

        const token=await genToken(user._id)

        res.cookie("token",token,cookieOptions())

        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({message:`signup error ${error}`})
    }
}

export const signIn=async (req,res)=>{
    try {
        const {password,userName,email}=req.body
        const identifier=email || userName
         const user=await User.findOne({ $or:[ {userName:identifier}, {email:identifier} ] })
        if(!user){
            return res.status(400).json({message:"User not found !"})
        }

     const isMatch=await bcrypt.compare(password,user.password)

       if(!isMatch){
         return res.status(400).json({message:"Incorrect Password !"})
       }

       if(user.isActive===false){
         return res.status(403).json({message:"Account deactivated. Contact an administrator."})
       }

        const token=await genToken(user._id)

        res.cookie("token",token,cookieOptions())

        return res.status(200).json({
            _id:user._id,
            name:user.name,
            userName:user.userName,
            email:user.email,
            profileImage:user.profileImage,
            bio:user.bio,
            profession:user.profession,
            gender:user.gender,
            role:user.role || "ADULT",
            dateOfBirth:user.dateOfBirth,
            isVerified:user.isVerified,
            followers:user.followers,
            following:user.following,
            posts:user.posts,
            saved:user.saved,
            loops:user.loops,
            story:user.story
        })

    } catch (error) {
        return res.status(500).json({message:`signin error ${error}`})
    }
}


export const signOut=async (req,res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"sign out successfully"})
    } catch (error) {
        return res.status(500).json({message:`signout error ${error}`})
    }
}

export const sendOtp=async (req,res)=>{
    try {
        const {email}=req.body
        const user =await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User not found"})
        }

        const otp=Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp=otp,
        user.otpExpires=Date.now() + 5*60*1000
        user.isOtpVerified=false

       await user.save()
       await sendMail(email,otp)
       return res.status(200).json({message:"email successfully send"})

    } catch (error) {
         return res.status(500).json({message:`send otp error ${error}`})
    }
}


export const verifyOtp=async (req,res)=>{
    try {
       const {email,otp}=req.body
     const user =await User.findOne({email})

     if(!user || user.resetOtp!==otp || user.otpExpires < Date.now() ){
        return res.status(400).json({message:"invalid/expired otp"})
     }

     user.isOtpVerified=true
     user.resetOtp=undefined
     user.otpExpires=undefined
await user.save()
return res.status(200).json({message:"otp verified"})
    } catch (error) {
         return res.status(500).json({message:`verify otp error ${error}`})
    }
}

export const resetPassword=async (req,res)=>{
    try {
        const {email,password}=req.body
        const user =await User.findOne({email})
        if(!user || !user.isOtpVerified){
            return res.status(400).json({message:"otp verfication required"})
        }

        const hashedPassword=await bcrypt.hash(password,10)
        user.password=hashedPassword
        user.isOtpVerified=false
await user.save()

return res.status(200).json({message:"password reset successfully"})

    } catch (error) {
         return res.status(500).json({message:`reset otp error ${error}`})
    }
}

export const signUpChild=async (req,res)=>{
    try {
        const {name,userName,childEmail,parentEmail,password,dateOfBirth,avatarId}=req.body

        if(!childEmail||!parentEmail){
            return res.status(400).json({message:"child email and parent email are required"})
        }

        if(childEmail.toLowerCase()===parentEmail.toLowerCase()){
            return res.status(400).json({message:"child email and parent email must be different"})
        }

        const findByEmail=await User.findOne({email:childEmail.toLowerCase()})
        if(findByEmail){
            return res.status(400).json({message:"Email already exist !"})
        }

        const findByUserName=await User.findOne({userName})
        if(findByUserName){
            return res.status(400).json({message:"UserName already exist !"})
        }

        if(password.length<6){
            return res.status(400).json({message:"password must be atleast 6 characters "})
        }

        const hashedPassword=await bcrypt.hash(password,10)

        const user=await User.create({
            name,
            userName,
            email:childEmail.toLowerCase(),
            password:hashedPassword,
            role:"CHILD",
            parentEmail:parentEmail.toLowerCase(),
            dateOfBirth:dateOfBirth?new Date(dateOfBirth):undefined,
            profileImage:avatarId||undefined
        })

        await KidsProfile.create({userId:user._id})

        const token=await genToken(user._id)

        res.cookie("token",token,cookieOptions())

        const userObj=user.toObject()
        delete userObj.parentEmail

        return res.status(201).json(userObj)

    } catch (error) {
        return res.status(500).json({message:`signup error ${error}`})
    }
}
