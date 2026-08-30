import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import User from "../models/user.model.js"
import BadgeDefinition from "../models/badgeDefinition.model.js"

dotenv.config()

const DEFAULT_BADGES=[
    {badgeId:"newcomer",name:"Newcomer",starsRequired:0,icon:"🌟",description:"Welcome to Kids Mode!"},
    {badgeId:"story_lover",name:"Story Lover",starsRequired:10,icon:"📚",description:"Read 2 stories to earn"},
    {badgeId:"quiz_whiz",name:"Quiz Whiz",starsRequired:25,icon:"🧠",description:"Keep quizzing to earn"},
    {badgeId:"artist",name:"Artist",starsRequired:40,icon:"🎨",description:"Draw and create to earn"},
    {badgeId:"champion",name:"Champion",starsRequired:60,icon:"🏆",description:"A true Kids Mode champion"},
    {badgeId:"superstar",name:"Superstar",starsRequired:100,icon:"⭐",description:"The highest badge of all"}
]

async function seedBadges(){
    const count=await BadgeDefinition.countDocuments()
    if(count>0){
        console.log("ℹ️  Badge definitions already exist. Skipping badge seed.")
        return
    }
    await BadgeDefinition.insertMany(DEFAULT_BADGES)
    console.log(`✅ Seeded ${DEFAULT_BADGES.length} default badge definitions`)
}

async function seedAdmin(){
    const email=(process.env.ADMIN_EMAIL||"").toLowerCase().trim()
    const password=process.env.ADMIN_PASSWORD||""
    const name=process.env.ADMIN_NAME||"Admin"

    if(!email||!password){
        console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env")
        console.error("   Add these env vars, then re-run: npm run seed:admin")
        process.exit(1)
    }
    if(password.length<6){
        console.error("❌ ADMIN_PASSWORD must be at least 6 characters")
        process.exit(1)
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to MongoDB")

        const existing=await User.findOne({email})
        if(existing){
            if(existing.role==="ADMIN"){
                console.log(`ℹ️  Admin with email ${email} already exists. Skipping.`)
            }else{
                console.error(`❌ Email ${email} is already in use by a ${existing.role} account. Use a different ADMIN_EMAIL.`)
            }
            await seedBadges()
            process.exit(0)
        }

        const hashedPassword=await bcrypt.hash(password,10)
        const admin=await User.create({
            name,
            userName:(process.env.ADMIN_USERNAME||"flocksyadmin").toLowerCase().trim(),
            email,
            password:hashedPassword,
            role:"ADMIN",
            isActive:true
        })

        console.log(`✅ Admin account created:`)
        console.log(`   Name:     ${admin.name}`)
        console.log(`   Email:    ${admin.email}`)
        console.log(`   Username: ${admin.userName}`)
        console.log(`   Role:     ${admin.role}`)
        console.log("")

        await seedBadges()

        console.log("")
        console.log(`Log in at http://localhost:5173/admin/login`)
        process.exit(0)
    } catch (error) {
        console.error("❌ Seeding failed:", error)
        process.exit(1)
    }
}

seedAdmin()
