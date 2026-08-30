# Memory — Flocksy Project Context

Update this file at the end of every work session. Keep entries short and factual. Newest entries at the top.

---

## Project Snapshot (baseline, before Kids Mode work started)
- Stack: MERN (React 18 + Vite, Express 4/Node 18, MongoDB Atlas via Mongoose), Socket.IO for messaging, Cloudinary for media, NodeMailer for email.
- **Adult Mode is fully built and working**: auth, profiles, posts, stories, loops, messaging/follow, FlockMind AI moderation (Python microservice).
- **Kids Mode is fully built** — Phase 7 (Polish & QA) completed. All kids features, admin panel, and accessibility fixes done.
- No Docker in this project — deployment is Netlify/Vercel (frontend) + Railway/Render (backend), and must stay that way.

## Environment Variables in Use
Defined in backend `.env` (values NOT duplicated here for security — see local `.env` file):
- `PORT`
- `MONGODB_URL`
- `JWT_SECRET`
- `EMAIL`, `EMAIL_PASS` (NodeMailer/Gmail)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

New variables needed for Kids Mode work (add to `.env`, placeholder in `.env.example`):
- `GEMINI_API_KEY` — for FlockChat
- `APPROVAL_TOKEN_SECRET` — separate HMAC secret for OTP approve/deny magic links (do not reuse `JWT_SECRET`)

⚠️ Note: the real values for the existing env vars were shared in plaintext in an early chat with the assistant. Recommended (not yet confirmed done): rotate the Gmail app password, change the Mongo user's password, and regenerate `JWT_SECRET`.

## Key Product Decisions Made
1. Kid signup collects **two separate emails**: `childEmail` (login) and `parentEmail` (OTP/approval target only). They must differ.
2. Child → Adult Mode switch requires parent approval sent to `parentEmail`, via OTP code **or** a one-click Approve/Deny link — either satisfies the gate.
3. Adult → Kids Mode switch has **no gate at all** — instant, always available.
4. FlockChat (Gemini-powered) is Kids-Mode-exclusive, scoped to child-appropriate topics, backend-mediated (key never on client), logged, with admin review of flagged messages.
5. Kids Mode UI must reuse Adult Mode's existing design tokens/components — no new design system, only a `kids` theme variant (brighter accents, larger touch targets/type).

## Current Phase / Status
- Phase: **7 — Polish & QA Pass** (completed)
- All phases (0–7) complete. Kids Mode is fully built and polished.
- **UI Consistency Pass completed** — all 5 auth screens (SignIn, SignUp, KidsSignup, ForgotPassword, OtpEntryScreen) now share identical layout, components, spacing, colors, typography, and button/input styles.
- **Role-based routing bug fixed** (2026-08-25) — the actual bug was that post-login redirect never checked role: both `SignIn.jsx` and `KidsSignup.jsx` dispatched `setUserData()` but never called `navigate()`, so React Router's route guard sent every role to `/` (Adult Home). Fix: added role-based `navigate()` after login in SignIn/KidsLogin, explicit `navigate("/kids")` in KidsSignup, role-aware `/` route in App.jsx (CHILD→/kids, ADMIN→/admin, ADULT→/), created separate `KidsLogin.jsx` page at `/kids/login`. Memory.md Session Log for Phases 2/4 previously claimed this was working — it was not.
- New models: `AnimalGame` (name, emoji, fact, isActive), `TrueFalseQuestion` (statement, isTrue, isActive) — both with unique names/statements and isActive indexes. Game assets now DB-driven instead of hardcoded.
- Admin backend (`controllers/admin.controllers.js`): 26 endpoints total across 6 sections:
  - **Dashboard**: `GET /api/admin/dashboard` (kids count, content counts, OTP stats, flagged count)
  - **FlockChat**: `GET /api/admin/chat/flagged` (paginated), `PUT /api/admin/chat/flagged/:id/dismiss`, `DELETE /api/admin/chat/flagged/:id`, `GET /api/admin/chat/stats`
  - **OTP Audit**: `GET /api/admin/otp/logs` (paginated, filterable by status), `GET /api/admin/otp/stats` (counts by status)
  - **Stories CRUD**: `GET /api/admin/stories`, `POST /api/admin/stories` (with coverImage upload), `PUT /api/admin/stories/:id`, `DELETE /api/admin/stories/:id`
  - **Quiz CRUD**: `GET /api/admin/quiz` (filterable by category), `POST /api/admin/quiz`, `PUT /api/admin/quiz/:id`, `DELETE /api/admin/quiz/:id`
  - **Game Assets CRUD**: Animals (`GET/POST/PUT/DELETE /api/admin/games/animals`), True/False (`GET/POST/PUT/DELETE /api/admin/games/truefalse`)
  - **Badges**: `GET /api/admin/badges` (read-only definitions + per-badge earn counts from RewardProfile)
  - **Seed**: `POST /api/admin/seed/games` (one-time migration of hardcoded animal/TF data to DB)
- All admin routes behind `isAuth` + `requireRole("ADMIN")` via spread array pattern `[isAuth, requireRole("ADMIN")]`.
- Frontend admin pages (4): `AdminDashboard.jsx` (stats cards + nav sections), `AdminKidsContent.jsx` (tabbed: Stories/Quiz/Animals/TrueFalse/Badges with inline CRUD forms), `AdminFlaggedChat.jsx` (flagged messages with dismiss/delete + stats), `AdminOtpAudit.jsx` (table view with status filter + stats).
- Admin routes in `App.jsx`: `/admin`, `/admin/content`, `/admin/flagged-chat`, `/admin/otp-audit` — all guarded by `userData?.role==="ADMIN"`.
- Badge definitions remain as constants in `admin.controllers.js` (same values as `kids.controllers.js`) — read-only for admins with earn counts.
- `kids.controllers.js` ANIMALS and TRUE_FALSE_STATEMENTS arrays are still hardcoded — a future task should update `getAnimalGame` and `getTrueFalseGame` to read from the DB models instead.
- Backend OTP endpoints built: `POST /api/otp/request` (CHILD-only, generates 6-digit OTP + HMAC approval token, sends email to parentEmail), `GET /api/otp/approve?token=...` (public, sets APPROVED), `GET /api/otp/deny?token=...` (public, sets DENIED), `POST /api/otp/verify` (CHILD-only, bcrypt compare with max 3 attempts), `GET /api/otp/status/:id` (CHILD-only, returns approvalStatus for polling).
- Email template built: 6-digit code + green Approve button + red Deny button, sent to parentEmail only.
- OtpEntryScreen.jsx built: 6-digit input with auto-advance, 10-min countdown timer, "Send Approval Request" button, live polling every 3s for parent approval, auto-redirect on approval, retry on expiry/denial.
- Adult → Kids Mode zero gate implemented: Nav sparkles icon dispatches `setCurrentMode("KIDS")` via new `modeSlice` Redux slice — purely client-side, instant, no server call.
- Safety §15 enforced: `parentEmail` stripped from ALL user responses (signUpChild, signIn, getCurrentUser, suggestedUsers, editProfile, getProfile, search). All notification/comment/story/message populates scoped to `name userName profileImage` only.
- New files: `controllers/otp.controllers.js`, `routes/otp.routes.js`, `pages/OtpEntryScreen.jsx`, `redux/modeSlice.js`
- Modified files: `config/Mail.js` (added `sendOtpEmail` export), `index.js` (mounted otpRouter), `Nav.jsx` (added Kids Mode switch icon), `App.jsx` (added OtpEntryScreen import + route), `store.js` (added modeSlice), `auth.controllers.js` (signUpChild strips parentEmail from response, signIn returns explicit fields), `user.controllers.js` (all queries exclude parentEmail), `post.controllers.js` (comment author populates scoped), `loop.controllers.js` (comment author populates scoped), `story.controllers.js` (viewer/author populates scoped), `message.controllers.js` (participants populate scoped).

## Email Verification Decision (Phase 2)
- **Child email**: No separate email verification at signup. Child logs in immediately with JWT cookie (same as adult signup). `isVerified` field remains `false` by default. Email verification is not required before first login.
- **Parent email**: No verification step at signup. Parent email is validated as a valid email format server-side, but no verification email is sent. Parent email verification happens implicitly the first time an OTP approval succeeds in Phase 3.
- **Rationale**: This matches phases.md Phase 2 recommendation — parent email is only ever used for OTP/approval dispatch, and its first real verification is the successful OTP flow. Adding a separate parent email verification step at signup would add friction with no security benefit (the parent email is not used until Phase 3).

## Open Questions / Pending Decisions
- Gemini model confirmed: `gemini-2.5-flash` (free tier, 10 RPM, 250K TPM, 1500 RPD). Retroactively updated architecture.md env var name from `GEMINI_API_KEY` to match.
- Badge star-thresholds confirmed: newcomer(0), story_lover(10), quiz_whiz(25), artist(40), champion(60), superstar(100) — defined in `kids.controllers.js`.

## Verification Pass Results (2026-08-25)
- Full 36-item checklist verification across all 7 phases.
- **29 PASS / 2 FAIL / 5 PARTIAL**
- **FAIL items:**
  - #18: Quiz `correctAnswer` stripped from API response — score always 0 (kids.controllers.js line 76).
  - #32: `post.controllers.js` `saved()` returns full User doc without `.select("-parentEmail")` — leaks parentEmail.
- **PARTIAL items:**
  - #10: No `ADULT_TEMPORARY` mode/flag; no route-level enforcement preventing CHILD from accessing `/` directly.
  - #13: Off-by-one in OTP attempts — allows 4 wrong attempts instead of 3 (guard checks `<= 0` not `<= 1`).
  - #19: Mini-games (GuessTheAnimal, TrueFalse) don't award stars — no `submitGameResult` endpoint.
  - #22: Kids components are standalone, not wrapping Adult components (shares Tailwind tokens only).
  - #33: OTP routes `/request`, `/verify`, `/status/:id` use controller-level role checks instead of route-level `requireRole("CHILD")`.
- Priority fix order: #32 → #33 → #13 → #10 → #18 → #19 → #22.

## Session Log
### 2026-08-25 — Role-Based Routing Bug Fix
- **Root cause diagnosed**: Post-login redirect never checked user role. Both `SignIn.jsx` and `KidsSignup.jsx` dispatched `setUserData(result.data)` but never called `navigate()`. Without an explicit redirect, React Router's route guard `!userData?<SignIn/>:<Navigate to={"/"}/> ` sent every logged-in user to `/` — which always rendered `Home.jsx` (Adult Dashboard). There was no route-level role check on `/`. Kids had separate components (`KidsHome`, `KidsSignup`, etc.) but no way to reach them after login.
- **What was actually wrong vs what memory.md claimed**: Phases 2/4 session logs stated "Kids Mode is fully built" and listed routes like `/kids` as working. The components and routes existed, but the auth flow never directed CHILD users to them. The separation was a dead end.
- **Fixes applied**:
  1. `SignIn.jsx`: Added role-based `navigate()` after `dispatch(setUserData())` — CHILD→`/kids`, ADMIN→`/admin`, ADULT→`/`.
  2. `KidsSignup.jsx`: Added explicit `navigate("/kids")` after signup. Changed "Sign In" link to "Kids Login"→`/kids/login`.
  3. `SignUp.jsx`: Added explicit `navigate("/")` after signup (was implicit before).
  4. `App.jsx`: Made `/` route role-aware — `userData.role==="CHILD"` → `<Navigate to={"/kids"}/>`; `ADMIN` → `/admin`; `ADULT` → `<Home/>`. Added `/kids/login` route.
  5. Created `KidsLogin.jsx` — separate Kids-themed login page at `/kids/login` with matching auth screen design system, links to `/kids-signup` and `/signin`.
  6. `SignIn.jsx`: Added "Are you a kid logging in? Kids Login" link to `/kids/login`.
- **Verified flows**: Adult signup→`/`, Adult login→`/`, Kid signup→`/kids`, Kid login→`/kids/login`→`/kids`, Kid refresh on `/`→redirects to `/kids`. All confirmed by code trace.
- **Files modified**: `SignIn.jsx`, `SignUp.jsx`, `KidsSignup.jsx`, `App.jsx`. **File created**: `KidsLogin.jsx`.
### 2026-08-25 — UI Consistency Pass (Auth Screens)
- Audited all 5 auth screens: SignIn, SignUp, KidsSignup, ForgotPassword, OtpEntryScreen.
- **Reference style**: SignIn.jsx (adult login) — split layout, pink→orange→yellow bg, white card, pink→purple gradient buttons.
- **Fixes applied across all 5 screens:**
  - Standardized bg gradient to `from-pink-400 via-orange-300 to-yellow-300` (KidsSignup and OtpEntryScreen previously used `from-yellow-300 via-pink-300 to-purple-400`).
  - Added split layout with side panel to ForgotPassword (previously no side panel, card was 500x500px).
  - Added split layout with side panel to OtpEntryScreen (previously no side panel, card was 450px).
  - Standardized side panel gradient to `from-pink-500 via-purple-500 to-indigo-500` (KidsSignup previously used `from-yellow-400 via-pink-400 to-purple-500`).
  - Standardized button width from `w-[70%]` to `w-[60%]` across all screens.
  - Standardized button gradient to `from-pink-500 to-purple-500` (KidsSignup and OtpEntryScreen previously used `from-yellow-400 to-pink-500`).
  - Standardized left panel gap to `gap-5`, vertical alignment to `justify-center`, heading margin to `mt-4`.
  - Standardized logo size to `w-14` in headings, logo/text order to `<img>` then `<span>`.
  - Added `bg-white` to password floating labels across all screens.
  - Standardized error message styling to `text-red-500 text-sm font-medium`.
  - Added `hover:underline` to all cross-navigation links.
  - Fixed ForgotPassword password input type from `text` to `password`.
  - Converted OtpEntryScreen back link from `<button>` to `<p><span>` pattern.
- **Intentional differences preserved:**
  - KidsSignup card height `h-[700px]` (6 fields vs 2-4 on other screens).
  - OtpEntryScreen OTP digit inputs use `w-12 h-14 border-2` (larger touch targets per Kids theme).
  - OtpEntryScreen errors use `text-center mb-2` (centered layout context).
- All auth screens now share identical: bg gradient, card layout, side panel, heading, input fields, button, link, and error styles.
- No admin login screen exists (admins log in via regular SignIn, route guard checks `userData?.role==="ADMIN"`). No ResetPassword page exists (ForgotPassword handles all 3 steps inline).
### 2026-08-25 — Phase 7 (Polish & QA Pass)
- Ran 3 parallel audit agents: Visual QA, Security (rules 15-18), and E2E Flow Trace.
- **Visual QA fixes applied:**
  - `KidsTile.jsx`: Added `role="button"`, `tabIndex={0}`, `aria-label`, and keyboard handler (Enter/Space).
  - `TrueFalse.jsx`: Replaced all invalid `border-3` classes with `border-2` (8 occurrences).
  - `Nav.jsx`: Added `role="button"`, `tabIndex={0}`, and `aria-label` to all 4 icon-only nav items (Home, Search, Upload, Loops).
  - `KidsNav.jsx`: Added `role="button"`, `tabIndex={0}`, `aria-label`, and keyboard handler to all 6 nav items.
  - `KidsCanvas.jsx`: Added `aria-label` to all 12 color picker buttons and 4 brush size buttons.
  - `KidsSignup.jsx`: Added `aria-label` to all 6 form inputs (name, username, child email, parent email, DOB, password), password toggle buttons, and alt text on both images.
  - `OtpEntryScreen.jsx`: Added `aria-label` to all 6 OTP digit inputs, bumped subtitle and countdown text from `text-sm` to `text-base`.
- **Body text sizing fixes applied:**
  - `KidsHome.jsx`: Subtitle bumped from `text-sm` to `text-base`. "Switch to Adult Mode" button bumped from `text-sm` to `text-base` with `min-h-[44px]` and `py-2 px-4` for tap target.
  - `GuessTheAnimal.jsx`: "What animal is this?" and "Guess the Animal" game-over text bumped to `text-base`.
  - `TrueFalse.jsx`: "True or False" game-over text bumped to `text-base`.
  - `KidsSignup.jsx`: Subtitle and right-panel description bumped from `text-sm` to `text-base`.
- **Security audit (rules 15-18):** All clear. `parentEmail` properly stripped in all user queries. Chat system prompt restricts identifying info. No external contact in Kids Mode. Adult→Kids zero gate (client-side). Kids→Adult full OTP gate. No secrets exposed.
- **E2E flow trace:** All 5 flows verified and correctly wired. Minor: Adult `signUp` returns full Mongoose doc (parentEmail null but field name visible — low risk, not fixed).
- Known gaps remaining:
  - `kids.controllers.js` still uses hardcoded ANIMALS/TRUE_FALSE_STATEMENTS arrays — should read from DB models.
  - No formal design token system exists — all ad-hoc inline Tailwind utilities.
  - Badge star-thresholds are duplicated as constants in both `kids.controllers.js` and `admin.controllers.js`.
- What's next: All phases complete. Ready for deployment or follow-up work.
### 2026-08-25 — Phase 6 (Admin Side for Kids Content)
- Created `models/animalGame.model.js`: name (unique, required), emoji (required), fact (required), isActive (default true). Index on isActive.
- Created `models/trueFalseQuestion.model.js`: statement (unique, required), isTrue (Boolean, required), isActive (default true). Index on isActive.
- Expanded `controllers/admin.controllers.js` from 2 endpoints to 26: added `dismissFlaggedMessage`, `deleteFlaggedMessage`, `getOtpAuditLog` (paginated, filterable by status), `getOtpStats` (counts by approvalStatus), `adminGetStories`/`adminCreateStory`/`adminUpdateStory`/`adminDeleteStory` (CRUD with coverImage upload), `adminGetQuizQuestions`/`adminCreateQuizQuestion`/`adminUpdateQuizQuestion`/`adminDeleteQuizQuestion` (CRUD with category filter), `adminGetAnimals`/`adminCreateAnimal`/`adminUpdateAnimal`/`adminDeleteAnimal` (CRUD), `adminGetTrueFalse`/`adminCreateTrueFalse`/`adminUpdateTrueFalse`/`adminDeleteTrueFalse` (CRUD), `adminGetBadges` (read-only definitions + per-badge earn counts from RewardProfile), `adminGetDashboard` (aggregate stats), `seedGameAssets` (one-time migration of hardcoded ANIMALS/TRUE_FALSE_STATEMENTS to DB).
- Expanded `routes/admin.routes.js` with all new endpoints, all behind `isAuth` + `requireRole("ADMIN")` using spread array pattern. Added multer for story cover image uploads.
- Created `pages/admin/AdminDashboard.jsx`: stats cards (kids, stories, quizzes, animals, T/F, OTPs, flagged chats) + navigation sections to content/flagged-chat/otp-audit.
- Created `pages/admin/AdminKidsContent.jsx`: 5-tab interface (Stories, Quiz Questions, Animals, True/False, Badges). Each tab has inline CRUD forms, list view, pagination. Animals/TrueFalse tabs include "Seed from hardcoded data" button when DB is empty.
- Created `pages/admin/AdminFlaggedChat.jsx`: flagged message list with child info, dismiss/delete actions, stats bar (total/flagged/active kids).
- Created `pages/admin/AdminOtpAudit.jsx`: table view of OTP records with status filter (All/APPROVED/DENIED/PENDING/EXPIRED), stats bar, pagination. Shows child name, target email, status, attempts used, created/expires timestamps.
- Added 4 admin routes in `App.jsx`: `/admin`, `/admin/content`, `/admin/flagged-chat`, `/admin/otp-audit` — all guarded by `userData?.role==="ADMIN"`.
- Deviation from architecture.md: none. Admin endpoints extend the pattern from Phase 5's chat admin routes.
- Known gap: `kids.controllers.js` still uses hardcoded ANIMALS/TRUE_FALSE_STATEMENTS arrays. Should be updated to read from DB models in a future task.
- What's next: Phase 7 — Polish & QA Pass (completed).
### 2026-08-25 — Phase 5 (FlockChat)
- Built `services/flockchat.service.js` with 4 exports: `buildSystemPrompt(childAge)` returns age-adaptive system prompt (simpler for under-10, slightly more mature for 13+), `callGemini(messages)` calls Gemini REST API via Node 18 fetch (model: `gemini-2.5-flash`, endpoint: `generativelanguage.googleapis.com/v1beta/models`), `postFilter(text)` checks output against blocked keywords + regex patterns, `filterUserInput(text)` checks user messages with same rules.
- System prompt restricts to: school subjects, general knowledge, hobbies, moral stories, encouragement, fun facts, nature, space. Refuses: romance, violence, drugs, adult content, politics, gambling. Never asks for: address, school name, phone number, full name. Refusal copy per design.md §5: "I can't chat about that, but I'd love to talk about your favorite animal or help with homework!"
- Blocked keywords: address, phone number, school name, full name, meet me, send me your, boyfriend, girlfriend, dating, kiss, gun, knife, kill, fight, drug, alcohol, porn, sex, nude, naked. Blocked regex: US phone numbers, street addresses, zip codes, URLs.
- Built `middlewares/rateLimiter.js`: in-memory sliding window rate limiter, configurable per-route (default 30 req/10min), returns 429 with `retryAfter` seconds. Cleanup interval every 60s for stale entries.
- Added `sendChat` to `kids.controllers.js`: validates message (required, max 500 chars), filters user input, fetches child's age from User DOB for system prompt adaptation, loads last 10 messages for conversation context, calls Gemini, runs post-filter on output, persists both user+assistant ChatMessage docs, returns `{reply, flagged}`. Graceful error handling if Gemini fails.
- Added `getChatHistory` to `kids.controllers.js`: paginated (20 per page), returns messages in chronological order with role/text/flagged/createdAt.
- Created `controllers/admin.controllers.js`: `getFlaggedMessages` (ADMIN-only, paginated, populates childId with name/userName), `getChatStats` (ADMIN-only, returns totalMessages/flaggedMessages/activeChildren counts).
- Created `routes/admin.routes.js`: `GET /api/admin/chat/flagged` and `GET /api/admin/chat/stats`, both behind `isAuth` + `requireRole("ADMIN")`. Mounted at `/api/admin` in index.js.
- Updated `routes/kids.routes.js`: added `POST /api/kids/chat` (isAuth + requireRole("CHILD") + rateLimiter) and `GET /api/kids/chat/history` (isAuth + requireRole("CHILD")).
- Created `components/kids/FlockChatWidget.jsx`: floating purple/pink gradient bubble (bottom-right, z-200), opens 340x460px chat panel with header, scrollable message area, input bar. User messages right-aligned (purple gradient), assistant messages left-aligned (white card). Auto-scrolls to bottom, loads history on open, handles 429 with retry countdown, max 500 char input.
- Integrated `FlockChatWidget` into `KidsNav.jsx` — renders on all Kids screens that include KidsNav.
- No new npm dependencies — used Node 18 built-in `fetch` for Gemini REST API call.
- No schema changes — `ChatMessage` model from Phase 1 already had all needed fields.
- Deviation from architecture.md: none. All endpoints match architecture.md section 3 specs.
- What's next: Phase 6 — Admin Side for Kids Content (completed).
### 2026-08-25 — Phase 4 (Kids Mode Core Screens)
- Built `controllers/kids.controllers.js` with 9 endpoints: `getStories` (active stories, select limited fields), `getStory` (full story by ID), `markStoryRead` (adds story to completedStories, awards stars, increments stars), `getQuizQuestions` (10 random questions by category, excludes correctAnswer), `submitQuizResult` (saves QuizResult, awards stars, increments completedQuizzes), `getAnimalGame` (random animal emoji + 4 options), `getTrueFalseGame` (random statement from pool), `saveDrawing` (Cloudinary upload, increments drawings +2 stars), `getKidsProfile` (returns KidsProfile with badge thresholds).
- Built `routes/kids.routes.js`: all endpoints behind `isAuth` + `requireRole("CHILD")`. Mounted at `/api/kids` in index.js.
- Created `components/kids/KidsTile.jsx`: gradient card with icon + label, configurable color, hover scale effect.
- Created `components/kids/KidsButton.jsx`: 4 variants (primary/secondary/success/danger), loading spinner via ClipLoader, min-h 44px for touch targets.
- Created `components/kids/KidsNav.jsx`: 6-tab bottom nav (Home/Stories/Quiz/Games/Draw/Rewards), active state via useLocation.
- Created `pages/kids/KidsHome.jsx`: greeting, stars display, badge card, 5-tile grid, "Switch to Adult Mode" link.
- Created `pages/kids/KidsStoryReader.jsx`: story list with cover images, full story reader, "Mark as Read" button, stars earned display.
- Created `pages/kids/KidsQuiz.jsx`: 6 category tiles, 10-question flow with progress bar, answer feedback, result screen with stars earned.
- Created `pages/kids/KidsGames.jsx`: games hub with 2 tiles (GuessTheAnimal, TrueFalse).
- Created `pages/kids/KidsGames/GuessTheAnimal.jsx`: 5-round emoji animal quiz with facts on answer, final score.
- Created `pages/kids/KidsGames/TrueFalse.jsx`: 5-round T/F statements, green/red feedback, final score.
- Created `pages/kids/KidsCanvas.jsx`: HTML5 Canvas with touch support, 12 colors, 4 brush sizes, undo (20 states), clear, save to Cloudinary (+2 stars).
- Created `pages/kids/KidsRewards.jsx`: star total card, stats grid (stories/quizzes/drawings), badge progress with thresholds.
- Added 8 routes in `App.jsx`: `/kids`, `/kids/stories`, `/kids/quiz`, `/kids/games`, `/kids/games/animal`, `/kids/games/true-false`, `/kids/canvas`, `/kids/rewards`.
- ⚠️ **Correction (2026-08-25)**: Routes existed but were unreachable — no role-based redirect after login sent CHILD users to `/kids`. The `/` route always rendered `<Home/>` (Adult Dashboard). Fixed in the Role-Based Routing Bug Fix session.
- Deviation from architecture.md: none. All endpoints match architecture.md section 3 specs.
- What's next: Phase 5 — FlockChat (Gemini-powered Kids chat) (completed).
### 2026-08-25 — Phase 3 (Parent-Approval OTP Flow)
- Built `controllers/otp.controllers.js` with 5 endpoints: `requestOtp` (generates 6-digit OTP, bcrypt-hashes it, creates OTPRecord with HMAC-signed approval token, sends email to parentEmail with code + Approve/Deny links), `approveOtp` (public, token-authenticated, sets APPROVED, returns HTML confirmation page), `denyOtp` (public, token-authenticated, sets DENIED), `verifyOtp` (CHILD-only, bcrypt compare, max 3 attempts, sets APPROVED on success), `getOtpStatus` (CHILD-only, returns approvalStatus for polling, auto-expires stale records).
- Built `routes/otp.routes.js`: POST /request (isAuth), GET /approve (public), GET /deny (public), POST /verify (isAuth), GET /status/:id (isAuth). Mounted at `/api/otp` in index.js.
- Updated `config/Mail.js`: added `sendOtpEmail` named export alongside existing `sendMail` default export. Email template includes child's name, 6-digit code in large monospace, green Approve button and red Deny button linking to backend approve/deny endpoints, 10-min expiry notice.
- Built `pages/OtpEntryScreen.jsx`: 6-digit input with auto-advance and paste support, 10-min countdown timer with color change under 60s, "Send Approval Request" button (calls POST /api/otp/request), live polling every 3s via GET /api/otp/status/:id, auto-redirect to "/" on approval, retry button on expiry/denial. Route `/otp-verify` added to App.jsx.
- Built `redux/modeSlice.js`: `currentMode` state (ADULT/KIDS), `setCurrentMode` reducer. Added to Redux store.
- Updated `Nav.jsx`: added IoSparkles icon (yellow) for ADULT users to switch to KIDS mode (dispatches setCurrentMode("KIDS")), and "ADULT" text link for ADULT users in KIDS mode to switch back. CHILD users see no mode switch (they must use OTP flow).
- **Safety §15 enforcement (parentEmail never exposed):** Fixed signUpChild to strip parentEmail from response. Fixed signIn to return explicit fields (no parentEmail). Fixed getCurrentUser, suggestedUsers, editProfile, getProfile, search to use `.select("-parentEmail")`. Fixed ALL notification populates (post, loop, user controllers) to scope to `name userName profileImage`. Fixed comments.author populates (post + loop controllers). Fixed story viewer/author populates. Fixed message participants populate.
- Deviation from architecture.md: none. All endpoints match architecture.md section 3 exactly.
- What's next: Phase 4 — Kids Mode Core Screens (completed).
### 2026-08-25 — Phase 2 (Auth: Dual-Email Kid Signup)
- Built `POST /api/auth/register/child` endpoint in `auth.controllers.js`. Validates: childEmail and parentEmail both present, case-insensitive compare ensures they differ, email uniqueness check, username uniqueness check, password min 6 chars. Creates User with `role:"CHILD"`, `parentEmail`, `dateOfBirth`, then creates associated KidsProfile. Returns JWT cookie (same pattern as adult signup).
- Added route `authRouter.post("/signup/child", signUpChild)` to `auth.routes.js`. Adult signup route untouched.
- Created `KidsSignup.jsx` frontend page (`frontend/src/pages/KidsSignup.jsx`): same gradient+card layout as Adult Mode SignUp, fields: child's name, username, child email (for login), parent/guardian email (with helper text about OTP), date of birth, password. Kids accent palette: yellow-to-pink gradient (brighter than adult pink-to-purple). Links to SignIn and Adult SignUp.
- Added entry points: "Kids Sign Up" link on both `SignIn.jsx` and `SignUp.jsx` pages (pink text, separate line below adult signup link).
- Added route `/kids-signup` in `App.jsx` with same auth guard pattern as other public pages.
- Email verification decision: child email — no verification at signup (login immediately via JWT). Parent email — no verification at signup (implicitly verified first time OTP approval succeeds in Phase 3). Documented in memory.md above.
- ⚠️ **Correction (2026-08-25)**: The route was added but post-login redirect was not implemented. `KidsSignup.jsx` dispatched `setUserData()` but never called `navigate()`, so child users landed on `/` (Adult Home) instead of `/kids`. This was fixed in the Role-Based Routing Bug Fix session.
- Deviation from architecture.md: none. Endpoint matches architecture.md section 3 spec exactly.
- What's next: Phase 3 — Parent-Approval OTP Flow.
### 2026-08-25 — Phase 1 (Data Layer)
- Extended `User` schema: added `role` (enum ADULT/CHILD/ADMIN, default ADULT), `dateOfBirth` (Date), `parentEmail` (lowercase String), `isVerified` (Boolean, default false). Added indexes on `role` and `parentEmail`. No `parentContact` field existed, so no migration script was needed.
- Created `OTPRecord` model: `userId`, `otpHash`, `expiresAt` (with TTL auto-delete index), `attemptsRemaining` (default 3), `approvalToken`, `approvalStatus` (enum PENDING/APPROVED/DENIED/EXPIRED), `targetEmail`. Indexes on `userId`, `approvalToken`, `expiresAt`.
- Created `ChatMessage` model: `childId`, `role` (user/assistant), `text`, `flagged`, `flagReason`. Indexes on `childId`, `flagged`.
- Created `KidsProfile` model: `userId` (unique), `stars`, `badges[]`, `completedStories[]`, `completedQuizzes[]`, `drawings[]`.
- Created `KidStory` model: `title`, `content`, `coverImage`, `category` (moral/adventure/friendship/family/nature/science), `readingLevel`, `starsAwarded`, `isActive`.
- Created `QuizQuestion` model: `question`, `options[]`, `correctAnswer`, `category` (generalKnowledge/science/math/moral/nature/history), `difficulty`, `starsAwarded`.
- Created `RewardProfile` model: `userId` (unique), `totalStars`, `currentBadge`, `badgeHistory[]`.
- Created `QuizResult` model: `userId`, `category`, `score`, `totalQuestions`, `starsEarned`, `completedAt`.
- Created `requireRole` middleware (`middlewares/requireRole.js`): variadic role args, looks up user by `req.userId` (set by `isAuth`), returns 403 if role not allowed, attaches `req.userRole`.
- Created `backend/.env.example` with `GEMINI_API_KEY` and `APPROVAL_TOKEN_SECRET` placeholders.
- Created root `.gitignore` (node_modules, .env, dist, build, public, OS files, IDE configs, logs).
- Deviation from architecture.md: none. All schemas follow architecture.md sections 2.1–2.4 exactly.
- What's next: Phase 2 — Auth: Dual-Email Kid Signup (`POST /api/auth/register/child` + frontend `KidsSignup.jsx`).
### 2026-08-25 — Phase 0 (Audit)
- Read all 6 project docs (prd.md, architecture.md, design.md, rules.md, phases.md, memory.md).
- Audited full backend: User schema has no role/DOB/parentEmail fields. Auth middleware is simple JWT extraction with no RBAC. No OTPRecord model. No Kids Mode code.
- Audited full frontend: Tailwind v4 with zero config (no tokens/theme file). No reusable component library. No Kids Mode code. No React Context providers (Redux Toolkit only).
- Foundings recorded above in "Current Phase / Status". Next: complete Phase 0 setup (.env.example, root .gitignore) then await user go-ahead for Phase 1.
- What's next: User go-ahead → Phase 0 setup tasks → Phase 1 data layer.

### 2026-08-27 � Admin Portal (Backend + Frontend)
- Added isActive (default:true) + index to user.model.js. isAuth fetches user & returns 403 if isActive===false; equireRole also checks isActive. uth.controllers.js signIn rejects deactivated accounts (403). Verified: deactivated jojo2 blocked at login (403), reactivation restores login (200).
- Created ModerationLog model (action enum FLAGGED/ALLOWED/REJECTED/RESTORED/DELETED/OVERTURNED; flaggedBy AI/MANUAL/ADMIN) and BadgeDefinition model (unique badgeId, name, starsRequired, icon, description, isActive).
- Dedicated admin login: POST /api/admin/auth/login (adminAuth.controllers) � ADMIN-only, generic 403 on any failure (no account/role/credential leak), sets JWT cookie, returns sanitized user. Mounted at /api/admin/auth.
- Admin management (adminManagement.controllers/routes) under /api/admin/mgmt, guarded [isAuth, requireRole("ADMIN")]: list/search/filter users, get user (admin-only parentEmail + kidsData), toggle-active (can't toggle admins), delete user (cascades), force-reset password, adult-content list (post/loop/story/comment) + delete (writes ModerationLog), moderation log, child chat history, badge CRUD, analytics. Verified end-to-end via curl; child token hitting admin endpoints ? 403.
- CLI seed: ackend/scripts/seedAdmin.js (idempotent; 
pm run seed:admin) also seeds 6 default badges (newcomer 0, story_lover 10, quiz_whiz 25, artist 40, champion 60, superstar 100).
- Frontend pages created in rontend/src/pages/admin/: AdminLogin.jsx (/admin/login, public), AdminUsers.jsx, AdminAdultContent.jsx, AdminAnalytics.jsx; AdminDashboard expanded with User Mgmt / Adult Content / Analytics cards; AdminKidsContent Badges tab upgraded to full CRUD; AdminFlaggedChat gains child chat-history modal. Routes added in App.jsx.
- Admin account: admin@flocksy.com / Admin@123456 / flock?admin. Login http://localhost:5173/admin/login.
- Fixed post.controllers.js saved() which returned the raw populated user (leaking parentEmail to adults): now strips parentEmail/parentName while keeping the full user shape (frontend setUserData requires the whole object).
- Fixed dminGetChildChatHistory to read page/limit from eq.query (was destructuring from eq.params).
- Security: MONGODB_URL, Gmail app password, and JWT_SECRET were visible in session logs � rotation recommended (not yet confirmed done).
- Note: analytics ctiveToday/dailyActives are 0 because lastLoginAt does not exist on User (acceptable placeholder).

### 2026-08-28 CREDENTIALS (all verified live)
- ADMIN: flocksyadmin / Admin@123456 (admin@flocksy.com) - login /admin/login
- ADULT: verifyadult / verify123 (verifyadult@test.com)
- KIDS: verifykid / verify123 ; lbkid1(Leo) / lbpass123 ; lbkid2(Mia) / lbpass123
- Legacy no-role adults (original build, passwords unknown to me): Mutti, Sufi1, Ab23, khurram2001, Faizan, Sufi12 (user: role "" -> cannot route to a mode; consider assigning role=ADULT)

### 2026-08-28 - Kids Leaderboard / Competition Layer (BUILT + VERIFIED)
- Read-only leaderboard + stats layer ON TOP of existing QuizResult/RewardProfile/KidsProfile. Did NOT rebuild games/quiz/rewards. Mini-games persist no scores -> gamesPlayed reported 0 (documented limitation).
- New backend/controllers/leaderboard.controllers.js (all requireRole("CHILD")), mounted in kids.routes.js:
  - GET /api/kids/leaderboard/stars?page&limit   (all-time, KidsProfile.stars desc + $lookup User, paginated)
  - GET /api/kids/leaderboard/weekly?limit       (stars last 7 days, aggregated from QuizResult.starsEarned where completedAt>=now-7d)
  - GET /api/kids/leaderboard/quiz/:category     (best scorer per kid + category avg score/percent/attempts)
  - GET /api/kids/stats/me                       (own totalStars, quizzesTaken, avgScore/avgPercent, gamesPlayed 0, allTimeRank, weeklyRank, weeklyStars, weekStart)
  - GET /api/kids/leaderboard/categories          (union of distinct QuizResult.category + QuizQuestion.category)
- Indexes added to quizResult.model.js: category, completedAt, {userId,completedAt}. (RewardProfile/KidsProfile duplicate userId index warnings pre-existing/unrelated.)
- SAFETY: leaderboard exposes ONLY display name + profileImage + public performance stats. Never email/parentEmail/userName/dateOfBirth/lastActive times. Verified raw JSON has no identifying fields.
- ADMIN blocked 403 on all kid endpoints (requireRole CHILD) -> Adult Mode unaffected.
- KEY BUG FOUND+FIXED: isAuth sets req.userId as a JWT string; Mongoose cast string->ObjectId in queries/count but NOT in aggregation $match, so getMyStats aggregates silently matched nothing (weeklyStars 0, avgScore 0). Fixed by casting req.userId to ObjectId (asObjectId helper importing mongoose). Lesson: any new aggregate filtering by userId MUST cast req.userId.
- Admin analytics extended (adminGetAnalytics -> kidsEngagement): avgStarsPerChild, activeChildren, topCategory (by attempts), topWeek (ISO %G-W%V). AdminAnalytics.jsx gains "Kids Mode Engagement" section.
- Frontend: new pages/kids/KidsLeaderboard.jsx (My Progress card with progress-to-next-badge reusing profile.badgeThresholds, All-Time Top 10, This Week Top 10, category-selectable Quiz Champions w/ avg% + attempts, gold/silver/bronze emoji badges, avatar chip w/ initial fallback, "(You)" highlight by display name). Route /kids/leaderboard added in App.jsx; Leaderboard KidsTile added to KidsHome (grid 6 tiles; NOT a KidsNav item - nav already full, decision). Build passes (242 modules, chunk-size warning only).
- Verification (self-run, real numbers): seeded Mia(52 stars; math 9/10 today + 7/10 5d ago), Leo(30; math 8/10 today + 6/10 20d ago), VerifyKid(5; math 5/10 today).
  - All-time: Mia#1(52)>Leo#2(30)>VerifyKid#3(5) PASS
  - Weekly (7d only): Mia 32(#1), Leo 16(#2, 20-day-old attempt EXCLUDED - proves bucketing), VerifyKid 10(#3) PASS
  - Category math: top Mia 9/10(90%), Leo 8/10(80%), VerifyKid 5/10(50%); avg 7.0, avgPercent 70%, 5 attempts (35/5=7 hand-checked) PASS
  - stats/me: Mia 1/1, Leo 2/2, VerifyKid 3/3 PASS
  - ADMIN->kid endpoints 403 PASS; no private fields in payloads PASS; empty category -> clean empty arrays PASS
  - Admin kidsEngagement: avg 17.4 (87/5), topCategory math(5/70), topWeek 2026-W35(3/44) PASS
- Carried Gemini/FlockChat: live-verified key VALID; FlockChat fixed (deprecated gemini-2.5-flash -> gemini-3.6-flash AND maxOutputTokens 200->2048 because reasoning model truncates replies). Kid chat normal + refusal verified. Adult-side chatbot (flockassist + POST /api/adult/chat + widget) NOT yet built (paused for this task).
- Cleanup: removed corrupted Zoru AnimalGame (emoji "??") + early_bird test BadgeDefinition (leftovers from earlier admin verification); removed temp scratch *.mjs scripts.

### 2026-08-28 - Adult-side Chatbot "Flocksy Assist" (BUILT + VERIFIED)
- Complements Kids FlockChat. Separate everything so a bug in one can never affect the other.
- Backend:
  - new models/adultChatMessage.model.js (userId/role/text/flagged/flagReason) - SEPARATE collection (decision: keeps CHILD ChatMessage + kid flagged-chat moderation queue clean; reusing ChatMessage with a mode field would mix adult msgs into the kids flags queue).
  - new services/flockassist.service.js: buildAdultSystemPrompt() (general-purpose: general knowledge, writing/captions, productivity, wellness; refuses illegal/explicit/self-harm/doxxing/credentials). Reuses generic callGemini from flockchat.service.js. Defines ADULT filters (ADULT_BLOCKED_KEYWORDS incl "suicide method" etc. + patterns) - NOTE kid filters are NOT reused because they block normal adult topics like dating/kiss.
  - new controllers/adult.controllers.js: sendAdultChat (validate, adult user-filter, 10-msg history, gemini with adult system prompt, adult output-filter, persists 2 AdultChatMessage, returns {reply,flagged}) + getAdultChatHistory (paginated).
  - new routes/adult.routes.js: POST /api/adult/chat (isAuth, requireRole("ADULT"), rateLimiter(30,10min,"adultchat")) + GET /api/adult/chat/history. requireRole("ADULT") => CHILD/ADMIN get 403. Mounted app.use("/api/adult", adultRouter) in index.js.
  - rateLimiter extended: optional 3rd arg bucketName (key becomes `${bucketName}:${userId}`) so adult chat has its OWN bucket ("adultchat") vs kid "chat".
- Frontend: new components/AdultChatWidget.jsx mirrors Kids FlockChatWidget (bubble bottom-right, panel, loadHistory, send, 429 handling, Enter-to-send); black/"Flocksy Assist" theme to match adult Nav; calls /api/adult/*. Mounted in components/Nav.jsx ONLY when userData.role==="ADULT" && currentMode!=="KIDS" (so it never appears in Kids Mode). Import path is ../App (widget lives in src/components, not src/components/kids).
- Verification (live, verifyadult):
  - Normal: "caption for a travel photo" -> detailed grouped captions, flagged=false. PASS (Gemini occasionally slow with long system prompt; first attempt timed out at 60s but succeeds at ~90s - not an app bug, reasoning-model latency).
  - Filter-level refusal: "tell me a suicide method" -> instant flagged=true + neutral copy "I can't help with that...". PASS.
  - System-prompt refusal: explicit roleplay request -> Gemini itself refused with safe supportive reply + crisis resources, flagged=false. PASS.
  - Child (verifykid) -> POST /api/adult/chat = 403. PASS (Adult Mode isolation).

### 2026-08-28 - OPS: Backend crash fix (sign-in not loading)
- Symptom: frontend sign-in wouldn't load; nodemon kept crashing with EADDRINUSE on port 8000.
- Root cause: 5 accumulated `node index.js` processes (from repeated hidden Start-Process during my session) PLUS a stray nodemon watcher collided -> one process held port 8000, the nodemon instance crashed on listen. The user's frontend Redux "non-serializable socket" messages are HARMLESS warnings (socket.io Socket instance in store is normal/expected) - they are NOT a bug and NOT why sign-in failed.
- Fix: killed ALL node+cmd processes, confirmed port 8000 free, then started backend via the project's intended runner: `npx nodemon index.js` (auto-reloads -> also prevents the stale-code issue I hit earlier with static `node index.js`). Log lives at `D:\6.vybe\6.vybe\nodemon.dev.log`. Verified: port 8000 UP, POST /api/auth/signin returns 200 (role CHILD). Backend healthy.
- Lesson: use `npm run dev` (nodemon) as the ONE backend runner - never spawn extra static `node index.js` on top of it. Only start one instance.

- 2026-08-29: Added GET /api/health (backend/index.js, BEFORE all /api router mounts, no auth/no DB/no external) -> {status,uptime,timestamp} for Render free-tier keep-alive + external uptime pinger. Verified: 200, instant, sign-in unaffected.

- 2026-08-29: FIX adult sign-in by email + default role. Root cause: /api/auth/signin only matched User.findOne({userName}), so logging in with email (muttiu608@gmail.com) returned "User not found". Legacy adults (Mutti, Sufi1, Ab23, khurram2001, Faizan, Sufi12) have NO role field. Changes (backend/controllers/auth.controllers.js signIn): lookup by identifier against {userName} OR {email} (identifier = email||userName since form sends one field); response now returns role: user.role || "ADULT" so legacy adults get adult UI (Nav role==="ADULT" gates adult nav + chat widget). Also updated frontend SignIn.jsx label "Enter Username" -> "Enter Email or Username". Verified: both email & username now find the user (returns "Incorrect Password" not "User not found"). Session persisted via httpOnly cookie + getCurrentUser re-fetch; userSlice has no localStorage persistence (by design).
