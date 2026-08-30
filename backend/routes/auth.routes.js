import express from "express"
import { resetPassword, sendOtp, signIn, signOut, signUp, signUpChild, verifyOtp } from "../controllers/auth.controllers.js"

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signup/child",signUpChild)
authRouter.post("/signin",signIn)
authRouter.post("/sendOtp",sendOtp)
authRouter.post("/verifyOtp",verifyOtp)
authRouter.post("/resetPassword",resetPassword)
authRouter.get("/signout",signOut)
export default authRouter