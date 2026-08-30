import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

function AdminFlaggedChat() {
  const [messages,setMessages]=useState([])
  const [stats,setStats]=useState(null)
  const [page,setPage]=useState(1)
  const [totalPages,setTotalPages]=useState(1)
  const [total,setTotal]=useState(0)
  const [loading,setLoading]=useState(true)
  const [historyModal,setHistoryModal]=useState(null)
  const [historyLoading,setHistoryLoading]=useState(false)
  const navigate=useNavigate()

  const fetchMessages=async (p=1)=>{
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/admin/chat/flagged?page=${p}`,{withCredentials:true})
      setMessages(result.data.messages)
      setPage(result.data.page)
      setTotalPages(result.data.totalPages)
      setTotal(result.data.total)
    } catch (error) {console.log(error)}
    setLoading(false)
  }

  const fetchStats=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/admin/chat/stats`,{withCredentials:true})
      setStats(result.data)
    } catch (error) {console.log(error)}
  }

  useEffect(()=>{fetchMessages(page);fetchStats()},[page])

  const handleDismiss=async (id)=>{
    try {
      await axios.put(`${serverUrl}/api/admin/chat/flagged/${id}/dismiss`,{},{withCredentials:true})
      fetchMessages(page)
      fetchStats()
    } catch (error) {console.log(error)}
  }

  const handleDelete=async (id)=>{
    if(!confirm("Permanently delete this message?")) return
    try {
      await axios.delete(`${serverUrl}/api/admin/chat/flagged/${id}`,{withCredentials:true})
      fetchMessages(page)
      fetchStats()
    } catch (error) {console.log(error)}
  }

  const openHistory=async (childId,name)=>{
    if(!childId) return
    setHistoryLoading(true)
    setHistoryModal({childId,name,messages:[]})
    try {
      const result=await axios.get(`${serverUrl}/api/admin/mgmt/chat/child/${childId}?limit=50`,{withCredentials:true})
      setHistoryModal({childId,name,messages:result.data.messages})
    } catch (error) {console.log(error);setHistoryModal(m=>({...m,messages:[]}))}
    setHistoryLoading(false)
  }

  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <button onClick={()=>navigate("/admin")} className='text-purple-600 text-sm font-semibold mb-4'>← Dashboard</button>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>FlockChat Flagged Messages</h1>

        {/* Stats */}
        {stats&&(
          <div className='grid grid-cols-3 gap-3 mb-6'>
            <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center'>
              <p className='text-2xl font-bold text-gray-800'>{stats.totalMessages}</p>
              <p className='text-xs text-gray-500'>Total Messages</p>
            </div>
            <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center'>
              <p className='text-2xl font-bold text-red-500'>{stats.flaggedMessages}</p>
              <p className='text-xs text-gray-500'>Flagged</p>
            </div>
            <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center'>
              <p className='text-2xl font-bold text-blue-500'>{stats.activeChildren}</p>
              <p className='text-xs text-gray-500'>Active Kids</p>
            </div>
          </div>
        )}

        {loading?<div className='text-center py-10'><ClipLoader size={30} color="#7c3aed"/></div>:messages.length===0?(
          <div className='text-center py-16 text-gray-400'>
            <span className='text-4xl block mb-3'>✅</span>
            <p>No flagged messages to review!</p>
          </div>
        ):(
          <div className='space-y-3'>
            <p className='text-sm text-gray-500'>{total} flagged message{total!==1?"s":""}</p>
            {messages.map(msg=>(
              <div key={msg._id} className='bg-white rounded-xl p-4 shadow-sm border border-red-100'>
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex items-center gap-2'>
                    <span className='w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600'>
                      {msg.childId?.name?.[0]||"?"}
                    </span>
                    <div>
                      <p className='font-semibold text-sm text-gray-800'>{msg.childId?.name||"Unknown"} (@{msg.childId?.userName||"?"})</p>
                      <p className='text-xs text-gray-400'>{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${msg.role==="user"?"bg-blue-100 text-blue-600":"bg-purple-100 text-purple-600"}`}>{msg.role}</span>
                </div>
                <p className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-2'>{msg.text}</p>
                {msg.flagReason&&<p className='text-xs text-red-500 mb-2'>Reason: {msg.flagReason}</p>}
                <div className='flex gap-2 flex-wrap'>
                  <button onClick={()=>openHistory(msg.childId?._id,msg.childId?.name||"Unknown")} className='px-3 py-1 bg-purple-500 text-white rounded text-xs font-semibold hover:bg-purple-600'>View Child History</button>
                  <button onClick={()=>handleDismiss(msg._id)} className='px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600'>Dismiss Flag</button>
                  <button onClick={()=>handleDelete(msg._id)} className='px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600'>Delete Message</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages>1&&(
          <div className='flex justify-center gap-2 mt-6'>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className='px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50'>Prev</button>
            <span className='px-3 py-1 text-sm text-gray-600'>Page {page}/{totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className='px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50'>Next</button>
          </div>
        )}

        {/* Chat History Modal */}
        {historyModal&&(
          <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setHistoryModal(null)}>
            <div className='bg-white rounded-xl p-5 max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col' onClick={e=>e.stopPropagation()}>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='font-bold text-gray-800'>Chat History — {historyModal.name}</h3>
                <button onClick={()=>setHistoryModal(null)} className='text-gray-400 hover:text-gray-600'>✕</button>
              </div>
              {historyLoading
                ? <div className='text-center py-10'><ClipLoader size={28} color="#7c3aed"/></div>
                : historyModal.messages.length===0
                  ? <p className='text-center text-gray-400 py-8'>No chat history.</p>
                  : (
                    <div className='space-y-2 overflow-y-auto pr-1'>
                      {historyModal.messages.map(m=>(
                        <div key={m._id} className='flex items-start gap-2'>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full mt-0.5 font-semibold ${m.role==="user"?"bg-blue-100 text-blue-600":"bg-purple-100 text-purple-600"}`}>{m.role}</span>
                          <div className='flex-1'>
                            <p className={`text-sm ${m.role==="user"?"text-gray-800":"text-purple-700"} bg-gray-50 rounded-lg px-3 py-2`}>{m.text}</p>
                            <p className='text-[10px] text-gray-400 mt-0.5'>{new Date(m.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminFlaggedChat
