import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../config/token.js"
import { cookieOptions } from "../config/cookie.js"

export const adminLogin=async (req,res)=>{
    try {
        const {email,password}=req.body

        if(!email||!password){
            return res.status(400).json({message:"Email and password are required"})
        }

        const user=await User.findOne({email:email.toLowerCase()})
        // Do not leak whether the account exists or the role. Return generic 403 for non-admins.
        if(!user || user.role!=="ADMIN"){
            return res.status(403).json({message:"Access denied"})
        }

        if(user.isActive===false){
            return res.status(403).json({message:"Account deactivated"})
        }

        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(403).json({message:"Access denied"})
        }

        const token=await genToken(user._id)

        res.cookie("token",token,cookieOptions())

        return res.status(200).json({
            _id:user._id,
            name:user.name,
            userName:user.userName,
            email:user.email,
            profileImage:user.profileImage,
            role:user.role,
            isVerified:user.isVerified,
            token
        })
    } catch (error) {
        return res.status(500).json({message:`admin login error ${error}`})
    }
}
