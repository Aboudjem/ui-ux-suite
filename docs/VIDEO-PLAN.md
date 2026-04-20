# UI/UX Suite — demo video plan

Three videos, three lengths, three audiences. Shoot once, cut three ways.

---

## Video 1 · 30-second hero (README top + social)

**Goal:** make a developer run `npx ui-ux-suite` on a real project before the clip ends.

**Script (voice-over, 90 words max):**

> 0:00 — "Your design is probably bad. You just don't know how bad yet."
> 0:06 — *`npx ui-ux-suite`* typed on screen. No install. No config.
> 0:10 — Animated scorecard fades in: 7.2 / 10. Bars sweep in.
> 0:15 — "12 dimensions. Color science. WCAG. APCA. Miller's Law."
> 0:20 — Top finding: *"No focus indicators — WCAG 2.4.7 fail"* → `/uiux-fix` → code diff.
> 0:26 — "ESLint for design. 100% local. Zero API keys."
> 0:30 — Logo lockup · GitHub URL.

**Shots:**
1. Terminal: `cd my-app` → `npx ui-ux-suite` → spinner
2. Scorecard animation rendering live in terminal (or hand off to the SVG scorecard you already have in `.github/assets/scorecard-dark.svg`)
3. Call out one finding → cut to code → `/uiux-fix` applies the patch
4. Closing card with npm + GitHub URL

**Tools:**
- Recording: Screen Studio (macOS) or OBS (free)
- Terminal: WezTerm / Ghostty with ligatures
- The scorecard SVG is already animated — record it playing in a browser at 2x speed for the reveal beat

---

## Video 2 · 90-second demo (landing page / tweet / YouTube card)

| Time | Beat | Visual |
|------|------|--------|
| 0–5s | Hook — "You ship the UI. Accessibility audit says: fail." | Screenshot of WCAG violations stacked |
| 5–15s | What it does | Scorecard reveal: 12 dimensions, one overall grade |
| 15–50s | Live audit on a real app | Terminal runs scan · findings appear · explanation cites UX law |
| 50–70s | Fix loop | `/uiux-fix` produces code patch with before/after |
| 70–85s | Editor integration | Claude asks: *"Audit my design"* → same scorecard inline |
| 85–90s | Close | `npx ui-ux-suite` — GitHub · npm · zero deps |

**On-screen text callouts:**
- "12 dimensions scored — not guessed"
- "Cites the UX law each finding violates"
- "OKLCH color recolor built in"
- "Works with React · Vue · Svelte · Tailwind · shadcn"

**Assets you already have:**
- `.github/assets/scorecard-dark.svg` and `scorecard-light.svg` — both animated, drop them in as overlays
- `.github/assets/logo-dark.svg` / `logo-light.svg` — for outro

---

## Video 3 · 3-minute walkthrough (docs / talks / YouTube)

**Chapters:**

1. **0:00 — The problem** · "design audits are vibes, not science" (30s)
2. **0:30 — Install** · `npx ui-ux-suite` on a Next.js + Tailwind app (20s)
3. **0:50 — The audit** · 12 dimensions explained on screen (60s)
4. **1:50 — The findings column** · each cites an authority (WCAG, APCA, Hick's Law, Miller's Law) (40s)
5. **2:30 — Fix workflow** · `/uiux-fix` produces code, you review + apply (30s)
6. **3:00 — OKLCH palette generation** · `uiux_generate_palette` for a new brand color (20s)
7. **3:20 — Editor integration** · MCP demo in Cursor (20s)
8. **3:40 — Outro** · "Design quality. Measured. Not guessed."

---

## Distribution

- **X / Twitter**: Video 1 native. Caption: *"I built ESLint for design. `npx ui-ux-suite` — 12 dims, real color science, zero deps."*
- **LinkedIn**: Video 2 + 3-paragraph writeup on the rise of measurable design quality. Tag WCAG, Tailwind CSS, Anthropic.
- **Reddit** (r/reactjs, r/webdev, r/accessibility): Video 3 + "I built this because design reviews were vibes, not data".
- **Hacker News**: *Show HN: UI/UX Suite — evidence-based design audits as a CLI*.
- **Dev.to / Medium**: write a companion post: *"Why design quality needs an ESLint moment"*. Embed Video 2.
- **YouTube**: upload Video 3 as main, Video 1 as Shorts, Video 2 as "pinned trailer".
- **README.md**: embed Video 1 at top via GitHub video attachment.

---

## Budget & timeline

- **Free path:** OBS + DaVinci Resolve + your voice = $0
- **Cheap path:** Screen Studio ($89 one-time) + ElevenLabs ($5/mo) + Descript free = under $100
- **Don't pay** for stock footage — Pexels + Coverr cover everything

**2-hour shoot block:**
- 30 min: set up a demo app with 5 seeded design issues (bad contrast, no focus ring, too many colors, body text too small, no reduced-motion)
- 30 min: record 4 takes of the full walkthrough
- 60 min: cut 90s master; trim for 30s and expand for 3m

Ship Video 1 day one. Video 2 end of week. Video 3 for launch.

---

## Paired with sniff

If you're shipping both sniff and ui-ux-suite, **film the same demo app twice** — once through sniff (finds code bugs + a11y + perf), once through ui-ux-suite (scores design quality + recommends tokens). One narrative: *"Sniff finds bugs. UI/UX Suite grades your design. Together: zero-config quality."*
