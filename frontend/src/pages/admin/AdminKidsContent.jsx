import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'

const TABS=["Stories","Quiz Questions","Animals","True/False","Badges"]
const STORY_CATEGORIES=["moral","adventure","friendship","family","nature","science"]
const QUIZ_CATEGORIES=["generalKnowledge","science","math","moral","nature","history"]

function AdminKidsContent() {
  const [activeTab,setActiveTab]=useState("Stories")
  const [loading,setLoading]=useState(false)
  const [seeding,setSeeding]=useState(false)
  const navigate=useNavigate()

  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <button onClick={()=>navigate("/admin")} className='text-purple-600 text-sm font-semibold mb-2'>← Dashboard</button>
            <h1 className='text-2xl font-bold text-gray-800'>Kids Content Management</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
          {TABS.map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${activeTab===tab?"bg-purple-600 text-white":"bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab==="Stories"&&<StoriesTab loading={loading} setLoading={setLoading}/>}
        {activeTab==="Quiz Questions"&&<QuizTab loading={loading} setLoading={setLoading}/>}
        {activeTab==="Animals"&&<AnimalsTab loading={loading} setLoading={setLoading} seeding={seeding} setSeeding={setSeeding}/>}
        {activeTab==="True/False"&&<TrueFalseTab loading={loading} setLoading={setLoading} seeding={seeding} setSeeding={setSeeding}/>}
        {activeTab==="Badges"&&<BadgesTab/>}
      </div>
    </div>
  )
}

function StoriesTab({loading,setLoading}){
  const [stories,setStories]=useState([])
  const [page,setPage]=useState(1)
  const [totalPages,setTotalPages]=useState(1)
  const [form,setForm]=useState(null)
  const [saving,setSaving]=useState(false)

  const fetchStories=async (p=1)=>{
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/admin/stories?page=${p}`,{withCredentials:true})
      setStories(result.data.stories)
      setPage(result.data.page)
      setTotalPages(result.data.totalPages)
    } catch (error) {console.log(error)}
    setLoading(false)
  }

  useEffect(()=>{fetchStories(page)},[page])

  const handleSave=async ()=>{
    setSaving(true)
    try {
      const fd=new FormData()
      Object.keys(form).forEach(k=>{if(form[k]!==undefined&&form[k]!==null)fd.append(k,form[k])})
      if(form._id){
        await axios.put(`${serverUrl}/api/admin/stories/${form._id}`,fd,{withCredentials:true,headers:{"Content-Type":"multipart/form-data"}})
      }else{
        await axios.post(`${serverUrl}/api/admin/stories`,fd,{withCredentials:true,headers:{"Content-Type":"multipart/form-data"}})
      }
      setForm(null)
      fetchStories(page)
    } catch (error) {console.log(error)}
    setSaving(false)
  }

  const handleDelete=async (id)=>{
    if(!confirm("Delete this story?")) return
    try {
      await axios.delete(`${serverUrl}/api/admin/stories/${id}`,{withCredentials:true})
      fetchStories(page)
    } catch (error) {console.log(error)}
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <p className='text-sm text-gray-500'>Manage moral stories for kids</p>
        <button onClick={()=>setForm({title:"",content:"",category:"moral",readingLevel:"easy",starsAwarded:5,isActive:true})} className='px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700'>+ New Story</button>
      </div>

      {form&&(
        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4'>
          <div className='grid md:grid-cols-2 gap-3'>
            <input placeholder="Title" value={form.title||""} onChange={e=>setForm({...form,title:e.target.value})} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'/>
            <select value={form.category||"moral"} onChange={e=>setForm({...form,category:e.target.value})} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'>
              {STORY_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.readingLevel||"easy"} onChange={e=>setForm({...form,readingLevel:e.target.value})} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
            <input type="number" placeholder="Stars" value={form.starsAwarded||5} onChange={e=>setForm({...form,starsAwarded:parseInt(e.target.value)})} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'/>
          </div>
          <textarea placeholder="Story content..." value={form.content||""} onChange={e=>setForm({...form,content:e.target.value})} className='w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm h-32 resize-none'/>
          <div className='flex items-center gap-3 mt-3'>
            <label className='flex items-center gap-2 text-sm'><input type="checkbox" checked={form.isActive!==false} onChange={e=>setForm({...form,isActive:e.target.checked})}/> Active</label>
          </div>
          <div className='flex gap-2 mt-3'>
            <button onClick={handleSave} disabled={saving} className='px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold'>{saving?<ClipLoader size={14} color="white"/>:"Save"}</button>
            <button onClick={()=>setForm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold'>Cancel</button>
          </div>
        </div>
      )}

      {loading?<div className='text-center py-10'><ClipLoader size={30} color="#7c3aed"/></div>:(
        <div className='space-y-2'>
          {stories.map(s=>(
            <div key={s._id} className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between'>
              <div className='flex-1 min-w-0'>
                <p className='font-bold text-gray-800 truncate'>{s.title}</p>
                <div className='flex gap-2 mt-1'>
                  <span className='text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full'>{s.category}</span>
                  <span className='text-xs text-gray-400'>⭐ {s.starsAwarded}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive?"bg-green-100 text-green-600":"bg-gray-100 text-gray-500"}`}>{s.isActive?"Active":"Inactive"}</span>
                </div>
              </div>
              <div className='flex gap-2 ml-4'>
                <button onClick={()=>setForm(s)} className='text-blue-500 text-sm font-semibold'>Edit</button>
                <button onClick={()=>handleDelete(s._id)} className='text-red-500 text-sm font-semibold'>Delete</button>
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
    </div>
  )
}

function QuizTab({loading,setLoading}){
  const [questions,setQuestions]=useState([])
  const [page,setPage]=useState(1)
  const [totalPages,setTotalPages]=useState(1)
  const [filter,setFilter]=useState("")
  const [form,setForm]=useState(null)
  const [saving,setSaving]=useState(false)

  const fetchQ=async (p=1)=>{
    setLoading(true)
    try {
      const url=filter?`${serverUrl}/api/admin/quiz?page=${p}&category=${filter}`:`${serverUrl}/api/admin/quiz?page=${p}`
      const result=await axios.get(url,{withCredentials:true})
      setQuestions(result.data.questions)
      setPage(result.data.page)
      setTotalPages(result.data.totalPages)
    } catch (error) {console.log(error)}
    setLoading(false)
  }

  useEffect(()=>{fetchQ(page)},[page,filter])

  const handleSave=async ()=>{
    setSaving(true)
    try {
      if(form._id){
        await axios.put(`${serverUrl}/api/admin/quiz/${form._id}`,form,{withCredentials:true})
      }else{
        await axios.post(`${serverUrl}/api/admin/quiz`,form,{withCredentials:true})
      }
      setForm(null)
      fetchQ(page)
    } catch (error) {console.log(error)}
    setSaving(false)
  }

  const handleDelete=async (id)=>{
    if(!confirm("Delete this question?")) return
    try {
      await axios.delete(`${serverUrl}/api/admin/quiz/${id}`,{withCredentials:true})
      fetchQ(page)
    } catch (error) {console.log(error)}
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex gap-2'>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'>
            <option value="">All Categories</option>
            {QUIZ_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={()=>setForm({question:"",options:["","","",""],correctAnswer:0,category:"generalKnowledge",difficulty:"easy",starsAwarded:1})} className='px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700'>+ New Question</button>
      </div>

      {form&&(
        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4'>
          <input placeholder="Question" value={form.question||""} onChange={e=>setForm({...form,question:e.target.value})} className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3'/>
          <div className='grid grid-cols-2 gap-2 mb-3'>
            {form.options?.map((opt,i)=>(
              <div key={i} className='flex items-center gap-2'>
                <input type="radio" name="correct" checked={form.correctAnswer===i} onChange={()=>setForm({...form,correctAnswer:i})} className='accent-green-500'/>
                <input placeholder={`Option ${i+1}`} value={opt} onChange={e=>{const opts=[...form.options];opts[i]=e.target.value;setForm({...form,options:opts})}} className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm'/>
              </div>
            ))}
          </div>
          <div className='flex gap-2'>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'>
              {QUIZ_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
            <input type="number" placeholder="Stars" value={form.starsAwarded||1} onChange={e=>setForm({...form,starsAwarded:parseInt(e.target.value)})} className='w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm'/>
          </div>
          <p className='text-xs text-gray-400 mt-2'>● = correct answer</p>
          <div className='flex gap-2 mt-3'>
            <button onClick={handleSave} disabled={saving} className='px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold'>{saving?<ClipLoader size={14} color="white"/>:"Save"}</button>
            <button onClick={()=>setForm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold'>Cancel</button>
          </div>
        </div>
      )}

      {loading?<div className='text-center py-10'><ClipLoader size={30} color="#7c3aed"/></div>:(
        <div className='space-y-2'>
          {questions.map(q=>(
            <div key={q._id} className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between'>
              <div className='flex-1 min-w-0'>
                <p className='font-bold text-gray-800 truncate'>{q.question}</p>
                <div className='flex gap-2 mt-1'>
                  <span className='text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full'>{q.category}</span>
                  <span className='text-xs text-gray-400'>⭐ {q.starsAwarded}</span>
                </div>
              </div>
              <div className='flex gap-2 ml-4'>
                <button onClick={()=>setForm(q)} className='text-blue-500 text-sm font-semibold'>Edit</button>
                <button onClick={()=>handleDelete(q._id)} className='text-red-500 text-sm font-semibold'>Delete</button>
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
    </div>
  )
}

function AnimalsTab({loading,setLoading,seeding,setSeeding}){
  const [animals,setAnimals]=useState([])
  const [form,setForm]=useState(null)
  const [saving,setSaving]=useState(false)

  const fetchAnimals=async ()=>{
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/admin/games/animals`,{withCredentials:true})
      setAnimals(result.data)
    } catch (error) {console.log(error)}
    setLoading(false)
  }

  useEffect(()=>{fetchAnimals()},[])

  const handleSeed=async ()=>{
    setSeeding(true)
    try {
      await axios.post(`${serverUrl}/api/admin/seed/games`,{},{withCredentials:true})
      fetchAnimals()
    } catch (error) {console.log(error)}
    setSeeding(false)
  }

  const handleSave=async ()=>{
    setSaving(true)
    try {
      if(form._id){
        await axios.put(`${serverUrl}/api/admin/games/animals/${form._id}`,form,{withCredentials:true})
      }else{
        await axios.post(`${serverUrl}/api/admin/games/animals`,form,{withCredentials:true})
      }
      setForm(null)
      fetchAnimals()
    } catch (error) {console.log(error)}
    setSaving(false)
  }

  const handleDelete=async (id)=>{
    if(!confirm("Delete this animal?")) return
    try {
      await axios.delete(`${serverUrl}/api/admin/games/animals/${id}`,{withCredentials:true})
      fetchAnimals()
    } catch (error) {console.log(error)}
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex gap-2'>
          <p className='text-sm text-gray-500'>DB: {animals.length} animals</p>
          {animals.length===0&&<button onClick={handleSeed} disabled={seeding} className='px-3 py-1 bg-amber-500 text-white rounded text-xs font-semibold'>{seeding?<ClipLoader size={12} color="white"/>:"Seed from hardcoded data"}</button>}
        </div>
        <button onClick={()=>setForm({name:"",emoji:"",fact:"",isActive:true})} className='px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700'>+ New Animal</button>
      </div>

      {form&&(
        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4'>
          <div className='grid grid-cols-3 gap-3'>
            <input placeholder="Name" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'/>
            <input placeholder="Emoji" value={form.emoji||""} onChange={e=>setForm({...form,emoji:e.target.value})} className='px-3 py-2 border border-gray-200 rounded-lg text-sm'/>
            <label className='flex items-center gap-2 text-sm'><input type="checkbox" checked={form.isActive!==false} onChange={e=>setForm({...form,isActive:e.target.checked})}/> Active</label>
          </div>
          <input placeholder="Fun fact" value={form.fact||""} onChange={e=>setForm({...form,fact:e.target.value})} className='w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm'/>
          <div className='flex gap-2 mt-3'>
            <button onClick={handleSave} disabled={saving} className='px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold'>{saving?<ClipLoader size={14} color="white"/>:"Save"}</button>
            <button onClick={()=>setForm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold'>Cancel</button>
          </div>
        </div>
      )}

      {loading?<div className='text-center py-10'><ClipLoader size={30} color="#7c3aed"/></div>:(
        <div className='grid md:grid-cols-2 gap-2'>
          {animals.map(a=>(
            <div key={a._id} className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>{a.emoji}</span>
                <div>
                  <p className='font-bold text-gray-800 text-sm'>{a.name}</p>
                  <p className='text-xs text-gray-400 truncate max-w-[200px]'>{a.fact}</p>
                </div>
              </div>
              <div className='flex gap-2 ml-2'>
                <button onClick={()=>setForm(a)} className='text-blue-500 text-xs font-semibold'>Edit</button>
                <button onClick={()=>handleDelete(a._id)} className='text-red-500 text-xs font-semibold'>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TrueFalseTab({loading,setLoading,seeding,setSeeding}){
  const [items,setItems]=useState([])
  const [form,setForm]=useState(null)
  const [saving,setSaving]=useState(false)

  const fetchItems=async ()=>{
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/admin/games/truefalse`,{withCredentials:true})
      setItems(result.data)
    } catch (error) {console.log(error)}
    setLoading(false)
  }

  useEffect(()=>{fetchItems()},[])

  const handleSeed=async ()=>{
    setSeeding(true)
    try {
      await axios.post(`${serverUrl}/api/admin/seed/games`,{},{withCredentials:true})
      fetchItems()
    } catch (error) {console.log(error)}
    setSeeding(false)
  }

  const handleSave=async ()=>{
    setSaving(true)
    try {
      if(form._id){
        await axios.put(`${serverUrl}/api/admin/games/truefalse/${form._id}`,form,{withCredentials:true})
      }else{
        await axios.post(`${serverUrl}/api/admin/games/truefalse`,form,{withCredentials:true})
      }
      setForm(null)
      fetchItems()
    } catch (error) {console.log(error)}
    setSaving(false)
  }

  const handleDelete=async (id)=>{
    if(!confirm("Delete this statement?")) return
    try {
      await axios.delete(`${serverUrl}/api/admin/games/truefalse/${id}`,{withCredentials:true})
      fetchItems()
    } catch (error) {console.log(error)}
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex gap-2'>
          <p className='text-sm text-gray-500'>DB: {items.length} statements</p>
          {items.length===0&&<button onClick={handleSeed} disabled={seeding} className='px-3 py-1 bg-amber-500 text-white rounded text-xs font-semibold'>{seeding?<ClipLoader size={12} color="white"/>:"Seed from hardcoded data"}</button>}
        </div>
        <button onClick={()=>setForm({statement:"",isTrue:true,isActive:true})} className='px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700'>+ New Statement</button>
      </div>

      {form&&(
        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4'>
          <input placeholder="Statement" value={form.statement||""} onChange={e=>setForm({...form,statement:e.target.value})} className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3'/>
          <div className='flex gap-4 items-center'>
            <label className='flex items-center gap-2 text-sm'>
              <input type="radio" name="tf" checked={form.isTrue===true} onChange={()=>setForm({...form,isTrue:true})} className='accent-green-500'/>
              True
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <input type="radio" name="tf" checked={form.isTrue===false} onChange={()=>setForm({...form,isTrue:false})} className='accent-red-500'/>
              False
            </label>
            <label className='flex items-center gap-2 text-sm ml-4'><input type="checkbox" checked={form.isActive!==false} onChange={e=>setForm({...form,isActive:e.target.checked})}/> Active</label>
          </div>
          <div className='flex gap-2 mt-3'>
            <button onClick={handleSave} disabled={saving} className='px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold'>{saving?<ClipLoader size={14} color="white"/>:"Save"}</button>
            <button onClick={()=>setForm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold'>Cancel</button>
          </div>
        </div>
      )}

      {loading?<div className='text-center py-10'><ClipLoader size={30} color="#7c3aed"/></div>:(
        <div className='space-y-2'>
          {items.map(t=>(
            <div key={t._id} className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between'>
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.isTrue?"bg-green-100 text-green-600":"bg-red-100 text-red-600"}`}>{t.isTrue?"T":"F"}</span>
                <p className='text-sm text-gray-800 truncate'>{t.statement}</p>
              </div>
              <div className='flex gap-2 ml-2'>
                <button onClick={()=>setForm(t)} className='text-blue-500 text-xs font-semibold'>Edit</button>
                <button onClick={()=>handleDelete(t._id)} className='text-red-500 text-xs font-semibold'>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BadgesTab(){
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [form,setForm]=useState(null)
  const [saving,setSaving]=useState(false)
  const [confirm,setConfirm]=useState(null)
  const [msg,setMsg]=useState("")

  const fetchBadges=async ()=>{
    setLoading(true)
    try {
      const result=await axios.get(`${serverUrl}/api/admin/mgmt/badge-definitions`,{withCredentials:true})
      setData(result.data)
    } catch (error) {console.log(error)}
    setLoading(false)
  }
  useEffect(()=>{ fetchBadges() },[])

  const saveBadge=async ()=>{
    setSaving(true)
    setMsg("")
    try {
      if(form._id){
        const {_id,...body}=form
        await axios.put(`${serverUrl}/api/admin/mgmt/badge-definitions/${_id}`,body,{withCredentials:true})
      }else{
        await axios.post(`${serverUrl}/api/admin/mgmt/badge-definitions`,form,{withCredentials:true})
      }
      setForm(null)
      await fetchBadges()
    } catch (error) {setMsg(error.response?.data?.message||"Save failed")}
    setSaving(false)
  }

  const deleteBadge=async ()=>{
    if(!confirm) return
    try {
      await axios.delete(`${serverUrl}/api/admin/mgmt/badge-definitions/${confirm._id}`,{withCredentials:true})
      setConfirm(null)
      await fetchBadges()
    } catch (error) {setMsg(error.response?.data?.message||"Delete failed")}
  }

  const blankForm={badgeId:"",name:"",starsRequired:0,icon:"🏆",description:"",isActive:true}

  if(loading) return <div className='text-center py-10'><ClipLoader size={30} color="#7c3aed"/></div>

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm text-gray-500'>Create, edit, and delete badge definitions used to reward kids.</p>
        <button onClick={()=>{setMsg("");setForm(blankForm)}} className='px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700'>+ New Badge</button>
      </div>

      {msg&&<p className='text-red-500 text-sm mb-3'>{msg}</p>}

      {form&&(
        <div className='bg-white rounded-xl p-5 border border-gray-200 mb-5'>
          <h3 className='font-bold text-gray-800 mb-3'>{form._id?"Edit Badge":"New Badge"}</h3>
          <div className='grid md:grid-cols-2 gap-3 mb-3'>
            {!form._id&&<label className='text-sm'>Badge ID<input value={form.badgeId||""} onChange={e=>setForm({...form,badgeId:e.target.value})} placeholder="e.g. rocket_rider" disabled={saving} className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500'/></label>}
            <label className='text-sm'>Name<input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} disabled={saving} className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500'/></label>
            <label className='text-sm'>Stars Required<input type="number" value={form.starsRequired||0} onChange={e=>setForm({...form,starsRequired:Number(e.target.value)})} disabled={saving} className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500'/></label>
            <label className='text-sm'>Icon<select value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} disabled={saving} className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500'>
              {["🏆","⭐","🌟","📚","🧠","🎨","🚀","🦁","🌈","🐾"].map(i=><option key={i} value={i}>{i}</option>)}
            </select></label>
          </div>
          <label className='text-sm block mb-3'>Description<textarea value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} disabled={saving} className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500' rows={2}/></label>
          <label className='flex items-center gap-2 text-sm mb-4'><input type="checkbox" checked={form.isActive!==false} onChange={e=>setForm({...form,isActive:e.target.checked})} disabled={saving}/> Active</label>
          <div className='flex gap-2'>
            <button onClick={saveBadge} disabled={saving} className='px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700'>{saving?<ClipLoader size={16} color="white"/>:(form._id?"Save Changes":"Create Badge")}</button>
            <button onClick={()=>setForm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300'>Cancel</button>
          </div>
        </div>
      )}

      <div className='grid md:grid-cols-3 gap-3'>
        {data?.badges?.map(b=>(
          <div key={b._id||b.badgeId} className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center relative'>
            {!b.isActive&&<span className='absolute top-2 right-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full'>Inactive</span>}
            <span className='text-3xl block mb-2'>{b.icon}</span>
            <p className='font-bold text-gray-800'>{b.name}</p>
            <p className='text-xs text-gray-400'>⭐ {b.starsRequired}+ stars · <span className='text-purple-600 font-semibold'>Earned by {data?.stats?.[b.badgeId]||0} kids</span></p>
            {b.description&&<p className='text-xs text-gray-400 mt-1'>{b.description}</p>}
            <div className='flex gap-2 mt-3 justify-center'>
              <button onClick={()=>{setMsg("");setForm({...b})}} className='px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold'>Edit</button>
              <button onClick={()=>setConfirm(b)} className='px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold'>Delete</button>
            </div>
          </div>
        ))}
        {data?.badges?.length===0&&<p className='text-gray-500 col-span-3 text-center py-6'>No badges yet. Create one.</p>}
      </div>

      {confirm&&(
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setConfirm(null)}>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl' onClick={e=>e.stopPropagation()}>
            <h3 className='font-bold text-gray-800 text-lg mb-2'>Delete Badge</h3>
            <p className='text-gray-600 text-sm mb-4'>Are you sure you want to delete the badge "{confirm.name}"? This cannot be undone.</p>
            <div className='flex gap-2 justify-end'>
              <button onClick={()=>setConfirm(null)} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold'>Cancel</button>
              <button onClick={deleteBadge} className='px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700'>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminKidsContent
