import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import KidsButton from '../../components/kids/KidsButton'
import KidsNav from '../../components/kids/KidsNav'

const CATEGORIES=[
  {id:"generalKnowledge",label:"General Knowledge",icon:"🌍",color:"from-blue-400 to-blue-500"},
  {id:"science",label:"Science",icon:"🔬",color:"from-green-400 to-green-500"},
  {id:"math",label:"Math",icon:"🔢",color:"from-orange-400 to-orange-500"},
  {id:"moral",label:"Moral Values",icon:"💝",color:"from-pink-400 to-pink-500"},
  {id:"nature",label:"Nature",icon:"🌿",color:"from-emerald-400 to-emerald-500"},
  {id:"history",label:"History",icon:"📜",color:"from-amber-400 to-amber-500"}
]

function KidsQuiz() {
  const [phase,setPhase]=useState("category")
  const [category,setCategory]=useState(null)
  const [questions,setQuestions]=useState([])
  const [currentIndex,setCurrentIndex]=useState(0)
  const [selectedAnswer,setSelectedAnswer]=useState(null)
  const [score,setScore]=useState(0)
  const [quizResult,setQuizResult]=useState(null)
  const [loading,setLoading]=useState(false)
  const navigate=useNavigate()

  const handleSelectCategory=async (cat)=>{
    setCategory(cat)
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/kids/quiz/${cat.id}`,{withCredentials:true})
      setQuestions(result.data)
      setPhase("quiz")
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const handleAnswer=(index)=>{
    if(selectedAnswer!==null) return
    setSelectedAnswer(index)
    const correct=index===questions[currentIndex].correctAnswer
    if(correct) setScore(prev=>prev+1)
  }

  const handleNext=()=>{
    if(currentIndex<questions.length-1){
      setCurrentIndex(prev=>prev+1)
      setSelectedAnswer(null)
    }else{
      finishQuiz()
    }
  }

  const finishQuiz=async ()=>{
    setPhase("result")
    try {
      const result=await axios.post(`${serverUrl}/api/kids/quiz/result`,{
        category:category.id,
        score,
        totalQuestions:questions.length
      },{withCredentials:true})
      setQuizResult(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  if(phase==="category"){
    return (
      <div className='w-full min-h-screen bg-gradient-to-b from-purple-50 to-white pb-[90px]'>
        <div className='max-w-lg mx-auto px-4 pt-6'>
          <button onClick={()=>navigate("/kids")} className='text-purple-500 font-semibold mb-4'>← Back</button>
          <h1 className='text-2xl font-bold text-purple-700 mb-6'>🧠 Choose a Quiz</h1>
          <div className='grid grid-cols-2 gap-3'>
            {CATEGORIES.map((cat)=>(
              <div key={cat.id} onClick={()=>handleSelectCategory(cat)} className={`bg-gradient-to-br ${cat.color} rounded-2xl p-5 text-center cursor-pointer hover:scale-105 transition-transform shadow-md`}>
                <span className='text-4xl block mb-2'>{cat.icon}</span>
                <span className='text-white font-bold'>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <KidsNav/>
      </div>
    )
  }

  if(phase==="result"){
    return (
      <div className='w-full min-h-screen bg-gradient-to-b from-green-50 to-white pb-[90px]'>
        <div className='max-w-lg mx-auto px-4 pt-6 text-center'>
          <span className='text-6xl block mb-4'>🎉</span>
          <h1 className='text-3xl font-bold text-purple-700 mb-2'>Quiz Complete!</h1>
          <p className='text-gray-500 mb-6'>{category.label}</p>
          
          <div className='bg-white rounded-2xl p-6 shadow-md mb-6'>
            <p className='text-5xl font-bold text-purple-600'>{score}/{questions.length}</p>
            <p className='text-gray-500 mt-2'>
              {score===questions.length?"Perfect score! 🌟":score>=questions.length/2?"Great job! 👏":"Keep trying! 💪"}
            </p>
          </div>

          {quizResult&&(
            <div className='bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6'>
              <p className='text-amber-600 font-bold'>⭐ You earned {quizResult.starsEarned} stars!</p>
              <p className='text-gray-500 text-sm'>Total: {quizResult.totalStars} stars</p>
            </div>
          )}

          <div className='flex flex-col gap-3'>
            <KidsButton onClick={()=>{setPhase("category");setCurrentIndex(0);setScore(0);setSelectedAnswer(null);setQuizResult(null)}}>Play Again</KidsButton>
            <KidsButton onClick={()=>navigate("/kids")} variant="secondary">Back to Home</KidsButton>
          </div>
        </div>
        <KidsNav/>
      </div>
    )
  }

  const q=questions[currentIndex]
  const isCorrect=selectedAnswer===q?.correctAnswer

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-purple-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        <button onClick={()=>{setPhase("category");setCurrentIndex(0);setScore(0);setSelectedAnswer(null)}} className='text-purple-500 font-semibold mb-4'>← Quit</button>
        
        {/* Progress */}
        <div className='flex items-center gap-2 mb-6'>
          <div className='flex-1 h-3 bg-gray-200 rounded-full overflow-hidden'>
            <div className='h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all' style={{width:`${((currentIndex+1)/questions.length)*100}%`}}/>
          </div>
          <span className='text-sm font-bold text-purple-600'>{currentIndex+1}/{questions.length}</span>
        </div>

        <div className='bg-white rounded-2xl p-6 shadow-md mb-6'>
          <p className='text-lg font-bold text-gray-800 mb-6'>{q?.question}</p>
          <div className='space-y-3'>
            {q?.options.map((opt,index)=>(
              <button 
                key={index}
                onClick={()=>handleAnswer(index)}
                className={`w-full p-4 rounded-xl text-left font-semibold transition-all duration-200 min-h-[48px] ${
                  selectedAnswer!==null
                    ?index===q.correctAnswer?"bg-green-100 border-2 border-green-400 text-green-700"
                    :index===selectedAnswer?"bg-red-100 border-2 border-red-400 text-red-700"
                    :"bg-gray-50 border-2 border-gray-200 text-gray-500"
                    :"bg-gray-50 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700"
                }`}
                disabled={selectedAnswer!==null}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {selectedAnswer!==null&&(
          <div className='text-center'>
            <p className={`font-bold mb-4 ${isCorrect?"text-green-600":"text-red-500"}`}>
              {isCorrect?"Correct! ✅":"Not quite ❌"}
            </p>
            <KidsButton onClick={handleNext}>
              {currentIndex<questions.length-1?"Next Question":"See Results"}
            </KidsButton>
          </div>
        )}
      </div>
      <KidsNav/>
    </div>
  )
}

export default KidsQuiz
