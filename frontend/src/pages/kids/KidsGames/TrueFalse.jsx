import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../../App'
import { useNavigate } from 'react-router-dom'
import KidsButton from '../../../components/kids/KidsButton'
import KidsNav from '../../../components/kids/KidsNav'

function TrueFalse() {
  const [game,setGame]=useState(null)
  const [selected,setSelected]=useState(null)
  const [score,setScore]=useState(0)
  const [rounds,setRounds]=useState(0)
  const [loading,setLoading]=useState(false)
  const navigate=useNavigate()
  const totalRounds=5

  const fetchGame=async ()=>{
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/kids/games/truefalse`,{withCredentials:true})
      setGame(result.data)
      setSelected(null)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(()=>{fetchGame()},[])

  const handleAnswer=(answer)=>{
    if(selected) return
    setSelected(answer)
    if(answer===game.isTrue) setScore(prev=>prev+1)
    setRounds(prev=>prev+1)
  }

  const handleNext=()=>{
    if(rounds<totalRounds){
      fetchGame()
    }
  }

  if(rounds>=totalRounds){
    return (
      <div className='w-full min-h-screen bg-gradient-to-b from-blue-50 to-white pb-[90px]'>
        <div className='max-w-lg mx-auto px-4 pt-6 text-center'>
          <span className='text-6xl block mb-4'>🎉</span>
          <h1 className='text-3xl font-bold text-blue-600 mb-2'>Game Over!</h1>
          <p className='text-gray-500 text-base mb-6'>True or False</p>
          <div className='bg-white rounded-2xl p-6 shadow-md mb-6'>
            <p className='text-5xl font-bold text-blue-600'>{score}/{totalRounds}</p>
            <p className='text-gray-500 mt-2'>
              {score===totalRounds?"Perfect! You're a genius! 🧠":score>=3?"Nice work! 👏":"Keep learning! 📚"}
            </p>
          </div>
          <div className='flex flex-col gap-3'>
            <KidsButton onClick={()=>{setScore(0);setRounds(0);fetchGame()}} className="bg-gradient-to-r from-blue-400 to-blue-500">Play Again</KidsButton>
            <KidsButton onClick={()=>navigate("/kids/games")} variant="secondary">More Games</KidsButton>
          </div>
        </div>
        <KidsNav/>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-blue-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        <button onClick={()=>navigate("/kids/games")} className='text-purple-500 font-semibold mb-4'>← Back</button>
        
        <div className='flex items-center justify-between mb-4'>
          <span className='text-sm font-bold text-gray-500'>Round {rounds+1}/{totalRounds}</span>
          <span className='text-sm font-bold text-blue-600'>Score: {score}</span>
        </div>

        {loading?(
          <div className='text-center py-20'>
            <span className='text-5xl animate-bounce block'>❓</span>
            <p className='text-gray-400 mt-4'>Loading...</p>
          </div>
        ):game&&(
          <>
            <div className='bg-white rounded-3xl p-8 shadow-md text-center mb-6'>
              <p className='text-xl font-bold text-gray-800 leading-relaxed'>{game.statement}</p>
            </div>

            <div className='flex gap-4 mb-4'>
              <button 
                onClick={()=>handleAnswer(true)}
                className={`flex-1 p-6 rounded-2xl font-bold text-2xl transition-all duration-200 min-h-[80px] ${
                  selected!==null
                    ?game.isTrue===true?"bg-green-100 border-2 border-green-400 text-green-700"
                    :selected===true?"bg-red-100 border-2 border-red-400 text-red-700"
                    :"bg-gray-50 border-2 border-gray-200 text-gray-400"
                    :"bg-green-50 border-2 border-green-200 hover:border-green-400 hover:bg-green-100 text-green-700 shadow-sm"
                }`}
                disabled={selected!==null}
              >
                ✅ True
              </button>
              <button 
                onClick={()=>handleAnswer(false)}
                className={`flex-1 p-6 rounded-2xl font-bold text-2xl transition-all duration-200 min-h-[80px] ${
                  selected!==null
                    ?game.isTrue===false?"bg-green-100 border-2 border-green-400 text-green-700"
                    :selected===false?"bg-red-100 border-2 border-red-400 text-red-700"
                    :"bg-gray-50 border-2 border-gray-200 text-gray-400"
                    :"bg-red-50 border-2 border-red-200 hover:border-red-400 hover:bg-red-100 text-red-700 shadow-sm"
                }`}
                disabled={selected!==null}
              >
                ❌ False
              </button>
            </div>

            {selected!==null&&(
              <div className={`rounded-2xl p-4 mb-4 text-center ${selected===game.isTrue?"bg-green-50":"bg-red-50"}`}>
                <p className={`font-bold ${selected===game.isTrue?"text-green-600":"text-red-500"}`}>
                  {selected===game.isTrue?"Correct! ✅":"Not quite ❌"} The answer is {game.isTrue?"True":"False"}
                </p>
              </div>
            )}

            {selected!==null&&(
              <KidsButton onClick={handleNext} className="w-full">
                {rounds+1<totalRounds?"Next Statement":"See Results"}
              </KidsButton>
            )}
          </>
        )}
      </div>
      <KidsNav/>
    </div>
  )
}

export default TrueFalse
