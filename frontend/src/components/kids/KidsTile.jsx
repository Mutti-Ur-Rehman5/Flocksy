import React from 'react'

function KidsTile({icon,label,onClick,color="from-yellow-400 to-pink-400"}) {
  return (
    <div 
      onClick={onClick}
      onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onClick&&onClick()}}}
      role="button"
      tabIndex={0}
      aria-label={label}
      className={`w-full aspect-square bg-gradient-to-br ${color} rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 p-4 min-h-[140px]`}
    >
      <span className="text-5xl">{icon}</span>
      <span className="text-white font-bold text-lg text-center leading-tight">{label}</span>
    </div>
  )
}

export default KidsTile
