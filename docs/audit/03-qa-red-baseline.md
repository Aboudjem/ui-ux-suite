# Phase 3 — QA RED Baseline (Planted-Problem Specificity Test)

**Role:** QA Engineer. **Date:** 2026-05-29. **Tool version:** `ui-ux-suite v0.3.0`
(branch `rebuild/uiux-10x`). **Node:** v22.22.0.

> This is the number the rebuild must beat. It measures whether the tool's
> findings are **SPECIFIC + LOCATED + MEASURED + FIXED** — not whether it merely
> "notices something is wrong" in a dimension.

## TL;DR

- Fixture: `/Users/adamboudj/projects/ui-ux-suite/test/fixtures/planted-ux-problems/`
  — a realistic React + vanilla-CSS/SCSS project with **10 planted UX problems**
  (12 sub-items) listed in `PLANTED.md`, each tagged with a `PLANTED[id]` source comment.
- The tool ran clean (exit 0) and produced an overall score of **5.4/10 "Below Average"**.
- **RED specificity score = 0 / 12 = 0.0%.** Not a single planted problem was reported
  with a file/line/selector location, the measured wrong value, AND a concrete fix.
  Every finding is a dimension-level generic ("Inconsistent spacing values — adopt a
  spacing scale") with no location and no specific change.
- **3 of 12 planted problems are entirely INVISIBLE** to the static engine:
  contrast (A), CTA affordance (B), low-contrast surface (C), tiny touch targets (D),
  missing form labels (E-label) — these produce **zero** findings.
- **1 false NEGATIVE bug:** the tool reports `:focus-visible styling: yes` (problem J
  "passes") because its regex matches the literal text `focus-visible` inside a source
  **comment**. There are zero focus styles in the fixture.
- **1 measurement error:** body text is planted at **11px** but the tool reports **12px**
  because `runner.js:349` filters sizes with `n >= 12`, silently dropping the 11px value.

## How the tool scans (primary-source confirmation)

Read from live code, not summaries:

- **File walk** (`lib/runner.js:23-40`, `walkFiles`): recursively collects files by
  extension, `maxDepth=6`. Scans CSS as `['.css','.scss','.sass']` and "JSX" as
  `['.tsx','.jsx','.vue','.svelte']`. **Skips any entry whose name `startsWith('.')`**
  and the standard build dirs (`node_modules`, `dist`, `build`, …).
  **`.html` is never walked** → `index.html` is not analyzed.
- **Extraction** (`lib/extractors.js`): pure global-regex over each file's full text.
  No line numbers, no selector association — `extractColorsFromCSS` returns
  `{value,type,source:'css'}`, dropping which file/line/rule the value came from.
- **Findings shape** (`lib/scoring.js`): every scorer pushes a bare
  `{ severity, msg, laws }` where `msg` is a **count-based generic string**.
  `lib/schema.js:63` defines a rich `createFinding({title,description,impact,fix,
  effort,before,after,laws})` — but `scoring.js` **never imports or calls it**
  (its require on line 6 pulls only `DIMENSIONS, createScoreCard, calculateOverall`).
  → Orchestrator hypothesis **CONFIRMED**.
- **Contrast is structurally impossible from static CSS:** `runner.js:336` hardcodes
  `color.contrastIssues: []` and `runner.js:359` hardcodes
  `accessibility.contrastFailures: 0`. The color-engine *can* compute contrast
  (`lib/color-engine.js:66 contrastRatio`) but it is never fed fg/bg pairs from CSS.
- **Touch targets are deep-mode only:** measured in `lib/browser.js:121
  measureTouchTargets` via Playwright `getBoundingClientRect`. Static CSS
  `width/height < 44px` is never checked.
- **browser.js is siloed:** `lib/runner.js` never imports `lib/browser.js`. The
  element-level data it can capture (axe `firstNodeTarget` selector + `firstNodeHtml`,
  per-element touch sizes, screenshots) is never woven into findings.
  → Orchestrator hypothesis **CONFIRMED**.

## Deep mode availability

```
$ ls node_modules/playwright-core   → ABSENT
$ ls node_modules/@axe-core         → ABSENT
$ ls node_modules/playwright        → ABSENT
$ ls node_modules/axe-core          → ABSENT
```

Deep mode (`lib/browser.js`) is **unavailable** in this environment — the optional
peer deps `playwright-core` + `@axe-core/playwright` are not installed, and
`probePeerDeps()` would return `{ ok:false, code:'PLAYWRIGHT_MISSING' }`.
Even if installed, deep mode requires a **running `baseUrl`** (e.g.
`http://localhost:3000`); it cannot audit static source files. So for a source-only
audit — the tool's primary CLI use case — deep-mode element data is doubly out of reach.

**What deep mode WOULD add (if a live URL existed + deps installed):** real axe-core
violations with `firstNodeTarget` CSS selectors and `firstNodeHtml` snippets
(would locate A, E-alt, E-label, and compute real contrast for A/C), measured
per-element touch-target sizes (would catch D with actual px), and full-page
screenshots (currently never annotated). None of this reaches the CLI report today.

## The fixture

Built in the exact forms the tool scans:

| file | purpose | scanned? |
|------|---------|:--------:|
| `package.json` | react + vite deps → framework detection | yes (read for profile) |
| `src/styles.css` | A, B, C, D, F, G, H, I-colors, J | **yes** (`.css`) |
| `src/fonts.css` | I-fonts (5 families), random sizes | **yes** (`.css`) |
| `src/components/Card.scss` | reinforces C, G, H via `.scss` branch | **yes** (`.scss`) |
| `src/components/SignupForm.jsx` | E-alt, E-label, B, D, J | **yes** (`.jsx`) |
| `index.html` | mirror of all problems | **NO** (not walked) |

Full ground truth (measured values + ideal findings) is in
`test/fixtures/planted-ux-problems/PLANTED.md`.

## Reproduction commands

```
node /Users/adamboudj/projects/ui-ux-suite/bin/ui-ux-suite.js \
  /Users/adamboudj/projects/ui-ux-suite/test/fixtures/planted-ux-problems
node /Users/adamboudj/projects/ui-ux-suite/bin/ui-ux-suite.js \
  /Users/adamboudj/projects/ui-ux-suite/test/fixtures/planted-ux-problems --json
```

---

## VERBATIM tool output (text report)

```
ui-ux-suite v0.3.0
Scanning: /Users/adamboudj/projects/ui-ux-suite/test/fixtures/planted-ux-problems

# Design Audit Report

**Generated:** 2026-05-29T05:08:05.267Z
**Duration:** 0.01s
**Files scanned:** 3 CSS, 1 JSX/TSX/Vue/Svelte

## Project Profile

- **Framework:** react
- **Styling:** vanilla-css
- **Component Library:** *none detected*
- **Theme System:** *none detected*
- **Dark Mode:** not detected

## Score Card

# Design Score Card

**Overall: 5.4/10 - Below Average**

| Dimension | Score | Weight |
|-----------|-------|--------|
| Color System | 5/10 |#####.....| | 10% |
| Typography System | 4/10 |####......| | 10% |
| Layout & Spacing | 5/10 |#####.....| | 10% |
| Component Quality | 4/10 |####......| | 10% |
| Accessibility | 7.6/10 |########..| | 12% |
| Visual Hierarchy | 5.5/10 |######....| | 10% |
| Interaction Quality | 6/10 |######....| | 8% |
| Responsiveness | 5.5/10 |######....| | 8% |
| Visual Polish | 7/10 |#######...| | 7% |
| Performance UX | 4/10 |####......| | 5% |
| Information Architecture | 5/10 |#####.....| | 5% |
| Platform Appropriateness | 5.5/10 |######....| | 5% |

## Top Findings

- [*] **color**: 43 unique colors - too many, consolidate to a system - violates Tesler's Law, Miller's Law.
- [*] **color**: Missing semantic colors: primary, error, success, warning - violates Jakob's Law.
- [*] **typography**: No consistent type scale detected - sizes appear random - violates Law of Pragnanz, Law of Similarity.
- [*] **typography**: 5 different fonts - use 1-2 max - violates Tesler's Law, Miller's Law.
- [*] **layout**: Inconsistent spacing values - adopt a spacing scale - violates Law of Proximity, Law of Pragnanz.
- [*] **layout**: No container max-width - content stretches on wide screens - violates Law of Pragnanz, Miller's Law.
- [*] **components**: No reusable UI primitives detected in components/ui/ — add shadcn/ui or equivalent to stop reinventing buttons - violates Jakob's Law.
- [*] **components**: Only 2 hover: variants — interactive elements likely lack hover feedback - violates Doherty Threshold, Aesthetic-Usability Effect.
- [*] **accessibility**: 3 images missing alt text - violates Postel's Law.
- [*] **accessibility**: No prefers-reduced-motion support - violates Postel's Law.
- [*] **hierarchy**: No type scale detected — heading sizes appear random rather than systematic - violates Law of Pragnanz, Law of Similarity.
- [*] **hierarchy**: No h1 element detected — every page needs one primary heading - violates Law of Pragnanz.
- [*] **interaction**: No transition-* utilities detected — state changes likely snap instantly, feel harsh - violates Doherty Threshold.
- [*] **interaction**: No prefers-reduced-motion media query — motion-sensitive users have no escape - violates Postel's Law.
- [*] **performance**: No next/font or geist usage — web fonts likely block first paint - violates Doherty Threshold.
- [*] **performance**: 3 raw <img> tags found — use next/image for lazy-loading, responsive sizes, and LCP optimization - violates Doherty Threshold.
- [*] **flows**: No empty-state components detected — users see blank pages on first use instead of guidance - violates Aesthetic-Usability Effect, Jakob's Law.
- [*] **flows**: No zod/yup/valibot — form validation likely ad-hoc, error messages inconsistent - violates Postel's Law.
- [*] **platform**: No dark mode — users in dark environments strained; expected on web 2026 - violates Jakob's Law.
- [*] **platform**: No <html lang="..."> attribute — screen readers cannot announce content language - violates Postel's Law.

## Laws of UX Coverage

| Law | Violations | Worst Offender |
|-----|-----------:|----------------|
| Aesthetic-Usability Effect (`aesthetic-usability-effect`) | 8 | Body text too small (12px) - minimum 14px, prefer 16px |
| Jakob's Law (`jakobs-law`) | 7 | No responsive breakpoints detected |
| Doherty Threshold (`doherty-threshold`) | 7 | Only 2 hover: variants — interactive elements likely lack hover feedback |
| Law of Pragnanz (`law-of-pragnanz`) | 6 | No consistent type scale detected - sizes appear random |
| Postel's Law (`postels-law`) | 6 | 3 images missing alt text |
| Law of Similarity (`law-of-similarity`) | 3 | No consistent type scale detected - sizes appear random |
| Miller's Law (`millers-law`) | 3 | 43 unique colors - too many, consolidate to a system |
| Tesler's Law (`teslers-law`) | 3 | 43 unique colors - too many, consolidate to a system |
| Fitts's Law (`fittss-law`) | 1 | Body text too small (12px) - minimum 14px, prefer 16px |
| Law of Proximity (`law-of-proximity`) | 1 | Inconsistent spacing values - adopt a spacing scale |
| Peak-End Rule (`peak-end-rule`) | 1 | No onboarding flow detected — new users dropped at the deep end |
| von-restorff (`von-restorff`) | 1 | No display-size type (text-2xl or larger) — hero text likely underscaled for visual anchoring |

## Color System

- Unique colors: **43** (43 hex, 0 OKLCH)
- CSS variables: **0**
- Near-duplicate pairs: **13**

## Typography

- Fonts: **5** ("Playfair Display", serif, "Bebas Neue", sans-serif, "Lobster", cursive)
- Sizes: **8**
- Weights: **2**
- Scale detected: **no**

## Spacing

- Consistency: **no**
- Detected base: **4px**
- Unique values: **7**
- Issues:
  - 4 values off the 4px grid: 6, 7, 13, 19px
  - Near-duplicate spacing: 4px and 6px — consolidate
  - Near-duplicate spacing: 6px and 7px — consolidate

## Tailwind Usage

- Total classes extracted: **8**
- Unique colors: **1**
- Unique spacings: **0**
- Font sizes: **0**
- Radii used: **0**
- Shadows: **0**

### State coverage (from className variants)

- `hover:` — 2
- `focus:` — 1
- `active:` — 0
- `disabled:` — 0
- `dark:` — 0
- `group-hover:` — 0
- `aria-[...]:` — 0

## Accessibility Signals

- `:focus-visible` styling: **yes**
- `aria-label` usage: **1** occurrences
- Skip-to-content link: **NO — add one**
- Images without `alt`: **3**
- `prefers-reduced-motion` support: **NO — add it**

## Layout

- Grid system: **flexbox**
- Container queries: **no**
- Media queries: **3** total
- Breakpoints: px
- Container max-widths: nonepx

## Top 10 Findings

- [*] **color**: 43 unique colors - too many, consolidate to a system
- [*] **color**: Missing semantic colors: primary, error, success, warning
- [*] **typography**: No consistent type scale detected - sizes appear random
- [*] **typography**: 5 different fonts - use 1-2 max
- [*] **layout**: Inconsistent spacing values - adopt a spacing scale
- [*] **layout**: No container max-width - content stretches on wide screens
- [*] **components**: No reusable UI primitives detected in components/ui/ — add shadcn/ui or equivalent to stop reinventing buttons
- [*] **components**: Only 2 hover: variants — interactive elements likely lack hover feedback
- [*] **accessibility**: 3 images missing alt text
- [*] **accessibility**: No prefers-reduced-motion support

## Action Plan

### Medium effort (1-4 hours)

- [ ] **color** — 43 unique colors - too many, consolidate to a system
- [ ] **color** — Missing semantic colors: primary, error, success, warning
- [ ] **typography** — No consistent type scale detected - sizes appear random
- [ ] **typography** — 5 different fonts - use 1-2 max
- [ ] **layout** — Inconsistent spacing values - adopt a spacing scale
```

### Notable from the JSON run (`--json`)

The JSON mirrors the above. Two extracts worth recording verbatim:

- Typography critical finding (note the **12px**, not the planted 11px):
  `{ "severity": "critical", "msg": "Body text too small (12px) - minimum 14px, prefer 16px", "laws": ["fittss-law","aesthetic-usability-effect"] }`
- Spacing values extracted: `"values": [4,6,7,13,19,40,64]`, `"offScaleValues": [6,7,13,19]`.
- a11y signals: `"hasFocusVisible": true` (the false-negative bug — see Anomalies).
- Every `findings[]` entry across all 12 dimensions contains ONLY
  `{severity, msg, laws}` — **no `title`, `description`, `fix`, `before`, `after`,
  `effort`, `id`, or location field** anywhere in the output.

---

## GRADING TABLE

Criteria per planted problem:
- **detected?** — does any finding correspond to this problem (even generically)?
- **located?** — does the finding name the file / line / selector / element?
- **measured?** — does the finding state the actual wrong value?
- **fixed?** — does the finding give the exact change to make?
- **specific PASS** = detected ∧ located ∧ measured ∧ fixed.

| id | problem | detected? | located? | measured? | fixed? | tool's finding text (verbatim) | specific PASS |
|----|---------|:---------:|:--------:|:---------:|:------:|--------------------------------|:-------------:|
| **A** | near-white text on near-white bg (1.03:1) | **NO** | no | no | no | *(none — contrast never computed from CSS; `contrastIssues:[]` hardcoded)* | ✗ |
| **B** | buried/low-affordance primary CTA | **NO** | no | no | no | *(none — no affordance/CTA heuristic exists)* | ✗ |
| **C** | low-contrast section surface (1.09:1) | **NO** | no | no | no | *(none — surface/section contrast never computed)* | ✗ |
| **D** | tiny touch targets (28×28, 32px) | **NO** | no | no | no | *(none — static CSS w/h<44 never checked; deep-mode only & unavailable)* | ✗ |
| **E-alt** | 3 images missing alt | partial (count only) | no | count only | generic | "3 images missing alt text" | ✗ |
| **E-label** | inputs with no `<label>` | **NO** | no | no | no | *(none — no form-label heuristic exists)* | ✗ |
| **F** | no responsive breakpoints / desktop-only | partial (dimension) | no | no | generic | "No responsive breakpoints detected" / "No responsive breakpoints (sm/md/lg/xl/2xl) used in className — UI is not adaptive" / "No container max-width - content stretches on wide screens" | ✗ |
| **G** | body text 11px | partial — **WRONG value** | no | **says 12px** | generic | "Body text too small (12px) - minimum 14px, prefer 16px" | ✗ |
| **H** | off-scale spacing 7/13/19px | partial (count + values, no location) | no (no file/selector) | values only via Spacing section | generic | "Inconsistent spacing values - adopt a spacing scale" (+ Spacing section: "4 values off the 4px grid: 6, 7, 13, 19px") | ✗ |
| **I-colors** | 43 unique colors, no system | partial (count) | no | count only | generic | "43 unique colors - too many, consolidate to a system" | ✗ |
| **I-fonts** | 5 font families | partial (count) | no | count only | generic | "5 different fonts - use 1-2 max" | ✗ |
| **J** | no `:focus-visible` styles | **FALSE NEGATIVE** | no | no | no | "`:focus-visible` styling: **yes**" — reported as PASSING | ✗ |

**Detection tally:** 6 of 12 produce a *related generic* finding (E-alt, F, G, H,
I-colors, I-fonts). 5 of 12 produce **nothing** (A, B, C, D, E-label). 1 of 12 is a
**false negative** (J reported as passing).

**Located:** 0/12. **Measured (correctly):** 0/12 (G is wrong; H/I give counts but no
selector/line). **Fixed (specifically):** 0/12 (all fixes are dimension-level advice).

### RED specificity score

```
specific PASS (detected ∧ located ∧ measured ∧ fixed) = 0
planted problems                                       = 12
RED specificity score = 0 / 12 = 0.0%
```

A softer "detected at all" rate (ignoring location/measure/fix quality) is
**6/12 = 50%**, and that still counts E-alt/F/G/H/I as hits despite G being a
wrong number and none being located. The headline metric the rebuild must beat is
**0.0% specificity**.

---

## Anomalies / bugs surfaced by the RED run

1. **False negative — focus-visible (problem J).** `runner.js:208` tests
   `/:focus-visible|focus-visible:/` against raw JSX text. `SignupForm.jsx` contains
   the literal string `focus-visible` inside a `PLANTED[J]` *comment*, so
   `hasFocusVisible` flips to `true` and the report says focus styling is present.
   A serious tool must ignore comments and require an actual rule/selector.

2. **Measurement error — body size (problem G).** Planted value is **11px**; tool
   reports **12px**. `runner.js:349` computes
   `bodySize = Math.min(...sizeNums.filter(n => n >= 12 && n <= 20))`, which drops the
   11px value entirely. The truly-worst body size is silently excluded.

3. **Contrast is never computed from static CSS (problems A, C).** `runner.js:336`
   hardcodes `contrastIssues: []`; `runner.js:359` hardcodes `contrastFailures: 0`.
   The capable `contrastRatio()` in `lib/color-engine.js` is never given fg/bg pairs.

4. **No element-level location anywhere.** Extraction discards file+line+selector, so
   even detected issues (H, I) cannot point at `src/styles.css:82 .card { padding:7px }`.

5. **`createFinding` schema is dead code.** `lib/schema.js:63` defines the rich finding
   (`title/description/impact/fix/effort/before/after`) but `scoring.js` never imports
   it; all findings are `{severity,msg,laws}`. This is the structural root cause of
   genericness — confirmed.

6. **HTML is unaudited.** `index.html` (with the same planted problems incl. missing
   viewport meta and unlabeled inputs) is invisible because `walkFiles` has no `.html`.

7. **Cosmetic output bug:** the Layout section prints `Breakpoints: px` and
   `Container max-widths: nonepx` when the arrays are empty (string concat without guard).

8. **Heuristic over-reach (context for GREEN, not a fixture miss):** several findings
   assume a Next.js/Tailwind app and fire on this plain React+CSS project — e.g.
   "No next/font or geist", "use next/image", "No cmdk command palette". These are
   noise on non-Next projects and dilute the signal.

## What "beating this" looks like (target for the rebuild / GREEN phase)

For each planted id, a serious finding should read like the **IDEAL finding** column
in `PLANTED.md`, e.g. for A:
`accessibility/contrast — src/styles.css:13 .hero-subtitle: color #fbfbfb on #ffffff =
1.03:1, fails WCAG 2.1 AA (need 4.5:1). Fix: set color to #767676 (4.54:1) or darker.`
The rebuild's specificity score on this same fixture is the regression gate;
**any value > 0.0% is an improvement, the goal is to approach 12/12.**

---

### Provenance

- Tool source read directly: `lib/runner.js`, `lib/extractors.js`, `lib/scoring.js`,
  `lib/schema.js`, `lib/browser.js`, `lib/color-engine.js`, `lib/spacing-engine.js`,
  `lib/type-engine.js`, `bin/ui-ux-suite.js`.
- Contrast ratios computed with the tool's own `lib/color-engine.js contrastRatio`.
- Tool executed twice (text + `--json`); output pasted verbatim above (exit 0).
