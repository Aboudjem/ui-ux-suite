# IMPROVEMENT PLAN — ui-ux-suite 10x rebuild (Phase 8)

Ranked, evidence-backed. Derived from `09-SYNTHESIS.md` TOP-10 + the research artifacts. Each item
carries the evidence block and maps to a SUCCESS CRITERION:
**SC-LOC** located · **SC-MEAS** measured · **SC-FIX** fixed · **SC-SPEC** specific ·
**SC-SAFE** audit-then-suggest · **SC-TRUST** no false confidence · **SC-LAW** verified laws ·
**SC-REACH** multi-editor + source-or-URL · **SC-SHIP** ships clean.

RED baseline to beat: **0/12 = 0.0% specificity** on `test/fixtures/planted-ux-problems/`.

---

## Implementation sequence (dependency order)

### Step 1 — Located-token model `lib/locator.js` `{value,type,file,line,col,selector}` · SC-LOC SC-SPEC
Replace blob concatenation (`runner.js:225/297`) with per-file scanning that keeps file identity and
computes line/col from `match.index`. Foundation for everything below.
- Evidence: `extractors.js:23-43` drops `match.index`; `runner.js:225` joins all CSS to one string.
- Confidence: confirmed · Risk: med (new model) · Impact: nothing moves the 0% until location is carried.
- Test: unit test maps known offset→line/col; CSS rule→selector association. Rollback: keep legacy extractor.

### Step 2 — Finding contract: `createFinding` + `evidence{}` + `LAWS_SLUGS` · SC-LOC SC-MEAS SC-FIX SC-LAW
Extend `schema.js` `createFinding` to require `evidence:{file,line,col,selector,measured,threshold,
screenshot}`, optional `nielsen:[#]`, `wcag:[SC]`. Add `LAWS_SLUGS` allow-list + `validateLaws()`.
- Evidence: `schema.js:63` exists but unused by scorers; `von-restorff` resolves to `undefined`.
- Confidence: confirmed · Risk: low · Impact: the shape every located finding needs.
- Test: `createFinding` rejects missing evidence in audit path; every law slug ∈ `LAWS_SLUGS`.

### Step 3 — Static contrast pairing `lib/static-contrast.js` · SC-MEAS SC-FIX (closes A, C)
Parse CSS rules, pair `color`/`background[-color]` within a rule (resolve simple `var()` + inherited
page surface), compute WCAG ratio (split **1.4.3 text 4.5/3** vs **1.4.11 non-text 3:1**) + APCA Lc,
and compute the **OKLCH L-adjusted `after` hex** that reaches threshold. Located per selector:line.
- Evidence: `runner.js:335/359` hardcode contrast off; `color-engine.js` has the math, never fed pairs.
  Fixture A `#fbfbfb` on `#ffffff` = 1.03:1; C `#c9ccd1` on `#f4f5f6` = 1.48:1 (`PLANTED.md`).
- Confidence: confirmed · Risk: med (pairing heuristic) · Impact: the marquee feature + 2 planted problems.
- Test: fixture A must emit `.hero-subtitle src/styles.css:13 #fbfbfb on #ffffff = 1.03:1 → #767676`.

### Step 4 — Route all 12 scorers through `createFinding` · SC-LOC SC-MEAS SC-FIX SC-SPEC
Each scorer emits located findings with measured value + concrete `fix`/`before`/`after`, carrying the
located tokens from Step 1. Keep the 12-dim weights + thresholds; change only the emission shape.
- Evidence: 73 bare pushes in `scoring.js`. Confidence: confirmed · Risk: med (every scorer) · Impact: core.
- Test: every finding on the fixture has `evidence.file`+`line`+`fix`. Rollback: per-scorer revert.

### Step 5 — Fix measurement/detection bugs · SC-MEAS SC-TRUST (closes G, J)
Drop the `n>=12` body-size filter (`runner.js:349`) so 11px reports as 11px; require a real focus
rule (ignore comments) so focus-visible isn't a false positive (`runner.js:208`); guard the
`Breakpoints: px` / `nonepx` cosmetic concat bug (`runner.js:599-600`).
- Evidence: `PLANTED.md` G=11px (tool says 12px); J false-positive via comment. Confidence: confirmed.
- Risk: low · Test: fixture G→11px, J→flagged. Rollback: trivial.

### Step 6 — Refuse-or-warn on zero-evidence input + `--fail-under` + exit codes · SC-TRUST
When `css===0 && jsx===0 && html===0`: emit "insufficient evidence", no numeric overall, non-zero
exit. Add `--fail-under <score>` for CI. Banner → stderr under `--json` (`bin/ui-ux-suite.js:68`).
- Evidence: byte-identical 5.4/10 for self/empty/missing dir (`02-product-dx-audit.md §2.2`);
  `--json` unparseable by `jq`. Confidence: confirmed · Risk: low · Impact: trust + CI.
- Test: empty dir → exit≠0, no score; `--json | jq .` parses. Rollback: trivial guards.

### Step 7 — HTML support + copy/UX-writing + CRO located pass · SC-LOC SC-SPEC (closes E-alt, E-label, F, B)
Walk `.html`; parse (zero-dep) `<img>`-without-alt, `<input>`-without-label, missing viewport meta,
generic CTA labels (Submit/Next/Click here/Learn more), placeholder-as-label, form field counts — all
with file:line. Biggest specificity ROI on content the engine never read.
- Evidence: `runner.js:129-130` omits `.html`; engine never reads text content (`06-online-research §6-7`).
  Fixture E/B/F (`PLANTED.md`). Confidence: confirmed · Risk: low-med (new surface) · Impact: high ROI.
- Test: fixture emits located alt/label/CTA/viewport findings.

### Step 8 — Weave `browser.js` into findings + clip & annotate screenshots · SC-LOC SC-MEAS SC-REACH (closes D)
Merge axe `firstNodeTarget`/`firstNodeHtml` + per-element touch sizes into `createFinding`; set
`scoreInput.platform.hasTouchTargets`. Replace `fullPage:true` with per-element clip + zero-dep
injected-overlay annotation, bounded ≤1920×1080; write `evidence.screenshot`. Fix target-size labels:
gate **AA 24×24 (2.5.8)**, surface **44×44 (AAA/iOS)** as enhanced (`browser.js:17,129`).
- Evidence: `runner.js` never imports `browser.js`; `takeScreenshot` short-circuits (no screenshotDir);
  `browser.js:129` enforces 44 but comment claims "WCAG 2.2" (`06-online-research §3,§8`).
- Confidence: confirmed · Risk: med (deep-mode, needs playwright) · Impact: real selectors + visual proof.
- Test: unit-test annotation overlay + clip math; smoke deep mode if playwright installs. Gate on static.

### Step 9 — Gate framework-specific findings + per-finding confidence · SC-TRUST
Only emit Next/Tailwind/cmdk findings when that framework is detected; add per-finding `confidence`;
suppress/relabel low-confidence findings ("fail safely").
- Evidence: "No next/font", "use next/image", "No cmdk" fired on the plain React+CSS fixture
  (`03-qa-red-baseline.md` anomaly #8). Confidence: confirmed · Risk: low · Impact: kills false-positive fatigue.

### Step 10 — Fixture regression gate + HTML report + validate fix + docs align · SC-SHIP SC-LOC
Add the specificity-score test as a CI gate (fails if any finding lacks `evidence.file`/`fix`); build
the HTML report (reuse recap dark template) with embedded annotated captures; apply D3
(`marketplace.json`, SKILL.md, delete root manifest); align `commands/audit.md`/README to real output.
- Evidence: `commands/audit.md` promises `file:line` not produced; README contrast example aspirational
  (`09-SYNTHESIS §P4`). Confidence: confirmed · Risk: low · Impact: ships clean, gate locked.

---

## Tune-vs-rewrite ledger
- **KEEP (tune):** `color-engine.js`, `type-engine.js`, `spacing-engine.js`, `oklch-parser.js`,
  `tailwind-parser.js`, `theme-parser.js`, `knowledge.js`, the 12-dim weights, MCP/CLI shell.
- **REWRITE:** the extractor output contract (→ located tokens) and the finding-emission layer
  (→ `createFinding` with evidence). **PROMOTE:** `browser.js` to deep-mode spine + annotation.
- **NEW:** `lib/locator.js`, `lib/static-contrast.js`, `lib/html-scan.js`, `lib/copy-cro.js`,
  `lib/annotate.js`, `lib/report-html.js`.

## Success gate
The same fixture, re-run after the rebuild, must score **measurably > 0/12** (target → 12/12) with
every finding located + measured + fixed; independently re-verified by the Skeptical Reviewer; the
first-time-user sim flips RED→GREEN.
