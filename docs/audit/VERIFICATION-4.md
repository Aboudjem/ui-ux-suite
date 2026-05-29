# VERIFICATION-4 — Fourth Independent Skeptical Re-Review

**Branch:** `rebuild/uiux-10x`
**HEAD:** `a2e04d4` (fix(contrast): skip backgroundless near-invisible (<1.5:1) page-fallback findings)
**Date:** 2026-05-29
**Reviewer:** Independent adversarial skeptic (did NOT author lib/). All verdicts re-derived from primaries: live `node bin/ui-ux-suite.js <dir> --json` + reading `lib/static-contrast.js` / `lib/located-audit.js` / `lib/color-engine.js`.
**Scope changed:** only this file (`docs/audit/VERIFICATION-4.md`). No edits to `lib/` or `test/`.

---

## VERDICT: **NO-GO**

The R3 target (0 near-1:1 page-fallback FPs) **is met** — across the entire sweep, zero findings sit below ratio 1.5. The planted fixture, nitya, hermes, and ivory all check out as true-positive-only. **However, the R3 fix is too narrow**: it only suppresses dark-section descendants whose page-fallback ratio falls **below 1.5**. lissaglow ships **5 residual false positives** of the *exact* R3 bug class (descendant-of-dark-section judged against the light page) that survive because the foreground pigments (gold `#C4993D`, rose-light `#D4A0A8`) land at **2.1–2.47:1 on cream** — above the 1.5 cutoff — while their real contrast on the section's own dark surface is **6.4–7.78:1 (all PASS)**. Each is emitted as `critical`/`important` with a destructive "darken the text" fix that would make the text invisible on its actual dark background.

This is the same failure that produced three prior NO-GOs; the threshold-based patch addresses the white-text instance (ratio ~1.03) but not the mid-luminance instance.

---

## 1. lissaglow (R3 failure site) — re-run

`node bin/ui-ux-suite.js /Users/adamboudj/projects/lissaglow --json`
Stats: 67 CSS files, 20 HTML, 8664 declarations, 164 located findings, overall score 5.3, 635 ms.

| metric | value | R3 target | result |
|---|---|---|---|
| contrast findings (`accessibility-c*`) | **64** | — | — |
| **near-1:1 (ratio < 1.5)** | **0** | 0 | **PASS** |
| ratio < 2.0 | 0 | — | — |
| dark-section page-fallback FPs (2.1–2.47) | **5** | 0 | **FAIL** |
| genuine cream-surface findings | 59 | — | retained (correct) |

### Sample audit — 10 findings recomputed independently with `lib/color-engine`

Every cited `file:line` was opened; every ratio recomputed from scratch. **All 10 ratios matched the tool exactly** (engine math + alpha-compositing are correct):

| selector | file:line | fg/bg | tool | recomputed | surface real? | verdict |
|---|---|---|---|---|---|---|
| `.section-subtitle` | lissa-base.css:242 | `#8b6d5d`/`#faf7f5` | 4.43 | 4.43 | cream page (correct) | **GENUINE** |
| `.feature-text` | :1240 | `#8b6d5d`/`#faf7f5` | 4.43 | 4.43 | cream (correct) | **GENUINE** |
| `.header-logo span` | :481 | `#c4993d`/`#faf7f5` | 2.47 | 2.47 | header `rgba(250,247,245,.85)`≈cream | **GENUINE** |
| `.btn-secondary` | :898 | `#b76e79`/`#faf7f5` | 3.57 | 3.57 | cream (transparent bg) | **GENUINE** |
| `.btn-secondary:hover` | :912 | `#ffffff`/`#d4a0a8` | 2.24 | 2.24 | OWN solid bg | **GENUINE** |
| `.price-savings` | :1403 | `#4a7c59`/`#e1eee3` | 4.06 | 4.06 (composite `rgba(39,174,96,.12)`/cream = `#e1eee3` ✓) | OWN translucent tint | **GENUINE** |
| `.badge-shipping` | :1356 | `#8b6914`/`#f5eee3` | 4.41 | 4.41 (composite `rgba(196,153,61,.1)`/cream = `#f5eee3` ✓) | OWN tint | **GENUINE** |
| `.hero-badge` | :733 | `#b76e79`/`#fefdfc` | 3.74 | 3.74 | glass over hero ≈ light | **GENUINE** |
| `.footer-col a:hover, .footer-links a:hover` | :2355 | `#d4a0a8`/`#faf7f5` | 2.1 | 2.1 on cream / **7.54 on `.footer` espresso `#2C1810`** | footer is **dark** | **ARTIFACT (FP)** |
| `.cookie-text a` | :2527 | `#d4a0a8`/`#faf7f5` | 2.1 | 2.1 on cream / **7.78 on cookie banner `rgba(26,26,26,.95)`** | cookie banner is **dark** | **ARTIFACT (FP)** |

The composite/alpha math is exact (`#e1eee3`, `#f5eee3`, `#e5f0e6` all reproduce). Variable resolution is correct (`--lg-taupe #8B6D5D`, `--lg-rose #B76E79`, `--lg-rose-light #D4A0A8`, `--lg-gold #C4993D`, `--lg-cream #FAF7F5`). The engine itself is sound; the defect is *surface selection* for section descendants.

### The 5 residual FPs (dark-section descendants judged against the cream page)

lissaglow declares its dark sections in the **same file** (`assets/lissa-base.css`): `.announcement-bar`, `.social-proof-bar`, `.site-footer/.footer` all set `background: var(--lg-espresso)` (`#2C1810`, luminance 0.012); the cookie banner sets `rgba(26,26,26,.95)`. Their text descendants have no own background, so `analyzeTextContrast` falls back to the single page surface (`#FAF7F5`, luminance 0.93) and reports an impossible failure.

| # | selector | file:line | tool (vs cream) | sev | REAL surface | REAL ratio | status |
|---|---|---|---|---|---|---|---|
| 1 | `.announcement-bar a` | :693 | `#c4993d`/`#faf7f5` 2.47 | critical | espresso `#2C1810` | **6.40** | PASS — FP |
| 2 | `.social-proof-item strong` | :1134 | `#c4993d`/`#faf7f5` 2.47 | critical | espresso (`.social-proof-bar`) | **6.40** | PASS — FP |
| 3 | `.footer-brand-name span` | :2315 | `#c4993d`/`#faf7f5` 2.47 | critical | espresso (`.footer`) | **6.40** | PASS — FP |
| 4 | `.footer-col a:hover, .footer-links a:hover` | :2355 | `#d4a0a8`/`#faf7f5` 2.1 | critical | espresso (`.footer`) | **7.54** | PASS — FP |
| 5 | `.cookie-text a` | :2527 | `#d4a0a8`/`#faf7f5` 2.1 | critical | cookie `rgba(26,26,26,.95)` | **7.78** | PASS — FP |

Each FP carries a destructive remediation (e.g. `.footer-col a:hover` → "change `#d4a0a8` to `#896c5c`/darker"), which on the real dark footer would *reduce* contrast and harm readability — the same destructive-fix hazard flagged in R1–R3.

> Note on the gold stars (`.star`, `.review-star`, `.review-big-star` at 2.47, lines 1376/1977/2039): these are gold glyphs on cream/ivory/glass (genuinely light) surfaces — correctly *not* dark-section artifacts. They are a borderline decorative-vs-text judgment (the rating is also conveyed by `.rating-text`), which a static tool cannot disambiguate. Counted as **genuine**, not FP.

---

## 2. Broad sweep — 10 real projects

Each scanned live; contrast findings extracted from `located.findings` (`dimension:accessibility`, title matches `contrast`); near-1:1 = ratio < 1.5.

| project | contrast findings | near-1:1 (<1.5) FP | dark-section FP | notes |
|---|---:|---:|---:|---|
| **lissaglow** | 64 | **0** | **5** | cream beauty site; dark footer/announcement/cookie descendants misresolved |
| hermes-personal-brand | 18 | 0 | 0 | coherent **dark** theme (page `#0A0E1A`); all text-on-dark fails GENUINE (only light bgs are 2px decorative `.dot-*`, correctly excluded) |
| nitya-capital | 7 | 0 | 0 | page `#f8f9fb`; incl. documented retained 2.41 (`#9ca3af`/`#f8f9fb`) + OWN-surface chips — all GENUINE |
| ivory | 3 | 0 | 0 | `#a0807f` placeholder/aside on `#f5f0e8` cream = 3.14 — GENUINE |
| ox | 0 | 0 | 0 | clean |
| recap-studio | 0 | 0 | 0 | clean |
| integra-brand | 0 | 0 | 0 | clean |
| shiftly | 0 | 0 | 0 | clean |
| marvelousfrance | 0 | 0 | 0 | clean (390 KB JSON, large project, no FPs) |
| agent-authority-site | 0 | 0 | 0 | clean |

(`recap` does not exist under `/Users/adamboudj/projects`; substituted `recap-studio`.)

**Sweep totals: near-1:1 FPs = 0 (target met). Total dark-section FPs = 5, all in lissaglow.**

The cross-site / multi-theme protections from R2 hold: hermes (the R2 43-FP site) is now a single coherent dark theme producing 18 genuine same-surface fails — no cross-contamination. nitya's per-site scoping and the 2.41 retention are intact.

---

## 3. True-positive retention (all PASS)

| check | result |
|---|---|
| Planted fixture coverage | **14/14** planted issues detected (A–J + variants) — exceeds 12/12+ |
| Planted contrast pairs | A `#fbfbfb`/`#ffffff` **1.03 critical** ✓, B `#9aa0a6`/`#fff` 2.64 ✓, C-text 1.48 ✓, Card.scss 1.39 ✓, swatch 1.75, cta:hover 4.04 |
| **PLANTED A (own-surface near-invisible)** | flags **critical 1.03:1** — R3 skip did NOT over-suppress own-surface near-invisible text ✓ |
| nitya 2.41 (`#9ca3af`/`#f8f9fb`) | **retained** ✓ |
| Coherent dark theme, text on own dark surface | hermes 18 genuine fails on `#0A0E1A` — **flags correctly** ✓ |

---

## 4. Break attempts (engine-level)

| attempt | input | result | assessment |
|---|---|---|---|
| **Dark section, mid ratio 2.0–2.5** | gold `#c4993d` link in `.footer{bg:#2c1810}` on `#faf7f5` page | **FLAGGED 2.47 critical** (real 6.40 on espresso) | **RESIDUAL FP** — this is the lissaglow defect, reproduced in isolation |
| **Dark section, ratio 1.5–2.0 band** | `#b8a8a0` in `.hero{bg:#1a1a1a}` on `#faf7f5` | **FLAGGED 2.15 critical** (real 7.58 on `#1a1a1a`) | **RESIDUAL FP** — confirms the whole 1.5–3.0 band leaks |
| Genuinely invisible page-level text | `#fafafa` on `#ffffff` page, no own bg | **SKIPPED** (bgFromPage && ratio<1.5) | **FALSE NEGATIVE** — acknowledged R3 tradeoff (code comment). Acceptable for precision, but real broken page text is now missed |
| `color-mix()` text | `color-mix(in srgb, #fff 10%, #000)` etc. | not flagged (resolves to first-hex endpoint, high contrast) | mis-resolves the mix but only ever **under-reports**; never fabricates an FP — acceptable |
| translucent text over surface | rgba fg composited | correct | OK |

The 1.5 cutoff is a one-sided patch: it cures the *bottom* of the page-fallback range (white-on-dark ≈ 1.0) but leaves the *middle* of the range (2.0–3.0, where mid-luminance brand colors on a light page land) fully exposed. Any dark section using a non-white text color (rose, gold, muted accents) on a light-page site reproduces the failure.

---

## 5. Tests & regression coverage

- `npm test` → **307 / 307 pass** (95 suites, 0 fail) ✓
- `test/precision-regression.test.js:96` covers the descendant-of-dark-section case — **but only with white text** (`.footer-link color:#ffffff` on `#2c1810` → ~1.03 on cream, caught by ratio<1.5). It does **not** cover a mid-luminance section-descendant (gold/rose), which is precisely the leak. The regression suite gives false confidence that the class is closed.

---

## Root cause & remediation

**Root cause:** `analyzeTextContrast` (lib/static-contrast.js:296–305) resolves a backgroundless rule's surface to the single page background, and the only guard against an ancestor-surface mismatch is `if (bgFromPage && ratio < 1.5) continue;` (line 333). Mid-luminance text in a dark section yields a page-fallback ratio of 2.0–3.0, slipping past the guard. The engine never consults the dark-section rule (`.footer{background:#2c1810}`) that lives in the same declaration set.

**Recommended fix (in order of robustness):**
1. **Section-surface inference (preferred).** Before falling back to the page surface, check whether the rule's selector is a descendant/prefix-family of a selector that declares its own solid background (e.g. `.footer-col a` ↔ `.footer`/`.footer-*` with `background:#2c1810`). If found, measure against that section surface, not the page. This fixes both the white-text and mid-luminance cases and removes the need for the 1.5 hack.
2. **Conflicting-section guard.** If the project declares both a light page surface and any dark *section* surface (not just page surfaces), treat backgroundless descendants of an identifiable dark section as indeterminate → skip (mirrors the R2 conflicting-page-surface logic, extended to sections).
3. **Minimum fallback.** As a stopgap, widen the page-fallback skip to suppress *any* backgroundless page-fallback finding whose selector matches a known dark-section family — but threshold-based widening (e.g. `< 3.0`) would also suppress genuine low-contrast page text and is not recommended.

Add a regression case with a **mid-luminance** (non-white) section descendant (e.g. `#c4993d` in `.footer{bg:#2c1810}` on a `#faf7f5` page) asserting **no finding**.

---

## Summary numbers

- lissaglow near-1:1 (<1.5) FP: **0** (R3 target met)
- lissaglow dark-section FP (2.1–2.47): **5** (`.announcement-bar a`, `.social-proof-item strong`, `.footer-brand-name span`, `.footer-col/links a:hover`, `.cookie-text a`)
- Total FPs across 10-project sweep: **5** (all lissaglow); near-1:1 FPs sweep-wide: **0**
- Planted fixture grade: **14/14** (PLANTED A critical 1.03:1 retained)
- Tests: **307/307 pass**

## FINAL: **NO-GO** — 5 residual dark-section false positives in lissaglow (R3 bug class surviving above the 1.5 threshold). Fix surface inference for dark-section descendants, then re-review.
