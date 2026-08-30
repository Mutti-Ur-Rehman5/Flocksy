# Design — Flocksy Kids Mode UI

## 1. Golden Rule
**Kids Mode is a themed variant of Adult Mode's existing design system, not a new one.**
Before building any Kids Mode screen: open the existing Adult Mode theme file / Tailwind config / CSS variables and reuse them. Do not pick new fonts, new shadow styles, or a new spacing scale. Do not add a new CSS framework.

## 2. Token Strategy
1. Locate the current design tokens (likely `tailwind.config.js` and/or a `theme.js`/`tokens.css`) used by Adult Mode.
2. Add a `kids` theme extension on top of the same base:
   - Same `fontFamily`.
   - Same spacing scale, same `borderRadius` scale (Kids can use the larger end of the existing scale, not invent new values).
   - Same shadow tokens.
   - **New accent palette only**: pick 2–3 bright colors that still come from (or are tinted versions of) the existing primary/secondary hues, so the app still feels like the same product family, not a different app.
3. Increase base font-size and tap targets for Kids screens only, using the existing type scale's larger steps (don't invent new px values ad hoc — use the next step up in the existing scale, or define exactly one new "kids-lg" step if the scale doesn't reach 18px/44px already).

## 3. Component Reuse Map
| Kids Mode need | Reuse this existing Adult component | Notes |
|---|---|---|
| Home tiles (Stories/Quiz/Games/Canvas/Rewards) | `Card` | Wrap as `KidsTile`, larger padding, icon + label |
| CTA buttons (Start Quiz, Save Drawing, etc.) | `Button` | `size="lg" variant="kids"`, min 44px height |
| OTP entry input | existing form `Input` | numeric mode, larger font |
| Chat bubble | existing `Modal`/`Drawer` if present, else new lightweight floating panel built from existing `Card` + `Button` | keep consistent corner radius/shadow |
| Navigation bar | existing `Navbar`/`TopBar` | Kids variant: fewer items, bigger icons, text labels always visible (not icon-only) |
| Toasts/success states (star earned, badge unlocked) | existing `Toast`/`Alert` | Kids variant adds a simple celebratory animation (CSS only, no new heavy library unless already present) |

## 4. Screens (Kids Mode)

1. **Kids Signup** — dual email fields (Child Email, Parent/Guardian Email) clearly labeled and visually distinguished (e.g. child email field has a kid-avatar icon, parent email field has a shield/parent icon + helper text: "We'll only use this to ask your parent before you can access Adult Mode"). Reuses the same form layout/styling as Adult Signup.
2. **Kids Home** — grid of `KidsTile`s: Stories, Quiz, Games, Drawing, Rewards. Star count + current badge shown top-right, reusing the existing avatar/badge chip component from Adult profile header if one exists.
3. **Story Reader** — full-bleed cover image, large body text, "Mark as Read" big button, stars-earned confirmation.
4. **Quiz** — one question per screen, 4 large answer buttons, progress bar (reuse existing progress/stepper component if present), end-of-quiz score summary card.
5. **Mini-Games** — Guess the Animal (image + 4 option buttons), True/False (statement card + two big buttons).
6. **Drawing Canvas** — 16-color palette row, brush size slider (reuse existing `Slider` if present), Undo/Eraser/Save buttons, saved gallery strip below.
7. **Rewards** — star total, badge grid (locked/unlocked states), simple progress bar to next badge.
8. **OTP Entry Screen (child side)** — countdown timer, 6-digit input, AND a live-updating "Waiting for parent..." status (polls approval status) so a click-Approve from the parent auto-advances without typing.
9. **FlockChat widget** — floating round button bottom-right on all Kids screens, opens a small chat panel; message bubbles reuse existing chat/message bubble styling from Adult DMs if that component exists, otherwise build minimal bubbles matching card/shadow tokens.

## 5. Copy & Tone Guidelines (Kids Mode only)
- Reading level: simple words, short sentences, second person ("You got 8 stars!").
- No dark patterns, no urgency/FOMO language.
- Errors are friendly, never blaming ("Oops, that wasn't quite right — try again!" not "Incorrect.").
- FlockChat refusal copy example: "I can't chat about that, but I'd love to talk about your favorite animal or help with homework!"

## 6. Accessibility
- Min 44×44px tap targets everywhere in Kids Mode (SRS 4.3.1 requirement, keep it).
- Min 18px font size for body text in Kids Mode.
- Color contrast AA minimum even with the brighter accent palette — check contrast ratios before finalizing kids accent colors.
- ARIA labels on all icon-only elements (there should be very few — Kids Mode prefers icon + text label per SRS).

## 7. What NOT to do
- Don't import a new UI kit (e.g. a "kids-themed" npm component library) — everything must trace back to existing Adult Mode primitives.
- Don't restyle Adult Mode screens while touching shared components — if a shared primitive needs a new `variant`/`theme` prop, add the prop, don't change the default behavior.
