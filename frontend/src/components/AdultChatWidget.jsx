import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { IoChatbubbleEllipses, IoClose, IoSend } from "react-icons/io5"
import { ClipLoader } from 'react-spinners'

function AdultChatWidget() {
  const [isOpen,setIsOpen]=useState(false)
  const [messages,setMessages]=useState([])
  const [input,setInput]=useState("")
  const [loading,setLoading]=useState(false)
  const [rateLimited,setRateLimited]=useState(false)
  const messagesEndRef=useRef(null)
  const inputRef=useRef(null)

  useEffect(()=>{
    if(isOpen){
      loadHistory()
      setTimeout(()=>inputRef.current?.focus(),100)
    }
  },[isOpen])

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  const loadHistory=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/adult/chat/history`,{withCredentials:true})
      if(result.data.messages?.length>0){
        setMessages(result.data.messages)
      }else{
        setMessages([{role:"assistant",text:"Hi! I'm Flocksy Assist. Ask me about crafting a post or caption, productivity tips, general knowledge, and more."}])
      }
    } catch (error) {
      setMessages([{role:"assistant",text:"Hi! I'm Flocksy Assist. Ask me about crafting a post or caption, productivity tips, general knowledge, and more."}])
    }
  }

  const handleSend=async ()=>{
    if(!input.trim()||loading||rateLimited) return

    const userMessage=input.trim()
    setInput("")
    setMessages(prev=>[...prev,{role:"user",text:userMessage}])
    setLoading(true)

    try {
      const result=await axios.post(`${serverUrl}/api/adult/chat`,{message:userMessage},{withCredentials:true})
      setMessages(prev=>[...prev,{role:"assistant",text:result.data.reply,flagged:result.data.flagged}])
    } catch (error) {
      if(error.response?.status===429){
        setRateLimited(true)
        setMessages(prev=>[...prev,{role:"assistant",text:"You're sending messages pretty fast. Give it a moment and try again."}])
        setTimeout(()=>setRateLimited(false),(error.response.data?.retryAfter||60)*1000)
      }else{
        setMessages(prev=>[...prev,{role:"assistant",text:"Hmm, something went wrong. Please try again in a moment."}])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown=(e)=>{
    if(e.key==="Enter"&&!e.shiftKey){
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!isOpen&&(
        <button 
          onClick={()=>setIsOpen(true)}
          className='fixed bottom-[85px] right-5 z-[200] w-14 h-14 rounded-full bg-black shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center'
          aria-label="Open Flocksy Assist"
        >
          <IoChatbubbleEllipses className="w-7 h-7 text-white"/>
        </button>
      )}

      {isOpen&&(
        <div className='fixed bottom-[85px] right-4 z-[200] w-[340px] max-w-[calc(100vw-32px)] h-[460px] max-h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200'>
          <div className='bg-black px-4 py-3 flex items-center justify-between shrink-0'>
            <div className='flex items-center gap-2'>
              <span className='text-xl'>✨</span>
              <div>
                <h3 className='text-white font-bold text-sm'>Flocksy Assist</h3>
                <p className='text-white/70 text-[10px]'>AI helper for creators</p>
              </div>
            </div>
            <button onClick={()=>setIsOpen(false)} className='text-white/70 hover:text-white transition-colors' aria-label="Close chat">
              <IoClose className="w-6 h-6"/>
            </button>
          </div>

          <div className='flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50'>
            {messages.map((msg,i)=>(
              <div key={i} className={`flex ${msg.role==="user"?"justify-end":"justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role==="user"
                    ?"bg-black text-white rounded-br-md"
                    :"bg-white text-gray-700 border border-gray-200 shadow-sm rounded-bl-md"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading&&(
              <div className='flex justify-start'>
                <div className='bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-md px-4 py-3'>
                  <ClipLoader size={16} color="#000"/>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          <div className='px-3 py-2 border-t border-gray-200 bg-white shrink-0'>
            <div className='flex items-center gap-2'>
              <input 
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={rateLimited?"Wait a moment...":"Type a message..."}
                disabled={loading||rateLimited}
                className='flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400 disabled:opacity-50 min-h-[40px]'
                maxLength={1000}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()||loading||rateLimited}
                className='w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shrink-0'
                aria-label="Send message"
              >
                {loading?<ClipLoader size={16} color="white"/>:<IoSend className="w-4 h-4"/>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdultChatWidget
