import express from "express"
import isAuth from "../middlewares/isAuth.js"
import requireRole from "../middlewares/requireRole.js"
import multer from "multer"
import rateLimiter from "../middlewares/rateLimiter.js"
import { getStories, getStory, markStoryRead, getQuizQuestions, submitQuizResult, getAnimalGame, getTrueFalseGame, saveDrawing, getKidsProfile, sendChat, getChatHistory } from "../controllers/kids.controllers.js"
import { getLeaderboardByStars, getWeeklyLeaderboard, getCategoryLeaderboard, getMyStats, getLeaderboardCategories } from "../controllers/leaderboard.controllers.js"

const kidsRouter=express.Router()
const upload=multer({dest:"./public"})

kidsRouter.get("/stories",isAuth,requireRole("CHILD"),getStories)
kidsRouter.get("/stories/:id",isAuth,requireRole("CHILD"),getStory)
kidsRouter.post("/stories/:id/read",isAuth,requireRole("CHILD"),markStoryRead)

kidsRouter.get("/quiz/:category",isAuth,requireRole("CHILD"),getQuizQuestions)
kidsRouter.post("/quiz/result",isAuth,requireRole("CHILD"),submitQuizResult)

kidsRouter.get("/games/animal",isAuth,requireRole("CHILD"),getAnimalGame)
kidsRouter.get("/games/truefalse",isAuth,requireRole("CHILD"),getTrueFalseGame)

kidsRouter.post("/drawing/save",isAuth,requireRole("CHILD"),upload.single("drawing"),saveDrawing)

kidsRouter.get("/profile",isAuth,requireRole("CHILD"),getKidsProfile)

kidsRouter.get("/leaderboard/stars",isAuth,requireRole("CHILD"),getLeaderboardByStars)
kidsRouter.get("/leaderboard/weekly",isAuth,requireRole("CHILD"),getWeeklyLeaderboard)
kidsRouter.get("/leaderboard/quiz/:category",isAuth,requireRole("CHILD"),getCategoryLeaderboard)
kidsRouter.get("/leaderboard/categories",isAuth,requireRole("CHILD"),getLeaderboardCategories)
kidsRouter.get("/stats/me",isAuth,requireRole("CHILD"),getMyStats)

kidsRouter.post("/chat",isAuth,requireRole("CHILD"),rateLimiter(30,10*60*1000),sendChat)
kidsRouter.get("/chat/history",isAuth,requireRole("CHILD"),getChatHistory)

export default kidsRouter
