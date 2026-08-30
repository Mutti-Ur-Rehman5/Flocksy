import React from 'react'
import { useNavigate } from 'react-router-dom'
import KidsTile from '../../components/kids/KidsTile'
import KidsNav from '../../components/kids/KidsNav'

function KidsGames() {
  const navigate=useNavigate()

  const games=[
    {icon:"🐾",label:"Guess the Animal",path:"/kids/games/animal",color:"from-green-400 to-emerald-500"},
    {icon:"❓",label:"True or False",path:"/kids/games/true-false",color:"from-blue-400 to-blue-500"}
  ]

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-green-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        <button onClick={()=>navigate("/kids")} className='text-purple-500 font-semibold mb-4'>← Back</button>
        <h1 className='text-2xl font-bold text-purple-700 mb-6'>🎮 Mini Games</h1>
        <div className='grid grid-cols-2 gap-4'>
          {games.map((game)=>(
            <KidsTile 
              key={game.path}
              icon={game.icon}
              label={game.label}
              color={game.color}
              onClick={()=>navigate(game.path)}
            />
          ))}
        </div>
      </div>
      <KidsNav/>
    </div>
  )
}

export default KidsGames
