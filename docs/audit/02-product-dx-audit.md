# 02 — Product & DX Audit (ui-ux-suite)

**Auditor role:** Product + DX (Phases 2 & 4-partial)
**Date:** 2026-05-29
**Repo:** `/Users/adamboudj/projects/ui-ux-suite` @ branch `rebuild/uiux-10x`
**Version under test:** 0.3.0 (`package.json:3`)
**Method:** read primaries (README, CLAUDE.md, package.json, lib/, commands/, skills/) + RAN the tool on its own repo, an empty dir, a non-existent dir, and a hand-built fixture with a known WCAG contrast failure. Every claim below cites file:line or command output. Findings are tagged Evidence / Confidence.

---

## TL;DR (headline)

The promise on the box is *"Your project's design quality, measured, not guessed"* (README:15) and *"ESLint for design ... a quantified 1-10 score per dimension"* (README:51). **In default mode the product does the opposite of its promise: it guesses, and the guess is constant.** An empty directory, a non-existent directory, and the tool's own repo all return the **identical 5.4/10 "Below Average" score with the identical 20 findings** (command output, below). The score is not a function of the project; it is a function of which patterns the tool *failed to find*. The flagship example finding in the README — *"Button text contrast is 2.8:1 ... change `#94a3b8` to `#64748b`"* (README:187) — **cannot be produced by the default tool**: the static analyzer hardcodes `contrastIssues: []` and `contrastFailures: 0` (`lib/runner.js:335`, `lib/runner.js:359`) and never calls the `contrastRatio` it imports (`lib/runner.js:13`). Real contrast detection lives only in the optional Playwright deep mode (`lib/browser.js`), which is siloed from findings.

**The orchestrator's hypothesis is CONFIRMED with file:line evidence** (see Section 4). The generic-findings problem is structural, not cosmetic.

---

## 1. What is it? Who is it for? JTBD?

**Stated JTBD** (CLAUDE.md "Core Value"): *"Any developer can audit their project's design quality in one command and get a prioritized, evidence-backed action plan — no design background needed."*

**Intended users:** front-end devs without a designer; AI-editor users (Claude Code / Cursor / Copilot) who type "audit my design"; CI authors wanting a design gate (README:152 suggests a `design-audit` npm script).

**Three surfaces ship:**
- CLI: `npx ui-ux-suite [path]` (`bin/ui-ux-suite.js`)
- MCP server: 15 tools (`lib/mcp-server.js`), 5 top-level commands (`commands/`: `audit.md`, `a11y.md`, `colors.md`, `components.md`, `typography.md`), 14 specialist skills (`skills/`).
- npm dev-dependency for scripts.

**Verdict on positioning:** the *concept* is strong and the surface area is real and well-organized. The problem is entirely in the engine: the audit output does not deliver the "measured, located, actionable" good that the positioning sells.

---

## 2. I RAN IT. Here is the real output.

### 2.1 On its own repo (the thing it's supposed to be good at)

Command: `node bin/ui-ux-suite.js /Users/adamboudj/projects/ui-ux-suite`

```
**Files scanned:** 0 CSS, 0 JSX/TSX/Vue/Svelte
...
**Overall: 5.4/10 - Below Average**
```

**Evidence:** live run, 2026-05-29. The tool is a vanilla-JS project with no CSS/JSX, so it scans 0 style files. It nonetheless emits a full 12-dimension scorecard and 20 findings.
**Confidence:** confirmed.

### 2.2 The CONTROL EXPERIMENT — empty dir vs non-existent dir vs self

| Target | Files scanned | Overall | Top findings |
|---|---|---|---|
| `/Users/adamboudj/projects/ui-ux-suite` (self) | 0 CSS, 0 JSX | **5.4** | 20, see below |
| `/tmp/empty-proj` (empty) | 0 CSS, 0 JSX | **5.4** | **byte-identical** |
| `/tmp/does-not-exist-xyz` (no such dir) | 0 CSS, 0 JSX | **5.4** | **byte-identical**, EXIT=0 |

**Evidence:** programmatic diff — `JSON.stringify(empty.topFindings.sort()) === JSON.stringify(self.topFindings.sort())` returned `true`; both `overall === 5.4`; non-existent dir produced the full report and exited 0.
**Confidence:** confirmed.

This is the single most damaging product fact: **the default audit cannot tell an empty folder, a missing folder, and a real codebase apart.** A user pointing it at a Rails app, an Angular app (`.ts`, not `.tsx`), or a plain HTML/CSS site gets a confident 5.4 and 20 "violations" that are 100% false positives.

### 2.3 Worst generic findings — verbatim

These 20 are emitted *regardless of input* (quoted verbatim from the live run):

- `**color**: Missing semantic colors: primary, error, success, warning - violates Jakob's Law.`
- `**typography**: No consistent type scale detected - sizes appear random - violates Law of Pragnanz, Law of Similarity.`
- `**components**: No reusable UI primitives detected in components/ui/ — add shadcn/ui or equivalent to stop reinventing buttons - violates Jakob's Law.`
- `**hierarchy**: No h1 element detected — every page needs one primary heading - violates Law of Pragnanz.`
- `**interaction**: No transition-* utilities detected — state changes likely snap instantly, feel harsh - violates Doherty Threshold.`
- `**flows**: No empty-state components detected — users see blank pages on first use instead of guidance...`
- `**platform**: No <html lang="..."> attribute — screen readers cannot announce content language...`

Note the rhetorical tell: nearly every finding is *"No X detected — [bad thing] likely..."*. The word **"likely"** appears repeatedly because the tool is inferring harm from *absence of a signal it knows how to grep for*, not from a measured defect. None carries a `file:line`, a measured value, or a concrete diff. The README's own contrast example (README:187) is **not** in the output — it's aspirational copy.

### 2.4 The contrast capability is non-functional in default mode (flagship claim)

Built a fixture `/tmp/realapp/src/app.css` with a deliberate WCAG fail: `color:#94a3b8; background:#ffffff` (~2.6:1) and `font-size:13px`.

- The CSS **was** read: JSON `files: {css:1, jsx:1}`.
- Output: **same canned findings; the 2.6:1 contrast failure was NOT flagged; the 13px body text was NOT flagged.**

**Root cause (Evidence, file:line):**
- `lib/runner.js:335` — `contrastIssues: []` (hardcoded empty)
- `lib/runner.js:359` — `contrastFailures: 0` (hardcoded zero)
- `lib/runner.js:13` imports `contrastRatio, apcaContrast` but they are **never invoked** to pair foreground/background colors during the static audit.
- The scorers that would consume them (`lib/scoring.js:16-20`, `:123-125`) are therefore **dead code in default mode** — their guards (`if (colorData.contrastIssues.length > 0)`) can never be true.

**Confidence:** confirmed. The marquee feature ("WCAG 2.1 + APCA contrast", README:304; the `#94a3b8 -> #64748b` example, README:187) only works in the optional Playwright deep path, which the default zero-dep install does not run.

---

## 3. First-run friction & time-to-first-useful-result

| Dimension | Finding | Evidence | Confidence |
|---|---|---|---|
| Install (npx) | Clean. Zero runtime deps confirmed: `dependencies: (none)` | `package.json` parse | confirmed |
| Speed | Excellent. Self-repo audit `real 0.06s`; runner reports `Duration: 0.02s` | `/usr/bin/time` | confirmed |
| Config burden | None required (good) — but also means no way to tell it your stack, so misdetection is silent | `bin/ui-ux-suite.js` has no config flags beyond `--json/--mcp` | confirmed |
| **Time to first USEFUL result** | **Effectively never in default mode** — the first result is a constant 5.4 with no located findings, so the dev gets *fast wrong* instead of *slow right* | Section 2.2 | confirmed |
| `--json` is broken for scripting | stdout is polluted by a banner before the JSON, so `... --json \| jq` fails | `bin/ui-ux-suite.js:68-69` `console.log` runs unconditionally; piping into `JSON.parse` threw `Unexpected token 'u', "\nui-ux-suit"...` | confirmed |
| No exit-code signal for CI | A "failing" 5.4 audit and a missing directory both exit 0 | runs above; missing dir EXIT=0 | confirmed |
| Silent no-op on unsupported stacks | `.html`, `.ts` (non-JSX), `.astro` are never walked — only `.css/.scss/.sass` and `.tsx/.jsx/.vue/.svelte` | `lib/runner.js:129-130` | confirmed |
| Missing-dir error is swallowed | `bin:61` `fs.existsSync` guard exists, yet a non-existent path still produced a full report — `walkFiles` try/catches `readdirSync` and returns `[]` (`lib/runner.js:29-35`), so bad input degrades into the canned report instead of an error | run in 2.2; code at runner.js:29-35 | confirmed |
| Honesty of "0 files scanned" | The report DOES print `Files scanned: 0 CSS, 0 JSX` (good, honest header) but then scores 12 dimensions anyway and never says "I found nothing, results are not meaningful" | run 2.1 | confirmed |

**Other DX notes (lower severity):**
- README claims "234 tests" (README:454); actual is **227 `test()/it()` calls across 17 files**, all green (`node --test` → `# fail 0`). Minor doc drift; tests are real and pass. Confidence: confirmed.
- README ships a `mermaid` "How it works" diagram and a 24-law table — strong trust-building docs. The docs over-promise relative to the engine, which is the core credibility risk.

---

## 4. Orchestrator's hypothesis: CONFIRMED

> "schema.js defines rich `createFinding({title,description,impact,fix,effort,before,after,laws})` but scoring.js never calls it — every scorer emits a bare `{severity,msg,laws}` ... browser.js captures element-level data but it's siloed."

**Evidence:**
- `lib/schema.js:63` defines `createFinding({ dimension, severity, title, description, impact, fix, effort, before, after, laws })`. **It is the right shape** for a serious tool.
- `grep -rn createFinding lib/`: the ONLY callers are `lib/schema.js` (def) and `lib/mcp-server.js:804` (the `uiux_audit_log` tool, where *Claude* is asked to hand-author the rich fields). **`lib/scoring.js` does not import or call `createFinding`** (it imports only `createScoreCard, calculateOverall` at `lib/scoring.js:6`).
- All 73 `findings.push(...)` in `lib/scoring.js` are bare literals `{ severity, msg, laws }` (e.g. `scoring.js:19,20,43,62,98,108`). The live JSON confirms the runtime shape: `{"severity":"important","msg":"Missing semantic colors: ...","laws":["jakobs-law"]}` — **no title, no fix, no before/after, no location.**
- `lib/browser.js` captures exactly the element-level data a serious finding needs: axe `firstNodeTarget` selector and `firstNodeHtml` (`browser.js:160-161`), per-element touch-target rects via `getBoundingClientRect` with the 44px WCAG check (`browser.js:122-140`), and screenshots (`browser.js:88-89,149`). But `browser.js` is imported **only** by `lib/mcp-server.js` — `grep` shows it is **not** required by `runner.js` or `scoring.js`. So none of that selector/size/screenshot data ever reaches a finding.
- Screenshots use `fullPage: true` (`browser.js:149`) and are **never annotated** — no boxes around offending elements.

**Conclusion:** the generic-findings problem has a single structural root: the scorers emit count-based strings instead of `createFinding` objects, and the one subsystem that has real locations/measurements (browser.js) is wired to a different consumer. This is exactly the rebuild target.

---

## 5. Ranked product/DX gaps (by user impact)

**P0 — destroys trust / makes the tool wrong**
1. **Constant-score bug.** Empty/missing/real dirs all → 5.4 + identical 20 findings. The audit must reflect input or refuse to score. Fix direction: when `files.css === 0 && files.jsx === 0`, do NOT emit a 5.4; emit "insufficient evidence to score" and exit non-zero. (Evidence: §2.2)
2. **Contrast detection is dead in default mode** despite being the headline claim. Wire `contrastRatio`/`apcaContrast` into a static fg/bg pairing pass, or stop advertising it for default mode. (Evidence: §2.4, runner.js:335/359)
3. **Findings have no location, no fix, no before/after** — the core "measured + located + fixed" promise. Route every scorer through `createFinding` and attach `file:line`. (Evidence: §4)

**P1 — silently wrong on whole classes of project**
4. **Unsupported stacks (.html/.ts/.astro/Angular) silently produce false positives** instead of "stack not supported / partial coverage." (Evidence: runner.js:129-130)
5. **`--json` is unparseable** because of the stdout banner — breaks the advertised "JSON output for scripts." Move the banner to stderr or suppress it under `--json`. (Evidence: bin:68-69)
6. **No CI signal**: always exit 0. Add `--fail-under <score>` and non-zero exits. (Evidence: §3)

**P2 — capability is built but disconnected**
7. **browser.js element-level data + screenshots are siloed** — integrate selectors/sizes into findings and annotate screenshots. (Evidence: §4)

**P3 — docs/credibility hygiene**
8. README example finding (README:187) and "234 tests" (README:454) overstate reality; align docs to the engine after the engine is fixed. (Evidence: §2.3, §3)

---

## 6. Reproduction commands (for the implementer)

```bash
# Constant score across unrelated inputs:
node bin/ui-ux-suite.js /Users/adamboudj/projects/ui-ux-suite | grep Overall   # 5.4
mkdir -p /tmp/empty-proj && node bin/ui-ux-suite.js /tmp/empty-proj | grep Overall   # 5.4
node bin/ui-ux-suite.js /tmp/does-not-exist-xyz | grep Overall; echo "exit=$?"      # 5.4, exit=0

# Contrast not detected though CSS is read:
printf ':root{--brand:#94a3b8}\n.btn{color:#94a3b8;background:#fff;font-size:13px}\n' > /tmp/realapp.css
# (place under a dir with a package.json + a .jsx, then audit — no contrast finding appears)

# --json is unparseable:
node bin/ui-ux-suite.js . --json | head -1   # prints "ui-ux-suite v0.3.0", not "{"
```
