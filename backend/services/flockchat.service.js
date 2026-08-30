const GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models"
const MODEL_ID="gemini-3.6-flash"

const SYSTEM_PROMPT=`You are FlockChat, a friendly assistant for children aged 6–15 on Flocksy.

ONLY discuss these topics:
- School subjects (math, science, history, geography, English)
- General knowledge and fun facts
- Hobbies (sports, art, music, reading, gaming, crafts)
- Moral stories and life lessons
- Encouragement and positive motivation
- Age-appropriate jokes and riddles
- Nature, animals, and the environment
- Space and science exploration

NEVER discuss:
- Romance, dating, or relationships
- Violence, weapons, or fighting
- Drugs, alcohol, or smoking
- Adult content of any kind
- Politics or political opinions
- Gambling or betting
- Anything suitable only for ages 16+

NEVER ask for or accept:
- The child's home address
- Their school name
- Their phone number
- Their full name (you may know their first name from context)
- Any personal contact information

If asked about something outside allowed topics, respond EXACTLY:
"I can't chat about that, but I'd love to talk about your favorite animal or help with homework! What sounds fun?"

Keep replies short (2-4 sentences max), warm, and simple. Use friendly language a 10-year-old would understand. Be encouraging and positive. Use emojis sparingly (1-2 per message).`

const FLAGGED_KEYWORDS=[
  "address","phone number","school name","full name",
  "meet me","come over","send me your","what's your number",
  "boyfriend","girlfriend","dating","kiss","love you",
  "gun","knife","kill","fight","blood",
  "drug","alcohol","cigarette","weed",
  "porn","sex","nude","naked"
]

const FLAGGED_PATTERNS=[
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  /\b\d+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln)\b/i,
  /\b\d{5}(-\d{4})?\b/,
  /https?:\/\/[^\s]+/
]

export const buildSystemPrompt=(childAge)=>{
  let ageNote=""
  if(childAge&&childAge<10){
    ageNote="\nExtra note: This child is under 10. Use very simple words and short sentences. Be extra patient and encouraging."
  }else if(childAge&&childAge>13){
    ageNote="\nThis child is a teenager. You can use slightly more mature vocabulary while staying appropriate."
  }
  return SYSTEM_PROMPT+ageNote
}

export const callGemini=async (messages)=>{
  const apiKey=process.env.GEMINI_API_KEY
  if(!apiKey){
    throw new Error("GEMINI_API_KEY not configured")
  }

  const contents=messages.map(m=>({
    role:m.role==="user"?"user":"model",
    parts:[{text:m.text}]
  }))

  const response=await fetch(`${GEMINI_API_URL}/${MODEL_ID}:generateContent?key=${apiKey}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      contents,
      generationConfig:{
        temperature:0.7,
        maxOutputTokens:2048,
        topP:0.9,
        topK:40
      },
      safetySettings:[
        {category:"HARM_CATEGORY_HARASSMENT",threshold:"BLOCK_NONE"},
        {category:"HARM_CATEGORY_HATE_SPEECH",threshold:"BLOCK_NONE"},
        {category:"HARM_CATEGORY_SEXUALLY_EXPLICIT",threshold:"BLOCK_NONE"},
        {category:"HARM_CATEGORY_DANGEROUS_CONTENT",threshold:"BLOCK_NONE"}
      ]
    })
  })

  if(!response.ok){
    const error=await response.text()
    throw new Error(`Gemini API error: ${response.status} ${error}`)
  }

  const data=await response.json()

  if(data.promptFeedback&&data.promptFeedback.blockReason){
    return{flagged:true,text:"I can't chat about that, but I'd love to talk about your favorite animal or help with homework! What sounds fun?"}
  }

  const text=data.candidates?.[0]?.content?.parts?.[0]?.text
  if(!text){
    return{flagged:true,text:"Oops, something went wrong. Let's try again! What would you like to talk about?"}
  }

  return{flagged:false,text}
}

export const postFilter=(text)=>{
  const lower=text.toLowerCase()

  for(const keyword of FLAGGED_KEYWORDS){
    if(lower.includes(keyword)){
      return{safe:false,reason:`Contains blocked keyword: ${keyword}`}
    }
  }

  for(const pattern of FLAGGED_PATTERNS){
    if(pattern.test(text)){
      return{safe:false,reason:`Contains blocked pattern: ${pattern.source}`}
    }
  }

  return{safe:true,reason:null}
}

export const filterUserInput=(text)=>{
  const lower=text.toLowerCase()

  for(const keyword of FLAGGED_KEYWORDS){
    if(lower.includes(keyword)){
      return{safe:false,reason:`User sent blocked content: ${keyword}`}
    }
  }

  for(const pattern of FLAGGED_PATTERNS){
    if(pattern.test(text)){
      return{safe:false,reason:"User sent blocked pattern (phone/address/link)"}
    }
  }

  return{safe:true,reason:null}
}
