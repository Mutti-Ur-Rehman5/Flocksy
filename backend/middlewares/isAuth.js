 import jwt from "jsonwebtoken"
 import User from "../models/user.model.js"
 const isAuth=async (req,res,next)=>{
    try {
        // Token from Authorization: Bearer header (cross-origin SPA) OR httpOnly cookie (local dev)
        const authHeader=req.headers.authorization
        const bearerToken=authHeader&&authHeader.startsWith("Bearer ")?authHeader.slice(7):null
        const token=bearerToken || req.cookies.token
        if(!token){
            return res.status(400).json({message:"token is not found"})
        }

   const verifyToken=await jwt.verify(token,process.env.JWT_SECRET)  
   
   req.userId=verifyToken.userId

   const user=await User.findById(req.userId).select("isActive role")
   if(!user){
       return res.status(401).json({message:"user not found"})
   }
   if(user.isActive===false){
       return res.status(403).json({message:"Account deactivated. Contact an administrator."})
   }
   req.userRole=user.role

   next()

    } catch (error) {
        return res.status(500).json({message:`is auth error ${error}`})
    }
 }

 export default isAuth