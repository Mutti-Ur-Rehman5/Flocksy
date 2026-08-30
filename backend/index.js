import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import loopRouter from "./routes/loop.routes.js";
import storyRouter from "./routes/story.routes.js";
import messageRouter from "./routes/message.routes.js"
import otpRouter from "./routes/otp.routes.js"
import kidsRouter from "./routes/kids.routes.js";
import adminRouter from "./routes/admin.routes.js";
import adminAuthRouter from "./routes/adminAuth.routes.js";
import adminManagementRouter from "./routes/adminManagement.routes.js";
import adultRouter from "./routes/adult.routes.js";
import { app, server } from "./socket.js";

dotenv.config();

const port = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check - lightweight, no auth, no DB/external calls (Render free-tier keep-alive)
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/loop", loopRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);
app.use("/api/otp", otpRouter);
app.use("/api/kids", kidsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/mgmt", adminManagementRouter);
app.use("/api/adult", adultRouter);


connectDb()
    .then(() => {
        console.log("MongoDB connected");
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("DB connection failed:", err);
    });