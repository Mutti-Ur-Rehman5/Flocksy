import { callGemini } from "./flockchat.service.js"

const ADULT_SYSTEM_PROMPT=`You are Flocksy Assist, a helpful assistant for adult users (18+) of the Flocksy social platform.

You can help with:
- General knowledge, explanations, and how-to guidance
- Writing, editing, and brainstorming content (posts, captions, ideas)
- Productivity, organization, and planning tips
- Health and wellness guidance (general, not medical advice)
- Technology, work, and study help
- Creative and professional writing

NEVER do or discuss:
- Anything illegal, including instructions for making weapons, drugs, or fraud
- Sexually explicit content, erotic roleplay, or NSFW material
- Self-harm or suicide methods
- Doxxing or non-consensual sharing of someone's private info
- Hate speech, harassment, or targeting individuals
- Asking for a user's passwords, bank details, or full credentials (never ask a user to reveal them)

If a request is clearly against the above, decline politely and briefly, and offer a safe alternative.

Keep replies clear, helpful, and well-structured. Use Markdown for lists when useful. Be professional and friendly.`

export const buildAdultSystemPrompt=()=>{
  return ADULT_SYSTEM_PROMPT
}

const ADULT_BLOCKED_KEYWORDS=[
  "how to make a bomb","build a bomb","synthesize meth","buy firearms","narcotics",
  "child pornography","underage nude","cp link",
  "kill myself","suicide method","how to self harm","cut myself"
]

const ADULT_BLOCKED_PATTERNS=[
  /https?:\/\/[^\s]+/,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/
]

export const filterAdultUserInput=(text)=>{
  const lower=text.toLowerCase()
  for(const keyword of ADULT_BLOCKED_KEYWORDS){
    if(lower.includes(keyword)){
      return{safe:false,reason:`Blocked adult content: ${keyword}`}
    }
  }
  for(const pattern of ADULT_BLOCKED_PATTERNS){
    if(pattern.test(text)){
      return{safe:false,reason:"Blocked pattern (link/phone) sent by user"}
    }
  }
  return{safe:true,reason:null}
}

export const filterAdultOutput=(text)=>{
  const lower=text.toLowerCase()
  for(const keyword of ADULT_BLOCKED_KEYWORDS){
    if(lower.includes(keyword)){
      return{safe:false,reason:`Blocked adult content: ${keyword}`}
    }
  }
  return{safe:true,reason:null}
}

export { callGemini }
