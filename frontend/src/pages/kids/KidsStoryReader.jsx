import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import KidsButton from '../../components/kids/KidsButton'
import KidsNav from '../../components/kids/KidsNav'

function KidsStoryReader() {
  const [stories,setStories]=useState([])
  const [selectedStory,setSelectedStory]=useState(null)
  const [loading,setLoading]=useState(false)
  const [readResult,setReadResult]=useState(null)
  const navigate=useNavigate()

  useEffect(()=>{
    const fetchStories=async ()=>{
      try {
        const result=await axios.get(`${serverUrl}/api/kids/stories`,{withCredentials:true})
        setStories(result.data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchStories()
  },[])

  const handleReadStory=async (id)=>{
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/kids/stories/${id}`,{withCredentials:true})
      setSelectedStory(result.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const handleMarkRead=async ()=>{
    try {
      const result=await axios.post(`${serverUrl}/api/kids/stories/${selectedStory._id}/read`,{},{withCredentials:true})
      setReadResult(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  if(selectedStory){
    return (
      <div className='w-full min-h-screen bg-white pb-[90px]'>
        <div className='max-w-lg mx-auto px-4 pt-6'>
          <button onClick={()=>{setSelectedStory(null);setReadResult(null)}} className='text-purple-500 font-semibold mb-4'>← Back to Stories</button>
          
          {selectedStory.coverImage&&(
            <img src={selectedStory.coverImage} alt="" className='w-full h-48 object-cover rounded-2xl mb-4'/>
          )}
          
          <div className='flex items-center gap-2 mb-2'>
            <span className='bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full'>{selectedStory.category}</span>
            <span className='bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full'>{selectedStory.readingLevel}</span>
          </div>
          
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>{selectedStory.title}</h1>
          <p className='text-gray-700 leading-relaxed text-lg whitespace-pre-wrap'>{selectedStory.content}</p>
          
          {readResult?(
            <div className='mt-6 bg-green-50 border border-green-200 rounded-2xl p-6 text-center'>
              <span className='text-4xl'>🎉</span>
              <p className='text-green-600 font-bold text-xl mt-2'>You earned {readResult.starsEarned} stars!</p>
              <p className='text-gray-500 mt-1'>Total: {readResult.totalStars} ⭐</p>
            </div>
          ):(
            <div className='mt-6'>
              <KidsButton onClick={handleMarkRead} variant="success" className="w-full">
                ⭐ Mark as Read & Earn Stars
              </KidsButton>
            </div>
          )}
        </div>
        <KidsNav/>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-blue-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        <button onClick={()=>navigate("/kids")} className='text-purple-500 font-semibold mb-4'>← Back</button>
        <h1 className='text-2xl font-bold text-purple-700 mb-6'>📖 Moral Stories</h1>
        
        {stories.length===0?(
          <p className='text-gray-400 text-center mt-10'>No stories available yet. Check back soon!</p>
        ):(
          <div className='space-y-3'>
            {stories.map((story)=>(
              <div key={story._id} onClick={()=>handleReadStory(story._id)} className='bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4'>
                {story.coverImage?(
                  <img src={story.coverImage} alt="" className='w-16 h-16 rounded-xl object-cover'/>
                ):(
                  <div className='w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-3xl'>📖</div>
                )}
                <div className='flex-1'>
                  <h3 className='font-bold text-gray-800'>{story.title}</h3>
                  <div className='flex gap-2 mt-1'>
                    <span className='text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full'>{story.category}</span>
                    <span className='text-xs text-amber-500'>⭐ {story.starsAwarded}</span>
                  </div>
                </div>
                <span className='text-gray-300 text-xl'>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <KidsNav/>
    </div>
  )
}

export default KidsStoryReader
