import React, { useState } from 'react'
import logo from "../../assets/logo2.png"
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { FiShield } from "react-icons/fi";
import axios from "axios"
import { serverUrl } from '../../App';
import { ClipLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../redux/userSlice';

function AdminLogin() {
  const [inputClicked,setInputClicked]=useState({email:false,password:false})
  const [showPassword,setShowPassword]=useState(false)
  const [loading,setLoading]=useState(false)
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [err,setErr]=useState("")

  const navigate=useNavigate()
  const dispatch=useDispatch()

  const handleLogin=async ()=>{
    setLoading(true)
    setErr("")
    try{
      const result=await axios.post(`${serverUrl}/api/admin/auth/login`,{email,password},{withCredentials:true})
      dispatch(setUserData(result.data))
      navigate("/admin")
      setLoading(false)
    }catch(error){
      console.log(error)
      setErr(error.response?.data?.message||"Login failed")
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-screen bg-gradient-to-tr from-pink-400 via-orange-300 to-yellow-300 flex justify-center items-center'>
      <div className='w-[90%] lg:max-w-[60%] h-[600px] bg-white rounded-3xl flex overflow-hidden shadow-2xl'>

        {/* LEFT SIDE */}
        <div className='w-full lg:w-[50%] flex flex-col items-center p-6 gap-5 justify-center'>

          <div className='flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-1 text-sm font-bold mb-1'>
            <FiShield/> Admin Portal
          </div>

          <div className='flex gap-2 items-center text-2xl font-bold text-purple-700 animate-bounce'>
            <img src={logo} alt="" className='w-14'/>
            <span>Admin Sign In</span>
          </div>

          <p className='text-gray-500 text-base text-center -mt-1'>Restricted area. Authorized personnel only.</p>

          {/* EMAIL INPUT */}
          <div className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300'
               onClick={()=>setInputClicked({...inputClicked,email:true})}>
            <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked.email?"-top-3 text-purple-500 font-semibold":""}`}>
              Admin Email
            </label>
            <input 
              type="email"
              aria-label="Admin Email"
              className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD INPUT */}
          <div className='relative w-[90%] h-12 rounded-xl border border-gray-300 bg-white hover:shadow-md transition-all duration-300'
               onClick={()=>setInputClicked({...inputClicked,password:true})}>
            <label className={`absolute left-3 px-1 bg-white text-gray-400 text-sm transition-all duration-300 ${inputClicked.password?"-top-3 text-purple-500 font-semibold":""}`}>
              Password
            </label>
            <input 
              type={showPassword?"text":"password"}
              aria-label="Password"
              className='w-full h-full px-3 bg-transparent text-gray-700 outline-none'
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              onKeyDown={(e)=>e.key==="Enter"&&handleLogin()}
            />
            {!showPassword ? 
              <IoIosEye className='absolute right-3 top-3 text-gray-500 cursor-pointer' aria-label="Show password" onClick={()=>setShowPassword(true)}/> :
              <IoIosEyeOff className='absolute right-3 top-3 text-gray-500 cursor-pointer' aria-label="Hide password" onClick={()=>setShowPassword(false)}/>
            }
          </div>

          {err && <p className='text-red-500 text-sm font-medium'>{err}</p>}

          <button 
            className='w-[60%] h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg'
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <ClipLoader size={25} color='white'/> : "Sign In as Admin"}
          </button>

          <p className='text-gray-500 text-sm'>
            Not an admin? 
            <span className='text-purple-600 cursor-pointer ml-1 hover:underline font-semibold' onClick={()=>navigate("/signin")}>
              Go to User Login
            </span>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className='hidden lg:flex w-[50%] flex-col justify-center items-center text-white bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 rounded-l-3xl shadow-lg'>
          <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4'><FiShield className='w-8 h-8'/></div>
          <p className='text-lg font-bold'>Flocksy Administration</p>
          <p className='mt-2 text-sm opacity-90 text-center'>Manage users, kids content, moderation, and analytics</p>
        </div>

      </div>
    </div>
  )
}

export default AdminLogin
