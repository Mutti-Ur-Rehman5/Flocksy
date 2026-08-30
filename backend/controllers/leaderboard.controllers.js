import User from "../models/user.model.js"
import QuizResult from "../models/quizResult.model.js"
import KidsProfile from "../models/kidsProfile.model.js"
import QuizQuestion from "../models/quizQuestion.model.js"
import mongoose from "mongoose"

const asObjectId = (id) => { try { return new mongoose.Types.ObjectId(id) } catch { return null } }

const USER_PUBLIC_PROJECT = { name: "$user.name", avatar: "$user.profileImage" }

const activeChildAgg = [
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
    { $match: { "user.role": "CHILD", "user.isActive": true } }
]

const sinceDaysAgo = (days) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d
}

// GET /api/kids/leaderboard/stars?page=1&limit=10 — all-time total stars
export const getLeaderboardByStars = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100)
        const skip = (page - 1) * limit

        const [entries, totalAgg] = await Promise.all([
            KidsProfile.aggregate([
                ...activeChildAgg,
                { $sort: { stars: -1, _id: -1 } },
                { $skip: skip },
                { $limit: limit },
                { $project: { name: "$user.name", avatar: "$user.profileImage", stars: 1 } }
            ]),
            KidsProfile.aggregate([...activeChildAgg, { $count: "total" }])
        ])

        const total = totalAgg[0]?.total || 0
        const ranked = entries.map((e, i) => ({ rank: skip + i + 1, ...e }))

        return res.status(200).json({ leaderboard: ranked, page, limit, total, totalPages: Math.ceil(total / limit) })
    } catch (error) {
        return res.status(500).json({ message: `leaderboard by stars error ${error}` })
    }
}

// GET /api/kids/leaderboard/weekly?limit=10 — stars earned in the last 7 days
export const getWeeklyLeaderboard = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100)
        const since = sinceDaysAgo(7)

        const entries = await QuizResult.aggregate([
            { $match: { completedAt: { $gte: since } } },
            { $group: { _id: "$userId", stars: { $sum: "$starsEarned" }, quizzes: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
            { $match: { "user.role": "CHILD", "user.isActive": true } },
            { $sort: { stars: -1, _id: -1 } },
            { $limit: limit },
            { $project: { name: "$user.name", avatar: "$user.profileImage", stars: 1, quizzes: 1 } }
        ])

        const ranked = entries.map((e, i) => ({ rank: i + 1, ...e }))
        const weekStart = since.toISOString()

        return res.status(200).json({ leaderboard: ranked, weekStart, limit })
    } catch (error) {
        return res.status(500).json({ message: `weekly leaderboard error ${error}` })
    }
}

// GET /api/kids/leaderboard/quiz/:category — best scorers + category average
export const getCategoryLeaderboard = async (req, res) => {
    try {
        const { category } = req.params
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100)

        const top = await QuizResult.aggregate([
            { $match: { category } },
            { $sort: { score: -1, completedAt: -1 } },
            { $group: {
                _id: "$userId",
                bestScore: { $first: "$score" },
                bestTotal: { $first: "$totalQuestions" },
                attempts: { $sum: 1 }
            } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
            { $match: { "user.role": "CHILD", "user.isActive": true } },
            { $sort: { bestScore: -1, _id: -1 } },
            { $limit: limit }
        ])

        const rankedTop = top.map((e, i) => ({
            rank: i + 1,
            name: e.user.name,
            avatar: e.user.profileImage,
            bestScore: e.bestScore,
            bestTotal: e.bestTotal,
            bestPercent: e.bestTotal ? Math.round((e.bestScore / e.bestTotal) * 100) : 0,
            attempts: e.attempts
        }))

        const agg = await QuizResult.aggregate([
            { $match: { category } },
            { $group: {
                _id: null,
                avgScore: { $avg: "$score" },
                attempts: { $sum: 1 },
                avgPercent: { $avg: { $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] } }
            } }
        ])

        const summary = agg[0] || { avgScore: 0, attempts: 0, avgPercent: 0 }

        return res.status(200).json({
            category,
            leaderboard: rankedTop,
            summary: {
                avgScore: Math.round(summary.avgScore * 100) / 100,
                avgPercent: Math.round(summary.avgPercent * 100) / 100,
                totalAttempts: summary.attempts
            }
        })
    } catch (error) {
        return res.status(500).json({ message: `category leaderboard error ${error}` })
    }
}

// GET /api/kids/stats/me — logged-in child's own stats + ranks
export const getMyStats = async (req, res) => {
    try {
        const userId = asObjectId(req.userId)
        const since = sinceDaysAgo(7)

        const profile = await KidsProfile.findOne({ userId }).lean()

        const [quizCount, avgAgg, myWeekAgg, alltimeRankAgg] = await Promise.all([
            QuizResult.countDocuments({ userId }),
            QuizResult.aggregate([
                { $match: { userId } },
                { $group: { _id: null, avgScore: { $avg: "$score" }, avgPercent: { $avg: { $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] } } } }
            ]),
            QuizResult.aggregate([
                { $match: { userId, completedAt: { $gte: since } } },
                { $group: { _id: null, stars: { $sum: "$starsEarned" } } }
            ]),
            KidsProfile.aggregate([
                ...activeChildAgg,
                { $match: { stars: { $gt: (profile?.stars || 0) } } },
                { $count: "n" }
            ])
        ])

        const myWeekStars = myWeekAgg[0]?.stars || 0
        let weeklyRank = 0
        if (quizCount > 0) {
            const wk = await QuizResult.aggregate([
                { $match: { completedAt: { $gte: since } } },
                { $group: { _id: "$userId", stars: { $sum: "$starsEarned" } } },
                { $match: { stars: { $gt: myWeekStars } } },
                { $count: "n" }
            ])
            weeklyRank = (wk[0]?.n || 0) + 1
        }

        const avg = avgAgg[0]

        return res.status(200).json({
            totalStars: profile?.stars || 0,
            quizzesTaken: quizCount,
            avgScore: avg ? Math.round(avg.avgScore * 100) / 100 : 0,
            avgPercent: avg ? Math.round(avg.avgPercent * 100) / 100 : 0,
            gamesPlayed: 0,
            weeklyStars: myWeekStars,
            allTimeRank: (alltimeRankAgg[0]?.n || 0) + 1,
            weeklyRank,
            weekStart: since.toISOString()
        })
    } catch (error) {
        return res.status(500).json({ message: `my stats error ${error}` })
    }
}

// GET /api/kids/leaderboard/categories — available quiz categories
export const getLeaderboardCategories = async (req, res) => {
    try {
        const [used, defined] = await Promise.all([
            QuizResult.distinct("category"),
            QuizQuestion.distinct("category")
        ])
        const categories = [...new Set([...defined, ...used])].sort()
        return res.status(200).json({ categories })
    } catch (error) {
        return res.status(500).json({ message: `categories error ${error}` })
    }
}
