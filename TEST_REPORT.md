# TEST REPORT — ui-ux-suite 10x rebuild

Branch `rebuild/uiux-10x` · Node v22.22.0 · 2026-05-29. Test runner: `node --test` (zero-dep).
Run with `npm test`. The planted-UX-problem fixture (`test/fixtures/planted-ux-problems/`) is the
specificity regression gate.

## Headline

| Metric | RED (v0.3.0) | GREEN (this rebuild) |
|---|---|---|
| Fixture specificity (detected ∧ located ∧ measured ∧ fixed) | **0 / 12 = 0.0%** | **12 / 12 = 100%** |
| Empty / non-existent dir | scored a confident **5.4/10** | **refuses** (insufficient evidence, exit 3) |
| Static text-contrast findings | **0** (hardcoded `contrastIssues:[]`) | real WCAG 2.2 + APCA, located, with a passing `after` hex |
| Findings carry file:line + selector + measured value + fix | **no** | **yes** (every located finding) |
| Real-world contrast false positives (hermes-personal-brand monorepo) | n/a | **43 → 0** (fixed across 2 review rounds) |
| Total automated tests | 234 | **306** |
| `claude plugin validate .` | **FAILS** (`"source":"."`) | **passes** |

## Contrast-precision hardening (driven by independent review)

The marquee feature (contrast auditing) was hardened across two adversarial review rounds that each
issued a NO-GO and were each fixed and re-verified — the authoring/review loop the standards require:
- **Round 1:** `rgba()` alpha was stripped (faint tints read as opaque fills) and aliased vars produced
  impossible `fg===bg` "1:1" findings. Fixed: composite alpha over the resolved surface; skip any
  `fg===bg` pairing; prefer base (`:root`) over `@media` var defs.
- **Round 2:** project-wide pooling resolved ONE page surface for a multi-site monorepo
  (`hermes-personal-brand`: a light dashboard + dark marketing sites) → **43 false "light-on-near-white"
  criticals**. Fixed: scope contrast per site root; treat conflicting light+dark surfaces as
  indeterminate (skip, never assume); make var resolution CSS-cascade-aware so a global `:root` var
  wins over a component-scoped (CSS Module) redefinition.
- Result: **43 → 0** false positives on that repo, while genuine low-contrast findings are retained
  (e.g. `nitya` keeps its 7) and the planted fixture stays 12/12. Locked by `test/precision-regression.test.js`.

## Test suite (`node --test test/*.test.js`) — 306 pass / 0 fail

Pre-existing suites retained (all still green): color-engine, oklch-parser, type-engine,
spacing-engine, tailwind-parser/-v2, theme-parser, knowledge, knowledge-laws, mcp-laws-query,
scoring, scoring-v2, scoring-citations (updated for corrected WCAG citations), stack-detection,
extractors, audit-run.

New suites added by the rebuild:
- **`test/locator.test.js`** — offset→line/col mapping (incl. clamping); `scanCss` declaration
  extraction with selector/prop/value/line + nested SCSS chains + property lowercasing; `codeMask`
  marks comment regions as non-code (the focus-in-comment false-positive defense).
- **`test/static-contrast.test.js`** — `#fbfbfb` on `#ffffff` flagged critical at ~1.03:1; the
  suggested `after` hex actually reaches ≥ 4.5:1 (re-checked with `color-engine.contrastRatio`);
  variable resolution + gradient-clipped-text skipping.
- **`test/located-audit.test.js`** — every located finding on the fixture has
  `evidence.file`, `evidence.line != null`, and a non-empty `fix`; specific planted problems are
  present (contrast, 11px body text, missing alt, missing label, generic CTA, off-grid spacing,
  missing focus-visible).
- **`test/fixture-regression.test.js`** — THE GATE: asserts the specificity score is **12/12** and
  fails loudly if it regresses; asserts an empty dir → `insufficientEvidence:true`, `overall:null`.
- **`test/cli-bad-input.test.js`** — CLI exit codes (0 ok · 2 missing dir · 3 insufficient evidence ·
  1 below `--fail-under`); `--json` stdout alone parses as JSON (banner on stderr).
- **`test/report-html.test.js`** — HTML report is `<!DOCTYPE html>`, self-contained, contains the
  score + a located selector + a fix, has no `<script>`, and HTML-escapes untrusted selector text.
- **`test/browser-weave.test.js`** — deep-mode axe/touch-target → located Finding conversion
  (mocked browserResult; no live browser needed); overlay/viewport clamp helpers.
- **`test/precision-regression.test.js`** — the contrast false-positive guards: rgba-alpha
  compositing, the `fg===bg` skip, base-over-`@media` and global-over-component var precedence,
  multi-site light+dark pooling, SCSS `$var` resolution, comment-masked markup — plus assertions that
  genuine low-contrast pairs are still flagged (no over-correction).

## Mandatory test categories (STANDARDS §5)

- **Smoke** — installs/runs in a clean env (zero runtime deps); `npx ui-ux-suite --version/--help` ok.
- **CLI** — every documented flag verified: `[path]`, `--json`, `--html FILE`, `--fail-under N`,
  `--mcp`, `--version`, `--help`; exit codes covered by `cli-bad-input.test.js`.
- **Docs-example** — README copy-paste commands run and produce the shown located finding.
- **Bad-input** — missing dir (exit 2), empty dir (exit 3, insufficient evidence), garbage paths fail
  gracefully with a helpful message (no stack trace).
- **Output-quality** — graded on the planted fixture (12/12 located+measured+fixed) AND on real-world
  HTML/CSS (`~/.recap/...`) where the variable/dark-theme precision fix cut false contrast positives
  from ~13 to ~1.
- **Regression** — all 234 prior tests still pass; the fixture gate prevents specificity regressions.
- **First-time-user simulation** — RED baseline `docs/audit/05-first-time-user-RED.md`; GREEN re-run
  `docs/audit/11-first-time-user-GREEN.md` (Phase 11).
- **Multi-editor smoke** — MCP stdio (`initialize`/`tools/list`/`tools/call`) + npx CLI; see
  `docs/audit/MULTI-EDITOR-SMOKE.md` (Phase 11).
- **Independent verification** — a separate Skeptical Reviewer re-derived the RED→GREEN claim and the
  finding correctness from primaries; see `docs/audit/VERIFICATION.md` (Phase 11).

## Known limitations / still-unverified

- **Deep mode (live URL)** requires the optional peer deps `playwright-core` + `@axe-core/playwright`
  + a running URL; these are NOT installed in the build/CI environment, so the browser-weave +
  screenshot-annotation path is unit-tested with mock data but not live-smoked here. Static,
  source-based findings are the gated primary deliverable (DECISIONS.md D6).
- The specificity gate is measured on one curated fixture; real-world precision is sampled, not
  exhaustively measured.
