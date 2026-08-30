import React from 'react'
import { GoHomeFill } from "react-icons/go";
import { IoBookSharp, IoSparkles, IoColorPalette, IoTrophy } from "react-icons/io5";
import { FaGamepad } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';
import FlockChatWidget from './FlockChatWidget';

function KidsNav() {
  const navigate=useNavigate()
  const location=useLocation()

  const items=[
    {icon:<GoHomeFill className="w-[22px] h-[22px]"/>,label:"Home",path:"/kids"},
    {icon:<IoBookSharp className="w-[22px] h-[22px]"/>,label:"Stories",path:"/kids/stories"},
    {icon:<IoSparkles className="w-[22px] h-[22px]"/>,label:"Quiz",path:"/kids/quiz"},
    {icon:<FaGamepad className="w-[22px] h-[22px]"/>,label:"Games",path:"/kids/games"},
    {icon:<IoColorPalette className="w-[22px] h-[22px]"/>,label:"Draw",path:"/kids/canvas"},
    {icon:<IoTrophy className="w-[22px] h-[22px]"/>,label:"Rewards",path:"/kids/rewards"}
  ]

  return (
    <>
      <FlockChatWidget/>
      <div className='w-full bg-white border-t border-gray-200 fixed bottom-0 left-0 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'>
        <div className='max-w-lg mx-auto flex justify-around items-center h-[70px] px-2'>
          {items.map((item)=>(
            <div key={item.path} onClick={()=>navigate(item.path)} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();navigate(item.path)}}} role="button" tabIndex={0} aria-label={item.label} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${location.pathname===item.path?"text-pink-500":"text-gray-400"}`}>
              {item.icon}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default KidsNav
