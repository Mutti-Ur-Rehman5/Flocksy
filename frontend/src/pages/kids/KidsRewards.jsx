import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import KidsNav from '../../components/kids/KidsNav'

function KidsRewards() {
  const [profile,setProfile]=useState(null)
  const navigate=useNavigate()

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

  if(!profile){
    return (
      <div className='w-full min-h-screen bg-gradient-to-b from-amber-50 to-white pb-[90px] flex items-center justify-center'>
        <span className='text-4xl animate-bounce'>🏆</span>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-amber-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        <button onClick={()=>navigate("/kids")} className='text-purple-500 font-semibold mb-4'>← Back</button>
        
        {/* Star Total */}
        <div className='bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 text-white text-center mb-6 shadow-lg'>
          <span className='text-5xl block mb-2'>⭐</span>
          <p className='text-4xl font-bold'>{profile.stars}</p>
          <p className='text-sm opacity-90 mt-1'>Total Stars Earned</p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-3 mb-6'>
          <div className='bg-white rounded-2xl p-4 text-center shadow-md'>
            <span className='text-2xl block'>📖</span>
            <p className='font-bold text-lg text-gray-800'>{profile.completedStories}</p>
            <p className='text-xs text-gray-400'>Stories</p>
          </div>
          <div className='bg-white rounded-2xl p-4 text-center shadow-md'>
            <span className='text-2xl block'>🧠</span>
            <p className='font-bold text-lg text-gray-800'>{profile.completedQuizzes}</p>
            <p className='text-xs text-gray-400'>Quizzes</p>
          </div>
          <div className='bg-white rounded-2xl p-4 text-center shadow-md'>
            <span className='text-2xl block'>🎨</span>
            <p className='font-bold text-lg text-gray-800'>{profile.drawings}</p>
            <p className='text-xs text-gray-400'>Drawings</p>
          </div>
        </div>

        {/* Badges */}
        <h2 className='text-xl font-bold text-gray-800 mb-4'>🏅 Badges</h2>
        <div className='grid grid-cols-3 gap-3'>
          {profile.badgeThresholds?.map((threshold)=>{
            const earned=profile.badges?.some(b=>b.badgeId===threshold.badgeId)
            const progress=Math.min(100,profile.stars>=threshold.starsRequired?100:(profile.stars/threshold.starsRequired)*100)
            return (
              <div key={threshold.badgeId} className={`rounded-2xl p-4 text-center shadow-md transition-all ${earned?"bg-white":"bg-gray-100 opacity-60"}`}>
                <span className={`text-3xl block mb-1 ${earned?"":"grayscale"}`}>{threshold.icon}</span>
                <p className='font-bold text-xs text-gray-700'>{threshold.name}</p>
                {earned?(
                  <p className='text-xs text-green-500 font-semibold mt-1'>Earned! ✅</p>
                ):(
                  <div className='mt-1'>
                    <div className='h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                      <div className='h-full bg-amber-400 rounded-full' style={{width:`${progress}%`}}/>
                    </div>
                    <p className='text-[10px] text-gray-400 mt-0.5'>{profile.stars}/{threshold.starsRequired}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <KidsNav/>
    </div>
  )
}

export default KidsRewards
