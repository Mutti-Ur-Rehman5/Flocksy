import React, { useState } from 'react'
import logo from "../assets/logo2.png"
import logo1 from "../assets/logo.png"
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import axios from "axios"
import { serverUrl } from '../App';
import { ClipLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { setToken } from '../auth';

function KidsLogin() {
  const [inputClicked,setInputClicked]=useState({userName:false,password:false})
  const [showPassword,setShowPassword]=useState(false)
  const [loading,setLoading]=useState(false)
  const [userName,setUserName]=useState("")
  const [password,setPassword]=useState("")
  const [err,setErr]=useState("")

  const navigate=useNavigate()
  const dispatch=useDispatch()

  const handleSignIn=async ()=>{
    setLoading(true)
    setErr("")
    try{
      const result=await axios.post(`${serverUrl}/api/auth/signin`,{userName,password},{withCredentials:true})
      setToken(result.data.token)
      dispatch(setUserData(result.data))
      if(result.data.role==="CHILD"){
        navigate("/kids")
      }else{
        navigate("/")
      }
      setLoading(false)
    }catch(error){
      console.log(error)
      setErr(error.response?.data?.message)
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-screen bg-gradient-to-tr from-pink-400 via-orange-300 to-yellow-300 flex justify-center items-center'>
      <div className='w-[90%] lg:max-w-[60%] h-[600px] bg-white rounded-3xl flex overflow-hidden shadow-2xl'>

        {/* LEFT SIDE */}
        <div className='w-full lg:w-[50%] flex flex-col items-center p-6 gap-5 justify-center'>

          <div className='flex gap-2 items-center text-2xl font-bold text-purple-700 mt-4 animate-bounce'>
            <img src={logo} alt="" className='w-14'/>
            <span>Kids Login</span>
          </div>

          <p className='text-gray-500 text-base text-center -mt-2'>Welcome back! Sign in to your Kids account.</p>

          {/* USERNAME INPUT */}
          <div className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300'
               onClick={()=>setInputClicked({...inputClicked,userName:true})}>
            <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked.userName?"-top-3 text-purple-500 font-semibold":""}`}>
              Enter Username
            </label>
            <input 
              type="text"
              aria-label="Username"
              className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
              value={userName}
              onChange={(e)=>setUserName(e.target.value)}
            />
          </div>

          {/* PASSWORD INPUT */}
          <div className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300'
               onClick={()=>setInputClicked({...inputClicked,password:true})}>
            <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked.password?"-top-3 text-purple-500 font-semibold":""}`}>
              Enter Password
            </label>
            <input 
              type={showPassword?"text":"password"}
              aria-label="Password"
              className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
            {!showPassword ? 
              <IoIosEye className='absolute right-3 top-3 text-gray-500 cursor-pointer' aria-label="Show password" onClick={()=>setShowPassword(true)}/> :
              <IoIosEyeOff className='absolute right-3 top-3 text-gray-500 cursor-pointer' aria-label="Hide password" onClick={()=>setShowPassword(false)}/>
            }
          </div>

          <div className='w-[90%] px-[20px] cursor-pointer text-purple-600 font-medium hover:underline transition-all duration-200'
               onClick={()=>navigate("/forgot-password")}>
            Forgot Password
          </div>

          {err && <p className='text-red-500 text-sm font-medium'>{err}</p>}

          <button 
            className='w-[60%] h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg'
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? <ClipLoader size={25} color='white'/> : "Sign In"}
          </button>

          <p className='text-gray-700'>
            Don't have an account? 
            <span className='text-purple-600 cursor-pointer ml-1 hover:underline' onClick={()=>navigate("/kids-signup")}>
              Kids Sign Up
            </span>
          </p>

          <p className='text-gray-500 text-sm'>
            Are you an adult? 
            <span className='text-purple-600 cursor-pointer ml-1 hover:underline' onClick={()=>navigate("/signin")}>
              Adult Sign In
            </span>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className='hidden lg:flex w-[50%] flex-col justify-center items-center text-white bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 rounded-l-3xl shadow-lg'>
          <img src={logo1} alt="" className='w-40 animate-pulse'/>
          <p className='mt-4 text-lg font-bold'>Welcome Back to Flocksy Kids!</p>
        </div>

      </div>
    </div>
  )
}

export default KidsLogin
