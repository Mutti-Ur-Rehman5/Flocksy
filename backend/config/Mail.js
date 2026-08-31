import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user:process.env.EMAIL,
    pass:process.env.EMAIL_PASS,
  },
});

// TEMP DIAGNOSTIC: capture non-sensitive Nodemailer/SMTP error fields only.
// Never logs the password, token, or auth object.
const safeErr=(err)=>{
    const s=(v)=> (typeof v==="string"?v.slice(0,500):v)
    return {
        name: err && err.name,
        message: s(err && err.message),
        code: s(err && err.code),
        responseCode: s(err && err.responseCode),
        command: s(err && err.command),
        response: s(err && err.response),
    }
}

const logNodemailerFailure=(context,error)=>{
    console.error(`[Mail] ${context} failed:`, JSON.stringify(safeErr(error)))
}

const sendMail=async (to,otp)=>{
await transporter.sendMail({
    from:`${process.env.EMAIL}`,
    to,
    subject: "Reset Your Password",
    html:`<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
})
}

const sendOtpEmail=async (to,otpCode,approveUrl,denyUrl,childName)=>{
try {
await transporter.sendMail({
    from:`${process.env.EMAIL}`,
    to,
    subject: `${childName} wants to switch to Adult Mode`,
    html:`
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px">
            <h2 style="color:#6b21a8">Parent Approval Request</h2>
            <p><b>${childName}</b> is requesting to switch from Kids Mode to Adult Mode.</p>
            
            <div style="background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;margin:20px 0">
                <p style="margin:0 0 8px;color:#555">Your approval code:</p>
                <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:0;color:#111">${otpCode}</p>
            </div>

            <p>You can either share this code with your child, or click a button below:</p>
            
            <div style="text-align:center;margin:24px 0">
                <a href="${approveUrl}" style="display:inline-block;padding:12px 32px;background:#22c55e;color:white;text-decoration:none;border-radius:8px;font-weight:bold;margin:0 8px">Approve</a>
                <a href="${denyUrl}" style="display:inline-block;padding:12px 32px;background:#ef4444;color:white;text-decoration:none;border-radius:8px;font-weight:bold;margin:0 8px">Deny</a>
            </div>

            <p style="color:#888;font-size:12px">This code expires in 10 minutes. If you did not expect this request, please click Deny.</p>
        </div>
    `
})
} catch (error) {
    // TEMP DIAGNOSTIC: log the real, non-sensitive SMTP/Nodemailer failure.
    const recipientProvided = typeof to === "string" ? to.slice(0,4)+"..." : "(none)"
    console.error(`[Mail] sendOtpEmail transport error (to=${recipientProvided}):`, JSON.stringify(safeErr(error)))
    throw error
}
}

export { sendMail as default, sendOtpEmail, safeErr }
