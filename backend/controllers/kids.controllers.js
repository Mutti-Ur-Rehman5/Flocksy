import KidStory from "../models/kidStory.model.js"
import QuizQuestion from "../models/quizQuestion.model.js"
import QuizResult from "../models/quizResult.model.js"
import KidsProfile from "../models/kidsProfile.model.js"
import RewardProfile from "../models/rewardProfile.model.js"
import ChatMessage from "../models/chatMessage.model.js"
import User from "../models/user.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import { buildSystemPrompt, callGemini, postFilter, filterUserInput } from "../services/flockchat.service.js"

const BADGE_THRESHOLDS=[
    {badgeId:"newcomer",name:"Newcomer",starsRequired:0,icon:"🌟"},
    {badgeId:"story_lover",name:"Story Lover",starsRequired:10,icon:"📚"},
    {badgeId:"quiz_whiz",name:"Quiz Whiz",starsRequired:25,icon:"🧠"},
    {badgeId:"artist",name:"Artist",starsRequired:40,icon:"🎨"},
    {badgeId:"champion",name:"Champion",starsRequired:60,icon:"🏆"},
    {badgeId:"superstar",name:"Superstar",starsRequired:100,icon:"⭐"}
]

export const getStories=async (req,res)=>{
    try {
        const stories=await KidStory.find({isActive:true}).select("title coverImage category readingLevel starsAwarded")
        return res.status(200).json(stories)
    } catch (error) {
        return res.status(500).json({message:`get stories error ${error}`})
    }
}

export const getStory=async (req,res)=>{
    try {
        const story=await KidStory.findById(req.params.id)
        if(!story||!story.isActive){
            return res.status(404).json({message:"story not found"})
        }
        return res.status(200).json(story)
    } catch (error) {
        return res.status(500).json({message:`get story error ${error}`})
    }
}

export const markStoryRead=async (req,res)=>{
    try {
        const story=await KidStory.findById(req.params.id)
        if(!story){
            return res.status(404).json({message:"story not found"})
        }

        let profile=await KidsProfile.findOne({userId:req.userId})
        if(!profile){
            profile=await KidsProfile.create({userId:req.userId})
        }

        if(profile.completedStories.includes(story._id)){
            return res.status(200).json({message:"already read",stars:profile.stars})
        }

        profile.completedStories.push(story._id)
        profile.stars+=story.starsAwarded
        await profile.save()

        await updateBadges(req.userId,profile.stars)

        return res.status(200).json({message:"story marked as read",starsEarned:story.starsAwarded,totalStars:profile.stars})
    } catch (error) {
        return res.status(500).json({message:`mark read error ${error}`})
    }
}

export const getQuizQuestions=async (req,res)=>{
    try {
        const {category}=req.params
        const questions=await QuizQuestion.aggregate([
            {$match:{category}},
            {$sample:{size:10}}
        ])
        const safe=questions.map(q=>({_id:q._id,question:q.question,options:q.options,category:q.category,difficulty:q.difficulty,starsAwarded:q.starsAwarded}))
        return res.status(200).json(safe)
    } catch (error) {
        return res.status(500).json({message:`get quiz error ${error}`})
    }
}

export const submitQuizResult=async (req,res)=>{
    try {
        const {category,score,totalQuestions}=req.body
        if(!category||score===undefined||!totalQuestions){
            return res.status(400).json({message:"category, score, and totalQuestions are required"})
        }

        const starsEarned=score*2

        await QuizResult.create({
            userId:req.userId,
            category,
            score,
            totalQuestions,
            starsEarned
        })

        let profile=await KidsProfile.findOne({userId:req.userId})
        if(!profile){
            profile=await KidsProfile.create({userId:req.userId})
        }

        profile.stars+=starsEarned
        await profile.save()

        await updateBadges(req.userId,profile.stars)

        return res.status(200).json({starsEarned,totalStars:profile.stars,score,totalQuestions})
    } catch (error) {
        return res.status(500).json({message:`submit quiz error ${error}`})
    }
}

const ANIMALS=[
    {name:"Dog",emoji:"🐕",fact:"Dogs can smell 10,000 times better than humans!"},
    {name:"Cat",emoji:"🐱",fact:"Cats sleep for 12-16 hours a day!"},
    {name:"Elephant",emoji:"🐘",fact:"Elephants are the largest land animals!"},
    {name:"Giraffe",emoji:"🦒",fact:"Giraffes have tongues that are 18 inches long!"},
    {name:"Penguin",emoji:"🐧",fact:"Penguins can hold their breath for 20 minutes!"},
    {name:"Dolphin",emoji:"🐬",fact:"Dolphins sleep with one eye open!"},
    {name:"Lion",emoji:"🦁",fact:"A lion's roar can be heard from 5 miles away!"},
    {name:"Tiger",emoji:"🐅",fact:"Tigers have striped skin, not just striped fur!"},
    {name:"Bear",emoji:"🐻",fact:"Bears can run as fast as a horse!"},
    {name:"Monkey",emoji:"🐒",fact:"Monkeys can understand basic math!"},
    {name:"Rabbit",emoji:"🐰",fact:"Rabbits can jump up to 3 feet high!"},
    {name:"Owl",emoji:"🦉",fact:"Owls can turn their heads almost all the way around!"},
    {name:"Fox",emoji:"🦊",fact:"Foxes use the Earth's magnetic field to hunt!"},
    {name:"Frog",emoji:"🐸",fact:"Frogs absorb water through their skin!"},
    {name:"Turtle",emoji:"🐢",fact:"Some turtles can live over 100 years!"},
    {name:"Fish",emoji:"🐟",fact:"Fish can feel pain and get stressed!"},
    {name:"Horse",emoji:"🐴",fact:"Horses can sleep standing up!"},
    {name:"Cow",emoji:"🐮",fact:"Cows have best friends and get stressed when separated!"},
    {name:"Pig",emoji:"🐷",fact:"Pigs are smarter than dogs!"},
    {name:"Chicken",emoji:"🐔",fact:"Chickens can dream while they sleep!"}
]

export const getAnimalGame=async (req,res)=>{
    try {
        const shuffled=[...ANIMALS].sort(()=>Math.random()-0.5)
        const correct=shuffled[0]
        const options=shuffled.slice(0,4).sort(()=>Math.random()-0.5)
        return res.status(200).json({emoji:correct.emoji,fact:correct.fact,options:options.map(a=>a.name),correctAnswer:correct.name})
    } catch (error) {
        return res.status(500).json({message:`animal game error ${error}`})
    }
}

const TRUE_FALSE_STATEMENTS=[
    {statement:"The Earth is the third planet from the Sun",isTrue:true},
    {statement:"Water boils at 100 degrees Celsius",isTrue:true},
    {statement:"Cats are mammals",isTrue:true},
    {statement:"The Sun is a star",isTrue:true},
    {statement:"Fish can live on land",isTrue:false},
    {statement:"Lightning is faster than thunder",isTrue:true},
    {statement:"Spiders are insects",isTrue:false},
    {statement:"The Moon produces its own light",isTrue:false},
    {statement:"Humans have 206 bones",isTrue:true},
    {statement:"Bats are blind",isTrue:false},
    {statement:"Diamonds are made of carbon",isTrue:true},
    {statement:"Sound travels faster than light",isTrue:false},
    {statement:"Penguins can fly",isTrue:false},
    {statement:"The human heart has 4 chambers",isTrue:true},
    {statement:"Bananas grow on trees",isTrue:false},
    {statement:"Octopuses have 3 hearts",isTrue:true},
    {statement:"Ice is denser than water",isTrue:false},
    {statement:"The Great Wall of China is visible from space",isTrue:false},
    {statement:"Honey never spoils",isTrue:true},
    {statement:"Sharks are mammals",isTrue:false}
]

export const getTrueFalseGame=async (req,res)=>{
    try {
        const statement=TRUE_FALSE_STATEMENTS[Math.floor(Math.random()*TRUE_FALSE_STATEMENTS.length)]
        return res.status(200).json(statement)
    } catch (error) {
        return res.status(500).json({message:`true false error ${error}`})
    }
}

export const saveDrawing=async (req,res)=>{
    try {
        let drawingUrl;
        if(req.file){
            drawingUrl=await uploadOnCloudinary(req.file.path)
        }
        if(!drawingUrl){
            return res.status(400).json({message:"drawing image is required"})
        }

        let profile=await KidsProfile.findOne({userId:req.userId})
        if(!profile){
            profile=await KidsProfile.create({userId:req.userId})
        }

        profile.drawings.push({url:drawingUrl})
        profile.stars+=2
        await profile.save()

        await updateBadges(req.userId,profile.stars)

        return res.status(200).json({message:"drawing saved",url:drawingUrl,totalStars:profile.stars})
    } catch (error) {
        return res.status(500).json({message:`save drawing error ${error}`})
    }
}

export const getKidsProfile=async (req,res)=>{
    try {
        let profile=await KidsProfile.findOne({userId:req.userId})
        if(!profile){
            profile=await KidsProfile.create({userId:req.userId})
        }

        let reward=await RewardProfile.findOne({userId:req.userId})
        if(!reward){
            reward=await RewardProfile.create({userId:req.userId,currentBadge:"newcomer",totalStars:profile.stars})
        }

        return res.status(200).json({
            stars:profile.stars,
            badges:profile.badges,
            completedStories:profile.completedStories.length,
            completedQuizzes:profile.completedQuizzes.length,
            drawings:profile.drawings.length,
            currentBadge:reward.currentBadge,
            badgeThresholds:BADGE_THRESHOLDS
        })
    } catch (error) {
        return res.status(500).json({message:`get profile error ${error}`})
    }
}

const updateBadges=async (userId,totalStars)=>{
    try {
        let reward=await RewardProfile.findOne({userId})
        if(!reward){
            reward=await RewardProfile.create({userId,totalStars,currentBadge:"newcomer"})
        }

        reward.totalStars=totalStars

        for(const threshold of BADGE_THRESHOLDS){
            if(totalStars>=threshold.starsRequired){
                const alreadyEarned=reward.badgeHistory.find(b=>b.badgeId===threshold.badgeId)
                if(!alreadyEarned){
                    reward.badgeHistory.push({
                        badgeId:threshold.badgeId,
                        name:threshold.name,
                        starsRequired:threshold.starsRequired,
                        earnedAt:new Date()
                    })
                    reward.currentBadge=threshold.badgeId

                    let profile=await KidsProfile.findOne({userId})
                    if(profile){
                        const alreadyInProfile=profile.badges.find(b=>b.badgeId===threshold.badgeId)
                        if(!alreadyInProfile){
                            profile.badges.push({badgeId:threshold.badgeId,name:threshold.name,icon:threshold.icon})
                            await profile.save()
                        }
                    }
                }
            }
        }

        await reward.save()
    } catch (error) {
        // silent fail for badge updates
    }
}

export const sendChat=async (req,res)=>{
    try {
        const {message}=req.body
        if(!message||!message.trim()){
            return res.status(400).json({message:"message is required"})
        }

        if(message.length>500){
            return res.status(400).json({message:"message too long (max 500 characters)"})
        }

        const userFilter=filterUserInput(message)
        if(!userFilter.safe){
            await ChatMessage.create({childId:req.userId,role:"user",text:message,flagged:true,flagReason:userFilter.reason})
            return res.status(200).json({
                reply:"I can't chat about that, but I'd love to talk about your favorite animal or help with homework! What sounds fun?",
                flagged:true
            })
        }

        const user=await User.findById(req.userId).select("dateOfBirth name")
        const childAge=user?.dateOfBirth?Math.floor((Date.now()-new Date(user.dateOfBirth).getTime())/(365.25*24*60*60*1000)):null

        const recentMessages=await ChatMessage.find({childId:req.userId})
            .sort({createdAt:-1})
            .limit(10)
            .select("role text")
            .lean()

        const conversationHistory=[...recentMessages.reverse().map(m=>({role:m.role,text:m.text})),{role:"user",text:message}]

        const systemPrompt=buildSystemPrompt(childAge)
        const messages=[{role:"user",text:systemPrompt+"\n\n---\n\nChat history and current message:"},...conversationHistory]

        let reply
        try{
            const geminiResult=await callGemini(messages)
            reply=geminiResult.text

            if(geminiResult.flagged){
                await ChatMessage.create({childId:req.userId,role:"user",text:message,flagged:true,flagReason:"Gemini blocked response"})
                return res.status(200).json({reply,flagged:true})
            }
        }catch(error){
            reply="Oops, I'm having trouble thinking right now. Let's try again in a moment! What would you like to talk about?"
        }

        const outputFilter=postFilter(reply)
        let flagged=false
        let flagReason=null

        if(!outputFilter.safe){
            flagged=true
            flagReason=outputFilter.reason
            reply="I can't chat about that, but I'd love to talk about your favorite animal or help with homework! What sounds fun?"
        }

        await ChatMessage.create({childId:req.userId,role:"user",text:message,flagged:false})
        await ChatMessage.create({childId:req.userId,role:"assistant",text:reply,flagged,flagReason})

        return res.status(200).json({reply,flagged})
    } catch (error) {
        return res.status(500).json({message:`chat error ${error}`})
    }
}

export const getChatHistory=async (req,res)=>{
    try {
        const page=parseInt(req.query.page)||1
        const limit=20
        const skip=(page-1)*limit

        const messages=await ChatMessage.find({childId:req.userId})
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit)
            .select("role text flagged createdAt")
            .lean()

        const total=await ChatMessage.countDocuments({childId:req.userId})

        return res.status(200).json({
            messages:messages.reverse(),
            page,
            totalPages:Math.ceil(total/limit),
            total
        })
    } catch (error) {
        return res.status(500).json({message:`get chat history error ${error}`})
    }
}
