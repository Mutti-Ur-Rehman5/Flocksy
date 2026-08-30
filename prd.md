# PRD — Flocksy Kids Mode (Phase 2)

## 0. Context
Flocksy is an existing MERN app. **Adult Mode is fully built and working** (auth, profiles, posts, stories, loops, messaging, follow system, FlockMind AI moderation). This PRD covers **everything still missing**: the complete Kids Mode experience, plus three requirements that were missing/underspecified in the original SRS.

Do NOT modify, refactor, or break any existing Adult Mode code, routes, schemas, or UI unless a task explicitly says so. Kids Mode is additive.

## 1. Goals
1. Build the full Kids Mode product surface: Home, Moral Stories, Quizzes, Mini-Games, Drawing Canvas, Rewards/Badges.
2. Build a **separate, safe Kid Signup flow** that captures two distinct emails (child's own + parent/guardian's dedicated email) instead of the single `parentContact` field currently in the schema.
3. Build the **Parent-Approval OTP flow for Child → Adult Mode switching**, sent specifically to the parent's dedicated email (not the child's own email), requiring explicit parent approval before `ADULT_TEMPORARY` access is granted.
4. Build **FlockChat** — a Gemini-powered chatbot exclusive to Kids Mode, scoped to child-appropriate topics only, refusing 16+ / mature / unsafe topics.
5. Kids Mode UI must reuse the **same design system, components, and visual language as Adult Mode** (colors, spacing, typography tokens, card/button shapes) — restyled to be brighter/larger for kids, not a different design system. No separate design language invented from scratch.
6. Adult → Kids Mode: **no restriction**, always allowed instantly, no OTP, no approval.

## 2. Out of Scope (unchanged from original SRS)
Native mobile apps, payments, live streaming, third-party social integrations.

## 3. New/Changed Requirements vs Original SRS

### 3.1 Dual-Email Kid Signup (NEW — supersedes FR-01/FR-40 parentContact design)
- Kid signup form fields: `displayName`, `childEmail`, `password`, `dateOfBirth`, `parentEmail`, `avatarId`.
- `childEmail` and `parentEmail` **must be different** — validated client + server side (case-insensitive compare).
- `childEmail` is used for the child's own login/verification.
- `parentEmail` is stored as a dedicated, immutable-by-child field (`ParentGuardian.email`) used **only** for OTP/approval dispatch — never shown to other users, never used for child login.
- Adult signup form is untouched: single email, no parent fields, no age branching UI beyond DOB → auto role.

### 3.2 Parent-Approval OTP for Adult Mode Switch (CLARIFIES UC-03/FR-40-43)
- Trigger unchanged: child taps "Switch to Adult Mode".
- OTP + an **Approve / Deny action** is sent to `parentEmail` (never `childEmail`).
- Email contains: (a) 6-digit OTP code, (b) one-click "Approve" link, (c) one-click "Deny" link. Either path is valid:
  - Parent verbally/manually shares the OTP with the child → child types it into the OTP Entry Screen → verified same as original SRS flow.
  - Parent clicks "Approve" directly → session is upgraded server-side immediately, child's OTP Entry Screen auto-redirects (via polling or socket event) without needing to type anything.
  - Parent clicks "Deny" → OTP invalidated immediately, child sees "Your parent did not approve this request."
- Direction is asymmetric: **Adult → Kids Mode switch has zero restriction**, no OTP, instant, always available from the Adult Dashboard nav (a persistent "Kids Mode" toggle/link).

### 3.3 FlockChat — Kids-Only AI Chat Assistant (NEW)
- Available only inside Kids Mode, as a floating chat bubble on the Kids Home Screen and inside Stories/Quiz sections.
- Backed by Gemini free-tier API (`gemini-1.5-flash` or `gemini-2.0-flash` — confirm current free model name at build time), called from the Node backend (never exposed client-side).
- System-prompted to: only discuss topics suitable for ages 6–15 (school subjects, general knowledge, moral stories, encouragement, simple explanations); refuse romantic/sexual/violent/political/adult/mature topics and redirect gently ("Let's talk about something else fun!"); never ask for or repeat personal identifying info (address, school name, phone); never generate content that could be used to contact the child outside the app.
- All chat messages logged (child_id, message, response, flagged boolean) for parent/admin visibility — no chat is fully private/unlogged.
- If Gemini flags an unsafe child message (e.g., distress, abuse disclosure), do NOT just refuse — surface a supportive, age-appropriate message and set a flag admins can review (do not attempt clinical advice).

### 3.4 UI Parity Requirement (NEW, cross-cutting)
- Reuse Adult Mode's existing design tokens (colors, spacing scale, border-radius, shadows, font family) from the current frontend theme/CSS.
- Kids Mode variant = same components, larger touch targets (44px min), higher-contrast/brighter accent palette pulled from the same token set (not new arbitrary colors), simpler copy, big icons.
- Concretely: Kids Home Screen tiles reuse the same Card component as Adult post cards; Kids buttons reuse the same Button component with a `size="lg" theme="kids"` variant; no separate component library/CSS framework introduced.

## 4. Features to Build (Kids Mode Full Scope)
Reference original SRS sections for full field-level spec — this PRD only calls out deltas:
- FR-11 Kids Profile (as-is)
- FR-18/FR-20 Kids Moral Stories reader (as-is)
- FR-32 Kids Quiz Module (as-is)
- FR-33 Kids Mini-Games — Guess the Animal, True/False (as-is)
- FR-34 Kids Drawing Canvas (as-is)
- FR-35 Rewards & Badges (as-is)
- FR-38 Admin: Kids Content Management (as-is, admin side already may be partially built — verify)
- NEW: FlockChat (3.3)
- CHANGED: Kid signup with dual email (3.1)
- CHANGED: Parent-approval OTP flow (3.2)

## 5. Success Criteria
- A child can sign up with two distinct emails and land in Kids Mode.
- A child can read stories, take quizzes, play both mini-games, draw and save, and earn stars/badges.
- A child tapping "Switch to Adult Mode" cannot proceed without explicit parent action on the parent's dedicated email.
- An adult can switch into Kids Mode instantly, with zero gate.
- FlockChat answers kid-appropriate questions and visibly declines mature topics with a friendly redirect.
- All new screens visually match Adult Mode's existing design system (verified against the current Tailwind/CSS tokens).
