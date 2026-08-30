# Rules — for opencode / Cursor agent working on Flocksy

These rules apply to every prompt/task in this project unless the user explicitly overrides one in a specific message.

## Hard constraints
1. **No Docker.** Do not add Dockerfiles, docker-compose, or containerization of any kind. Deployment stays Netlify/Vercel + Railway/Render as-is.
2. **Do not touch working Adult Mode code** unless a task explicitly names an Adult Mode file/feature to change. Kids Mode work is additive. If a shared component needs a new prop/variant to support Kids Mode, add the prop — never change its default behavior or existing call sites.
3. **Never hardcode secrets.** All keys/URLs come from `process.env.*`, already defined in `.env` (`MONGODB_URL`, `JWT_SECRET`, `EMAIL`, `EMAIL_PASS`, `CLOUDINARY_*`). Add new ones the same way, e.g. `GEMINI_API_KEY`, `APPROVAL_TOKEN_SECRET`. Never print `.env` contents back into chat, logs, comments, or committed files.
4. **`.env` stays out of version control.** Confirm `.gitignore` includes `.env` before any commit-related task; add it if missing.
5. **Follow existing patterns first.** Before creating a new folder structure, controller pattern, or naming convention, look at how Adult Mode already does it (routes/controllers/services split, error handling middleware, response shape) and match it. Don't introduce a second architectural style.
6. **Role-based access is mandatory on every new route.** Every Kids Mode and FlockChat endpoint must be guarded so CHILD-only routes reject ADULT/ADMIN and vice versa, per architecture.md section 6.

## Process rules
7. **One phase/task at a time.** Follow `phases.md` in order. Do not jump ahead to a later phase's work inside an earlier phase's task unless asked.
8. **Read `memory.md` before starting any task**, and update it at the end of a work session with: what was built, what decisions were made, what's still pending, and any deviation from `architecture.md`/`design.md` (with a one-line reason).
9. **If a requirement in `prd.md`/`architecture.md`/`design.md` conflicts with the original SRS PDF content the user shared earlier, the newer docs in this repo win** — they encode the corrected/clarified requirements (dual-email signup, parent-approval OTP, FlockChat, UI-parity).
10. **Ask before assuming on ambiguous UI/UX calls** only if it materially changes user-facing behavior (e.g., exact badge thresholds, exact color hex values); otherwise pick the most consistent-with-existing-design option and note the assumption in `memory.md`.

## Code quality
11. Match existing lint/style config (ESLint/Airbnb per SRS 4.3.3) — run lint before considering a task done if a lint script exists.
12. Keep FlockMind AI (existing Python moderation service) and FlockChat (new, Gemini, inside Express) architecturally separate — do not merge them into one service.
12b. Reuse the existing text-moderation logic for FlockChat's output post-filter where reasonably possible instead of writing a parallel implementation from scratch.
13. Every new Mongoose schema needs indexes on fields used in lookups (`userId`, `childId`, email fields) — check before marking a data-layer task complete.
14. No `console.log` debugging left in committed code; use whatever logger pattern the existing backend already uses (or a minimal one if none exists yet).

## Safety-specific rules (non-negotiable, this is a child-facing product)
15. `parentEmail` is never exposed to any client-side code path except the one-time signup confirmation for the child who entered it.
16. FlockChat must never ask for or store additional identifying info about the child beyond what's already collected at signup.
17. Any Kids Mode feature that could allow a child to contact anyone outside the app (sharing links, external contact fields, etc.) is out of scope — flag it back to the user rather than building it silently.
18. Adult → Kids Mode switch: confirm zero server-side gate is implemented (per architecture.md §3). Kids → Adult Mode switch: confirm the parent-approval gate is fully enforced before marking that feature complete.

## When in doubt
If a task instruction is ambiguous or seems to contradict a rule above, stop and ask the user rather than guessing on anything safety- or auth-related.
