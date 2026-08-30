import express from "express"
import isAuth from "../middlewares/isAuth.js"
import requireRole from "../middlewares/requireRole.js"
import multer from "multer"
import {
    getFlaggedMessages,dismissFlaggedMessage,deleteFlaggedMessage,getChatStats,
    getOtpAuditLog,getOtpStats,
    adminGetStories,adminCreateStory,adminUpdateStory,adminDeleteStory,
    adminGetQuizQuestions,adminCreateQuizQuestion,adminUpdateQuizQuestion,adminDeleteQuizQuestion,
    adminGetAnimals,adminCreateAnimal,adminUpdateAnimal,adminDeleteAnimal,
    adminGetTrueFalse,adminCreateTrueFalse,adminUpdateTrueFalse,adminDeleteTrueFalse,
    adminGetBadges,adminGetDashboard,seedGameAssets
} from "../controllers/admin.controllers.js"

const adminRouter=express.Router()
const upload=multer({dest:"./public"})
const adminAuth=[isAuth,requireRole("ADMIN")]

// Dashboard
adminRouter.get("/dashboard",...adminAuth,adminGetDashboard)

// FlockChat flagged messages
adminRouter.get("/chat/flagged",...adminAuth,getFlaggedMessages)
adminRouter.put("/chat/flagged/:id/dismiss",...adminAuth,dismissFlaggedMessage)
adminRouter.delete("/chat/flagged/:id",...adminAuth,deleteFlaggedMessage)
adminRouter.get("/chat/stats",...adminAuth,getChatStats)

// OTP Audit Log
adminRouter.get("/otp/logs",...adminAuth,getOtpAuditLog)
adminRouter.get("/otp/stats",...adminAuth,getOtpStats)

// Stories CRUD
adminRouter.get("/stories",...adminAuth,adminGetStories)
adminRouter.post("/stories",...adminAuth,upload.single("coverImage"),adminCreateStory)
adminRouter.put("/stories/:id",...adminAuth,upload.single("coverImage"),adminUpdateStory)
adminRouter.delete("/stories/:id",...adminAuth,adminDeleteStory)

// Quiz Questions CRUD
adminRouter.get("/quiz",...adminAuth,adminGetQuizQuestions)
adminRouter.post("/quiz",...adminAuth,adminCreateQuizQuestion)
adminRouter.put("/quiz/:id",...adminAuth,adminUpdateQuizQuestion)
adminRouter.delete("/quiz/:id",...adminAuth,adminDeleteQuizQuestion)

// Animal Game CRUD
adminRouter.get("/games/animals",...adminAuth,adminGetAnimals)
adminRouter.post("/games/animals",...adminAuth,adminCreateAnimal)
adminRouter.put("/games/animals/:id",...adminAuth,adminUpdateAnimal)
adminRouter.delete("/games/animals/:id",...adminAuth,adminDeleteAnimal)

// True/False Game CRUD
adminRouter.get("/games/truefalse",...adminAuth,adminGetTrueFalse)
adminRouter.post("/games/truefalse",...adminAuth,adminCreateTrueFalse)
adminRouter.put("/games/truefalse/:id",...adminAuth,adminUpdateTrueFalse)
adminRouter.delete("/games/truefalse/:id",...adminAuth,adminDeleteTrueFalse)

// Badge Definitions (read-only)
adminRouter.get("/badges",...adminAuth,adminGetBadges)

// Seed Game Assets (one-time migration from hardcoded data)
adminRouter.post("/seed/games",...adminAuth,seedGameAssets)

export default adminRouter
