import AdultChatMessage from "../models/adultChatMessage.model.js"
import User from "../models/user.model.js"
import { buildAdultSystemPrompt, callGemini, filterAdultUserInput, filterAdultOutput } from "../services/flockassist.service.js"

export const sendAdultChat=async (req,res)=>{
    try {
        const {message}=req.body
        if(!message||!message.trim()){
            return res.status(400).json({message:"message is required"})
        }
        if(message.length>1000){
            return res.status(400).json({message:"message too long (max 1000 characters)"})
        }

        const userFilter=filterAdultUserInput(message)
        if(!userFilter.safe){
            await AdultChatMessage.create({userId:req.userId,role:"user",text:message,flagged:true,flagReason:userFilter.reason})
            return res.status(200).json({
                reply:"I can't help with that. Ask me about general knowledge, writing, productivity, or anything else helpful!",
                flagged:true
            })
        }

        const user=await User.findById(req.userId).select("name")
        const systemPrompt=buildAdultSystemPrompt()
        const recent=await AdultChatMessage.find({userId:req.userId})
            .sort({createdAt:-1})
            .limit(10)
            .select("role text")
            .lean()

        const history=[...recent.reverse().map(m=>({role:m.role,text:m.text})),{role:"user",text:message}]
        const messages=[{role:"user",text:systemPrompt+"\n\n---\n\nThe user's name is "+(user?.name||"there")+". Chat history and current message:"},...history]

        let reply
        let geminiFlagged=false
        try{
            const geminiResult=await callGemini(messages)
            reply=geminiResult.text
            geminiFlagged=!!geminiResult.flagged
        }catch(error){
            reply="Hmm, I hit a snag answering that. Could you try again in a moment?"
        }

        const outputFilter=filterAdultOutput(reply||"")
        const flagged=geminiFlagged||!outputFilter.safe
        const flagReason=!outputFilter.safe?outputFilter.reason:null

        if(flagged&&!outputFilter.safe){
            reply="I can't help with that. Ask me about general knowledge, writing, productivity, or anything else helpful!"
        }

        await AdultChatMessage.create({userId:req.userId,role:"user",text:message,flagged:false})
        if(reply){
            await AdultChatMessage.create({userId:req.userId,role:"assistant",text:reply,flagged,flagReason})
        }

        return res.status(200).json({reply,flagged})
    } catch (error) {
        return res.status(500).json({message:`adult chat error ${error}`})
    }
}

export const getAdultChatHistory=async (req,res)=>{
    try {
        const page=parseInt(req.query.page)||1
        const limit=20
        const skip=(page-1)*limit

        const messages=await AdultChatMessage.find({userId:req.userId})
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit)
            .select("role text flagged createdAt")
            .lean()

        const total=await AdultChatMessage.countDocuments({userId:req.userId})

        return res.status(200).json({
            messages:messages.reverse(),
            page,
            totalPages:Math.ceil(total/limit),
            total
        })
    } catch (error) {
        return res.status(500).json({message:`get adult chat history error ${error}`})
    }
}
