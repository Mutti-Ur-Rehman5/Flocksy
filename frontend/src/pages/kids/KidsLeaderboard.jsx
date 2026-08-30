import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import KidsNav from '../../components/kids/KidsNav'

const RANK_BADGE = { 1: "🥇", 2: "🥈", 3: "🥉" }

function Avatar({ name, avatar, size = "w-10 h-10", text = "text-lg" }) {
  if (avatar) {
    return <img src={avatar} alt={name} className={`${size} rounded-full object-cover`} />
  }
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white ${text} font-bold`}>
      {(name || "?")[0]?.toUpperCase()}
    </div>
  )
}

function LeaderRow({ entry, highlight }) {
  const badge = RANK_BADGE[entry.rank]
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl ${highlight ? "bg-gradient-to-r from-yellow-100 to-pink-100 ring-2 ring-pink-300" : "bg-white"} shadow-sm`}>
      <span className="w-8 text-center text-xl">{badge || <span className="text-base font-bold text-gray-400">{entry.rank}</span>}</span>
      <Avatar name={entry.name} avatar={entry.avatar} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 truncate">{entry.name}{highlight && <span className="ml-1 text-pink-500">(You)</span>}</p>
        {entry.category !== undefined ? (
          <p className="text-xs text-gray-500">{entry.bestPercent}% · {entry.bestScore}/{entry.bestTotal} correct</p>
        ) : (
          <p className="text-xs text-gray-500">{entry.stars} stars earned</p>
        )}
      </div>
      <span className="font-bold text-amber-500">⭐ {entry.stars !== undefined ? entry.stars : `${entry.bestPercent}%`}</span>
    </div>
  )
}

function KidsLeaderboard() {
  const navigate = useNavigate()
  const [allTime, setAllTime] = useState([])
  const [weekly, setWeekly] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState("")
  const [catData, setCatData] = useState(null)
  const [profile, setProfile] = useState(null)
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    const load = async () => {
      try {
        const [stars, week, cats, statsRes, prof] = await Promise.all([
          axios.get(`${serverUrl}/api/kids/leaderboard/stars?limit=10`, { withCredentials: true }),
          axios.get(`${serverUrl}/api/kids/leaderboard/weekly?limit=10`, { withCredentials: true }),
          axios.get(`${serverUrl}/api/kids/leaderboard/categories`, { withCredentials: true }),
          axios.get(`${serverUrl}/api/kids/stats/me`, { withCredentials: true }),
          axios.get(`${serverUrl}/api/kids/profile`, { withCredentials: true })
        ])
        setAllTime(stars.data.leaderboard || [])
        setWeekly(week.data.leaderboard || [])
        setCategories(cats.data.categories || [])
        setSelectedCat(cats.data.categories?.[0] || "")
        setMyStats(statsRes.data)
        setProfile(prof.data)
      } catch (error) {
        console.log(error)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedCat) return
    const loadCat = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/kids/leaderboard/quiz/${selectedCat}`, { withCredentials: true })
        setCatData(res.data)
      } catch (error) {
        console.log(error)
      }
    }
    loadCat()
  }, [selectedCat])

  const nextBadge = (() => {
    const thresholds = profile?.badgeThresholds || []
    const current = profile?.currentBadge
    const idx = thresholds.findIndex(t => t.badgeId === current)
    return thresholds[idx + 1] || null
  })()

  const stars = myStats?.totalStars || 0
  const progressToNext = nextBadge ? Math.min(100, Math.round((stars / nextBadge.starsRequired) * 100)) : 100

  if (loading) {
    return (
      <div className='w-full min-h-screen bg-gradient-to-b from-pink-50 to-white pb-[90px] flex items-center justify-center'>
        <span className='text-4xl animate-bounce'>🏅</span>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-pink-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        <button onClick={() => navigate("/kids")} className='text-pink-500 font-semibold mb-4'>← Back</button>
        <h1 className='text-2xl font-bold text-purple-700 mb-1'>🏅 Leaderboard</h1>
        <p className='text-gray-500 text-base mb-4'>See how you're doing and cheer on your friends!</p>

        {/* My Stats card */}
        <div className='bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white mb-6 shadow-lg'>
          <p className='font-bold text-lg mb-3'>✨ My Progress</p>
          <div className='flex items-center justify-between text-center'>
            <StatBox label="My Rank" value={myStats?.allTimeRank ? `#${myStats.allTimeRank}` : "-"} />
            <StatBox label="Total Stars" value={myStats?.totalStars ?? 0} />
            <StatBox label="Quiz Avg" value={myStats?.avgPercent ? `${myStats.avgPercent}%` : "-"} />
            <StatBox label="This Week" value={myStats?.weeklyStars ?? 0} />
          </div>
          {nextBadge && (
            <div className='mt-4 bg-white/20 rounded-2xl p-3'>
              <div className='flex justify-between items-center text-sm mb-1'>
                <span>{nextBadge.icon} Next: {nextBadge.name}</span>
                <span>{stars}/{nextBadge.starsRequired}</span>
              </div>
              <div className='h-2.5 bg-white/30 rounded-full overflow-hidden'>
                <div className='h-full bg-yellow-300 rounded-full transition-all' style={{ width: `${progressToNext}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* All-time Top 10 */}
        <LeaderSection title="⭐ All-Time Champions">
          {allTime.length === 0 ? <Empty /> : allTime.map(e => <LeaderRow key={e.rank} entry={e} highlight={e.name === userData?.name} />)}
        </LeaderSection>

        {/* This Week Top 10 */}
        <LeaderSection title="🔥 This Week">
          {weekly.length === 0 ? <Empty /> : weekly.map(e => <LeaderRow key={e.rank} entry={e} highlight={e.name === userData?.name} />)}
        </LeaderSection>

        {/* Category leaderboard */}
        <div className='mb-2'>
          <h2 className='text-xl font-bold text-gray-800 mb-3'>🧠 Quiz Champions</h2>
          <div className='flex flex-wrap gap-2 mb-4'>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-full font-semibold capitalize text-sm min-h-[44px] transition-colors ${selectedCat === cat ? "bg-purple-500 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          {catData && (
            <div className='mb-2'>
              <p className='text-sm text-gray-500 mb-3'>Average score across all kids: <span className='font-bold text-purple-600'>{catData.summary.avgPercent}%</span> ({catData.summary.totalAttempts} quizzes played)</p>
              <div className='space-y-2'>
                {catData.leaderboard.length === 0 ? <Empty /> : catData.leaderboard.map(e => <LeaderRow key={e.rank} entry={{ ...e, stars: undefined }} highlight={e.name === userData?.name} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <KidsNav />
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className='flex-1'>
      <p className='text-2xl font-bold'>{value}</p>
      <p className='text-xs opacity-90 mt-0.5'>{label}</p>
    </div>
  )
}

function LeaderSection({ title, children }) {
  return (
    <div className='mb-6'>
      <h2 className='text-xl font-bold text-gray-800 mb-3'>{title}</h2>
      <div className='space-y-2'>{children}</div>
    </div>
  )
}

function Empty() {
  return <p className='text-gray-400 text-sm py-4 text-center'>No scores yet — go play a quiz to get on the board! 🎉</p>
}

export default KidsLeaderboard
