# Phases — Flocksy Kids Mode Rollout

Work through these in order. Each phase should end with a working, testable state before moving to the next. Update `memory.md` at the end of every phase.

## Phase 0 — Audit & Setup
- Read the existing codebase: confirm current `User` schema fields, existing auth middleware, existing theme/token files, existing route structure.
- Confirm whether any Kids Mode work already partially exists (schema stubs, empty routes, admin panel bits) — document findings in `memory.md` before writing new code.
- Add `.gitignore` check for `.env`.
- Add new env var placeholders to a `.env.example` (no real values): `GEMINI_API_KEY`, `APPROVAL_TOKEN_SECRET`.

## Phase 1 — Data Layer
- Add/adjust `User.parentEmail`, write migration for any existing `parentContact` data.
- Extend `OTPRecord` with `approvalToken`, `approvalStatus`, `targetEmail`.
- Create `ChatMessage` schema.
- Create/confirm `KidsProfile`, `KidStory`, `QuizQuestion`, `RewardProfile`, `QuizResult` schemas per original SRS ERD (build any that don't already exist).

## Phase 2 — Auth: Dual-Email Kid Signup
- `POST /api/auth/register/child` with validation (`childEmail !== parentEmail`, both valid emails, DOB → auto CHILD role, no manual role selection).
- Keep `POST /api/auth/register/adult` separate and untouched in behavior.
- Frontend: `KidsSignup.jsx` page + link from landing page ("Sign up as a Parent for your Child" or similar), separate from Adult signup entry point.
- Email verification flow: decide (and document in memory.md) whether verification email goes to `childEmail` only, or both — recommend `childEmail` only, since `parentEmail` verification happens implicitly the first time an OTP approval succeeds.

## Phase 3 — Parent-Approval OTP Flow
- Backend: `/api/otp/request`, `/api/otp/approve`, `/api/otp/deny`, `/api/otp/verify`, `/api/otp/status/:id`.
- Email templates: OTP code + Approve/Deny links, sent to `parentEmail`.
- Frontend: `OtpEntryScreen.jsx` with countdown + live polling for parent approval.
- Confirm Adult → Kids Mode switch has zero gate (just a nav link/context flip).
- Test both paths: child types OTP manually; parent clicks Approve link directly.

## Phase 4 — Kids Mode Core Screens
- Kids Home Screen with tiles (reusing shared components per `design.md`).
- Moral Stories reader (list + detail + "mark as read" → star award).
- Quiz module (category select → 10 MCQs → score → stars).
- Mini-games: Guess the Animal, True/False.
- Drawing Canvas with save-to-Cloudinary.
- Rewards/Badges screen + badge-threshold logic.

## Phase 5 — FlockChat
- Backend service (`flockchat.service.js`), system prompt, Gemini call, post-filter reusing existing moderation logic where possible.
- Rate limiting per child.
- Chat history persistence + admin flagged-message review endpoint.
- Frontend floating widget on all Kids screens.

## Phase 6 — Admin Side for Kids Content
- Confirm/build Admin: Kids Content Management (stories, quiz banks, game assets, badge definitions) per original SRS FR-38.
- Admin: FlockChat flagged-message review queue.
- Admin: OTP audit log view (approvals/denials/expiries).

## Phase 7 — Polish & QA Pass
- Visual QA: side-by-side check that every Kids Mode screen uses the same design tokens as Adult Mode (per `design.md` §7 checklist).
- Full flow test: child signup → home → each feature → OTP request → parent approve (both paths) → adult dashboard → back to kids via instant switch.
- Security pass against `rules.md` §15–18.
- Update `memory.md` with final state and any known gaps.

## Explicitly not in these phases
Docker, native mobile apps, payments, live streaming — do not schedule these without a new PRD update.
