import User from "../models/user.model.js"

const requireRole=(...roles)=>{
    return async (req,res,next)=>{
        try {
            const user=await User.findById(req.userId).select("role isActive")
            if(!user){
                return res.status(404).json({message:"user not found"})
            }
            if(user.isActive===false){
                return res.status(403).json({message:"Account deactivated"})
            }
            if(!roles.includes(user.role)){
                return res.status(403).json({message:"access denied"})
            }
            req.userRole=user.role
            next()
        } catch (error) {
            return res.status(500).json({message:`role check error ${error}`})
        }
    }
}

export default requireRole
