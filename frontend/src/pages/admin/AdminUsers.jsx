import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

function AdminUsers() {
  const [users,setUsers]=useState([])
  const [total,setTotal]=useState(0)
  const [page,setPage]=useState(1)
  const [totalPages,setTotalPages]=useState(1)
  const [search,setSearch]=useState("")
  const [roleFilter,setRoleFilter]=useState("ALL")
  const [statusFilter,setStatusFilter]=useState("ALL")
  const [loading,setLoading]=useState(true)
  const [detail,setDetail]=useState(null)
  const [confirm,setConfirm]=useState(null)
  const [resetForm,setResetForm]=useState(null)
  const [msg,setMsg]=useState("")
  const navigate=useNavigate()

  const fetchUsers=useCallback(async (p=1)=>{
    setLoading(true)
    try {
      const params=new URLSearchParams({page:p,limit:15})
      if(search) params.set("search",search)
      if(roleFilter!=="ALL") params.set("role",roleFilter)
      if(statusFilter!=="ALL") params.set("status",statusFilter)
      const result=await axios.get(`${serverUrl}/api/admin/mgmt/users?${params}`,{withCredentials:true})
      setUsers(result.data.users)
      setTotal(result.data.total)
      setPage(result.data.page)
      setTotalPages(result.data.totalPages)
    } catch (error) {console.log(error)}
    setLoading(false)
  },[search,roleFilter,statusFilter])

  useEffect(()=>{ fetchUsers(page) },[page,search,roleFilter,statusFilter])

  const openDetail=async (id)=>{
    try {
      const result=await axios.get(`${serverUrl}/api/admin/mgmt/users/${id}`,{withCredentials:true})
      setDetail(result.data)
    } catch (error) {console.log(error)}
  }

  const doToggle=async ()=>{
    if(!confirm) return
    try {
      await axios.put(`${serverUrl}/api/admin/mgmt/users/${confirm._id}/toggle-active`,{},{withCredentials:true})
      setConfirm(null)
      if(detail&&detail.user._id===confirm._id) setDetail(null)
      await fetchUsers(page)
    } catch (error) {setMsg(error.response?.data?.message||"Action failed")}
  }

  const doDelete=async ()=>{
    if(!confirm) return
    try {
      await axios.delete(`${serverUrl}/api/admin/mgmt/users/${confirm._id}`,{withCredentials:true})
      setConfirm(null)
      if(detail&&detail.user._id===confirm._id) setDetail(null)
      await fetchUsers(page)
    } catch (error) {setMsg(error.response?.data?.message||"Delete failed")}
  }

  const doReset=async ()=>{
    if(!resetForm) return
    try {
      await axios.put(`${serverUrl}/api/admin/mgmt/users/${resetForm._id}/reset-password`,{newPassword:resetForm.newPassword},{withCredentials:true})
      setResetForm(null)
      setMsg("")
    } catch (error) {setMsg(error.response?.data?.message||"Reset failed")}
  }

  const roleBadge=(role)=>role==="CHILD"?"bg-blue-100 text-blue-700":role==="ADMIN"?"bg-purple-100 text-purple-700":"bg-pink-100 text-pink-700"

  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <button onClick={()=>navigate("/admin")} className='text-purple-600 text-sm font-semibold mb-2'>← Dashboard</button>
            <h1 className='text-2xl font-bold text-gray-800'>User Management</h1>
            <p className='text-gray-500 text-sm'>All accounts across Adult and Kids Modes</p>
          </div>
        </div>

        {msg&&<p className='text-red-500 text-sm mb-3'>{msg}</p>}

        {/* Filters */}
        <div className='bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4 flex flex-wrap gap-3 items-center'>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search name, username, or email..." className='flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500'/>
          <select value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setPage(1)}} className='px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none'>
            <option value="ALL">All Roles</option>
            <option value="ADULT">Adult</option>
            <option value="CHILD">Child</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}} className='px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none'>
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-gray-600'>
              <tr>
                <th className='text-left px-4 py-3 font-semibold'>User</th>
                <th className='text-left px-4 py-3 font-semibold'>Email</th>
                <th className='text-left px-4 py-3 font-semibold'>Role</th>
                <th className='text-left px-4 py-3 font-semibold'>Status</th>
                <th className='text-left px-4 py-3 font-semibold'>Joined</th>
                <th className='text-right px-4 py-3 font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading&&<tr><td colSpan={6} className='text-center py-8'><ClipLoader size={30} color="#7c3aed"/></td></tr>}
              {!loading&&users.map(u=>(
                <tr key={u._id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0'>{u.profileImage?<img src={u.profileImage} alt="" className='w-full h-full object-cover'/>:<span className='w-full h-full flex items-center justify-center text-gray-500 font-bold'>{u.name?.[0]}</span>}</div>
                      <div>
                        <p className='font-semibold text-gray-800'>{u.name}</p>
                        <p className='text-xs text-gray-400'>@{u.userName}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-gray-600'>{u.email}</td>
                  <td className='px-4 py-3'><span className={`px-2 py-1 text-xs rounded-full font-semibold ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td className='px-4 py-3'><span className={`px-2 py-1 text-xs rounded-full font-semibold ${u.isActive===false?"bg-red-100 text-red-700":"bg-green-100 text-green-700"}`}>{u.isActive===false?"Inactive":"Active"}</span></td>
                  <td className='px-4 py-3 text-gray-500'>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className='px-4 py-3 text-right'>
                    <div className='flex gap-2 justify-end'>
                      <button onClick={()=>openDetail(u._id)} className='px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold'>View</button>
                      <button onClick={()=>setConfirm({...u,action:"toggle"})} className={`px-3 py-1 text-xs rounded-lg font-semibold ${u.isActive===false?"bg-green-50 text-green-600 hover:bg-green-100":"bg-amber-50 text-amber-600 hover:bg-amber-100"}`}>{u.isActive===false?"Activate":"Deactivate"}</button>
                      {u.role!=="ADMIN"&&<button onClick={()=>setConfirm({...u,action:"delete"})} className='px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold'>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading&&users.length===0&&<tr><td colSpan={6} className='text-center py-8 text-gray-500'>No users found</td></tr>}
            </tbody>
          </table>
        </div>

        {totalPages>1&&(
          <div className='flex items-center justify-center gap-2 mt-4'>
            <button disabled={page<=1} onClick={()=>setPage(page-1)} className='px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40'>Prev</button>
            <span className='text-sm text-gray-600'>Page {page} of {totalPages} · {total} users</span>
            <button disabled={page>=totalPages} onClick={()=>setPage(page+1)} className='px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40'>Next</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail&&(
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setDetail(null)}>
          <div className='bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto' onClick={e=>e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-800'>User Details</h3>
              <button onClick={()=>setDetail(null)} className='text-gray-400 hover:text-gray-600'>✕</button>
            </div>
            <div className='space-y-3 text-sm'>
              <div className='flex items-center gap-3'><div className='w-12 h-12 rounded-full bg-gray-200 overflow-hidden'>{detail.user.profileImage?<img src={detail.user.profileImage} alt="" className='w-full h-full object-cover'/>:<span className='w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg'>{detail.user.name?.[0]}</span>}</div><div><p className='font-bold text-gray-800'>{detail.user.name}</p><p className='text-gray-500'>@{detail.user.userName}</p></div></div>
              <InfoRow label="Email" value={detail.user.email}/>
              <InfoRow label="Role" value={detail.user.role}/>
              <InfoRow label="Status" value={detail.user.isActive===false?"Inactive":"Active"}/>
              <InfoRow label="Joined" value={new Date(detail.user.createdAt).toLocaleString()}/>
              {detail.user.dateOfBirth&&<InfoRow label="Date of Birth" value={new Date(detail.user.dateOfBirth).toLocaleDateString()}/>}
              {detail.user.bio&&<InfoRow label="Bio" value={detail.user.bio}/>}
              {detail.user.parentEmail&&<InfoRow label="Parent Email (admin only)" value={detail.user.parentEmail}/>}
              {detail.user.role==="CHILD"&&detail.kidsData&&(
                <>
                  <InfoRow label="Stars" value={detail.kidsData.stars||0}/>
                  <InfoRow label="Badges" value={detail.kidsData.badges?.length||0}/>
                  <InfoRow label="Stories Read" value={detail.kidsData.completedStories?.length||0}/>
                  <InfoRow label="Quizzes Taken" value={detail.kidsData.completedQuizzes?.length||0}/>
                </>
              )}
            </div>
            <div className='flex gap-2 mt-5'>
              <button onClick={()=>setResetForm({_id:detail.user._id,name:detail.user.name})} className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700'>Force Password Reset</button>
              {detail.user.role!=="ADMIN"&&<button onClick={()=>{setConfirm({...detail.user,action:"delete"});setDetail(null)}} className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700'>Delete User</button>}
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirm&&(
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setConfirm(null)}>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl' onClick={e=>e.stopPropagation()}>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>{confirm.action==="delete"?"Delete User":confirm.action==="toggle"&&confirm.isActive===false?"Activate User":"Deactivate User"}</h3>
            <p className='text-gray-600 text-sm mb-4'>
              {confirm.action==="delete"
                ? <>Are you sure you want to permanently delete <b>{confirm.name}</b> (@{confirm.userName}) and all their data? This cannot be undone.</>
                : <>Are you sure you want to <b>{confirm.isActive===false?"activate":"deactivate"}</b> <b>{confirm.name}</b> (@{confirm.userName})?</>}
            </p>
            <div className='flex gap-2 justify-end'>
              <button onClick={()=>setConfirm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold'>Cancel</button>
              <button onClick={confirm.action==="delete"?doDelete:doToggle} className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${confirm.action==="delete"?"bg-red-600 hover:bg-red-700":"bg-purple-600 hover:bg-purple-700"}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetForm&&(
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setResetForm(null)}>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl' onClick={e=>e.stopPropagation()}>
            <h3 className='text-lg font-bold text-gray-800 mb-1'>Force Password Reset</h3>
            <p className='text-gray-500 text-sm mb-4'>Set a new password for <b>{resetForm.name}</b>. The user will need to log in with this new password.</p>
            <input type="text" value={resetForm.newPassword||""} onChange={e=>setResetForm({...resetForm,newPassword:e.target.value})} placeholder="New password (min 6 chars)" className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 mb-4'/>
            <div className='flex gap-2 justify-end'>
              <button onClick={()=>setResetForm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold'>Cancel</button>
              <button onClick={doReset} disabled={!resetForm.newPassword||resetForm.newPassword.length<6} className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40'>Reset Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({label,value}){
  return (
    <div className='flex justify-between border-b border-gray-100 pb-2'>
      <span className='text-gray-500'>{label}</span>
      <span className='font-semibold text-gray-800'>{value}</span>
    </div>
  )
}

export default AdminUsers
