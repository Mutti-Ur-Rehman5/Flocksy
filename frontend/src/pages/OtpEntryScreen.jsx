import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"
import { serverUrl } from '../App';
import { ClipLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from "../assets/logo2.png"
import logo1 from "../assets/logo.png"

function OtpEntryScreen() {
  const [otpId,setOtpId]=useState(null)
  const [otp,setOtp]=useState(["","","","","",""])
  const [loading,setLoading]=useState(false)
  const [requesting,setRequesting]=useState(false)
  const [err,setErr]=useState("")
  const [success,setSuccess]=useState("")
  const [timeLeft,setTimeLeft]=useState(600)
  const [approvalStatus,setApprovalStatus]=useState(null)
  const [polling,setPolling]=useState(false)
  const inputRefs=useRef([])
  const pollRef=useRef(null)
  const timerRef=useRef(null)

  const navigate=useNavigate()
  const {userData}=useSelector(state=>state.user)

  useEffect(()=>{
    return ()=>{
      if(pollRef.current) clearInterval(pollRef.current)
      if(timerRef.current) clearInterval(timerRef.current)
    }
  },[])

  useEffect(()=>{
    if(timeLeft<=0&&otpId){
      setApprovalStatus("EXPIRED")
      setErr("This request has expired. Please request a new code.")
      if(pollRef.current) clearInterval(pollRef.current)
      if(timerRef.current) clearInterval(timerRef.current)
    }
  },[timeLeft,otpId])

  const startTimer=()=>{
    setTimeLeft(600)
    if(timerRef.current) clearInterval(timerRef.current)
    timerRef.current=setInterval(()=>{
      setTimeLeft(prev=>{
        if(prev<=1){
          clearInterval(timerRef.current)
          return 0
        }
        return prev-1
      })
    },1000)
  }

  const startPolling=(id)=>{
    if(pollRef.current) clearInterval(pollRef.current)
    setPolling(true)
    pollRef.current=setInterval(async ()=>{
      try {
        const result=await axios.get(
          `${serverUrl}/api/otp/status/${id}`,
          {withCredentials:true}
        )
        if(result.data.status==="APPROVED"){
          clearInterval(pollRef.current)
          setPolling(false)
          setApprovalStatus("APPROVED")
          setSuccess("Your parent approved! Redirecting...")
          setTimeout(()=>navigate("/"),2000)
        }else if(result.data.status==="DENIED"){
          clearInterval(pollRef.current)
          setPolling(false)
          setApprovalStatus("DENIED")
          setErr("Your parent denied this request.")
        }else if(result.data.status==="EXPIRED"){
          clearInterval(pollRef.current)
          setPolling(false)
          setApprovalStatus("EXPIRED")
          setErr("This request has expired.")
        }
      } catch (error) {
        // keep polling on transient errors
      }
    },3000)
  }

  const handleRequestOtp=async ()=>{
    setRequesting(true)
    setErr("")
    setSuccess("")
    try {
      const result=await axios.post(
        `${serverUrl}/api/otp/request`,
        {},
        {withCredentials:true}
      )
      setOtpId(result.data.otpId)
      setApprovalStatus("PENDING")
      startTimer()
      startPolling(result.data.otpId)
      setRequesting(false)
    } catch (error) {
      setErr(error.response?.data?.message)
      setRequesting(false)
    }
  }

  const handleOtpChange=(index,value)=>{
    if(!/^\d*$/.test(value)) return
    const newOtp=[...otp]
    newOtp[index]=value.slice(-1)
    setOtp(newOtp)
    if(value&&index<5){
      inputRefs.current[index+1]?.focus()
    }
  }

  const handleKeyDown=(index,e)=>{
    if(e.key==="Backspace"&&!otp[index]&&index>0){
      inputRefs.current[index-1]?.focus()
      const newOtp=[...otp]
      newOtp[index-1]=""
      setOtp(newOtp)
    }
  }

  const handlePaste=(e)=>{
    e.preventDefault()
    const pasted=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6)
    const newOtp=["","","","","",""]
    for(let i=0;i<pasted.length;i++){
      newOtp[i]=pasted[i]
    }
    setOtp(newOtp)
    const nextEmpty=newOtp.findIndex(v=>!v)
    inputRefs.current[nextEmpty===-1?5:nextEmpty]?.focus()
  }

  const handleVerify=async ()=>{
    const otpString=otp.join("")
    if(otpString.length!==6){
      setErr("Please enter all 6 digits")
      return
    }
    setLoading(true)
    setErr("")
    try {
      const result=await axios.post(
        `${serverUrl}/api/otp/verify`,
        {otpId,otp:otpString},
        {withCredentials:true}
      )
      if(result.data.status==="APPROVED"){
        setApprovalStatus("APPROVED")
        setSuccess("Approved! Redirecting...")
        if(pollRef.current) clearInterval(pollRef.current)
        setTimeout(()=>navigate("/"),2000)
      }
      setLoading(false)
    } catch (error) {
      setErr(error.response?.data?.message)
      if(error.response?.data?.status){
        setApprovalStatus(error.response.data.status)
      }
      setLoading(false)
    }
  }

  const formatTime=(seconds)=>{
    const m=Math.floor(seconds/60)
    const s=seconds%60
    return `${m}:${s.toString().padStart(2,"0")}`
  }

  if(approvalStatus==="APPROVED"){
    return (
      <div className='w-full h-screen bg-gradient-to-tr from-pink-400 via-orange-300 to-yellow-300 flex justify-center items-center'>
        <div className='w-[90%] lg:max-w-[60%] h-[600px] bg-white rounded-3xl flex overflow-hidden shadow-2xl'>
          <div className='w-full lg:w-[50%] flex flex-col items-center justify-center p-6 gap-5'>
            <div className='text-6xl mb-2'>✅</div>
            <h2 className='text-2xl font-bold text-green-600'>Approved!</h2>
            <p className='text-gray-600 text-center'>Your parent approved your request.</p>
            <p className='text-gray-600 text-center'>Redirecting to Adult Mode...</p>
          </div>
          <div className='hidden lg:flex w-[50%] flex-col justify-center items-center text-white bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 rounded-l-3xl shadow-lg'>
            <img src={logo1} alt="" className='w-40 animate-pulse'/>
            <p className='mt-4 text-lg font-bold'>Welcome to Adult Mode!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full h-screen bg-gradient-to-tr from-pink-400 via-orange-300 to-yellow-300 flex justify-center items-center'>
      <div className='w-[90%] lg:max-w-[60%] h-[600px] bg-white rounded-3xl flex overflow-hidden shadow-2xl'>

        {/* LEFT SIDE */}
        <div className='w-full lg:w-[50%] flex flex-col items-center p-6 gap-5 justify-center'>

          <div className='flex gap-2 items-center text-2xl font-bold text-purple-700 mt-4 animate-bounce'>
            <img src={logo} alt="" className='w-14'/>
            <span>Switch to Adult Mode</span>
          </div>
          <p className='text-gray-500 text-center text-base mb-2'>
            Ask your parent to check their email for the approval code.
          </p>

          {!otpId ? (
            <button
              className='w-[60%] h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50'
              onClick={handleRequestOtp}
              disabled={requesting}
            >
              {requesting ? <ClipLoader size={25} color='white'/> : "Send Approval Request"}
            </button>
          ) : (
            <>
              {/* COUNTDOWN */}
              <div className='text-center mb-2'>
                <p className='text-base text-gray-500'>Code expires in</p>
                <p className={`text-2xl font-bold ${timeLeft<60?'text-red-500':'text-purple-600'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>

              {/* OTP INPUT */}
              <div className='flex justify-center gap-3 mb-3'>
                {otp.map((digit,index)=>(
                  <input
                    key={index}
                    ref={el=>inputRefs.current[index]=el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`OTP digit ${index+1}`}
                    value={digit}
                    onChange={(e)=>handleOtpChange(index,e.target.value)}
                    onKeyDown={(e)=>handleKeyDown(index,e)}
                    onPaste={index===0?handlePaste:undefined}
                    className='w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl outline-none focus:border-purple-500 transition-colors'
                  />
                ))}
              </div>

              {polling && (
                <p className='text-center text-sm text-blue-500 mb-2 animate-pulse'>
                  Waiting for parent response...
                </p>
              )}

              {err && <p className='text-red-500 text-sm text-center mb-2'>{err}</p>}
              {success && <p className='text-green-500 text-sm text-center mb-2'>{success}</p>}

              <button
                className='w-[60%] h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50'
                onClick={handleVerify}
                disabled={loading||approvalStatus==="DENIED"||approvalStatus==="EXPIRED"||timeLeft<=0}
              >
                {loading ? <ClipLoader size={25} color='white'/> : "Verify Code"}
              </button>

              {(approvalStatus==="DENIED"||approvalStatus==="EXPIRED"||timeLeft<=0) && (
                <button
                  className='w-[60%] h-12 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all duration-300 mt-2'
                  onClick={handleRequestOtp}
                  disabled={requesting}
                >
                  {requesting ? <ClipLoader size={25} color='#555'/> : "Request New Code"}
                </button>
              )}
            </>
          )}

          <p className='text-gray-500 text-sm mt-2'>
            <span className='cursor-pointer hover:underline' onClick={()=>navigate("/")}>
              ← Back to Kids Mode
            </span>
          </p>

        </div>

        {/* RIGHT SIDE */}
        <div className='hidden lg:flex w-[50%] flex-col justify-center items-center text-white bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 rounded-l-3xl shadow-lg'>
          <img src={logo1} alt="" className='w-40 animate-pulse'/>
          <p className='mt-4 text-lg font-bold text-center'>Your parent will approve this request</p>
        </div>

      </div>
    </div>
  )
}

export default OtpEntryScreen
