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

function KidsSignup() {
  const [inputClicked,setInputClicked]=useState({
    name:false,
    userName:false,
    childEmail:false,
    parentEmail:false,
    password:false,
    dateOfBirth:false
  })
  const [showPassword,setShowPassword]=useState(false)
  const [loading,setLoading]=useState(false)
  const [name,setName]=useState("")
  const [userName,setUserName]=useState("")
  const [childEmail,setChildEmail]=useState("")
  const [parentEmail,setParentEmail]=useState("")
  const [password,setPassword]=useState("")
  const [dateOfBirth,setDateOfBirth]=useState("")
  const [err,setErr]=useState("")

  const navigate=useNavigate()
  const dispatch=useDispatch()

  const handleSignUp=async ()=>{
    setLoading(true)
    setErr("")
    try {
      const result=await axios.post(
        `${serverUrl}/api/auth/signup/child`,
        {name,userName,childEmail,parentEmail,password,dateOfBirth},
        {withCredentials:true}
      )
      dispatch(setUserData(result.data))
      setToken(result.data.token)
      navigate("/kids")
      setLoading(false)
    } catch (error) {
      setErr(error.response?.data?.message)
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-screen bg-gradient-to-tr from-pink-400 via-orange-300 to-yellow-300 flex justify-center items-center'>
      <div className='w-[90%] lg:max-w-[60%] h-[700px] bg-white rounded-3xl flex overflow-hidden shadow-2xl'>

        {/* LEFT SIDE */}
        <div className='w-full lg:w-[50%] flex flex-col items-center p-6 gap-5 justify-center'>

          <div className='flex gap-2 items-center text-2xl font-bold text-purple-700 mt-4 animate-bounce'>
            <img src={logo} alt="Kids Sign Up" className='w-14'/>
            <span>Kids Sign Up</span>
          </div>

          <p className='text-gray-500 text-base text-center -mt-2'>Create an account for your child</p>

          {/* INPUTS */}
          {[
            {id:"name", label:"Child's Name", value:name, set:setName},
            {id:"userName", label:"Choose a Username", value:userName, set:setUserName}
          ].map((field)=>(
            <div key={field.id}
              className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300'
              onClick={()=>setInputClicked({...inputClicked,[field.id]:true})}
            >
              <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked[field.id]?"-top-3 text-purple-500 font-semibold":""}`}>
                {field.label}
              </label>
              <input 
                type="text"
                aria-label={field.label}
                className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
                value={field.value}
                onChange={(e)=>field.set(e.target.value)}
              />
            </div>
          ))}

          {/* CHILD EMAIL */}
          <div className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300'
            onClick={()=>setInputClicked({...inputClicked,childEmail:true})}
          >
            <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked.childEmail?"-top-3 text-purple-500 font-semibold":""}`}>
              Child's Email (for login)
            </label>
            <input 
              type="email"
              aria-label="Child's Email"
              className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
              value={childEmail}
              onChange={(e)=>setChildEmail(e.target.value)}
            />
          </div>

          {/* PARENT EMAIL */}
          <div className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300'
            onClick={()=>setInputClicked({...inputClicked,parentEmail:true})}
          >
            <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked.parentEmail?"-top-3 text-purple-500 font-semibold":""}`}>
              Parent/Guardian Email
            </label>
            <input 
              type="email"
              aria-label="Parent or Guardian Email"
              className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
              value={parentEmail}
              onChange={(e)=>setParentEmail(e.target.value)}
            />
            <p className='absolute -bottom-5 left-3 text-xs text-gray-400'>Used only to ask your parent before switching to Adult Mode</p>
          </div>

          {/* DATE OF BIRTH */}
          <div className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300 mt-2'
            onClick={()=>setInputClicked({...inputClicked,dateOfBirth:true})}
          >
            <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked.dateOfBirth?"-top-3 text-purple-500 font-semibold":""}`}>
              Date of Birth
            </label>
            <input 
              type="date"
              aria-label="Date of Birth"
              className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
              value={dateOfBirth}
              onChange={(e)=>setDateOfBirth(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300 mt-2'
            onClick={()=>setInputClicked({...inputClicked,password:true})}
          >
            <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked.password?"-top-3 text-purple-500 font-semibold":""}`}>
              Create Password
            </label>
            <input 
              type={showPassword?"text":"password"}
              aria-label="Create Password"
              className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
            {!showPassword ?
              <IoIosEye className='absolute right-3 top-3 text-gray-500 cursor-pointer' aria-label="Show password" onClick={()=>setShowPassword(true)}/>
              :
              <IoIosEyeOff className='absolute right-3 top-3 text-gray-500 cursor-pointer' aria-label="Hide password" onClick={()=>setShowPassword(false)}/>
            }
          </div>

          {err && <p className='text-red-500 text-sm font-medium'>{err}</p>}

          {/* BUTTON */}
          <button 
            className='w-[60%] h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg'
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? <ClipLoader size={25} color='white'/> : "Create Kids Account"}
          </button>

          <p className='text-gray-700'>
            Already have an account? 
            <span className='text-purple-600 cursor-pointer ml-1 hover:underline' onClick={()=>navigate("/kids/login")}>
              Kids Login
            </span>
          </p>
          <p className='text-gray-700'>
            Want to sign up as an adult? 
            <span className='text-purple-600 cursor-pointer ml-1 hover:underline' onClick={()=>navigate("/signup")}>
              Adult Sign Up
            </span>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className='hidden lg:flex w-[50%] flex-col justify-center items-center text-white bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 rounded-l-3xl shadow-lg'>
          <img src={logo1} alt="Flocksy Kids" className='w-40 animate-pulse'/>
          <p className='mt-4 text-lg font-bold text-center'>Welcome to Kids Mode!</p>
          <p className='mt-2 text-base text-center opacity-90'>Read stories, take quizzes, play games, and earn badges!</p>
        </div>

      </div>
    </div>
  )
}

export default KidsSignup
