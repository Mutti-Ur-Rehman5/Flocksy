import express from "express"
import isAuth from "../middlewares/isAuth.js"
import requireRole from "../middlewares/requireRole.js"
import {
    adminListUsers,adminGetUser,adminToggleUserActive,adminDeleteUser,adminForceResetPassword,
    adminListAdultContent,adminDeleteAdultContent,adminGetModerationLog,
    adminGetChildChatHistory,
    adminCreateBadge,adminUpdateBadge,adminDeleteBadge,adminListBadgeDefinitions,
    adminGetAnalytics
} from "../controllers/adminManagement.controllers.js"

const mgmtRouter=express.Router()
const adminAuth=[isAuth,requireRole("ADMIN")]

// User management
mgmtRouter.get("/users",...adminAuth,adminListUsers)
mgmtRouter.get("/users/:id",...adminAuth,adminGetUser)
mgmtRouter.put("/users/:id/toggle-active",...adminAuth,adminToggleUserActive)
mgmtRouter.delete("/users/:id",...adminAuth,adminDeleteUser)
mgmtRouter.put("/users/:id/reset-password",...adminAuth,adminForceResetPassword)

// Adult content moderation
mgmtRouter.get("/adult-content",...adminAuth,adminListAdultContent)
mgmtRouter.delete("/adult-content/:type/:id",...adminAuth,adminDeleteAdultContent)
mgmtRouter.get("/moderation-log",...adminAuth,adminGetModerationLog)

// FlockChat child history
mgmtRouter.get("/chat/child/:childId",...adminAuth,adminGetChildChatHistory)

// Badge CRUD
mgmtRouter.get("/badge-definitions",...adminAuth,adminListBadgeDefinitions)
mgmtRouter.post("/badge-definitions",...adminAuth,adminCreateBadge)
mgmtRouter.put("/badge-definitions/:id",...adminAuth,adminUpdateBadge)
mgmtRouter.delete("/badge-definitions/:id",...adminAuth,adminDeleteBadge)

// Analytics
mgmtRouter.get("/analytics",...adminAuth,adminGetAnalytics)

export default mgmtRouter
