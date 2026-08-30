import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

function AdminAnalytics() {
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const navigate=useNavigate()

  useEffect(()=>{
    const fetch=async ()=>{
      try {
        const result=await axios.get(`${serverUrl}/api/admin/mgmt/analytics`,{withCredentials:true})
        setData(result.data)
      } catch (error) {console.log(error)}
      setLoading(false)
    }
    fetch()
  },[])

  if(loading) return <div className='w-full min-h-screen bg-gray-50 flex items-center justify-center'><ClipLoader size={30} color="#7c3aed"/></div>

  const T=()=>data.totals||{}
  const C=()=>data.content||{}
  const E=()=>data.engagement||{}
  const M=()=>data.moderation||{}
  const K=()=>data.kidsEngagement||{}

  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='mb-6'>
          <button onClick={()=>navigate("/admin")} className='text-purple-600 text-sm font-semibold mb-2'>← Dashboard</button>
          <h1 className='text-2xl font-bold text-gray-800'>Analytics</h1>
          <p className='text-gray-500 text-sm'>Platform usage and engagement overview</p>
        </div>

        <Section title="User Totals">
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            <Stat label="Adults" value={T().adults||0} color="bg-pink-50 text-pink-600"/>
            <Stat label="Kids" value={T().kids||0} color="bg-blue-50 text-blue-600"/>
            <Stat label="Admins" value={T().admins||0} color="bg-purple-50 text-purple-600"/>
            <Stat label="Total Users" value={T().users||0} color="bg-green-50 text-green-600"/>
          </div>
        </Section>

        <Section title="Content Volume">
          <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
            <Stat label="Posts" value={C().posts||0} color="bg-indigo-50 text-indigo-600"/>
            <Stat label="Loops" value={C().loops||0} color="bg-cyan-50 text-cyan-600"/>
            <Stat label="Stories" value={C().stories||0} color="bg-amber-50 text-amber-600"/>
            <Stat label="Posts Today" value={C().postsToday||0} color="bg-red-50 text-red-600"/>
            <Stat label="Loops Today" value={C().loopsToday||0} color="bg-teal-50 text-teal-600"/>
          </div>
        </Section>

        <Section title="Engagement">
          <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
            <Stat label="Quizzes" value={E().quizzes||0} color="bg-blue-50 text-blue-600"/>
            <Stat label="Total Stars" value={E().totalStars||0} color="bg-yellow-50 text-yellow-600"/>
            <Stat label="Chats" value={E().chats||0} color="bg-green-50 text-green-600"/>
            <Stat label="Flagged Chats" value={E().flaggedChats||0} color="bg-red-50 text-red-600"/>
            <Stat label="Active Today" value={data.activeToday||0} color="bg-purple-50 text-purple-600"/>
          </div>
        </Section>

        <Section title="Kids Mode Engagement">
          <div className='grid grid-cols-1 md:grid-cols-4 gap-3 mb-3'>
            <Stat label="Avg Stars / Child" value={K().avgStarsPerChild||0} color="bg-yellow-50 text-yellow-600"/>
            <Stat label="Active Children" value={K().activeChildren||0} color="bg-blue-50 text-blue-600"/>
          </div>
          {K().topCategory&&(
            <div className='text-sm text-gray-600 space-y-1 mb-2'>
              <p>🏆 Most Popular Quiz Category: <span className='font-semibold capitalize'>{K().topCategory.category}</span> ({K().topCategory.attempts} attempts, ⭐ {K().topCategory.totalStars})</p>
            </div>
          )}
          {K().topWeek&&(
            <p className='text-sm text-gray-600'>📅 Most Active Week: <span className='font-semibold'>{K().topWeek.week}</span> ({K().topWeek.attempts} quizzes, ⭐ {K().topWeek.totalStars})</p>
          )}
          {!K().topCategory&&<p className='text-sm text-gray-400'>No quiz activity yet.</p>}
        </Section>

        <Section title="Moderation Activity">
          <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
            <Stat label="Rejected" value={M().rejected||0} color="bg-red-50 text-red-600"/>
            <Stat label="Restored" value={M().restored||0} color="bg-green-50 text-green-600"/>
            <Stat label="Overturned" value={M().overturned||0} color="bg-amber-50 text-amber-600"/>
            <Stat label="Deleted" value={M().deleted||0} color="bg-gray-100 text-gray-600"/>
            <Stat label="Flagged by AI" value={M().flaggedByAI||0} color="bg-purple-50 text-purple-600"/>
          </div>
        </Section>

        <Section title="Signups (Last 7 Days)">
          <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
            {(data.sevenDaySignups||[]).map(s=>(
              <Stat key={s._id} label={s._id} value={s.count} color="bg-indigo-50 text-indigo-600"/>
            ))}
            {(data.sevenDaySignups||[]).length===0&&<p className='text-gray-500 col-span-full text-sm'>No signups recorded yet.</p>}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({title,children}){
  return (
    <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4'>
      <h2 className='font-bold text-gray-800 mb-3'>{title}</h2>
      {children}
    </div>
  )
}

function Stat({label,value,color}){
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className='text-2xl font-bold'>{value}</p>
      <p className='text-xs font-semibold mt-1'>{label}</p>
    </div>
  )
}

export default AdminAnalytics
