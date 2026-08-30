import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

function AdminDashboard() {
  const [stats,setStats]=useState(null)
  const [loading,setLoading]=useState(true)
  const navigate=useNavigate()

  useEffect(()=>{
    const fetchStats=async ()=>{
      try {
        const result=await axios.get(`${serverUrl}/api/admin/dashboard`,{withCredentials:true})
        setStats(result.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  },[])

  if(loading){
    return (
      <div className='w-full min-h-screen bg-gray-50 flex items-center justify-center'>
        <ClipLoader size={40} color="#7c3aed"/>
      </div>
    )
  }

  const cards=[
    {label:"Kids Users",value:stats?.totalKids||0,icon:"👶",color:"bg-blue-500"},
    {label:"Stories",value:stats?.totalStories||0,icon:"📖",color:"bg-purple-500"},
    {label:"Quiz Questions",value:stats?.totalQuizQuestions||0,icon:"🧠",color:"bg-green-500"},
    {label:"Animals",value:stats?.totalAnimals||0,icon:"🐾",color:"bg-amber-500"},
    {label:"True/False",value:stats?.totalTrueFalse||0,icon:"❓",color:"bg-blue-400"},
    {label:"OTP Requests",value:stats?.totalOtpRequests||0,icon:"🔐",color:"bg-pink-500"},
    {label:"Flagged Chats",value:stats?.flaggedChats||0,icon:"🚩",color:"bg-red-500"}
  ]

  const sections=[
    {label:"User Management",path:"/admin/users",icon:"👥",desc:"Search, activate, deactivate, delete users & reset passwords"},
    {label:"Adult Content",path:"/admin/adult-content",icon:"🖼️",desc:"Review & remove posts, loops, stories, comments"},
    {label:"Analytics",path:"/admin/analytics",icon:"📊",desc:"User totals, content volume, engagement, moderation"},
    {label:"Kids Content",path:"/admin/content",icon:"📚",desc:"Manage stories, quizzes, badges & game assets"},
    {label:"Flagged Chat",path:"/admin/flagged-chat",icon:"🚩",desc:"Review flagged FlockChat messages"},
    {label:"OTP Audit Log",path:"/admin/otp-audit",icon:"🔐",desc:"View approval/denial history"}
  ]

  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
            <p className='text-gray-500 mt-1'>Flocksy Kids Mode Administration</p>
          </div>
          <button onClick={()=>navigate("/")} className='text-purple-600 font-semibold hover:text-purple-800 transition-colors'>
            ← Back to App
          </button>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          {cards.map((card,i)=>(
            <div key={i} className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
              <div className='flex items-center gap-3'>
                <span className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-white text-lg`}>{card.icon}</span>
                <div>
                  <p className='text-2xl font-bold text-gray-800'>{card.value}</p>
                  <p className='text-xs text-gray-500'>{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Sections */}
        <div className='grid md:grid-cols-3 gap-4'>
          {sections.map((section,i)=>(
            <div key={i} onClick={()=>navigate(section.path)} className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer'>
              <span className='text-3xl block mb-3'>{section.icon}</span>
              <h3 className='text-lg font-bold text-gray-800 mb-1'>{section.label}</h3>
              <p className='text-sm text-gray-500'>{section.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
