import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../../App'
import { useNavigate } from 'react-router-dom'
import KidsButton from '../../../components/kids/KidsButton'
import KidsNav from '../../../components/kids/KidsNav'

function GuessTheAnimal() {
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
      const result=await axios.get(`${serverUrl}/api/kids/games/animal`,{withCredentials:true})
      setGame(result.data)
      setSelected(null)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  useEffect(()=>{fetchGame()},[])

  const handleAnswer=(name)=>{
    if(selected) return
    setSelected(name)
    if(name===game.correctAnswer) setScore(prev=>prev+1)
    setRounds(prev=>prev+1)
  }

  const handleNext=()=>{
    if(rounds<totalRounds){
      fetchGame()
    }
  }

  if(rounds>=totalRounds){
    return (
      <div className='w-full min-h-screen bg-gradient-to-b from-green-50 to-white pb-[90px]'>
        <div className='max-w-lg mx-auto px-4 pt-6 text-center'>
          <span className='text-6xl block mb-4'>🎉</span>
          <h1 className='text-3xl font-bold text-green-600 mb-2'>Game Over!</h1>
          <p className='text-gray-500 text-base mb-6'>Guess the Animal</p>
          <div className='bg-white rounded-2xl p-6 shadow-md mb-6'>
            <p className='text-5xl font-bold text-green-600'>{score}/{totalRounds}</p>
            <p className='text-gray-500 mt-2'>
              {score===totalRounds?"Perfect! You're an animal expert! 🏆":score>=3?"Great job! 👏":"Keep learning! 📚"}
            </p>
          </div>
          <div className='flex flex-col gap-3'>
            <KidsButton onClick={()=>{setScore(0);setRounds(0);fetchGame()}} variant="success">Play Again</KidsButton>
            <KidsButton onClick={()=>navigate("/kids/games")} variant="secondary">More Games</KidsButton>
          </div>
        </div>
        <KidsNav/>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-green-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        <button onClick={()=>navigate("/kids/games")} className='text-purple-500 font-semibold mb-4'>← Back</button>
        
        <div className='flex items-center justify-between mb-4'>
          <span className='text-sm font-bold text-gray-500'>Round {rounds+1}/{totalRounds}</span>
          <span className='text-sm font-bold text-green-600'>Score: {score}</span>
        </div>

        {loading?(
          <div className='text-center py-20'>
            <span className='text-5xl animate-bounce block'>🐾</span>
            <p className='text-gray-400 mt-4'>Loading...</p>
          </div>
        ):game&&(
          <>
            <div className='bg-white rounded-3xl p-8 shadow-md text-center mb-6'>
              <p className='text-8xl mb-4'>{game.emoji}</p>
              <p className='text-gray-500 text-base'>What animal is this?</p>
            </div>

            <div className='grid grid-cols-2 gap-3 mb-4'>
              {game.options.map((opt)=>(
                <button 
                  key={opt}
                  onClick={()=>handleAnswer(opt)}
                  className={`p-4 rounded-xl font-bold text-lg transition-all duration-200 min-h-[48px] ${
                    selected
                      ?opt===game.correctAnswer?"bg-green-100 border-2 border-green-400 text-green-700"
                      :opt===selected?"bg-red-100 border-2 border-red-400 text-red-700"
                      :"bg-gray-50 border-2 border-gray-200 text-gray-400"
                      :"bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 shadow-sm"
                  }`}
                  disabled={!!selected}
                >
                  {opt}
                </button>
              ))}
            </div>

            {selected&&(
              <div className='bg-blue-50 rounded-2xl p-4 mb-4 text-center'>
                <p className='text-sm text-blue-600 font-medium'>💡 {game.fact}</p>
              </div>
            )}

            {selected&&(
              <KidsButton onClick={handleNext} className="w-full">
                {rounds+1<totalRounds?"Next Animal":"See Results"}
              </KidsButton>
            )}
          </>
        )}
      </div>
      <KidsNav/>
    </div>
  )
}

export default GuessTheAnimal
