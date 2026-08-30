# Architecture — Flocksy Kids Mode Addition

## 1. Stack (unchanged)
React 18 (Vite) frontend · Express.js 4 + Node 18 backend · MongoDB Atlas via Mongoose · Cloudinary for media · NodeMailer for email · Socket.IO for realtime · JWT auth (access token in memory, refresh in HttpOnly cookie).

**New dependency:** `@google/generative-ai` (or plain `fetch` to Gemini REST endpoint) — backend only, for FlockChat.

No Docker. Deployment targets stay Netlify/Vercel (frontend) + Railway/Render (backend) as per existing setup — do not introduce containers.

## 2. Schema Changes

### 2.1 `User` (existing — extend, do not break existing fields)
```
role: Enum[ADULT, CHILD, ADMIN]           // unchanged
email: String (unique)                     // for CHILD this becomes childEmail semantics
parentEmail: String                        // NEW — required if role=CHILD, distinct from email
dateOfBirth: Date                          // unchanged
isVerified: Boolean                        // unchanged
```
Migration note: existing `parentContact` field (if already present from Adult-phase build) should be renamed/mapped to `parentEmail` for CHILD users. Write a one-time migration script; do not silently drop data.

### 2.2 `OTPRecord` (existing — extend)
```
otpHash: String (bcrypt)
expiresAt: Date (+10min)
attemptsRemaining: Number
approvalToken: String            // NEW — signed token embedded in Approve/Deny email links
approvalStatus: Enum[PENDING, APPROVED, DENIED, EXPIRED]   // NEW
targetEmail: String              // NEW — always parentEmail, for audit clarity
```

### 2.3 `ChatMessage` (NEW collection — FlockChat)
```
_id
childId: ObjectId (FK -> User)
role: Enum[user, assistant]
text: String
flagged: Boolean
flagReason: String (nullable)
createdAt: Date
```

### 2.4 Everything else (KidsProfile, KidStory, QuizQuestion, RewardProfile, QuizResult, ModerationLog, OTPAuditLog) — unchanged from original SRS ERD, build as specified there.

## 3. New/Changed API Endpoints

### Auth
- `POST /api/auth/register/child` — body: `{displayName, childEmail, parentEmail, password, dateOfBirth, avatarId}`. Server validates `childEmail !== parentEmail`. Creates User(role=CHILD) + KidsProfile.
- `POST /api/auth/register/adult` — existing adult registration, unchanged, single email.
- `POST /api/auth/login` — unchanged, works for both roles via existing role-based routing (FR-06).

### Mode switching
- `POST /api/mode/kids/enter` — any authenticated ADULT can call this anytime, no gate, returns `{mode: 'KIDS_TEMPORARY'}` or simply flips a client-side view context (no server session change needed since it's not a privilege escalation — adult already has full rights). **No OTP, no approval step.**
- `POST /api/otp/request` — CHILD only. Generates OTP, stores OTPRecord with `targetEmail = user.parentEmail`, sends email with OTP code + Approve/Deny links.
- `GET /api/otp/approve?token=...` — public (token-authenticated) link handler, no login required for the parent. Sets `approvalStatus=APPROVED`, immediately marks OTPRecord verified, child's frontend picks this up via short polling (`GET /api/otp/status/:otpId` every 3s) or a Socket.IO room keyed to the child's userId.
- `GET /api/otp/deny?token=...` — same pattern, sets `approvalStatus=DENIED`.
- `POST /api/otp/verify` — CHILD submits typed 6-digit code (original SRS flow, unchanged mechanism), bcrypt compare, constant-time, max 3 attempts.

### FlockChat
- `POST /api/kids/chat` — CHILD only (role-guard middleware rejects ADULT/ADMIN). Body: `{message}`. Server: (1) prepend system prompt enforcing kid-safe scope, (2) call Gemini API server-side, (3) run response through same profanity/age-appropriateness check used for text moderation (reuse FlockMind text moderator where possible), (4) persist ChatMessage x2 (user+assistant), (5) return `{reply, flagged}`.
- `GET /api/kids/chat/history` — CHILD only, paginated own history.
- `GET /api/admin/chat/flagged` — ADMIN only, review queue for flagged FlockChat messages.

### Kids Mode features
All existing SRS endpoints for stories/quiz/games/canvas/rewards unchanged — build per original spec (FR-31 to FR-35).

## 4. FlockChat Backend Design
Keep it in the Express backend (not a separate Python service like FlockMind — Gemini call is a simple HTTP call, no need for a new microservice).

```
services/flockchat.service.js
  - buildSystemPrompt(childAge) -> string
  - callGemini(messages) -> { text }
  - postFilter(text) -> { safe: boolean, reason }
```

System prompt (baseline, refine during build):
> "You are FlockChat, a friendly assistant for children aged 6–15 on Flocksy. Only discuss school subjects, general knowledge, hobbies, moral stories, encouragement, and age-appropriate fun facts. Never discuss romance, dating, violence, weapons, drugs, adult content, politics, or anything for ages 16+. Never ask for the child's address, school name, or phone number. If asked about something outside these topics, gently say you can't talk about that and suggest something fun instead. Keep replies short, warm, and simple."

Gemini API key stored as `GEMINI_API_KEY` in backend `.env`, never sent to frontend.

## 5. Frontend Structure (additions only)

```
src/
  pages/kids/
    KidsHome.jsx
    KidsSignup.jsx          // NEW — dual-email form
    KidsStoryReader.jsx
    KidsQuiz.jsx
    KidsGames/
      GuessTheAnimal.jsx
      TrueFalse.jsx
    KidsCanvas.jsx
    KidsRewards.jsx
    OtpEntryScreen.jsx      // updated: shows "waiting for parent approval" state via polling
  components/kids/
    KidsTile.jsx            // wraps existing <Card> with theme="kids"
    KidsButton.jsx          // wraps existing <Button> with size="lg" theme="kids"
    FlockChatWidget.jsx     // floating bubble, only mounted inside Kids layout
  context/
    KidsChatContext.jsx
  theme/
    kids-tokens.js           // pulls base tokens from existing theme file, overrides only accent + scale
```

**Reuse rule:** `KidsTile` and `KidsButton` must import and wrap the *existing* Adult Mode `<Card>` / `<Button>` primitives, not redefine new ones from scratch. Same font stack, same border-radius scale, same shadow tokens. Only the accent color and sizing scale differ, sourced from a `kids` variant already defined in (or added to) the shared theme file.

## 6. Security Notes (delta from existing SRS section 4.2)
- `parentEmail` never returned in any API response visible to the child's own client except on the signup confirmation screen once.
- `/api/otp/approve` and `/api/otp/deny` tokens are single-use, signed (HMAC with a dedicated secret, not the main JWT secret), and expire with the OTP (10 min).
- Rate-limit `/api/kids/chat` per child (e.g., 30 messages / 10 min) to control Gemini free-tier usage and prevent abuse.
- Role-guard middleware (`requireRole('CHILD')`) added to all Kids Mode + chat routes; `requireRole('ADULT')` NOT required anywhere for entering Kids Mode (per 3.2 asymmetry).

## 7. Non-Goals for This Phase
No Docker. No new microservice for chat (stays inside existing Express backend). No redesign of Adult Mode. No changes to existing Adult Mode DB fields beyond the additive `parentEmail` on `User` and the migration of any prior `parentContact` field.
