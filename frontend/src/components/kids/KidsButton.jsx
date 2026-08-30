import React from 'react'
import { ClipLoader } from 'react-spinners'

function KidsButton({children,onClick,loading=false,disabled=false,variant="primary",className=""}) {
  const variants={
    primary:"bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:scale-105",
    secondary:"bg-white text-purple-600 border-2 border-purple-300 hover:bg-purple-50",
    success:"bg-gradient-to-r from-green-400 to-green-500 text-white hover:scale-105",
    danger:"bg-gradient-to-r from-red-400 to-red-500 text-white hover:scale-105"
  }

  return (
    <button
      className={`min-h-[44px] px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled||loading}
    >
      {loading?<ClipLoader size={25} color={variant==="primary"||variant==="success"||variant==="danger"?"white":"#7c3aed"}/>:children}
    </button>
  )
}

export default KidsButton
