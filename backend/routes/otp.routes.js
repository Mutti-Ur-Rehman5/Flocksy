import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { requestOtp, approveOtp, denyOtp, verifyOtp, getOtpStatus } from "../controllers/otp.controllers.js"

const otpRouter=express.Router()

otpRouter.post("/request",isAuth,requestOtp)
otpRouter.get("/approve",approveOtp)
otpRouter.get("/deny",denyOtp)
otpRouter.post("/verify",isAuth,verifyOtp)
otpRouter.get("/status/:id",isAuth,getOtpStatus)

export default otpRouter
