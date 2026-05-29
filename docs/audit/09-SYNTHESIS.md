# 09 — Final Synthesis (Integrator)

**Role:** Final Integrator. I did NOT author artifacts 00–08; I read all of them on disk and
**re-opened the load-bearing source files myself** (`lib/scoring.js`, `lib/schema.js`,
`lib/extractors.js`, `lib/runner.js`, `lib/browser.js`, `lib/knowledge.js`,
`lib/mcp-server.js`) to confirm the critical facts rather than trust summaries.
**Repo:** `/Users/adamboudj/projects/ui-ux-suite` (branch `rebuild/uiux-10x`, v0.3.0).
**Date:** 2026-05-29. **Node:** v22.22.0.

> Verdict up front: the orchestrator's hypothesis is **CONFIRMED on every clause** by my own
> primary read, not just by the input artifacts. RED specificity = **0/12 = 0.0%**.
> Recommendation = **TUNE the engine, REWRITE the finding layer.** Build the located-token
> model + `createFinding` wiring **first**.

---

## 0. What I re-verified myself (anti-parroting pass)

Every fact below I confirmed by re-opening the file (command output in `()`):

| Claim (from artifacts 01/02/03/07/08) | My independent check | Verdict |
|---|---|---|
| `scoring.js` never calls `createFinding` | `grep -c createFinding lib/scoring.js` → **0** | CONFIRMED |
| `scoring.js` imports only 3 schema names | `scoring.js:6` = `require('./schema')` pulls `{ DIMENSIONS, createScoreCard, calculateOverall }` (no `createFinding`) | CONFIRMED |
| All findings are bare `{severity,msg,laws}` | `grep -c "findings.push" lib/scoring.js` → **73**, all bare literals; e.g. `scoring.js:19,32,43,62,77` | CONFIRMED |
| `createFinding` exists & is rich | `schema.js:63` `createFinding({dimension,severity,title,description,impact,fix,effort,before,after,laws})` | CONFIRMED |
| Only caller of `createFinding` is the MCP `audit_log` tool | `mcp-server.js:9` import, `mcp-server.js:804` call (hand-authored by an LLM, not the pipeline) | CONFIRMED |
| `runner.js` never imports `browser.js` | `grep -n browser lib/runner.js` → **no match** | CONFIRMED |
| Contrast is hardcoded out of the static path | `runner.js:335` `contrastIssues: []`; `runner.js:359` `contrastFailures: 0` | CONFIRMED |
| Extractors discard location | `extractColorsFromCSS` (`extractors.js:23-43`) pushes `{value,type,source}` only — `match.index` is in scope but dropped | CONFIRMED |
| File identity is lost via blob concat | `runner.js:225` `const cssContent = cssFiles.map(readFileSync).join('\n')` (all CSS → one blob) | CONFIRMED |
| `von-restorff` is a broken slug | `scoring.js` `laws: [...,'von-restorff']` (the `has2xlOrLarger` finding); `knowledge.js` has ONLY `von-restorff-effect` at `:313,:315` → `KNOWLEDGE.laws['von-restorff']` = `undefined` | CONFIRMED |
| `bodySize` filter drops 11px | `runner.js:349` `Math.min(...sizeNums.filter(n => n >= 12 && n <= 20))` → 11px excluded, reports 12px | CONFIRMED |
| focus-visible false-positive | `runner.js:208` `/:focus-visible|focus-visible:/.test(content)` matches the literal text in a JSX **comment** | CONFIRMED |

**Two corrections to the input artifacts (the QA/verifier facts hold; the line attributions drift):**
- **Artifact 08 mis-attributes the `von-restorff` slug to `scoring.js:191`.** Line 191 is the
  *multiple-h1* finding (`laws: ['law-of-pragnanz']`). The broken `von-restorff` slug is on the
  `has2xlOrLarger` finding a few lines below. **The slug bug is real** (it is the only
  `von-restorff` token in scoring.js and it does not resolve); only the line number is off. Use
  "the `has2xlOrLarger`/hero-scale finding in scoring.js" as the locator, not `:191`.
- **Artifact 06 claims the live lawsofux.com slug for Prägnanz is `law-of-pr%C3%A4gnanz`.** That is
  UNVERIFIED here (I did not re-fetch the site) and it **conflicts** with artifact 08, which
  fetched `lawsofux.com/law-of-pragnanz/` and treats `law-of-pragnanz` as the correct slug. The
  repo's own KB uses `law-of-pragnanz` (`knowledge.js:441`). **Do NOT change the slug to a
  percent-encoded form on artifact 06's word alone** — see §6.

---

## 1. CONFIRMED RED baseline

**Measured specificity score = `0 / 12 = 0.0%`** on the planted-problem fixture
(`test/fixtures/planted-ux-problems/`), where a PASS requires **detected ∧ located ∧ measured ∧
fixed** (artifact 03, GRADING TABLE). Softer "detected at all" rate = 6/12 = 50%, but **0/12 are
located, 0/12 measured correctly, 0/12 fixed.** The tool runs clean (exit 0) and prints a
confident **5.4/10 "Below Average"** — and that same 5.4 + identical 20 findings is emitted for an
**empty dir and a non-existent dir** (artifact 02 §2.2: `JSON.stringify(empty.topFindings.sort())
=== JSON.stringify(self.topFindings.sort())` → `true`). The score is a function of what the tool
*failed to grep for*, not of the project.

**The 5 worst verbatim generic findings** (from the live RED run, artifact 03 lines 151–170):

1. `**color**: 43 unique colors - too many, consolidate to a system` — a count, no token list, no file.
2. `**typography**: No consistent type scale detected - sizes appear random` — no sizes, no file:line.
3. `**layout**: Inconsistent spacing values - adopt a spacing scale` — the off-grid values
   (7/13/19px) exist in a *separate* "Spacing" section but are never attached to a selector/line.
4. `**accessibility**: 3 images missing alt text` — count only; never names `SignupForm.jsx:14,15`.
5. `**typography**: Body text too small (12px) - minimum 14px, prefer 16px` — **wrong number**
   (planted is 11px; `runner.js:349`'s `n >= 12` filter silently drops it).

Plus two engine bugs that make findings actively *wrong*, not just vague:
- **False negative:** report says `:focus-visible styling: yes` (problem J reported as PASSING)
  because the regex matched `focus-visible` inside a source comment (`runner.js:208`).
- **3 of 12 planted problems are entirely INVISIBLE:** contrast (A), CTA affordance (B), low-contrast
  surface (C), tiny touch targets (D), missing form labels (E-label) → **zero** findings.

---

## 2. Consolidated, de-duplicated, severity-ranked problem list

De-duped across all 8 artifacts. Severity = user/credibility impact. Each carries the evidence block.

### P0 — Destroys the core promise ("located + measured + fixed")

**P0-1. Findings are bare `{severity,msg,laws}`; `createFinding` is dead in the pipeline.**
- Evidence: `scoring.js:6` (import excludes `createFinding`), 73× `findings.push({severity,msg,laws})`, `schema.js:63` (rich constructor unused by scorers); only `mcp-server.js:804` calls it.
- Confidence: **confirmed.** Risk of fix: medium (touches every scorer signature). Impact: this is the structural root cause of 0% specificity — fixing it is what moves the RED number.
- Test-plan-hint: regression test asserts every emitted finding has `title`, `fix`, `evidence.{file,line}` non-null on the fixture. Rollback-hint: scorers are pure functions; revert per-scorer.

**P0-2. No location is ever carried; extractors discard `match.index`, runner concatenates to blobs.**
- Evidence: `extractors.js:23-43` pushes `{value,type,source}` (no offset); `runner.js:225` joins all CSS to one `cssContent`; `runner.js:297` joins JSX to one `jsxSample`. The seam where location *could* attach was destroyed two steps before the scorer (artifact 01 §4).
- Confidence: **confirmed.** Risk: medium-high (requires a per-file located-token model). Impact: without this, P0-1 has nothing real to put in `evidence.file:line`.
- Test-plan-hint: extractor returns `{value,type,file,line,col}`; unit test maps a known offset→line. Rollback: keep old extractor exported alongside.

**P0-3. Contrast — the marquee feature — is hardcoded OFF in the default (static) path.**
- Evidence: `runner.js:335` `contrastIssues:[]`, `runner.js:359` `contrastFailures:0`; `color-engine.js:66 contrastRatio` is never fed fg/bg pairs. README's flagship example (`#94a3b8→#64748b`) never fires on its own demo input (artifact 05 §Step 2/6).
- Confidence: **confirmed.** Risk: medium (need a static fg/bg pairing heuristic per rule/selector). Impact: closes planted A + C, and the single most-advertised capability.
- Test-plan-hint: fixture A `#fbfbfb` on `#ffffff` must emit a located 1.03:1 finding. Rollback: feature-flag the pairing pass.

**P0-4. Constant-score / scores an empty or missing dir 5.4/10.**
- Evidence: artifact 02 §2.2 (byte-identical findings for self/empty/missing, all exit 0); `runner.js:29-35` `walkFiles` try/catches and returns `[]`; null scores floored to 6 (`runner.js:467-469`).
- Confidence: **confirmed.** Risk: low. Impact: trust — a tool that can't tell a real app from `/tmp/does-not-exist` cannot be believed. Fix: when `css===0 && jsx===0`, emit "insufficient evidence" + non-zero exit.
- Test-plan-hint: empty dir → no numeric overall, exit≠0. Rollback: trivial guard.

### P1 — Silently wrong on whole classes of project / breaks advertised I/O

**P1-1. `--json` is unparseable** (banner on stdout before JSON, `bin/ui-ux-suite.js:68-69`) → `… --json | jq` throws. Evidence: artifact 02 §3, artifact 05 #8. Confidence: confirmed. Fix: banner→stderr or suppress under `--json`. Low risk.

**P1-2. Unsupported stacks produce false positives, not "unsupported."** `.html` never walked (so the fixture's `index.html` is invisible), `.ts`/`.astro`/Angular silently 0-files → canned 5.4. Evidence: `runner.js:129-130` ext lists; artifact 03 fixture table. Confidence: confirmed. Risk: low-medium (HTML parsing is new surface). Impact: HTML support also unlocks planted E-label/E-alt/F-viewport from real markup.

**P1-3. Heuristic over-reach (Next/Tailwind assumptions fire on plain React+CSS).** "No next/font", "use next/image", "No cmdk command palette" emitted on a vanilla project. Evidence: artifact 03 anomaly #8; RED output lines 165-166. Confidence: confirmed. Impact: false-positive fatigue (the category's #1 killer per artifact 07 §6). Fix: gate framework-specific findings on detected framework.

**P1-4. No CI signal** — always exit 0; no `--fail-under`. Evidence: artifact 02 §3/§5 P1-6. Confidence: confirmed. Low risk.

### P2 — Built capability is disconnected

**P2-1. `browser.js` deep-mode element data is siloed.** `runner.js` never imports it; result attached as a sibling `result.browserAudit` (`mcp-server.js:798`), never merged into `scoreCard.dimensions[].findings`. The one bridge point (`scorePlatform` reads `d.hasTouchTargets`, `scoring.js:287`) is never set by the runner (`runner.js:428` platform block omits it). Evidence: artifacts 01 §5, 02 §4. Confidence: confirmed. Impact: closes planted D + provides real selectors for A/E.

**P2-2. Screenshots are never taken and never annotated.** `browser.js:143-151` uses `fullPage:true` (which the global CLAUDE.md flags as oversized-image API failures); the single caller (`mcp-server.js:719 {routes:['/']}`) sets no `screenshotDir`, so `takeScreenshot` short-circuits to `null` — **no screenshot is produced today.** Evidence: artifact 01 clause 6. Confidence: confirmed. Fix: clip per element + injected-overlay annotation (zero-dep), bounded ≤1920×1080.

**P2-3. `flagArbitraryValues` (`tailwind-parser.js:151-175`) — the closest thing to a located finding — is dead code** (zero callers in runner/scoring/mcp-server). Evidence: artifact 01 §key-question. Confidence: confirmed. Cheap win to wire in.

### P3 — UX-law citation integrity (audit-then-suggest; see §6)

**P3-1. `von-restorff` is a broken slug** (resolves to `undefined`); **P3-2. `aesthetic-usability-effect` is a catch-all** misapplied in ~14 citations; **P3-3. accessibility findings are mis-tagged with UX laws** instead of WCAG SC numbers. Evidence: artifact 08 §1-§5. Confidence: confirmed for the slug + misapplication pattern; the umlaut/slug-encoding question is UNVERIFIED (§6).

### P4 — Docs/credibility hygiene

**P4-1. `commands/audit.md` promises `file:line` the engine never produces** (example shows `"file": "src/app/page.tsx:42"`). **P4-2. README's contrast example is aspirational** + buried deep-mode caveat + duplicate "Claude Code plugin marketplace" headings + count drift ("234 tests" / "19 knowledge files" vs actual). Evidence: artifacts 01 §doc-gap, 02 §5 P3, 05 #9. Confidence: confirmed. Fix: align docs *after* the engine ships located findings.

---

## 3. TUNE vs REWRITE recommendation

**Verdict: TUNE the engine; REWRITE the finding LAYER. Make browser/screenshot the spine and
annotate.**

The rule I applied:

> **Keep what already computes correct numbers; rewrite only the layer that throws the numbers away.**
> The defect is not in the math — it is that the math is reduced to a count *before* it becomes a
> finding. So: **keep** extractors' regex engines + `color-engine.js` (WCAG/APCA/OKLCH/ΔE math) +
> `type-engine.js` + `spacing-engine.js` + `knowledge.js` KB + the 12-dimension scoring weights +
> the zero-dep MCP/CLI shell. **Rewrite** (a) the extractor *output contract* to carry
> `{value, file, line, col, selector}` instead of bare values, and (b) the finding-emission layer
> so every scorer calls `createFinding({title,description,impact,fix,before,after,effort,laws,
> evidence:{file,line,selector,measured,threshold,screenshot}})` instead of pushing a count string.
> **Promote `browser.js` from a siloed sibling to the spine of deep mode**: merge its
> `firstNodeTarget`/`firstNodeHtml`/touch sizes into findings and clip+annotate the screenshot per
> finding.

Why not a full rewrite: artifact 07 §0/§3 is decisive — ui-ux-suite *already owns the hard parts*
(verified UX laws, color science, 12-dim scope, source+URL, zero-dep AI-editor reach) that no
competitor combines; it merely *forfeits* the three decisive cells (file:line, before→after,
annotated screenshot) at the emission step. A rewrite would risk the moat to re-solve solved
problems. Why not pure tune: you cannot tune a count string into a location — the bare-finding
shape and the blob-concatenation are *architectural*, so the finding layer and the extractor output
contract must be rewritten, not parameter-tuned.

---

## 4. Plugin vs Skill recommendation (for DECISIONS.md)

**Decision: HYBRID. PLUGIN (zero-dep stdio MCP server + `npx` CLI) is the engine; a THIN
`/design-audit` skill is the Claude-Code-only orchestration layer. Agents + commands stay inside
the same plugin.**

**Rule (apply this, don't memorize the answer — artifact 00):**
> **Compute = plugin. Judgment = skill. Reach = plugin (MCP + npx CLI).**
> Deterministic computation/extraction (contrast math, OKLCH, token extraction, scoring, located
> finding assembly) → `lib/` behind an MCP tool/CLI subcommand (must be byte-identical across
> editors, never model-dependent). Orchestration/judgment (which agents, how to rank, how to phrase
> before/after) → skill/agent prompt. Cross-editor requirement (Cursor/VS Code/Codex/Gemini/
> Windsurf/Continue) → MUST be an MCP server over stdio + `npx` CLI, because **those editors do not
> load Claude Code skills/agents/commands.** A skill must never re-implement compute a tool already does.

**Evidence (artifact 00, live commands 2026-05-29):**
- Skill-only is **disqualified**: it cannot reach the 6 non-Claude editors (skills are CC-only).
- Plugin-only is **disqualified**: non-CC editors can't run in-repo agents/commands, and a bare MCP
  tool list gives no opinionated "audit-then-suggest" workflow.
- The tool is *already* a hybrid (1 plugin bundling 14 skills + 12 agents + 5 commands + a 16-tool
  zero-dep MCP server + npx CLI). `npm view ui-ux-suite version` → `0.3.0` (the npx path is live);
  stdio MCP handshake smoke-tested (E5). So Phase-7 is **"keep the hybrid, fix the wiring."**
- **One HARD BLOCKER to fix in the rebuild:** `claude plugin validate .` currently **FAILS** —
  `marketplace.json:12` `"source": "."` must be `"./"` (the validator requires the `./` prefix;
  one-char fix made validation green in a temp copy, E1/E2). Also migrate
  `design-audit/SKILL.md` `trigger:` → the official `when_to_use:` key, and delete the legacy root
  `manifest.json` (non-standard `mcpServer` singular key).

**Thin-skill boundary:** the skill OWNS agent-dispatch waves, top-N ranking, before/after phrasing,
report-file writing, depth choice. The skill DELEGATES (must call, never re-derive) every contrast
ratio, token extraction, score, law citation, and the located finding assembly → `uiux_*` tools.

---

## 5. TOP 10 highest-leverage changes (priority order), each mapped to a SUCCESS CRITERION

> Success criteria the rebuild must satisfy (derived from the mission): findings are
> **(SC-LOC) LOCATED** (file:line/selector) · **(SC-MEAS) MEASURED** (the wrong value) ·
> **(SC-FIX) FIXED** (exact change/before→after) · **(SC-SPEC) SPECIFIC** (which element, not a
> count) · **(SC-SAFE) audit-then-suggest, never mutates** · **(SC-TRUST) no false confidence**
> (no constant score, fail-safe, accurate numbers) · **(SC-LAW) verified UX-law citations** ·
> **(SC-REACH) works across editors + from source OR URL) · **(SC-SHIP) ships clean** (validates,
> tests gate specificity).

1. **Build the located-token extractor model** `{value,type,file,line,col,selector}` and stop
   blob-concatenation (replace `runner.js:225/297` with a per-file index; use `match.index`→line).
   → **SC-LOC, SC-SPEC.** *This is the foundation for everything below — build it FIRST.*
2. **Route every scorer through `createFinding(...)`** with a mandatory
   `evidence:{file,line,selector,measured,threshold}` + populate `title/description/impact/fix`.
   → **SC-LOC, SC-MEAS, SC-FIX, SC-SPEC.** (`schema.js:63` already exists; just wire it.)
3. **Wire static contrast**: pair fg/bg per rule/selector, feed `color-engine.js contrastRatio`/APCA,
   emit located WCAG findings with the offending hex + ratio + computed nearest-passing `after` hex
   (OKLCH L-nudge). → **SC-MEAS, SC-FIX**; closes planted A, C; delivers the README's marquee example.
4. **Refuse-or-warn on zero-evidence input** (no `css`+`jsx` ⇒ "insufficient evidence", non-zero
   exit; add `--fail-under`). → **SC-TRUST.** Kills the constant-5.4 bug + adds CI signal.
5. **Fix the two measurement/detection bugs**: drop the `n >= 12` body-size filter
   (`runner.js:349`) so 11px is reported as 11px; require a real focus rule (ignore comments) so
   focus-visible isn't a false positive (`runner.js:208`). → **SC-MEAS, SC-TRUST**; closes G, J.
6. **Weave `browser.js` into findings + make it the deep-mode spine**: merge
   `firstNodeTarget`/`firstNodeHtml`/touch sizes into `createFinding`; set
   `scoreInput.platform.hasTouchTargets`. → **SC-LOC, SC-MEAS, SC-REACH**; closes planted D.
7. **Clip + annotate screenshots** (per-element `page.screenshot({clip})` + injected-overlay
   bounding boxes, zero-dep, bounded ≤1920×1080; replace `fullPage:true`). Put the path in the
   finding's `evidence.screenshot`. → **SC-FIX (visual), SC-SPEC, SC-SAFE** (throwaway page only).
8. **Add a copy/UX-writing + CRO located pass** (generic CTA labels, placeholder-as-label, form
   field counts, missing alt text *with file:line from real JSX/HTML*) and **support `.html`**.
   → **SC-LOC, SC-SPEC**; closes planted E-alt, E-label, F-viewport; biggest specificity ROI on
   content the current engine never reads (artifact 06 §6-7).
9. **Gate framework-specific findings on detected framework** + suppress low-confidence findings
   (add per-finding `confidence`, "fail safely"). → **SC-TRUST**; kills false-positive fatigue (P1-3).
10. **Add the fixture as a regression gate + fix the validate blocker + align docs.** A test that
    fails if any finding lacks `evidence.file`/`fix`; `marketplace.json` `"."`→`"./"`;
    `commands/audit.md`/README aligned to real output. → **SC-SHIP, SC-LOC.** The 0/12 fixture
    score becomes the gate; any value > 0% is progress, target → 12/12.

---

## 6. CORRECTED / UNVERIFIED UX-law citations to fix (from artifact 08)

**Apply (audit-then-suggest only — do NOT edit `lib/` in this synthesis phase):**

1. **`von-restorff` → `von-restorff-effect`** in the `has2xlOrLarger`/hero-scale finding in
   `scoring.js` (NOT line 191 — that's the h1 finding; see §0 correction). Evidence: `knowledge.js`
   has only `von-restorff-effect` at `:313,:315`; the bare slug resolves to `undefined`. **CORRECTED
   (broken slug).** Risk: trivial. Test: `KNOWLEDGE.laws['von-restorff-effect']` resolves. Rollback:
   one string.
2. **Stop tagging accessibility findings with UX laws.** Contrast (`scoring.js:19,20,125`), focus/
   skip-link (`130,135`), alt (`140`), reduced-motion/lang (`145,205,283,284`) should cite **WCAG SC
   numbers** (1.4.3, 2.4.7, 1.1.1, 3.1.1, 2.3.3) — a UX law is not evidence for a WCAG failure.
   **CORRECTED (misapplied).**
3. **Reserve `aesthetic-usability-effect` for ONE holistic "low polish lowers perceived usability"
   finding** computed from the polish dimension — not as a per-defect tag (14 of 39 citations abuse
   it). **CORRECTED (over-applied).**
4. **Re-map mis-tagged findings to laws that actually fit and are currently unused in the KB:**
   too-many-fonts/colors → `hicks-law`/`occams-razor` (not `millers-law`); no-onboarding/nav-order →
   `serial-position-effect`/`goal-gradient-effect`; no-progress-indicator → `zeigarnik-effect`.
   **CORRECTED (better fit).**
5. **`fittss-law` is NOT a misspelling** — `lawsofux.com` itself uses `fittss-law` (double-s). This
   partially **REFUTES** the orchestrator's framing that it's a typo. But it is **misapplied** at the
   body-text-too-small finding (`scoring.js:77`) — Fitts's Law is about interactive target size, not
   text legibility. **CONFIRMED slug / CORRECTED application.**
6. **UNVERIFIED — do not act blindly:** artifact 06 says the live Prägnanz slug is
   `law-of-pr%C3%A4gnanz`; artifact 08 fetched `lawsofux.com/law-of-pragnanz/` and treats
   `law-of-pragnanz` as correct; the repo KB uses `law-of-pragnanz` (`knowledge.js:441`). These two
   artifacts **conflict**, and I did not re-fetch the site. **Action: re-fetch `lawsofux.com` for the
   Prägnanz canonical slug before changing anything.** Only the display `name` "Pragnanz" →
   "Prägnanz" (`knowledge.js:440`) is a safe cosmetic fix (the umlaut); the **slug should stay
   `law-of-pragnanz` until the live URL is re-confirmed.**
7. **Route scorer findings through the `handleAuditLog` slug validator** (`mcp-server.js:803-818`,
   which already calls `createFinding` and can validate slugs) so a future broken slug like
   `von-restorff` is caught with a warning instead of shipping silently. **Process fix.**

---

## Headline verdict

The orchestrator's hypothesis is **CONFIRMED by my own primary read**: `scoring.js` pushes 73 bare
`{severity,msg,laws}` literals and never calls the rich `createFinding` at `schema.js:63`;
extractors discard `match.index` and `runner.js:225` concatenates files into blobs so location is
lost before scoring; `browser.js` is never imported by `runner.js` and its selectors/sizes/
screenshots are siloed and unannotated. The measured **RED specificity score is 0/12 = 0.0%** — not
one planted problem is located+measured+fixed, the same 5.4/10 is emitted for an empty *and* a
non-existent directory, and the marquee contrast finding never fires on its own demo input. The call
is **TUNE the engine (keep extractors, color/type/spacing math, the knowledge base, the 12-dim
weights, the zero-dep MCP/CLI hybrid) but REWRITE the finding LAYER to element-level
located+measured+fixed via `createFinding`, and promote `browser.js`+annotated screenshots to the
deep-mode spine.** **Build first: the located-token extractor model `{value,file,line,col,selector}`
(TOP-10 #1)** — it is the foundation every other specificity fix depends on, and nothing moves the
0.0% number until location is carried from source to finding.
