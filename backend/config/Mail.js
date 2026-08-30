import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user:process.env.EMAIL,
    pass:process.env.EMAIL_PASS,
  },
});

const sendMail=async (to,otp)=>{
await transporter.sendMail({
    from:`${process.env.EMAIL}`,
    to,
    subject: "Reset Your Password",
    html:`<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
})
}

const sendOtpEmail=async (to,otpCode,approveUrl,denyUrl,childName)=>{
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
}

export { sendMail as default, sendOtpEmail }
