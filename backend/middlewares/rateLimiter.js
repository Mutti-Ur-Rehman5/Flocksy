const rateLimitStore=new Map()

const CLEANUP_INTERVAL=60*1000

setInterval(()=>{
  const now=Date.now()
  for(const[key,entry] of rateLimitStore){
    if(now-entry.windowStart>CLEANUP_INTERVAL*2){
      rateLimitStore.delete(key)
    }
  }
},CLEANUP_INTERVAL)

const rateLimiter=(maxRequests=30,windowMs=10*60*1000,bucketName="chat")=>{
  return (req,res,next)=>{
    const userId=req.userId
    if(!userId) return next()

    const now=Date.now()
    const key=`${bucketName}:${userId}`

    let entry=rateLimitStore.get(key)

    if(!entry||now-entry.windowStart>windowMs){
      entry={count:1,windowStart:now}
      rateLimitStore.set(key,entry)
      return next()
    }

    entry.count++

    if(entry.count>maxRequests){
      const retryAfter=Math.ceil((entry.windowStart+windowMs-now)/1000)
      return res.status(429).json({
        message:"Too many messages. Please wait a moment before chatting again.",
        retryAfter
      })
    }

    next()
  }
}

export default rateLimiter
