import ChatMessage from "../models/chatMessage.model.js"
import User from "../models/user.model.js"
import KidStory from "../models/kidStory.model.js"
import QuizQuestion from "../models/quizQuestion.model.js"
import AnimalGame from "../models/animalGame.model.js"
import TrueFalseQuestion from "../models/trueFalseQuestion.model.js"
import OTPRecord from "../models/otpRecord.model.js"
import KidsProfile from "../models/kidsProfile.model.js"
import RewardProfile from "../models/rewardProfile.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"

// ==================== FlockChat: Flagged Messages ====================

export const getFlaggedMessages=async (req,res)=>{
    try {
        const page=parseInt(req.query.page)||1
        const limit=50
        const skip=(page-1)*limit

        const messages=await ChatMessage.find({flagged:true})
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit)
            .select("childId role text flagReason createdAt")
            .populate("childId","name userName")
            .lean()

        const total=await ChatMessage.countDocuments({flagged:true})

        return res.status(200).json({
            messages,
            page,
            totalPages:Math.ceil(total/limit),
            total
        })
    } catch (error) {
        return res.status(500).json({message:`get flagged messages error ${error}`})
    }
}

export const dismissFlaggedMessage=async (req,res)=>{
    try {
        const message=await ChatMessage.findByIdAndUpdate(
            req.params.id,
            {flagged:false,flagReason:null},
            {new:true}
        )
        if(!message){
            return res.status(404).json({message:"message not found"})
        }
        return res.status(200).json({message:"message flag dismissed"})
    } catch (error) {
        return res.status(500).json({message:`dismiss error ${error}`})
    }
}

export const deleteFlaggedMessage=async (req,res)=>{
    try {
        const message=await ChatMessage.findByIdAndDelete(req.params.id)
        if(!message){
            return res.status(404).json({message:"message not found"})
        }
        return res.status(200).json({message:"message deleted"})
    } catch (error) {
        return res.status(500).json({message:`delete error ${error}`})
    }
}

export const getChatStats=async (req,res)=>{
    try {
        const totalMessages=await ChatMessage.countDocuments()
        const flaggedMessages=await ChatMessage.countDocuments({flagged:true})
        const uniqueChildren=await ChatMessage.distinct("childId")

        return res.status(200).json({
            totalMessages,
            flaggedMessages,
            activeChildren:uniqueChildren.length
        })
    } catch (error) {
        return res.status(500).json({message:`get chat stats error ${error}`})
    }
}

// ==================== OTP Audit Log ====================

export const getOtpAuditLog=async (req,res)=>{
    try {
        const page=parseInt(req.query.page)||1
        const limit=50
        const skip=(page-1)*limit
        const {status}=req.query

        const filter={}
        if(status){
            filter.approvalStatus=status.toUpperCase()
        }

        const records=await OTPRecord.find(filter)
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit)
            .select("userId targetEmail approvalStatus attemptsRemaining createdAt expiresAt")
            .populate("userId","name userName")
            .lean()

        const total=await OTPRecord.countDocuments(filter)

        return res.status(200).json({
            records,
            page,
            totalPages:Math.ceil(total/limit),
            total
        })
    } catch (error) {
        return res.status(500).json({message:`get otp audit error ${error}`})
    }
}

export const getOtpStats=async (req,res)=>{
    try {
        const total=await OTPRecord.countDocuments()
        const approved=await OTPRecord.countDocuments({approvalStatus:"APPROVED"})
        const denied=await OTPRecord.countDocuments({approvalStatus:"DENIED"})
        const expired=await OTPRecord.countDocuments({approvalStatus:"EXPIRED"})
        const pending=await OTPRecord.countDocuments({approvalStatus:"PENDING"})

        return res.status(200).json({total,approved,denied,expired,pending})
    } catch (error) {
        return res.status(500).json({message:`get otp stats error ${error}`})
    }
}

// ==================== Kids Content Management: Stories ====================

export const adminGetStories=async (req,res)=>{
    try {
        const page=parseInt(req.query.page)||1
        const limit=20
        const skip=(page-1)*limit

        const stories=await KidStory.find()
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit)
            .lean()

        const total=await KidStory.countDocuments()

        return res.status(200).json({stories,page,totalPages:Math.ceil(total/limit),total})
    } catch (error) {
        return res.status(500).json({message:`admin get stories error ${error}`})
    }
}

export const adminCreateStory=async (req,res)=>{
    try {
        const {title,content,category,readingLevel,starsAwarded,isActive}=req.body
        if(!title||!content){
            return res.status(400).json({message:"title and content are required"})
        }

        let coverImage
        if(req.file){
            coverImage=await uploadOnCloudinary(req.file.path)
        }

        const story=await KidStory.create({
            title,content,category,readingLevel,starsAwarded,isActive,coverImage
        })

        return res.status(201).json(story)
    } catch (error) {
        return res.status(500).json({message:`create story error ${error}`})
    }
}

export const adminUpdateStory=async (req,res)=>{
    try {
        const {title,content,category,readingLevel,starsAwarded,isActive}=req.body
        const update={title,content,category,readingLevel,starsAwarded,isActive}

        if(req.file){
            update.coverImage=await uploadOnCloudinary(req.file.path)
        }

        Object.keys(update).forEach(k=>update[k]===undefined&&delete update[k])

        const story=await KidStory.findByIdAndUpdate(req.params.id,update,{new:true})
        if(!story){
            return res.status(404).json({message:"story not found"})
        }
        return res.status(200).json(story)
    } catch (error) {
        return res.status(500).json({message:`update story error ${error}`})
    }
}

export const adminDeleteStory=async (req,res)=>{
    try {
        const story=await KidStory.findByIdAndDelete(req.params.id)
        if(!story){
            return res.status(404).json({message:"story not found"})
        }
        return res.status(200).json({message:"story deleted"})
    } catch (error) {
        return res.status(500).json({message:`delete story error ${error}`})
    }
}

// ==================== Kids Content Management: Quiz Questions ====================

export const adminGetQuizQuestions=async (req,res)=>{
    try {
        const page=parseInt(req.query.page)||1
        const limit=20
        const skip=(page-1)*limit
        const {category}=req.query

        const filter={}
        if(category) filter.category=category

        const questions=await QuizQuestion.find(filter)
            .sort({createdAt:-1})
            .skip(skip)
            .limit(limit)
            .lean()

        const total=await QuizQuestion.countDocuments(filter)

        return res.status(200).json({questions,page,totalPages:Math.ceil(total/limit),total})
    } catch (error) {
        return res.status(500).json({message:`admin get quiz error ${error}`})
    }
}

export const adminCreateQuizQuestion=async (req,res)=>{
    try {
        const {question,options,correctAnswer,category,difficulty,starsAwarded}=req.body
        if(!question||!options||correctAnswer===undefined||!category){
            return res.status(400).json({message:"question, options, correctAnswer, and category are required"})
        }
        if(!Array.isArray(options)||options.length<2){
            return res.status(400).json({message:"options must be an array with at least 2 items"})
        }

        const quiz=await QuizQuestion.create({
            question,options,correctAnswer,category,difficulty,starsAwarded
        })
        return res.status(201).json(quiz)
    } catch (error) {
        return res.status(500).json({message:`create quiz error ${error}`})
    }
}

export const adminUpdateQuizQuestion=async (req,res)=>{
    try {
        const {question,options,correctAnswer,category,difficulty,starsAwarded}=req.body
        const update={question,options,correctAnswer,category,difficulty,starsAwarded}
        Object.keys(update).forEach(k=>update[k]===undefined&&delete update[k])

        const quiz=await QuizQuestion.findByIdAndUpdate(req.params.id,update,{new:true})
        if(!quiz){
            return res.status(404).json({message:"question not found"})
        }
        return res.status(200).json(quiz)
    } catch (error) {
        return res.status(500).json({message:`update quiz error ${error}`})
    }
}

export const adminDeleteQuizQuestion=async (req,res)=>{
    try {
        const quiz=await QuizQuestion.findByIdAndDelete(req.params.id)
        if(!quiz){
            return res.status(404).json({message:"question not found"})
        }
        return res.status(200).json({message:"question deleted"})
    } catch (error) {
        return res.status(500).json({message:`delete quiz error ${error}`})
    }
}

// ==================== Kids Content Management: Game Assets ====================

export const adminGetAnimals=async (req,res)=>{
    try {
        const animals=await AnimalGame.find().sort({name:1}).lean()
        return res.status(200).json(animals)
    } catch (error) {
        return res.status(500).json({message:`get animals error ${error}`})
    }
}

export const adminCreateAnimal=async (req,res)=>{
    try {
        const {name,emoji,fact,isActive}=req.body
        if(!name||!emoji||!fact){
            return res.status(400).json({message:"name, emoji, and fact are required"})
        }
        const animal=await AnimalGame.create({name,emoji,fact,isActive})
        return res.status(201).json(animal)
    } catch (error) {
        if(error.code===11000){
            return res.status(400).json({message:"animal name already exists"})
        }
        return res.status(500).json({message:`create animal error ${error}`})
    }
}

export const adminUpdateAnimal=async (req,res)=>{
    try {
        const {name,emoji,fact,isActive}=req.body
        const update={name,emoji,fact,isActive}
        Object.keys(update).forEach(k=>update[k]===undefined&&delete update[k])

        const animal=await AnimalGame.findByIdAndUpdate(req.params.id,update,{new:true})
        if(!animal){
            return res.status(404).json({message:"animal not found"})
        }
        return res.status(200).json(animal)
    } catch (error) {
        return res.status(500).json({message:`update animal error ${error}`})
    }
}

export const adminDeleteAnimal=async (req,res)=>{
    try {
        const animal=await AnimalGame.findByIdAndDelete(req.params.id)
        if(!animal){
            return res.status(404).json({message:"animal not found"})
        }
        return res.status(200).json({message:"animal deleted"})
    } catch (error) {
        return res.status(500).json({message:`delete animal error ${error}`})
    }
}

export const adminGetTrueFalse=async (req,res)=>{
    try {
        const questions=await TrueFalseQuestion.find().sort({createdAt:-1}).lean()
        return res.status(200).json(questions)
    } catch (error) {
        return res.status(500).json({message:`get true false error ${error}`})
    }
}

export const adminCreateTrueFalse=async (req,res)=>{
    try {
        const {statement,isTrue,isActive}=req.body
        if(!statement||isTrue===undefined){
            return res.status(400).json({message:"statement and isTrue are required"})
        }
        const tf=await TrueFalseQuestion.create({statement,isTrue,isActive})
        return res.status(201).json(tf)
    } catch (error) {
        if(error.code===11000){
            return res.status(400).json({message:"statement already exists"})
        }
        return res.status(500).json({message:`create true false error ${error}`})
    }
}

export const adminUpdateTrueFalse=async (req,res)=>{
    try {
        const {statement,isTrue,isActive}=req.body
        const update={statement,isTrue,isActive}
        Object.keys(update).forEach(k=>update[k]===undefined&&delete update[k])

        const tf=await TrueFalseQuestion.findByIdAndUpdate(req.params.id,update,{new:true})
        if(!tf){
            return res.status(404).json({message:"statement not found"})
        }
        return res.status(200).json(tf)
    } catch (error) {
        return res.status(500).json({message:`update true false error ${error}`})
    }
}

export const adminDeleteTrueFalse=async (req,res)=>{
    try {
        const tf=await TrueFalseQuestion.findByIdAndDelete(req.params.id)
        if(!tf){
            return res.status(404).json({message:"statement not found"})
        }
        return res.status(200).json({message:"statement deleted"})
    } catch (error) {
        return res.status(500).json({message:`delete true false error ${error}`})
    }
}

// ==================== Badge Definitions (read-only from constants) ====================

const BADGE_THRESHOLDS=[
    {badgeId:"newcomer",name:"Newcomer",starsRequired:0,icon:"🌟"},
    {badgeId:"story_lover",name:"Story Lover",starsRequired:10,icon:"📚"},
    {badgeId:"quiz_whiz",name:"Quiz Whiz",starsRequired:25,icon:"🧠"},
    {badgeId:"artist",name:"Artist",starsRequired:40,icon:"🎨"},
    {badgeId:"champion",name:"Champion",starsRequired:60,icon:"🏆"},
    {badgeId:"superstar",name:"Superstar",starsRequired:100,icon:"⭐"}
]

export const adminGetBadges=async (req,res)=>{
    try {
        const rewards=await RewardProfile.find().select("userId currentBadge totalStars").populate("userId","name userName").lean()
        const badgeCounts={}
        for(const threshold of BADGE_THRESHOLDS){
            badgeCounts[threshold.badgeId]={...threshold,earnedBy:0}
        }
        for(const reward of rewards){
            if(reward.currentBadge&&badgeCounts[reward.currentBadge]){
                badgeCounts[reward.currentBadge].earnedBy++
            }
        }
        return res.status(200).json({badges:BADGE_THRESHOLDS,stats:badgeCounts,totalKids:rewards.length})
    } catch (error) {
        return res.status(500).json({message:`get badges error ${error}`})
    }
}

// ==================== Dashboard Stats ====================

export const adminGetDashboard=async (req,res)=>{
    try {
        const totalKids=await User.countDocuments({role:"CHILD"})
        const totalStories=await KidStory.countDocuments()
        const totalQuizQuestions=await QuizQuestion.countDocuments()
        const totalAnimals=await AnimalGame.countDocuments()
        const totalTrueFalse=await TrueFalseQuestion.countDocuments()
        const totalOtpRequests=await OTPRecord.countDocuments()
        const flaggedChats=await ChatMessage.countDocuments({flagged:true})
        const activeStories=await KidStory.countDocuments({isActive:true})
        const activeAnimals=await AnimalGame.countDocuments({isActive:true})
        const activeTrueFalse=await TrueFalseQuestion.countDocuments({isActive:true})

        return res.status(200).json({
            totalKids,totalStories,activeStories,totalQuizQuestions,
            totalAnimals,activeAnimals,totalTrueFalse,activeTrueFalse,
            totalOtpRequests,flaggedChats
        })
    } catch (error) {
        return res.status(500).json({message:`get dashboard error ${error}`})
    }
}

// ==================== Seed Game Data ====================

export const seedGameAssets=async (req,res)=>{
    try {
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

        const TRUE_FALSE=[
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

        let animalsCreated=0
        for(const a of ANIMALS){
            const exists=await AnimalGame.findOne({name:a.name})
            if(!exists){
                await AnimalGame.create(a)
                animalsCreated++
            }
        }

        let tfCreated=0
        for(const t of TRUE_FALSE){
            const exists=await TrueFalseQuestion.findOne({statement:t.statement})
            if(!exists){
                await TrueFalseQuestion.create(t)
                tfCreated++
            }
        }

        return res.status(200).json({
            message:"Seed complete",
            animalsCreated,
            trueFalseCreated:tfCreated,
            totalAnimals:await AnimalGame.countDocuments(),
            totalTrueFalse:await TrueFalseQuestion.countDocuments()
        })
    } catch (error) {
        return res.status(500).json({message:`seed error ${error}`})
    }
}
