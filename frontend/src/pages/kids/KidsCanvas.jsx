import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import KidsButton from '../../components/kids/KidsButton'
import KidsNav from '../../components/kids/KidsNav'
import { ClipLoader } from 'react-spinners'

const COLORS=["#000000","#FF0000","#FF6600","#FFCC00","#33CC33","#0099FF","#6633CC","#FF3399","#FFFFFF","#999999","#FF99CC","#99CCFF"]
const BRUSH_SIZES=[4,8,14,22]

function KidsCanvas() {
  const canvasRef=useRef(null)
  const [color,setColor]=useState("#FF0000")
  const [brushSize,setBrushSize]=useState(8)
  const [isDrawing,setIsDrawing]=useState(false)
  const [saving,setSaving]=useState(false)
  const [saveResult,setSaveResult]=useState(null)
  const [history,setHistory]=useState([])
  const navigate=useNavigate()

  useEffect(()=>{
    const canvas=canvasRef.current
    if(!canvas) return
    const ctx=canvas.getContext("2d")
    const rect=canvas.parentElement.getBoundingClientRect()
    canvas.width=rect.width
    canvas.height=400
    ctx.fillStyle="#FFFFFF"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.lineCap="round"
    ctx.lineJoin="round"
  },[])

  const getPos=(e)=>{
    const canvas=canvasRef.current
    const rect=canvas.getBoundingClientRect()
    const clientX=e.touches?e.touches[0].clientX:e.clientX
    const clientY=e.touches?e.touches[0].clientY:e.clientY
    return{x:clientX-rect.left,y:clientY-rect.top}
  }

  const startDraw=(e)=>{
    e.preventDefault()
    const canvas=canvasRef.current
    const ctx=canvas.getContext("2d")
    saveState()
    const pos=getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x,pos.y)
    ctx.strokeStyle=color
    ctx.lineWidth=brushSize
    setIsDrawing(true)
  }

  const draw=(e)=>{
    if(!isDrawing) return
    e.preventDefault()
    const canvas=canvasRef.current
    const ctx=canvas.getContext("2d")
    const pos=getPos(e)
    ctx.lineTo(pos.x,pos.y)
    ctx.stroke()
  }

  const endDraw=()=>{setIsDrawing(false)}

  const saveState=()=>{
    const canvas=canvasRef.current
    setHistory(prev=>[...prev.slice(-20),canvas.toDataURL()])
  }

  const undo=()=>{
    if(history.length===0) return
    const canvas=canvasRef.current
    const ctx=canvas.getContext("2d")
    const last=history[history.length-1]
    const img=new Image()
    img.onload=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.drawImage(img,0,0)
    }
    img.src=last
    setHistory(prev=>prev.slice(0,-1))
  }

  const clearCanvas=()=>{
    const canvas=canvasRef.current
    const ctx=canvas.getContext("2d")
    saveState()
    ctx.fillStyle="#FFFFFF"
    ctx.fillRect(0,0,canvas.width,canvas.height)
  }

  const handleSave=async ()=>{
    setSaving(true)
    try {
      const canvas=canvasRef.current
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"))
      const formData=new FormData()
      formData.append("drawing",blob,"drawing.png")
      const result=await axios.post(`${serverUrl}/api/kids/drawing/save`,formData,{
        withCredentials:true,
        headers:{"Content-Type":"multipart/form-data"}
      })
      setSaveResult(result.data)
      setSaving(false)
    } catch (error) {
      console.log(error)
      setSaving(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-orange-50 to-white pb-[90px]'>
      <div className='max-w-lg mx-auto px-4 pt-6'>
        <button onClick={()=>navigate("/kids")} className='text-purple-500 font-semibold mb-4'>← Back</button>
        <h1 className='text-2xl font-bold text-purple-700 mb-4'>🎨 Drawing Canvas</h1>

        {/* Canvas */}
        <div className='bg-white rounded-2xl shadow-md overflow-hidden mb-4'>
          <canvas 
            ref={canvasRef}
            className='w-full cursor-crosshair touch-none'
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
          />
        </div>

        {/* Color Palette */}
        <div className='flex flex-wrap gap-2 justify-center mb-3'>
          {COLORS.map((c)=>(
            <button key={c} onClick={()=>setColor(c)} aria-label={`Select color ${c}`} className={`w-8 h-8 rounded-full border-2 transition-transform ${color===c?"border-purple-500 scale-125":"border-gray-200"}`} style={{backgroundColor:c}}/>
          ))}
        </div>

        {/* Brush Size */}
        <div className='flex gap-3 justify-center items-center mb-4'>
          {BRUSH_SIZES.map((size)=>(
            <button key={size} onClick={()=>setBrushSize(size)} aria-label={`Brush size ${size}`} className={`rounded-full bg-gray-700 transition-all ${brushSize===size?"ring-2 ring-purple-500 ring-offset-2":""}`} style={{width:size+8,height:size+8}}/>
          ))}
        </div>

        {/* Actions */}
        <div className='flex gap-2 justify-center mb-4'>
          <KidsButton onClick={undo} variant="secondary" className="px-4 text-sm">↩ Undo</KidsButton>
          <KidsButton onClick={clearCanvas} variant="danger" className="px-4 text-sm">🗑 Clear</KidsButton>
        </div>

        {saveResult?(
          <div className='bg-green-50 border border-green-200 rounded-2xl p-4 text-center mb-4'>
            <p className='text-green-600 font-bold'>Drawing saved! 🎉 +2 stars</p>
            <p className='text-gray-500 text-sm'>Total: {saveResult.totalStars} ⭐</p>
          </div>
        ):(
          <KidsButton onClick={handleSave} loading={saving} variant="success" className="w-full">
            💾 Save Drawing (+2 Stars)
          </KidsButton>
        )}
      </div>
      <KidsNav/>
    </div>
  )
}

export default KidsCanvas
