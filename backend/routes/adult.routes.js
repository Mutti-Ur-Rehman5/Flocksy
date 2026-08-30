import express from "express"
import isAuth from "../middlewares/isAuth.js"
import requireRole from "../middlewares/requireRole.js"
import rateLimiter from "../middlewares/rateLimiter.js"
import { sendAdultChat, getAdultChatHistory } from "../controllers/adult.controllers.js"

const adultRouter=express.Router()

adultRouter.post("/chat",isAuth,requireRole("ADULT"),rateLimiter(30,10*60*1000,"adultchat"),sendAdultChat)
adultRouter.get("/chat/history",isAuth,requireRole("ADULT"),getAdultChatHistory)

export default adultRouter
