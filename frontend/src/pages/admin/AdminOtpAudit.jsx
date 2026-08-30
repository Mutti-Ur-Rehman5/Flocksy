import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

const STATUS_COLORS={
  APPROVED:"bg-green-100 text-green-600",
  DENIED:"bg-red-100 text-red-600",
  PENDING:"bg-amber-100 text-amber-600",
  EXPIRED:"bg-gray-100 text-gray-500"
}

function AdminOtpAudit() {
  const [records,setRecords]=useState([])
  const [stats,setStats]=useState(null)
  const [page,setPage]=useState(1)
  const [totalPages,setTotalPages]=useState(1)
  const [total,setTotal]=useState(0)
  const [filter,setFilter]=useState("")
  const [loading,setLoading]=useState(true)
  const navigate=useNavigate()

  const fetchRecords=async (p=1)=>{
    setLoading(true)
    try {
      const url=filter?`${serverUrl}/api/admin/otp/logs?page=${p}&status=${filter}`:`${serverUrl}/api/admin/otp/logs?page=${p}`
      const result=await axios.get(url,{withCredentials:true})
      setRecords(result.data.records)
      setPage(result.data.page)
      setTotalPages(result.data.totalPages)
      setTotal(result.data.total)
    } catch (error) {console.log(error)}
    setLoading(false)
  }

  const fetchStats=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/admin/otp/stats`,{withCredentials:true})
      setStats(result.data)
    } catch (error) {console.log(error)}
  }

  useEffect(()=>{fetchRecords(page);fetchStats()},[page,filter])

  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 py-8'>
        <button onClick={()=>navigate("/admin")} className='text-purple-600 text-sm font-semibold mb-4'>← Dashboard</button>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>OTP Audit Log</h1>

        {/* Stats */}
        {stats&&(
          <div className='grid grid-cols-5 gap-3 mb-6'>
            <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center'>
              <p className='text-xl font-bold text-gray-800'>{stats.total}</p>
              <p className='text-xs text-gray-500'>Total</p>
            </div>
            <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center'>
              <p className='text-xl font-bold text-green-500'>{stats.approved}</p>
              <p className='text-xs text-gray-500'>Approved</p>
            </div>
            <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center'>
              <p className='text-xl font-bold text-red-500'>{stats.denied}</p>
              <p className='text-xs text-gray-500'>Denied</p>
            </div>
            <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center'>
              <p className='text-xl font-bold text-amber-500'>{stats.pending}</p>
              <p className='text-xs text-gray-500'>Pending</p>
            </div>
            <div className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center'>
              <p className='text-xl font-bold text-gray-400'>{stats.expired}</p>
              <p className='text-xs text-gray-500'>Expired</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className='flex gap-2 mb-4'>
          {["","APPROVED","DENIED","PENDING","EXPIRED"].map(s=>(
            <button key={s} onClick={()=>{setFilter(s);setPage(1)}} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filter===s?"bg-purple-600 text-white":"bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              {s||"All"}
            </button>
          ))}
        </div>

        {loading?<div className='text-center py-10'><ClipLoader size={30} color="#7c3aed"/></div>:records.length===0?(
          <div className='text-center py-16 text-gray-400'>
            <span className='text-4xl block mb-3'>🔐</span>
            <p>No OTP records found</p>
          </div>
        ):(
          <>
            <p className='text-sm text-gray-500 mb-3'>{total} record{total!==1?"s":""}</p>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-100 bg-gray-50'>
                    <th className='text-left px-4 py-3 font-semibold text-gray-600'>Child</th>
                    <th className='text-left px-4 py-3 font-semibold text-gray-600'>Target Email</th>
                    <th className='text-left px-4 py-3 font-semibold text-gray-600'>Status</th>
                    <th className='text-left px-4 py-3 font-semibold text-gray-600'>Attempts</th>
                    <th className='text-left px-4 py-3 font-semibold text-gray-600'>Created</th>
                    <th className='text-left px-4 py-3 font-semibold text-gray-600'>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r=>(
                    <tr key={r._id} className='border-b border-gray-50 hover:bg-gray-50'>
                      <td className='px-4 py-3'>
                        <p className='font-semibold text-gray-800'>{r.userId?.name||"Unknown"}</p>
                        <p className='text-xs text-gray-400'>@{r.userId?.userName||"?"}</p>
                      </td>
                      <td className='px-4 py-3 text-gray-600 text-xs'>{r.targetEmail}</td>
                      <td className='px-4 py-3'>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[r.approvalStatus]||"bg-gray-100 text-gray-500"}`}>{r.approvalStatus}</span>
                      </td>
                      <td className='px-4 py-3 text-gray-600'>{3-r.attemptsRemaining}/3</td>
                      <td className='px-4 py-3 text-gray-500 text-xs'>{new Date(r.createdAt).toLocaleString()}</td>
                      <td className='px-4 py-3 text-gray-500 text-xs'>{new Date(r.expiresAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {totalPages>1&&(
          <div className='flex justify-center gap-2 mt-6'>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className='px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50'>Prev</button>
            <span className='px-3 py-1 text-sm text-gray-600'>Page {page}/{totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className='px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50'>Next</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOtpAudit
