import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import OTPRecord from "../models/otpRecord.model.js"
import { sendOtpEmail } from "../config/Mail.js"

const OTP_EXPIRY_MS=10*60*1000
const MAX_ATTEMPTS=3

const generateApprovalToken=(otpRecordId)=>{
    if(!process.env.APPROVAL_TOKEN_SECRET){
        throw new Error("OTP service not configured: APPROVAL_TOKEN_SECRET is missing")
    }
    return jwt.sign({id:otpRecordId},process.env.APPROVAL_TOKEN_SECRET,{expiresIn:"10m"})
}

const getBaseUrl=()=>{
    return process.env.CLIENT_URL||"http://localhost:5173"
}

export const requestOtp=async (req,res)=>{
    try {
        const user=await User.findById(req.userId)
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        if(user.role!=="CHILD"){
            return res.status(403).json({message:"only children can request otp"})
        }
        if(!user.parentEmail){
            return res.status(400).json({message:"no parent email on file"})
        }

        await OTPRecord.deleteMany({userId:user._id,approvalStatus:"PENDING"})

        const otpCode=Math.floor(100000+Math.random()*900000).toString()
        const otpHash=await bcrypt.hash(otpCode,10)
        const expiresAt=new Date(Date.now()+OTP_EXPIRY_MS)

        const otpRecord=await OTPRecord.create({
            userId:user._id,
            otpHash,
            expiresAt,
            attemptsRemaining:MAX_ATTEMPTS,
            approvalStatus:"PENDING",
            targetEmail:user.parentEmail
        })

        const approvalToken=generateApprovalToken(otpRecord._id)
        otpRecord.approvalToken=approvalToken
        await otpRecord.save()

        const approveUrl=`${getBaseUrl()}/api/otp/approve?token=${approvalToken}`
        const denyUrl=`${getBaseUrl()}/api/otp/deny?token=${approvalToken}`

        if(!process.env.EMAIL||!process.env.EMAIL_PASS){
            return res.status(500).json({message:"OTP service not configured: EMAIL or EMAIL_PASS is missing on the server"})
        }

        try {
            await sendOtpEmail(user.parentEmail,otpCode,approveUrl,denyUrl,user.name)
        } catch (emailError) {
            await OTPRecord.deleteOne({_id:otpRecord._id})
            return res.status(500).json({message:"OTP could not be sent. Check the email configuration (EMAIL/EMAIL_PASS) on the server."})
        }

        return res.status(200).json({
            message:"otp sent to parent email",
            otpId:otpRecord._id
        })

    } catch (error) {
        return res.status(500).json({message:`request otp error ${error}`})
    }
}

export const approveOtp=async (req,res)=>{
    try {
        const {token}=req.query
        if(!token){
            return res.status(400).send("<h3>Invalid approval link</h3>")
        }

        let payload
        try {
            payload=jwt.verify(token,process.env.APPROVAL_TOKEN_SECRET)
        } catch (e) {
            return res.status(400).send("<h3>This approval link has expired or is invalid</h3>")
        }

        const otpRecord=await OTPRecord.findById(payload.id)
        if(!otpRecord){
            return res.status(404).send("<h3>Request not found</h3>")
        }
        if(otpRecord.approvalStatus!=="PENDING"){
            return res.status(400).send(`<h3>This request has already been ${otpRecord.approvalStatus.toLowerCase()}</h3>`)
        }
        if(otpRecord.expiresAt<Date.now()){
            otpRecord.approvalStatus="EXPIRED"
            await otpRecord.save()
            return res.status(400).send("<h3>This request has expired</h3>")
        }

        otpRecord.approvalStatus="APPROVED"
        await otpRecord.save()

        return res.status(200).send(`
            <div style="text-align:center;padding:50px;font-family:sans-serif">
                <h2 style="color:#22c55e">Approved!</h2>
                <p>Your child can now access Adult Mode.</p>
                <p style="color:#888;font-size:14px">You can close this tab.</p>
            </div>
        `)

    } catch (error) {
        return res.status(500).send("<h3>Something went wrong</h3>")
    }
}

export const denyOtp=async (req,res)=>{
    try {
        const {token}=req.query
        if(!token){
            return res.status(400).send("<h3>Invalid link</h3>")
        }

        let payload
        try {
            payload=jwt.verify(token,process.env.APPROVAL_TOKEN_SECRET)
        } catch (e) {
            return res.status(400).send("<h3>This link has expired or is invalid</h3>")
        }

        const otpRecord=await OTPRecord.findById(payload.id)
        if(!otpRecord){
            return res.status(404).send("<h3>Request not found</h3>")
        }
        if(otpRecord.approvalStatus!=="PENDING"){
            return res.status(400).send(`<h3>This request has already been ${otpRecord.approvalStatus.toLowerCase()}</h3>`)
        }

        otpRecord.approvalStatus="DENIED"
        await otpRecord.save()

        return res.status(200).send(`
            <div style="text-align:center;padding:50px;font-family:sans-serif">
                <h2 style="color:#ef4444">Denied</h2>
                <p>Your child will not be able to access Adult Mode at this time.</p>
                <p style="color:#888;font-size:14px">You can close this tab.</p>
            </div>
        `)

    } catch (error) {
        return res.status(500).send("<h3>Something went wrong</h3>")
    }
}

export const verifyOtp=async (req,res)=>{
    try {
        const {otpId,otp}=req.body
        if(!otpId||!otp){
            return res.status(400).json({message:"otp id and code are required"})
        }

        const user=await User.findById(req.userId)
        if(!user||user.role!=="CHILD"){
            return res.status(403).json({message:"access denied"})
        }

        const otpRecord=await OTPRecord.findById(otpId)
        if(!otpRecord){
            return res.status(404).json({message:"otp record not found"})
        }
        if(otpRecord.userId.toString()!==req.userId){
            return res.status(403).json({message:"access denied"})
        }
        if(otpRecord.approvalStatus==="APPROVED"){
            return res.status(200).json({message:"already approved",status:"APPROVED"})
        }
        if(otpRecord.approvalStatus==="DENIED"){
            return res.status(400).json({message:"your parent denied this request",status:"DENIED"})
        }
        if(otpRecord.expiresAt<Date.now()){
            otpRecord.approvalStatus="EXPIRED"
            await otpRecord.save()
            return res.status(400).json({message:"otp has expired",status:"EXPIRED"})
        }
        if(otpRecord.attemptsRemaining<=0){
            otpRecord.approvalStatus="EXPIRED"
            await otpRecord.save()
            return res.status(400).json({message:"too many attempts",status:"EXPIRED"})
        }

        const isMatch=await bcrypt.compare(otp,otpRecord.otpHash)
        if(!isMatch){
            otpRecord.attemptsRemaining-=1
            await otpRecord.save()
            return res.status(400).json({
                message:`incorrect code. ${otpRecord.attemptsRemaining} attempts left`,
                status:"PENDING"
            })
        }

        otpRecord.approvalStatus="APPROVED"
        await otpRecord.save()

        return res.status(200).json({message:"approved",status:"APPROVED"})

    } catch (error) {
        return res.status(500).json({message:`verify otp error ${error}`})
    }
}

export const getOtpStatus=async (req,res)=>{
    try {
        const {id}=req.params

        const user=await User.findById(req.userId)
        if(!user||user.role!=="CHILD"){
            return res.status(403).json({message:"access denied"})
        }

        const otpRecord=await OTPRecord.findById(id).select("approvalStatus expiresAt")
        if(!otpRecord){
            return res.status(404).json({message:"otp record not found"})
        }
        if(otpRecord.userId.toString()!==req.userId){
            return res.status(403).json({message:"access denied"})
        }

        if(otpRecord.approvalStatus==="PENDING"&&otpRecord.expiresAt<Date.now()){
            otpRecord.approvalStatus="EXPIRED"
            await otpRecord.save()
        }

        return res.status(200).json({status:otpRecord.approvalStatus})

    } catch (error) {
        return res.status(500).json({message:`status check error ${error}`})
    }
}
