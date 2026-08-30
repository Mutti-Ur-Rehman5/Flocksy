import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import KidsTile from '../../components/kids/KidsTile'
import KidsNav from '../../components/kids/KidsNav'
import { useSelector } from 'react-redux'

function KidsHome() {
  const [profile,setProfile]=useState(null)
  const navigate=useNavigate()
  const {userData}=useSelector(state=>state.user)

  useEffect(()=>{
    const fetchProfile=async ()=>{
      try {
        const result=await axios.get(`${serverUrl}/api/kids/profile`,{withCredentials:true})
        setProfile(result.data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchProfile()
  },[])

  const tiles=[
    {icon:"📖",label:"Stories",path:"/kids/stories",color:"from-blue-400 to-blue-500"},
    {icon:"🧠",label:"Quiz",path:"/kids/quiz",color:"from-purple-400 to-purple-500"},
    {icon:"🎮",label:"Games",path:"/kids/games",color:"from-green-400 to-green-500"},
    {icon:"🎨",label:"Drawing",path:"/kids/canvas",color:"from-orange-400 to-red-400"},
    {icon:"🏆",label:"Rewards",path:"/kids/rewards",color:"from-yellow-400 to-amber-500"},
    {icon:"🏅",label:"Leaderboard",path:"/kids/leaderboard",color:"from-pink-400 to-rose-500"}
  ]

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-yellow-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-purple-700'>Hi, {userData?.name}! 👋</h1>
            <p className='text-gray-500 text-base'>What would you like to do today?</p>
          </div>
          {profile&&(
            <div className='bg-white rounded-2xl px-4 py-2 shadow-md flex items-center gap-2'>
              <span className='text-xl'>⭐</span>
              <span className='font-bold text-lg text-amber-500'>{profile.stars}</span>
            </div>
          )}
        </div>

        {/* Badge */}
        {profile&&(
          <div className='bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-6 text-white flex items-center gap-3'>
            <span className='text-3xl'>{profile.badges?.length>0?profile.badges[profile.badges.length-1].icon:"🌟"}</span>
            <div>
              <p className='font-bold text-lg'>{profile.currentBadge?profile.currentBadge.replace(/_/g," "):"Newcomer"}</p>
              <p className='text-sm opacity-90'>{profile.stars} stars earned</p>
            </div>
          </div>
        )}

        {/* Tiles Grid */}
        <div className='grid grid-cols-2 gap-4'>
          {tiles.map((tile)=>(
            <KidsTile 
              key={tile.path}
              icon={tile.icon}
              label={tile.label}
              color={tile.color}
              onClick={()=>navigate(tile.path)}
            />
          ))}
        </div>

        {/* Switch to Adult Mode */}
        {userData?.role==="CHILD"&&(
          <div className='mt-6 text-center'>
            <button onClick={()=>navigate("/otp-verify")} className='text-gray-400 text-base hover:text-gray-600 transition-colors py-2 px-4 min-h-[44px]'>
              Switch to Adult Mode →
            </button>
          </div>
        )}
      </div>
      <KidsNav/>
    </div>
  )
}

export default KidsHome
