import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import Loop from "../models/loop.model.js"
import Story from "../models/story.model.js"
import KidsProfile from "../models/kidsProfile.model.js"
import RewardProfile from "../models/rewardProfile.model.js"
import QuizResult from "../models/quizResult.model.js"
import OTPRecord from "../models/otpRecord.model.js"
import ChatMessage from "../models/chatMessage.model.js"
import BadgeDefinition from "../models/badgeDefinition.model.js"
import ModerationLog from "../models/moderationLog.model.js"
import bcrypt from "bcryptjs"

const PUBLIC_USER_FIELDS="-password -parentEmail -resetOtp -otpExpires -isOtpVerified"

// ==================== User Management ====================

export const adminListUsers=async (req,res)=>{
    try {
        const {search,role,status,page=1,limit=15}=req.query
        const filter={}
        if(search){
            filter.$or=[
                {name:{$regex:search,$options:"i"}},
                {userName:{$regex:search,$options:"i"}},
                {email:{$regex:search,$options:"i"}}
            ]
        }
        if(role&&role!=="ALL") filter.role=role
        if(status==="active") filter.isActive=true
        if(status==="inactive") filter.isActive=false

        const skip=(parseInt(page)-1)*parseInt(limit)
        const users=await User.find(filter)
            .select(PUBLIC_USER_FIELDS)
            .sort({createdAt:-1})
            .skip(skip)
            .limit(parseInt(limit))
            .lean()
        const total=await User.countDocuments(filter)

        return res.status(200).json({users,total,page:parseInt(page),totalPages:Math.ceil(total/parseInt(limit))})
    } catch (error) {
        return res.status(500).json({message:`list users error ${error}`})
    }
}

export const adminGetUser=async (req,res)=>{
    try {
        const user=await User.findById(req.params.id)
            .select(PUBLIC_USER_FIELDS)
            .lean()
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        // Include parentEmail for CHILD users (admin-only view)
        const withParent=await User.findById(req.params.id).select("parentEmail").lean()
        let kidsData=null
        if(user.role==="CHILD"){
            kidsData=await KidsProfile.findOne({userId:user._id}).lean()
        }
        return res.status(200).json({user:{...user,parentEmail:withParent?.parentEmail||null},kidsData})
    } catch (error) {
        return res.status(500).json({message:`get user error ${error}`})
    }
}

export const adminToggleUserActive=async (req,res)=>{
    try {
        const user=await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        if(user.role==="ADMIN"){
            return res.status(400).json({message:"Cannot deactivate another admin"})
        }
        user.isActive=!user.isActive
        await user.save()
        return res.status(200).json({message:`${user.isActive?"Activated":"Deactivated"} successfully`,isActive:user.isActive})
    } catch (error) {
        return res.status(500).json({message:`toggle user error ${error}`})
    }
}

export const adminDeleteUser=async (req,res)=>{
    try {
        const user=await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        if(user.role==="ADMIN"){
            return res.status(400).json({message:"Cannot delete another admin"})
        }
        // Cascade cleanups
        await KidsProfile.deleteOne({userId:user._id})
        await RewardProfile.deleteOne({userId:user._id})
        await QuizResult.deleteMany({userId:user._id})
        await ChatMessage.deleteMany({childId:user._id})
        await OTPRecord.deleteMany({userId:user._id})
        await Post.deleteMany({author:user._id})
        await Loop.deleteMany({author:user._id})
        await Post.updateMany({},{$pull:{likes:user._id,comments:{author:user._id}}})
        await Loop.updateMany({},{$pull:{likes:user._id,comments:{author:user._id}}})
        await User.deleteOne({_id:user._id})
        return res.status(200).json({message:"User and all related data deleted"})
    } catch (error) {
        return res.status(500).json({message:`delete user error ${error}`})
    }
}

export const adminForceResetPassword=async (req,res)=>{
    try {
        const {newPassword}=req.body
        if(!newPassword||newPassword.length<6){
            return res.status(400).json({message:"New password must be at least 6 characters"})
        }
        const user=await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        user.password=await bcrypt.hash(newPassword,10)
        await user.save()
        return res.status(200).json({message:"Password reset successfully"})
    } catch (error) {
        return res.status(500).json({message:`force reset error ${error}`})
    }
}

// ==================== Adult Content Moderation ====================

export const adminListAdultContent=async (req,res)=>{
    try {
        const {type,page=1,limit=10}=req.query
        let data={}
        const skip=(parseInt(page)-1)*parseInt(limit)
        const lim=parseInt(limit)
        const populateAuthor=[{path:"author",select:"name userName profileImage"}]
        const populateComments=[{path:"comments.author",select:"name userName profileImage"}]

        if(type==="post"||!type){
            const posts=await Post.find().sort({createdAt:-1}).skip(skip).limit(lim)
                .populate(populateAuthor).populate(populateComments).lean()
            const total=await Post.countDocuments()
            data={type:"post",items:posts,total,page:parseInt(page),totalPages:Math.ceil(total/lim)}
        }else if(type==="loop"){
            const loops=await Loop.find().sort({createdAt:-1}).skip(skip).limit(lim)
                .populate(populateAuthor).populate(populateComments).lean()
            const total=await Loop.countDocuments()
            data={type:"loop",items:loops,total,page:parseInt(page),totalPages:Math.ceil(total/lim)}
        }else if(type==="story"){
            const stories=await Story.find().sort({createdAt:-1}).skip(skip).limit(lim)
                .populate(populateAuthor).lean()
            const total=await Story.countDocuments()
            data={type:"story",items:stories,total,page:parseInt(page),totalPages:Math.ceil(total/lim)}
        }else if(type==="comment"){
            // Flatten comments across posts+loops
            const [posts,loops]=await Promise.all([
                Post.find().sort({createdAt:-1}).populate(populateAuthor).populate(populateComments).lean(),
                Loop.find().sort({createdAt:-1}).populate(populateAuthor).populate(populateComments).lean()
            ])
            const allComments=[]
            posts.forEach(p=>p.comments.forEach(c=>allComments.push({_id:c._id,contentType:"post",parentId:p._id,parentCaption:p.caption,author:c.author,message:c.message,media:p.media,createdAt:c.createdAt||p.createdAt})))
            loops.forEach(l=>l.comments.forEach(c=>allComments.push({_id:c._id,contentType:"loop",parentId:l._id,parentCaption:l.caption,author:c.author,message:c.message,media:l.media,createdAt:c.createdAt||l.createdAt})))
            allComments.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
            const total=allComments.length
            const sliced=allComments.slice(skip,skip+lim)
            data={type:"comment",items:sliced,total,page:parseInt(page),totalPages:Math.ceil(total/lim)}
        }

        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({message:`list content error ${error}`})
    }
}

export const adminDeleteAdultContent=async (req,res)=>{
    try {
        const {type,id}=req.params
        let deleted=false
        if(type==="post"){
            deleted=await Post.findByIdAndDelete(id)
        }else if(type==="loop"){
            deleted=await Loop.findByIdAndDelete(id)
        }else if(type==="story"){
            deleted=await Story.findByIdAndDelete(id)
        }else if(type==="comment"){
            // Find the comment across posts+loops and pull it
            const removedPost=await Post.updateMany({"comments._id":id},{$pull:{comments:{_id:id}}})
            const removedLoop=await Loop.updateMany({"comments._id":id},{$pull:{comments:{_id:id}}})
            deleted=removedPost.modifiedCount>0||removedLoop.modifiedCount>0
        }else{
            return res.status(400).json({message:"invalid content type"})
        }

        await ModerationLog.create({
            contentType:["post","loop","story"].includes(type)?type:"comment",
            action:"DELETED",
            performedBy:req.userId,
            reason:"Deleted by admin"
        })

        if(!deleted) return res.status(404).json({message:"content not found"})
        return res.status(200).json({message:`${type} deleted successfully`})
    } catch (error) {
        return res.status(500).json({message:`delete content error ${error}`})
    }
}

// ==================== Moderation Log / Queue ====================

export const adminGetModerationLog=async (req,res)=>{
    try {
        const {page=1,limit=20}=req.query
        const skip=(parseInt(page)-1)*parseInt(limit)
        const logs=await ModerationLog.find()
            .sort({createdAt:-1})
            .skip(skip)
            .limit(parseInt(limit))
            .populate("performedBy","name userName")
            .populate("targetUser","name userName")
            .lean()
        const total=await ModerationLog.countDocuments()
        return res.status(200).json({logs,total,page:parseInt(page),totalPages:Math.ceil(total/parseInt(limit))})
    } catch (error) {
        return res.status(500).json({message:`moderation log error ${error}`})
    }
}

// ==================== FlockChat child history ====================

export const adminGetChildChatHistory=async (req,res)=>{
    try {
        const {childId}=req.params
        const page=parseInt(req.query.page)||1
        const limit=parseInt(req.query.limit)||20
        const skip=(page-1)*limit
        const messages=await ChatMessage.find({childId})
            .sort({createdAt:1})
            .skip(skip)
            .limit(limit)
            .lean()
        const total=await ChatMessage.countDocuments({childId})
        return res.status(200).json({messages,total,page,totalPages:Math.ceil(total/limit)})
    } catch (error) {
        return res.status(500).json({message:`child chat history error ${error}`})
    }
}

// ==================== Badge CRUD ====================

export const adminCreateBadge=async (req,res)=>{
    try {
        const {badgeId,name,starsRequired,icon,description,isActive}=req.body
        if(!badgeId||!name||starsRequired===undefined){
            return res.status(400).json({message:"badgeId, name, and starsRequired are required"})
        }
        const exists=await BadgeDefinition.findOne({badgeId:badgeId.toLowerCase()})
        if(exists){
            return res.status(400).json({message:"Badge ID already exists"})
        }
        const badge=await BadgeDefinition.create({
            badgeId:badgeId.toLowerCase(),
            name,
            starsRequired,
            icon:icon||"🏆",
            description,
            isActive:isActive!==false
        })
        return res.status(201).json(badge)
    } catch (error) {
        return res.status(500).json({message:`create badge error ${error}`})
    }
}

export const adminUpdateBadge=async (req,res)=>{
    try {
        const badge=await BadgeDefinition.findById(req.params.id)
        if(!badge){
            return res.status(404).json({message:"badge not found"})
        }
        const {name,starsRequired,icon,description,isActive}=req.body
        if(name!==undefined) badge.name=name
        if(starsRequired!==undefined) badge.starsRequired=starsRequired
        if(icon!==undefined) badge.icon=icon
        if(description!==undefined) badge.description=description
        if(isActive!==undefined) badge.isActive=isActive
        await badge.save()
        return res.status(200).json(badge)
    } catch (error) {
        return res.status(500).json({message:`update badge error ${error}`})
    }
}

export const adminDeleteBadge=async (req,res)=>{
    try {
        const badge=await BadgeDefinition.findByIdAndDelete(req.params.id)
        if(!badge){
            return res.status(404).json({message:"badge not found"})
        }
        return res.status(200).json({message:"Badge deleted"})
    } catch (error) {
        return res.status(500).json({message:`delete badge error ${error}`})
    }
}

export const adminListBadgeDefinitions=async (req,res)=>{
    try {
        const badges=await BadgeDefinition.find().sort({starsRequired:1}).lean()
        // attach earned counts
        const rewards=await RewardProfile.find().select("userId currentBadge").lean()
        const stats={}
        badges.forEach(b=>stats[b.badgeId]=0)
        rewards.forEach(r=>{ if(r.currentBadge&&stats[r.currentBadge]!==undefined) stats[r.currentBadge]++ })
        return res.status(200).json({badges,stats,totalKids:rewards.length})
    } catch (error) {
        return res.status(500).json({message:`list badges error ${error}`})
    }
}

// ==================== Analytics ====================

export const adminGetAnalytics=async (req,res)=>{
    try {
        const today=new Date()
        const startOfDay=new Date(today.setHours(0,0,0,0))
        const last7Days=new Date()
        last7Days.setDate(last7Days.getDate()-7)

        const [totalAdults,totalKids,totalAdmin,totalPosts,totalLoops,totalStories,activeToday,postsToday,loopsToday,
            totalQuizzes,quizzesToday,totalStars,totalChats,flaggedChats,otpStats,moderationStats]=await Promise.all([
            User.countDocuments({role:"ADULT"}),
            User.countDocuments({role:"CHILD"}),
            User.countDocuments({role:"ADMIN"}),
            Post.countDocuments(),
            Loop.countDocuments(),
            Story.countDocuments(),
            User.countDocuments({lastLoginAt:{$gte:startOfDay}}),
            Post.countDocuments({createdAt:{$gte:startOfDay}}),
            Loop.countDocuments({createdAt:{$gte:startOfDay}}),
            QuizResult.countDocuments(),
            QuizResult.countDocuments({completedAt:{$gte:startOfDay}}),
            RewardProfile.aggregate([{$group:{_id:null,total:{$sum:"$totalStars"}}}]),
            ChatMessage.countDocuments(),
            ChatMessage.countDocuments({flagged:true}),
            OTPRecord.aggregate([{$group:{_id:"$approvalStatus",count:{$sum:1}}}]),
            ModerationLog.aggregate([{$group:{_id:"$action",count:{$sum:1}}}])
        ])

        const totalStarsVal=totalStars[0]?.total||0
        const otpMap={}
        otpStats.forEach(o=>otpMap[o._id]=o.count)
        const modMap={}
        moderationStats.forEach(m=>modMap[m._id]=m.count)

        // 7-day signup trend
        const sevenDayUsers=await User.aggregate([
            {$match:{createdAt:{$gte:last7Days}}},
            {$group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$createdAt"}},count:{$sum:1}}},
            {$sort:{_id:1}}
        ])

        // Kids Mode engagement
        const avgStarsAgg=await KidsProfile.aggregate([{$group:{_id:null,avgStars:{$avg:"$stars"},children:{$sum:1}}}])
        const topCategory=await QuizResult.aggregate([
            {$group:{_id:"$category",attempts:{$sum:1},totalStars:{$sum:"$starsEarned"}}},
            {$sort:{attempts:-1}},
            {$limit:1}
        ])
        const topWeek=await QuizResult.aggregate([
            {$group:{_id:{$dateToString:{format:"%G-W%V",date:"$completedAt"}},attempts:{$sum:1},totalStars:{$sum:"$starsEarned"}}},
            {$sort:{attempts:-1}},
            {$limit:1}
        ])

        return res.status(200).json({
            totals:{adults:totalAdults,kids:totalKids,admins:totalAdmin,users:totalAdults+totalKids+totalAdmin},
            content:{posts:totalPosts,loops:totalLoops,stories:totalStories,postsToday:postsToday,loopsToday:loopsToday},
            engagement:{quizzes:totalQuizzes,quizzesToday:quizzesToday,totalStars:totalStarsVal,chats:totalChats,flaggedChats},
            moderation:{rejected:modMap["REJECTED"]||0,restored:modMap["RESTORED"]||0,overturned:modMap["OVERTURNED"]||0,deleted:modMap["DELETED"]||0,flaggedByAI:modMap["FLAGGED"]||0},
            otp:otpMap,
            activeToday,
            sevenDaySignups:sevenDayUsers,
            kidsEngagement:{
                avgStarsPerChild:Math.round((avgStarsAgg[0]?.avgStars||0)*100)/100,
                activeChildren:avgStarsAgg[0]?.children||0,
                topCategory:topCategory[0]?{category:topCategory[0]._id,attempts:topCategory[0].attempts,totalStars:topCategory[0].totalStars}:null,
                topWeek:topWeek[0]?{week:topWeek[0]._id,attempts:topWeek[0].attempts,totalStars:topWeek[0].totalStars}:null
            },
            dailyActives:await estimateDailyActives(startOfDay)
        })
    } catch (error) {
        return res.status(500).json({message:`analytics error ${error}`})
    }
}

const estimateDailyActives=async (startOfDay)=>{
    try {
        // Approximate daily actives: users with content/activity today + active admins/kids
        const [postAuthors,loopAuthors,quizTakers]=await Promise.all([
            Post.distinct("author",{createdAt:{$gte:startOfDay}}),
            Loop.distinct("author",{createdAt:{$gte:startOfDay}}),
            QuizResult.distinct("userId",{completedAt:{$gte:startOfDay}})
        ])
        const set=new Set([...postAuthors,...loopAuthors,...quizTakers])
        return set.size
    } catch (e) {
        return 0
    }
}
