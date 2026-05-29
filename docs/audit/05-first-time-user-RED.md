# 05 — First-Time-User Simulation (RED)

**Role:** Stranger who has NEVER seen this tool. Input: the public `README.md` only.
**Question:** Can a stranger get a SPECIFIC, located, measured design finding in **< 5 min** from the README alone?
**Method:** Read README, then run *exactly* the commands it shows, in order, recording verbatim what happened.
**Environment:** macOS (darwin 25.3.0), Node v22.22.0, npm 10.9.4, npx present. Date 2026-05-29.
**Verdict (TL;DR):** **NO.** The command works and is fast (~2.7s), but the single concrete example the README advertises (a located, measured contrast finding with a hex-to-hex fix) **never appears in any configuration I tried.** A stranger gets a confident-looking 5.7/10 score card and ~20 generic, count-based findings with **zero `file:line`, zero selectors, zero measured values, and zero before/after fixes.** Net: looks impressive, delivers nothing actionable.

This **CONFIRMS the orchestrator's hypothesis** end-to-end from the outside: findings are bare `{severity, msg, laws}` generic strings; the rich `createFinding({...before, after, fix})` shape is never seen by a user; the color engine *does* compute near-duplicates internally (`nearDuplicates: 1`) but never names the offending hex pair; and the headline contrast capability never fires.

---

## What the README promises (so I know what "success" looks like)

- README line 15 (tagline): *"Your project's design quality, measured, not guessed."*
- README line 40 (the FIRST and most prominent command): ` npx ui-ux-suite `
- README line 44: *"No dependencies. No config. No API keys. 100% local."*
- README lines 185-187 — the **only concrete finding example in the whole README**, placed under the heading *"Findings are concrete, not vague"*:
  > *"Button text contrast is 2.8:1, needs 4.5:1 for WCAG AA. Change `#94a3b8` to `#64748b` on your white background."*
- README line 52: *"WCAG 2.2, APCA contrast, OKLCH color science, deltaE near-duplicate detection — not 'this feels off.'"*

So as a new user, my success criterion is simple and set BY THE README: run the headline command on a project that has `color:#94a3b8` on white, and get that contrast finding (or something equally specific). I built exactly that input.

---

## Verbatim step-by-step friction log

### Step 0 — Build a realistic target (a stranger already has a project)
The README says it audits the "current directory." I made a tiny app whose CSS deliberately contains the README's own example scenario:

```css
/* /tmp/uiux-newuser-app/styles.css */
.btn { color: #94a3b8; background: #fff; padding: 8px; }          /* <- README's exact contrast example */
.card { margin: 13px; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
h1 { font-size: 41px; } h2 { font-size: 33px; } p { font-size: 14px; line-height: 1.2; }
.link { color: #6366f1; } .link2 { color: #6365f0; }              /* <- near-duplicate pair, ~deltaE tiny */
```
Plus an `App.jsx` with an `<h1>` and a `<button className="btn">`.

### Step 1 — Run the headline command (README line 40): `npx ui-ux-suite`
**What I ran:** `cd /tmp/uiux-newuser-app && npx --yes ui-ux-suite`
**What happened:** Worked. Fast (`2.671s total`). Printed `ui-ux-suite v0.3.0`, a Markdown "Design Audit Report", an **Overall: 5.7/10 - Below Average** score card across 12 dimensions, a "Top Findings" list, a "Laws of UX Coverage" table, and an "Action Plan."

> **FRICTION #1 — first impression is generic, not the promised concrete finding.**
> The very first finding a stranger reads is:
> `[*] color: Missing semantic colors: primary, error, success, warning - violates Jakob's Law.`
> Every one of the ~20 findings is a **count-based template string** with NO file, NO line, NO selector, NO measured value, NO before/after. Examples verbatim:
> - `interaction: Only 0 hover: variants — interactive elements likely lack hover feedback`
> - `hierarchy: No type scale detected — heading sizes appear random rather than systematic`
> - `typography: Body text 14px - consider 16px for readability` (closest to specific — has one number, but no location)
> This is exactly the README's anti-promise ("not vague") — yet it is vague.

### Step 2 — Look for the promised contrast finding (README line 187)
**What I ran:** captured the full report to a file and grepped it.
`npx --yes ui-ux-suite > /tmp/uiux-fullrun.txt; grep -in "contrast" /tmp/uiux-fullrun.txt; grep -in "94a3b8\|64748b\|:1" ...`
**What happened (verbatim):**
```
--- lines:      158 /tmp/uiux-fullrun.txt
--- contrast mentions:   NONE
--- 94a3b8 / 64748b mentions:   NONE   (the only "4.5" hit was the report TIMESTAMP, a false positive)
--- file:line mentions:   NONE
```

> **FRICTION #2 (SHOWSTOPPER) — the README's single concrete example never fires.**
> My CSS literally has `.btn { color:#94a3b8; background:#fff }` — the exact input the README uses to sell the product. In the full 158-line report the word **"contrast" appears 0 times**, the hex values **`#94a3b8`/`#64748b` appear 0 times**, and **no finding cites any `file:line`**. The headline promise is not delivered on its own demo input. This is where a discerning stranger concludes the README oversold the tool.

### Step 3 — Try `--json` (README line 257) to see if the data is just hidden from the report
**What I ran:** `npx --yes ui-ux-suite --json`
**What happened:** The JSON proves the engine *has* the raw data but never turns it into located findings:
```json
"files":  { "css": 1, "jsx": 1 },
"colors": { "hex": 4, "oklch": 0, "total": 4, "cssVariables": 0, "nearDuplicates": 1 }
```
- It correctly counted my 4 colors and **detected the near-duplicate pair (`nearDuplicates: 1`)** — but `nearDuplicates` is a **bare integer**; the offending hex pair `#6366f1`/`#6365f0` is **never named**, so I cannot act on it.
- I grepped the JSON for finding-level location/fix keys:
```
"line" / "file" / "location" / "selector" / "before" / "after" / "fix"  →  (none present)
"contrast" / "wcag" / "apca"  →  (none present; only false-positive "ration"/"Ratio" substrings)
```

> **FRICTION #3 — confirms the structural root cause from the outside.**
> The capability exists (deltaE near-dup detection ran), but the finding objects are location-less and fix-less. The README sells `deltaE near-duplicate detection`; the user gets the integer `1` with no way to find or fix the duplicate. This matches the hypothesis that scorers emit `{severity,msg,laws}` and never call the rich `createFinding(...)`.

### Step 4 — Notice the profile said "no styling" on a real CSS project
**What happened:** On my plain-CSS app (no `package.json`), the report said:
```
- Styling: *no styling approach detected*
- Unique colors: 0        (in the "Tailwind Usage" section)
```
…even though it scanned `1 CSS` file and the JSON found 4 hex colors.

> **FRICTION #4 — "no styling approach detected" on a CSS-only folder.**
> A stranger with a vanilla CSS project (no `package.json`) is told their styling approach is undetectable, which reads as "this tool doesn't understand my project." I later confirmed (Step 6) that styling detection is **package-driven**, not CSS-content-driven — a real trap for the simplest possible user.

### Step 5 — Point it at an empty/non-frontend folder (a stranger WILL do this by mistake)
**What I ran:** `mkdir /tmp/uiux-empty && cd /tmp/uiux-empty && npx --yes ui-ux-suite`
**What happened (verbatim):**
```
Files scanned: 0 CSS, 0 JSX/TSX/Vue/Svelte
Overall: 5.4/10 - Below Average
```
…followed by ~20 confident findings about NOTHING, e.g.:
`hierarchy: No h1 element detected`, `platform: No dark mode`, `interaction: Only 0 hover: variants`.

> **FRICTION #5 — it scores an empty directory 5.4/10 and emits 20 findings for zero files.**
> The scorers conflate "file absent" with "feature missing in real code," so a stranger who runs it in the wrong folder (or a backend repo) gets a plausible-looking but meaningless audit. This destroys trust: the same `[*]` findings appear whether you have a real app or literally nothing.

### Step 6 — Verify the README's auto-detect claim (line 53) with a proper Tailwind app
**What I ran:** built `/tmp/uiux-tw` with `package.json` (react+tailwind), `tailwind.config.js`, `index.css` containing `.btn{color:#94a3b8;background:#fff}`, and `Button.jsx` with `className="... hover:bg-blue-500 text-slate-400"`.
**What happened:** Auto-detect WORKS here:
```
Framework: react
Styling:   tailwind-v3
```
But the contrast finding STILL never fires:
```
grep -in "contrast\|slate-400\|94a3b8" → only matched "## Tailwind Usage" / "Styling: tailwind-v3"
                                          → NO contrast/low-contrast finding
```

> **FRICTION #6 — even a textbook Tailwind project with a 2.8:1 button gets no contrast finding.**
> I gave it the README's exact bad color in BOTH raw CSS (`#94a3b8` on `#fff`) and Tailwind (`text-slate-400` on white) with full framework detection working. Zero contrast findings in every case. The marquee example is undeliverable by the headline command in any configuration.

### Step 7 — Read the fine print: where contrast actually lives
**What the README says (line 333, inside a collapsed `<details>` "Deep mode"):**
> "Deep mode injects axe-core into the running app at `baseUrl`, measures **live contrast on rendered elements**, flags touch targets smaller than 44x44px, and screenshots routes."
**And line 322:** deep mode requires `npm i -D playwright-core @axe-core/playwright && npx playwright install chromium`, plus the `/ui-ux-suite:a11y --deep` slash command (Claude-Code-plugin only — not the `npx` CLI).

> **FRICTION #7 — the concrete example is gated behind deep mode, but the README places it next to the headline `npx` command as if it were free.**
> The contrast example (line 187) sits under "Findings are concrete, not vague," far above the deep-mode caveat that's buried in a collapsed section near the bottom. Worse: live contrast needs Playwright + a running app at a `baseUrl` — i.e., the example is **not** producible by `npx ui-ux-suite` at all, contradicting the README's "No dependencies / 100% local / one command" framing for that specific promise. A stranger following the README top-to-bottom would never reach line 333 before giving up at Step 2.

### Minor friction (not blockers)
- **`--mcp` gives no feedback (FRICTION #8, minor).** `npx ui-ux-suite --mcp` printed the version banner then nothing for 4s. A CLI stranger can't tell whether the server started, hung, or crashed (it's silently waiting on stdin JSON-RPC). No "listening" line.
- **README install section is confusing (FRICTION #9, minor).** Two separate `<details>` blocks are both titled **"Claude Code plugin marketplace"** (lines 62-71 and 113-126) — one says "(one-command install)", the other "(recommended)" — so a stranger sees the same heading twice and doesn't know which to trust.
- **`docs/VIDEO-PLAN.md` is linked in the header nav** (line 21, "Demo videos") — a stranger clicking it gets a planning doc, not demo videos. Promises a video, links a to-do.

---

## Where a stranger gives up (the give-up point)

**Step 2, within the first ~90 seconds.** They run `npx ui-ux-suite` (works, ~3s), skim the score card (looks legit), then look for the concrete finding the README promised. They see `Missing semantic colors: primary, error, success, warning` with no file, no line, no values. They think *"this is a checklist generator, not an analyzer of MY code,"* and either (a) close it, or (b) suspect the score is fake — confirmed when they run it in an empty folder and get 5.4/10 (Step 5). Time to disappointment: **under 2 minutes**, well inside the 5-min window, but the wrong direction.

## Scorecard against the mission's "SPECIFIC + LOCATED + MEASURED + FIXED" bar

| Property the README promises | Delivered by `npx ui-ux-suite`? | Evidence |
|---|---|---|
| **Specific** (names the actual offending value) | NO | "Missing semantic colors…", "Only 0 hover:…" — generic templates. Step 1. |
| **Located** (file:line / selector) | NO | 0 `file`/`line`/`selector` keys in JSON; 0 path mentions in report. Steps 2-3. |
| **Measured** (contrast ratio, deltaE value, px) | BARELY | Only "Body text 14px"; no contrast ratio, no deltaE value, near-dup shown as bare count `1`. Steps 2-3. |
| **Fixed** (before/after, hex-to-hex) | NO | 0 `before`/`after`/`fix` keys; README's "change #94a3b8 to #64748b" never appears. Steps 2, 6. |
| Headline contrast example reproducible | NO | Never fires on `#94a3b8`-on-white in CSS or Tailwind; only exists in deep mode behind Playwright. Steps 2, 6, 7. |
| Works on any folder safely | NO | Empty dir scores 5.4/10 with 20 findings. Step 5. |

## What would fix the first-run experience (suggestions only — not changes)

1. **Make the static color scorer emit the README's own example finding** for `#94a3b8`-on-white: `color:#94a3b8` at `styles.css:1`, contrast 2.8:1 vs WCAG AA 4.5:1, suggest `#64748b`. The color engine already parses the hex and a background — wire it into a located finding (route every scorer through `createFinding({before,after,fix,...})`).
2. **Name the near-duplicate pair** instead of `nearDuplicates: 1` (e.g., "`#6366f1` and `#6365f0` are deltaE 0.4 apart — merge to one token; `.link`/`.link2` in styles.css").
3. **Attach `file:line` to every finding** — the scanner already reads files; carry the line through.
4. **Refuse-or-warn on zero-file directories** instead of returning a 5.4/10 score for nothing.
5. **Fix styling detection for package-less CSS projects** (detect from `.css` content, not just `package.json`).
6. **Move the concrete example next to the command that actually produces it**, or relabel line 187 as a deep-mode example so the headline `npx` command isn't overselling.

---

### Bottom line
The tool installs and runs flawlessly in ~3 seconds with zero setup — the on-ramp is genuinely good. But a stranger cannot get a SPECIFIC, located, measured, fixed finding from the README in 5 minutes, because the headline command produces only generic count-based findings and the one concrete example the README advertises **never fires on its own demo input**. The raw capability exists (colors and near-dups are computed) but is thrown away before it reaches the user — the exact failure mode the orchestrator hypothesized, observed purely from the outside.
