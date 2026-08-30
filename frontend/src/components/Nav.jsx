import React from 'react'
import { GoHomeFill } from "react-icons/go";
import { FiSearch } from "react-icons/fi";
import { RxVideo } from "react-icons/rx";
import { FiPlusSquare } from "react-icons/fi";
import { IoSparkles } from "react-icons/io5";
import dp from "../assets/dp.webp"
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentMode } from '../redux/modeSlice';
import AdultChatWidget from './AdultChatWidget';

function Nav() {
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const {userData}=useSelector(state=>state.user)
  const {currentMode}=useSelector(state=>state.mode)
  return (
    <>
      {userData?.role==="ADULT"&&currentMode!=="KIDS"&&<AdultChatWidget/>}
    <div className='w-[90%] lg:w-[40%] h-[80px] bg-black flex justify-around items-center fixed bottom-[20px] rounded-full shadow-2xl shadow-[#000000] z-[100]'>
      <div onClick={()=>navigate("/")} role="button" tabIndex={0} aria-label="Home"><GoHomeFill className='text-white cursor-pointer w-[25px] h-[25px]'/></div>
     <div onClick={()=>navigate("/search")} role="button" tabIndex={0} aria-label="Search"><FiSearch className='text-white cursor-pointer w-[25px] h-[25px]'/></div>
     <div onClick={()=>navigate("/upload")} role="button" tabIndex={0} aria-label="Upload"><FiPlusSquare className='text-white cursor-pointer w-[25px] h-[25px]'/></div>
     <div onClick={()=>navigate("/loops")} role="button" tabIndex={0} aria-label="Loops"><RxVideo className='text-white cursor-pointer w-[28px] h-[28px]'/></div>
     {userData?.role==="ADULT"&&currentMode!=="KIDS"&&(
       <div onClick={()=>dispatch(setCurrentMode("KIDS"))} title="Switch to Kids Mode">
         <IoSparkles className='text-yellow-400 cursor-pointer w-[25px] h-[25px] hover:scale-125 transition-transform'/>
       </div>
     )}
     {userData?.role==="ADULT"&&currentMode==="KIDS"&&(
       <div onClick={()=>dispatch(setCurrentMode("ADULT"))} title="Switch to Adult Mode">
         <span className='text-purple-400 cursor-pointer text-xs font-bold hover:text-purple-300 transition-colors'>ADULT</span>
       </div>
     )}
     <div className='w-[40px] h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={()=>navigate(`/profile/${userData.userName}`)}>
         <img src={userData.profileImage || dp} alt="" className='w-full object-cover'/>
     </div>
    </div>
    </>
  )
}

export default Nav
