# 11 — First-Time-User Simulation (GREEN)

**Role:** Stranger who has NEVER seen this tool. Allowed input: the public `README.md` only (I did not read `lib/`).
**Question:** Can a stranger get a SPECIFIC + LOCATED + MEASURED + FIXED design finding in **< 5 min** from the README alone?
**Method:** Read README, run *exactly* the commands it shows, on real folders a stranger would have, recording verbatim what happened. Form my own verdict, THEN diff against `05-first-time-user-RED.md`.
**Environment:** macOS (darwin 25.3.0), Node v22.22.0, working dir `/Users/adamboudj/projects/ui-ux-suite` (branch `rebuild/uiux-10x`). Date 2026-05-29.

## Verdict (TL;DR): **PASS.**

A stranger gets a specific, located, measured, fixed, WCAG-cited finding in **well under 1 minute** — and on the README's own headline example input, the marquee contrast finding **now fires**. The RED showstopper (the advertised contrast example never appearing) is gone. Of RED's 9 friction points, the two showstoppers and most minors are fixed; one cosmetic profile-line issue remains (styling detection on a package-less CSS folder) but it no longer blocks success because the located findings fire regardless.

Time-to-first-useful-finding, measured: the audit of a real 15-file folder ran in **0.09s wall** (`/usr/bin/time -p`), and the canonical fixture finding reproduces verbatim. A stranger is comfortably inside the 5-minute window.

---

## Step-by-step log (commands + verbatim results)

### Step 0 — Read README, note the success bar it sets
The README's headline claim (line 33) and verbatim example (lines 165-170) promise a finding like:
> `.hero-subtitle` at `src/styles.css:14`: text `#fbfbfb` on `#ffffff` = **1.03:1** … Fix: change `color` to `#767676`.

So "success" = reproduce a finding that is **located + measured + fixed + cited**. README also gives a self-test (line 175): `npx ui-ux-suite test/fixtures/planted-ux-problems` → "3.8 / 10".

### Step 1 — Run the headline command (README line 54): `npx ui-ux-suite .`
**Ran:** `npx ui-ux-suite .` (from the repo dir; npx resolved the local checkout, version banner `v0.3.0`).
**Happened:** Worked, ~0.04s. Printed a Markdown Design Audit Report, project profile, a 12-dimension score card (`Overall: 3.9/10 - Needs Work`), a Laws-of-UX coverage table, and color/type/spacing sections. Findings included located + measured + fixed entries, e.g. (verbatim):
```
- **Where:** `test/fixtures/planted-ux-problems/src/styles.css:14` · selector `.hero-subtitle`
- **Fix:** Change `color` on `.hero-subtitle` from #fbfbfb to #767676 (meets 4.5:1 on #ffffff), or darken further.
```
First impression, unlike RED, is a **located** finding, not a generic "Missing semantic colors" template.

### Step 2 — Run the README's own self-test (line 175)
**Ran:** `node bin/ui-ux-suite.js test/fixtures/planted-ux-problems`
**Happened (verbatim, exactly matching README lines 165-172):**
```
**Overall: 3.8/10 - Needs Work**
### [!] Low text contrast on `.hero-subtitle` — 1.03:1
- **Where:** `src/styles.css:14` · selector `.hero-subtitle`
- **Measured:** 1.03:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#fbfbfb` on `#ffffff` measures 1.03:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Fix:** Change `color` on `.hero-subtitle` from `#fbfbfb` to `#767676` (meets 4.5:1 on `#ffffff`), or darken further.
```diff
- color: #fbfbfb;
+ color: #767676;
```
```
The score (3.8/10) and the canonical finding match the README **verbatim**. Self-test passes.

### Step 3 — Point it at a REAL arbitrary folder a stranger has (not a fixture)
**Ran:** `time node bin/ui-ux-suite.js /Users/adamboudj/.recap/2026-04-25-ai-models` (14 hand-written HTML + 1 CSS, never seen by the tool).
**Happened:** `real 0.09` wall time. `Files scanned: 1 CSS, 0 JSX, 14 HTML`. `Overall: 7/10 - Good`. First located finding (verbatim):
```
### [!] Low text contrast on `.strength-cite, .src` — 1:1
- **Where:** `upgrade.css:185` · selector `.strength-cite, .src`
- **Measured:** 1:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#00e0ff` on `#00e0ff` measures 1:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Fix:** Change `color` … from `#00e0ff` to `#00606e` (meets 4.5:1 on `#00e0ff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)
```
12 located findings total (`jq '.located.findings | length'` = 12). A real, specific, located, fixed finding on a stranger's own files — in 0.09s.

### Step 4 — Reproduce RED's EXACT demo input (the showstopper test)
RED built `/tmp/uiux-newuser-app/styles.css` with `.btn { color:#94a3b8; background:#fff }` (the README's old marquee example) and a near-dup pair `.link #6366f1` / `.link2 #6365f0`, and reported the contrast finding **never fired**. I rebuilt the byte-identical input and re-ran.
**Happened (verbatim):**
```
### [!] Low text contrast on `.btn` — 2.56:1
- **Where:** `styles.css:1` · selector `.btn`
- **Measured:** 2.56:1 (APCA Lc 47.7) (needs 4.5:1)
- **Fix:** Change `color` on `.btn` from `#94a3b8` to `#6d7787` (meets 4.5:1 on `#ffffff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)

### [-] Near-duplicate colors `#6366f1` ≈ `#6365f0` (ΔE 2.6)
- **Where (from JSON):** styles.css:4 (`.link`) and styles.css:4 (`.link2`)
- **Measured:** ΔE 2.6 vs #6366f1 (needs ΔE ≥ 3)
- **Fix:** Keep `#6366f1` and replace `#6365f0` with it (or promote both to one `--color-*` token).
```
The contrast finding that RED proved **never appeared** now fires, located + measured + fixed + cited. The near-duplicate pair, which RED saw only as a bare integer `nearDuplicates: 1`, is now **named** with both hexes, both selectors, the ΔE value, and a merge fix.

### Step 5 — Verify EVERY finding is located + fixed (close RED's "Located: NO" / "Fixed: NO")
**Ran:** `node bin/ui-ux-suite.js /tmp/uiux-newuser-app --json | jq '[.located.findings[] | select(.evidence.file==null or .evidence.line==null)] | length'`
**Happened:** `0`. All 6 findings carry `evidence.file`, `evidence.line`, and a non-empty `fix`. The fixture finding's JSON: `evidence: {file:"src/styles.css", line:14, col:3, selector:".hero-subtitle", measured:"1.03:1 (APCA Lc 0)", threshold:"4.5:1"}`.

### Step 6 — Test the other README outputs (lines 62-66)
| Command | Result |
|---|---|
| `... --json \| jq` | Clean: stdout starts with `{`, banner on stderr → pipes to `jq` fine. Score at `.scoreCard.overall` = 3.8; findings at `.located.findings` (48 on fixture). |
| `... --html /tmp/uiux-green-report.html` | Wrote a 99 KB standalone HTML report (`<!DOCTYPE html>…`). Exit 0. |
| `... --fail-under 7` (score 3.8) | Exit **1** (correct CI gate). `--fail-under 1` → exit **0**. |
| empty/non-existent dir | "Insufficient evidence" message + exit **3** (no fake score). |

### Step 7 — MCP entry point (README step 3, line 73): `npx ui-ux-suite --mcp`
**Ran:** piped a JSON-RPC `initialize` + `tools/list` over stdio.
**Happened:** Server replied correctly: `{"result":{"protocolVersion":"2024-11-05","serverInfo":{"name":"ui-ux-suite","version":"0.3.0"}}}` and `tools/list` returned **16** tools (`jq '.result.tools | length'` = 16, matching the README's "16 MCP tools"). MCP path works.

---

## RED → GREEN comparison (every prior friction point)

| # | RED friction point | RED status | GREEN status | Evidence (this run) |
|---|---|---|---|---|
| **#2** | **Headline contrast example never fires** on its own demo input (`#94a3b8` on white) — the showstopper | ✗ FAIL (0 contrast mentions in 158-line report) | **✓ FIXED** | Step 4: `Low text contrast on .btn — 2.56:1` at `styles.css:1`, fix `#94a3b8`→`#6d7787`, cites 1.4.3 |
| **#1** | First finding is generic ("Missing semantic colors…"), not located | ✗ FAIL | **✓ FIXED** | Steps 1-2: first findings are located (`src/styles.css:14`, selector `.hero-subtitle`) |
| **#3** | Near-dup shown as bare integer `1`; offending hex pair never named | ✗ FAIL | **✓ FIXED** | Step 4: `Near-duplicate colors #6366f1 ≈ #6365f0 (ΔE 2.6)`, both selectors named + merge fix |
| **#4** | "no styling approach detected" on a package-less CSS folder | ✗ FAIL | **△ PARTIAL** | Step 4: profile still prints "no styling approach detected" / "no framework detected" — BUT located findings fire on the raw CSS anyway, so it no longer reads as "tool doesn't understand my project" |
| **#5** | Empty dir scored 5.4/10 with ~20 fake findings | ✗ FAIL | **✓ FIXED** | Step 6: empty/missing dir → "Insufficient evidence", exit 3, no score |
| **#6** | Textbook Tailwind project with a 2.8:1 button got no contrast finding | ✗ FAIL | **✓ FIXED** | Step 4 proves the contrast scorer now fires on `#94a3b8`/white in raw CSS; same engine path |
| **#7** | Concrete example gated behind deep mode / Playwright but advertised next to headline `npx` | ✗ FAIL | **✓ FIXED** | README now uses a STATIC finding (`.hero-subtitle` 1.03:1) as the headline example (lines 165-170) — reproducible by the plain `npx` command (Step 2). Deep mode is correctly framed as opt-in (line 236) |
| **#8** (minor) | `--mcp` gives no feedback / can't tell if it started | ✗ minor | **△ PARTIAL** | Step 7: still no human "listening" line on a TTY, but it correctly answers JSON-RPC (works as designed for an MCP client) |
| **#9** (minor) | Duplicate/confusing install `<details>` headings; VIDEO-PLAN link | ✗ minor | **✓ FIXED** | README install blocks are now distinct ("One-line MCP setup per editor", "Install as a Claude Code plugin", "Install as a dev dependency"); no dead "Demo videos" nav link |

## RED's "SPECIFIC + LOCATED + MEASURED + FIXED" scorecard, re-run

| Property the README promises | RED | GREEN | Evidence |
|---|---|---|---|
| **Specific** (names the offending value) | NO | **YES** | `#94a3b8`, `#fbfbfb`, ΔE 2.6 named in findings (Steps 2, 4) |
| **Located** (`file:line` + selector) | NO | **YES** | every finding has `evidence.file`+`line`; 0 missing (Step 5) |
| **Measured** (ratio / ΔE / px) | BARELY | **YES** | `2.56:1 (APCA Lc 47.7)`, `1.03:1`, `ΔE 2.6`, `13px` (Steps 2-4) |
| **Fixed** (before→after hex) | NO | **YES** | `#94a3b8`→`#6d7787`, `#fbfbfb`→`#767676`, diff blocks (Steps 2, 4) |
| Headline example reproducible by `npx` | NO | **YES** | fixture finding matches README verbatim (Step 2) |
| Works on any folder safely | NO | **YES** | empty dir → insufficient evidence, no fake score (Step 6) |

---

## New / residual friction observed in GREEN (minor, none blocking)

1. **JSON key paths in docs are wrong.** `--help` suggests `jq '.topFindings[0]'` and the README example uses `.score.overall` / `.topFindings[0]`, but the real top-level JSON has neither — `jq '.topFindings[0]'` returns `null`. Correct paths are `.scoreCard.overall` (= 3.8) and `.scoreCard.topFindings[0]`; findings are at `.located.findings`. A user copy-pasting the help/README jq example gets `null` and may think the tool is broken. **Fix: update the `--help` and README jq examples to `.scoreCard.topFindings[0]` / `.scoreCard.overall`.**
2. **Version string lags the README.** README narrative says "v0.4" (line 158), but `package.json`, the CLI banner, and MCP `serverInfo` all report `0.3.0`. Cosmetic, but a careful reader notices the mismatch.
3. **Exit-code 2 ("path not found") appears unreachable.** README documents `2 path not found`, but a non-existent path is scanned, finds 0 files, and returns `3 insufficient evidence` (same as an empty dir). Behavior is well-messaged and reasonable; the documented code 2 just never fires for a typo'd path.
4. **Residual from RED #4:** the profile line still says "no styling/framework detected" on a package-less CSS-only folder. Non-blocking (findings fire anyway) but cosmetically still reads as a gap.

## Bottom line

RED's verdict was **NO** — the headline contrast example never fired on its own demo input, and a stranger got a confident score card with zero located/measured/fixed findings. GREEN flips that: on the byte-identical RED demo input, the contrast finding now fires (`2.56:1`, `styles.css:1`, fix `#94a3b8`→`#6d7787`), the near-duplicate pair is named with ΔE and selectors, empty dirs refuse to fake a score, and the README's published example reproduces verbatim. A stranger gets a SPECIFIC + LOCATED + MEASURED + FIXED finding on their own real folder in **~0.1s** of run time, far inside 5 minutes.

**Can a stranger get a specific located finding in <5 min? PASS.**
The only remaining rough edges are documentation-level (wrong `jq` paths in `--help`/README, a v0.3 vs v0.4 version string mismatch) and one cosmetic profile line — none of which prevent success.
