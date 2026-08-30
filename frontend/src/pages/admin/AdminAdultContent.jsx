import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

const TABS=[{key:"post",label:"Posts"},{key:"loop",label:"Loops"},{key:"story",label:"Stories"},{key:"comment",label:"Comments"}]

function AdminAdultContent() {
  const [type,setType]=useState("post")
  const [items,setItems]=useState([])
  const [total,setTotal]=useState(0)
  const [page,setPage]=useState(1)
  const [totalPages,setTotalPages]=useState(1)
  const [loading,setLoading]=useState(true)
  const [confirm,setConfirm]=useState(null)
  const [deleting,setDeleting]=useState(false)
  const navigate=useNavigate()

  const fetchContent=useCallback(async (p=1)=>{
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/admin/mgmt/adult-content?type=${type}&page=${p}&limit=10`,{withCredentials:true})
      setItems(result.data.items||[])
      setTotal(result.data.total||0)
      setPage(result.data.page||1)
      setTotalPages(result.data.totalPages||1)
    } catch (error) {console.log(error)}
    setLoading(false)
  },[type])

  useEffect(()=>{ fetchContent(page) },[type,page])

  const doDelete=async ()=>{
    if(!confirm) return
    setDeleting(true)
    try {
      await axios.delete(`${serverUrl}/api/admin/mgmt/adult-content/${confirm.type}/${confirm.id}`,{withCredentials:true})
      setConfirm(null)
      await fetchContent(page)
    } catch (error) {console.log(error)}
    setDeleting(false)
  }

  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <button onClick={()=>navigate("/admin")} className='text-purple-600 text-sm font-semibold mb-2'>← Dashboard</button>
            <h1 className='text-2xl font-bold text-gray-800'>Adult Content & Moderation</h1>
            <p className='text-gray-500 text-sm'>Review and remove user-generated content</p>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-4'>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>{setType(t.key);setPage(1)}} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${type===t.key?"bg-purple-600 text-white":"bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4'>
          {loading
            ? <div className='text-center py-10'><ClipLoader size={30} color="#7c3aed"/></div>
            : (
              <>
                <div className={`grid gap-3 ${type==="comment"?"":"md:grid-cols-2"}`}>
                  {items.map((it,i)=>(
                    <div key={it._id+String(i)} className='border border-gray-200 rounded-xl p-3 flex gap-3 items-start'>
                      {mediaThumb(it,type)}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <div className='w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0'>{it.author?.profileImage?<img src={it.author.profileImage} alt="" className='w-full h-full object-cover'/>:<span className='w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold'>{it.author?.name?.[0]}</span>}</div>
                          <p className='font-semibold text-gray-800 text-sm truncate'>{it.author?.name} <span className='text-gray-400 font-normal'>@{it.author?.userName}</span></p>
                        </div>
                        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{it.caption||it.message||"(no text)"}</p>
                        <div className='flex items-center gap-3 mt-1 text-xs text-gray-400'>
                          <span>{new Date(it.createdAt).toLocaleString()}</span>
                          {it.mediaType==="video"&&<span>🎬 Video</span>}
                          {type==="post"&&<span>❤️ {it.likes?.length||0}</span>}
                          {type==="comment"&&<span className='text-purple-500'>on {it.contentType}</span>}
                        </div>
                      </div>
                      <button onClick={()=>setConfirm({type,id:it._id,caption:it.caption||it.message})} className='px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold flex-shrink-0'>Delete</button>
                    </div>
                  ))}
                </div>
                {items.length===0&&<p className='text-center text-gray-500 py-8'>No {TABS.find(t=>t.key===type)?.label.toLowerCase()} found</p>}
              </>
            )
          }
        </div>

        {/* Pagination */}
        {totalPages>1&&(
          <div className='flex items-center justify-center gap-2'>
            <button disabled={page<=1} onClick={()=>setPage(page-1)} className='px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40'>Prev</button>
            <span className='text-sm text-gray-600'>Page {page} of {totalPages} · {total} items</span>
            <button disabled={page>=totalPages} onClick={()=>setPage(page+1)} className='px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40'>Next</button>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirm&&(
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setConfirm(null)}>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl' onClick={e=>e.stopPropagation()}>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>Delete Content</h3>
            <p className='text-gray-600 text-sm mb-4'>Are you sure you want to permanently delete this {confirm.type}? {confirm.caption?`"${confirm.caption}"`:""} This action is logged and cannot be undone.</p>
            <div className='flex gap-2 justify-end'>
              <button onClick={()=>setConfirm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold'>Cancel</button>
              <button onClick={doDelete} disabled={deleting} className='px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700'>{deleting?<ClipLoader size={16} color="white"/>:"Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function mediaThumb(it,type){
  const mediaUrl=type==="comment"?null:(it.media||it.image)
  if(type==="comment"){
    if(it.media) return <div className='w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0'>{it.mediaType!=="video"?<img src={it.media} alt="" className='w-full h-full object-cover'/>:<span className='w-full h-full flex items-center justify-center text-gray-400'>🎬</span>}</div>
    return <div className='w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400'>💬</div>
  }
  if(!mediaUrl) return <div className='w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400'>📝</div>
  if(it.mediaType==="video") return <div className='w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400'>🎬</div>
  return <div className='w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0'><img src={mediaUrl} alt="" className='w-full h-full object-cover'/></div>
}

export default AdminAdultContent
