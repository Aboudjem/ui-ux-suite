# ui-ux-suite — Audit & Rebuild Report (10x)

**Repo:** github.com/Aboudjem/ui-ux-suite · **Branch:** `rebuild/uiux-10x` · **Date:** 2026-05-29
**Author:** Adam Boudjemaa (`Aboudjem`) · **Method:** 12-phase audit→rebuild→test→verify→polish→release,
fanned out with the Workflow tool. Full audit trail in [`docs/audit/`](docs/audit/);
locked decisions in [`DECISIONS.md`](DECISIONS.md); tests in [`TEST_REPORT.md`](TEST_REPORT.md).

> **One line:** the tool returned *generic, count-based, unlocated* findings (and scored an empty
> directory 5.4/10). It now returns **specific, located, measured, fixed** findings — fixture
> specificity went **0/12 → 12/12** — audits without ever touching your files, and validates clean.

---

## 1. What was found (the RED baseline, re-derived from primary source)

Measured on a fixture of 12 planted UX problems (`test/fixtures/planted-ux-problems/`, ground truth in
`PLANTED.md`). A "specific" finding = detected ∧ located (file:line/selector) ∧ measured (the wrong
value) ∧ fixed (the exact change). **RED specificity = 0/12 = 0.0%.** Root causes, each confirmed by
re-opening the source (not an agent summary):

| # | Defect | Primary evidence |
|---|---|---|
| P0-1 | Findings were bare `{severity,msg,laws}`; the rich `createFinding` was dead in the pipeline | `scoring.js` had 0 `createFinding` calls / 73 bare pushes; only `mcp-server.js:804` (manual tool) used it |
| P0-2 | No location ever carried — extractors dropped `match.index`, runner concatenated files to one blob | `extractors.js:23-43`; `runner.js:225` `cssFiles.map(read).join('\n')` |
| P0-3 | Contrast — the marquee feature — was **hardcoded off** in the static path | `runner.js:335` `contrastIssues:[]`, `:359` `contrastFailures:0` |
| P0-4 | Scored an **empty / non-existent** dir a confident **5.4/10** (identical findings) | byte-identical output for self/empty/missing dir |
| P1 | `--json` unparseable (banner on stdout); Next-only advice fired on plain React; no CI signal | `bin` printed the banner to stdout; `scoring.js` Next/cmdk checks ungated |
| P2 | `browser.js` deep-mode element data (selectors, touch sizes, screenshots) was siloed + never annotated | `runner.js` never `require`d `browser.js`; `takeScreenshot` used `fullPage:true`, never called |
| P3 | UX-law citation bugs: `von-restorff` resolved to `undefined`; a11y findings cited UX laws; `fittss-law` misapplied to body-text size | `knowledge.js` had only `von-restorff-effect`; verified vs lawsofux.com |

## 2. The decision: TUNE the engine, REWRITE the finding layer (not a full rewrite)

Rule applied: *keep what computes correct numbers; rewrite only the layer that throws them away.*
**Kept** the color/type/spacing engines, OKLCH/ΔE/APCA math, the knowledge base + Laws of UX, the
12-dimension weights, and the zero-dep MCP/CLI hybrid. **Rewrote** the extractor output contract (→
located tokens) and the finding-emission layer (→ `createFinding` with an `evidence` block).
**Promoted** `browser.js` to the deep-mode spine with annotated screenshots. Architecture stays a
**hybrid** (plugin engine + thin `/design-audit` skill). Full rationale + evidence in `DECISIONS.md`.

## 3. What was improved (the rebuild)

- **`lib/locator.js`** (new) — zero-dep CSS rule scanner + offset→line/col + comment/string masking.
  Carries `{value, file, line, col, selector}` from source to finding.
- **`lib/static-contrast.js`** (new) — pairs `color`/`background` per rule (falling back to the
  resolved page surface), computes **WCAG 2.2 (1.4.3 text / 1.4.11 non-text)** + **APCA Lc**, and the
  **nearest-passing `after` hex**. Resolves CSS variables, skips gradient-clipped text, and never
  assumes white on a dark/variable-themed page (the real-world precision fix).
- **`lib/located-audit.js`** (new) — the specificity engine: contrast, invisible-surface boundary,
  small text, off-grid spacing, static touch targets, missing focus-visible (comment-safe), too-many
  fonts, near-duplicate colors (named pairs), fixed-width/no-breakpoints, and HTML/JSX copy+CRO checks
  (missing alt, unlabeled inputs, generic CTA labels, missing viewport). Repetitive series (e.g.
  `.swatch-NN`) are grouped to keep signal clean.
- **`lib/schema.js`** — `createFinding` now carries `evidence{file,line,col,selector,measured,
  threshold,screenshot}` + `nielsen`/`wcag`; added a verified `LAWS_SLUGS` allow-list + `validateLaws`
  (canonical names/URLs, incl. the `%C3%A4` Prägnanz slug and `von-restorff-effect`).
- **`lib/runner.js`** — runs the located layer, merges findings into the scorecard with bounded score
  penalties (a real contrast failure now lowers the score), a **zero-evidence guard** (no fake score),
  framework-gated Next-specific checks, and the 11px / focus-in-comment / cosmetic bug fixes; the
  report renders each finding with where + measured + fix + before→after diff + law/WCAG links.
- **`lib/browser-weave.js` + `lib/annotate.js`** (new) + **`lib/browser.js`** — deep mode turns live
  axe violations + per-element touch sizes (with selectors + clipped, **annotated** screenshots) into
  the same located Finding model; zero-dep injected-overlay annotation, viewport capped 1920×1080.
- **`lib/report-html.js`** (new) — a self-contained dark-theme HTML report (no `<script>`, XSS-safe).
- **CLI** — `--json` (clean, pipeable), `--html FILE`, `--fail-under N` (CI gate), exit codes; banner
  to stderr.
- **Audit-then-suggest** — the audit is strictly read-only; it suggests `fix`/`before`/`after` and
  never writes to the audited project.
- **Ship hygiene** — fixed the `claude plugin validate` blocker (`marketplace.json "."→"./"`),
  migrated `design-audit/SKILL.md` to `when_to_use:`, removed the legacy root `manifest.json`.

## 4. Results

| | RED (v0.3.0) | GREEN (rebuild) |
|---|---|---|
| Fixture specificity | 0/12 (0.0%) | **12/12 (100%)** |
| Empty/missing dir | 5.4/10 confident | refuses (exit 3) |
| Real-world false contrast positives (sample page) | ~13 | ~1 |
| Tests | 234 | **297** (+ fixture regression gate) |
| `claude plugin validate` | fails | passes |

Example located finding (real output): `accessibility — .hero-subtitle (src/styles.css:14): #fbfbfb
on #ffffff = 1.03:1, fails WCAG 2.2 §1.4.3 (need 4.5:1). Fix: color → #767676.`

## 5. Verification (Phase 11)

Independent, separate-lane review (the builders did not grade their own work):
- **Skeptical Reviewer** re-derived RED→GREEN from primaries, spot-checked finding correctness, hunted
  false positives, and confirmed audit-then-suggest + XSS-safety → `docs/audit/VERIFICATION.md`.
- **First-time-user (GREEN)** re-ran the README-only flow → `docs/audit/11-first-time-user-GREEN.md`.
- **Multi-editor smoke** (MCP stdio + npx CLI, per-editor config) → `docs/audit/MULTI-EDITOR-SMOKE.md`.

_Verdict: see VERIFICATION.md (GO/NO-GO) — summarized in this report's final section after sign-off._

## 6. Deliverables & next commands

- This report · `DECISIONS.md` · `TEST_REPORT.md` · rewritten `README.md` + `AGENTS.md` + `llms.txt`
  + `CHANGELOG.md` (v0.4.0) · the planted fixture as a regression gate · `docs/audit/` (12-phase trail).

Run it yourself:
```
npx ui-ux-suite .                      # audit the current project (located findings)
npx ui-ux-suite . --json | jq          # machine-readable
npx ui-ux-suite . --html report.html   # dark-theme HTML report
npx ui-ux-suite . --fail-under 7       # CI gate
npx ui-ux-suite --mcp                  # MCP server for Claude Code / Cursor / VS Code / …
```
