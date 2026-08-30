import express from "express"
import { adminLogin } from "../controllers/adminAuth.controllers.js"

const adminAuthRouter=express.Router()

adminAuthRouter.post("/login",adminLogin)

export default adminAuthRouter
