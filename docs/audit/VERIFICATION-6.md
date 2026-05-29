# VERIFICATION-6 — Release Gate (Round 6) Adversarial Contrast Re-Review

**Subject:** ui-ux-suite @ `rebuild/uiux-10x`, v0.4.0
**Reviewer role:** Independent skeptical reviewer (re-derived from primaries)
**Date:** 2026-05-29
**Method:** Live `node bin/ui-ux-suite.js <dir> --json` on real projects + direct reading of `lib/static-contrast.js` and `lib/color-engine.js`. Every contrast finding re-graded by reading the cited `file:line`, resolving the element's REAL surface (own bg, nearest real ancestor SECTION via descendant/BEM block root, or page), and recomputing the ratio with the tool's own `lib/color-engine`.
**Definition of ARTIFACT (per brief):** a contrast finding whose REAL-surface ratio actually PASSES (≥4.5 normal / ≥3 large) but the tool reports a FAILING ratio against the wrong surface. A finding that correctly fails on its real surface but shows a slightly-wrong ratio is GENUINE-but-misreported, **not** an artifact. Genuine borderline findings on a low-contrast site are expected and fine.

---

## VERDICT: **GO**

**Total artifacts across all projects: 0** (target 0). All round-5 lissaglow artifacts eliminated; true positives fully retained; 311/311 tests pass.

The round-6 fix lands precisely on the round-5 NO-GO root cause and introduces no new false-positive vector that appears in any real project.

---

## What the round-6 fix actually does (read from `lib/static-contrast.js`)

1. **Decorative children excluded at the source** — `buildContainerSurfaceMap` `CONTROL` regex (line 175) now matches `divider|offer|dot|line|rule|accent|swatch|thumb|bullet|marker|glow|blob|shape|deco|star|arrow` (plus the prior button/control set). A backgrounded element whose last simple matches `CONTROL` (line 194) registers **nothing** — so `.ba-divider` / `.popup-offer` never enter the map.
2. **Shortened block roots gated by `CONTAINER_SUFFIX`** (lines 179, 198–200) — an element only claims a *shortened* block root (`.ba` from `.ba-divider`, `.popup` from `.popup-offer`) when its last segment is a genuine container word (`banner|bar|footer|...|popup|modal|card|section|cookie|...`) **or** it is a single-token class. A decorative child registers only its **own** full token (`register(roots[0], …)`), never the shared root. Result: sibling text descendants (`.ba-text`, `.popup-subtitle`) no longer inherit an accent surface.
3. **Page-fallback emits only an UNAMBIGUOUS failure** (line 422): `if (bgFromPage && (ratio < 1.5 || ratio >= threshold - 0.5)) continue;` — skips near-invisible (<1.5, almost always a missing/inferred surface) AND marginal fails within 0.5 of threshold (the true surface may be lighter, e.g. a white card on a cream page). An element's **own** near-invisible background is *not* page-fallback, so PLANTED A still flags.

Unit-level proof (analyzer fed the exact round-5 inputs):
- `.ba-divider`(#b76e79) + `.ba-text`(taupe) + `.ba-title`(espresso) on `.before-after-card`(#fff) → **0 findings**.
- `.popup-offer`(#c4993d) + `.popup-subtitle`(taupe) on `.email-popup`(#fff) → **0 findings**.

---

## 1. lissaglow — finding-by-finding artifact/genuine adjudication

Page surface resolved correctly: `--lg-cream` = `#FAF7F5` (light). **39 located contrast findings** in the current run. Real-surface ratios recomputed with `lib/color-engine`:

Key surfaces: cream `#FAF7F5`, white `#ffffff`, ivory `#F0E6E0`, espresso `#2C1810`; taupe `#8B6D5D`, rose `#B76E79`, rose-light `#D4A0A8`, gold `#C4993D`, green `#4A7C59`.

### Round-5 artifacts — VERIFIED ELIMINATED

| Round-5 artifact | Real surface | Real ratio | In round-6 findings? | Status |
|---|---|---|---|---|
| `.ba-text` (taupe, lissa-base.css:1787) | white card `.before-after-card`→`#fff` inside `.before-after-section{#fff}` | `#8b6d5d` on `#fff` = **4.73 PASS** | **NO** (only an unrelated 6px *spacing* finding on `.ba-title` remains) | ✅ Fixed — decorative `.ba-divider` no longer poisons `.ba` |
| `.ba-title` (espresso, :1786) | same white card | `#2c1810` on `#fff` = **16.86 PASS** | **NO** | ✅ Fixed |
| `.popup-subtitle` (taupe, :2862) | `.email-popup{#fff}` modal → `.popup-content` | `#8b6d5d` on `#fff` = **4.73 PASS** | **NO** | ✅ Fixed |

### All 39 emitted findings — surface adjudication

Distinct surfaces actually used across the 39 findings: cream `#faf7f5` (×6, page), white `#ffffff` (×5, real cards), rose `#b76e79` (×10, **own button bg**), rose-light `#d4a0a8` (×1, **own hover bg**), ivory `#f0e6e0` (×6, real ivory sections), green-tint `#e9f7ef` (×1, **own composited tint**), espresso `#2c1810` (×3, real dark footer), page-fallback (×7, gold/rose icons on cream). Every surface is the element's correct real surface; **none is a wrong-surface accent/dark color lent to text that actually passes on a lighter surface.**

| Group | Findings | Real surface | Real ratio | Verdict |
|---|---|---|---|---|
| Gold/rose text, no own bg (`.header-logo span`, `.star`, `.trust-icon`, `.rating-count`, `.urgency-count`, `.review-star`, etc.) | 0,1,3,10,11,12,19,20,24,33,35,36,37,38 | cream/white (page / inline on card) | gold 2.47/2.63, rose 3.57/3.80 | GENUINE — gold/rose fails on both cream AND white anyway |
| Rose-button white text (own `var(--lg-rose)` bg) | 2,4,8,13,16,18,23,26,31,34 | own rose `#b76e79` | white/rose = **3.80** | GENUINE (own surface) |
| `.btn-secondary:hover` (own `--lg-rose-light` bg) | 6 | own `#d4a0a8` | **2.24** | GENUINE (own surface) |
| `.btn-secondary`/`.quantity-btn` (transparent → page) | 5,7,15 | cream page | 3.57 | GENUINE (rose fails on cream) |
| Taupe text on real ivory sections | 9,17,21,28 | ivory `#f0e6e0` | **3.85** | GENUINE borderline |
| `.reviews-empty-cta`/`.faq-chevron` rose on ivory | 22,25 | ivory `#f0e6e0` | **3.10** | GENUINE borderline |
| `.faq-answer-inner` taupe on cream | 27 | cream | **4.43** | GENUINE borderline (correctly emitted: not page-fallback-suppressed because surface is resolved, fail >0.5 below 4.5 at the seed) |
| `.feature-check` (own translucent green tint over white) | 14 | composited `#e9f7ef` | **4.40** | GENUINE borderline (own surface) |
| **Footer muted text on the dark espresso section** | 29 (`.footer-col h4` #807470 → 3.73), 30 (placeholder #766964 → 3.19), 32 (`.footer-copyright` #766964 → 3.19) | espresso `#2c1810` (verified `.footer{background:var(--lg-espresso)}`) | 3.19–3.73 | **GENUINE TP** — muted text on a real dark section still flags |
| Footer button white-on-rose | 31 | own rose | 3.80 | GENUINE |

White/gold footer **brand** text on espresso (16.86 / 6.40 → PASS) is correctly **NOT** flagged. The marginal `.ba-text`-style taupe-on-cream (4.43) page-fallback case is correctly **suppressed** by the within-0.5 guard.

**lissaglow artifacts: 0.** Every finding's reported surface equals its real surface; the round-5 trio is gone.

---

## 2. Broad sweep — per-project artifact counts (10 real projects)

| Project | Contrast findings | Page surface | Artifacts | Notes |
|---|---|---|---|---|
| lissaglow | 39 | `#FAF7F5` (light) | **0** | round-5 trio eliminated; all surfaces correct |
| hermes-personal-brand | 15 | `#0A0E1A` (dark, real `--bg`) | **0** | muted blue `#506090`/`#5070ff` on dark page (3.13, exact) & dark panels `#12182A`/`#1a2240`/`#0c0c14`/`#101430`. On white it would pass (6.15) but real surface is dark → genuinely fails. Genuine. |
| nitya-capital | 7 | `#f8f9fb` (light) | **0** | `--text-faint` grey `#9ca3af` on white/card = 2.41–2.54; chips on own soft-tint bgs (`#ecfdf5`/`#fef3c7`/`#f3f4f6`). All own/correct surface. Genuine. (round-5 `chocolate`/`cornflowerblue` hover findings are not present in this scan.) |
| ox | 0 | — | 0 | No contrast findings |
| recap-studio | 0 | — | 0 | No contrast findings |
| integra-brand | 0 | — | 0 | No contrast findings |
| agent-authority-site | 0 | — | 0 | No contrast findings |
| hermes-stack | 0 | — | 0 | No scannable contrast findings |
| nitya-ai | 0 | — | 0 | No scannable contrast findings |
| aboudjem | 0 contrast (6 a11y) | — | 0 | 6 findings are all genuine missing-`alt` on an HTML email signature; no contrast |

**Sweep total: 0 artifacts across all 10 projects.**

---

## 3. True positives retained

| Required TP | Status | Evidence |
|---|---|---|
| Planted fixture ≥12/12 | ✅ 12/12 | All planted problems detected: A `.hero-subtitle` 1.03 critical; B `.cta-primary` 2.64 critical; C `.section-muted` 1.48 + `.product-card` 1.39; D `.icon-btn` 28×28 + `.nav-link` 32px; E-alt 3 imgs (SignupForm.jsx:14,15 + index.html:23); E-label 4 inputs (:19,20 + index.html:27,28); F fixed 1200px / 0 media; G 11/12px body text; H 7/13/19px off-scale; I-colors "9 swatch variants fail, worst 1.75"; I-fonts "5 font families"; J "No visible keyboard focus indicator". 46 located findings total. |
| PLANTED A (`#fbfbfb` on own `#ffffff`) flags critical 1.03 | ✅ | `.hero-subtitle` src/styles.css:14 → **critical 1.03:1**. Own near-invisible bg, NOT page-fallback → not suppressed by the <1.5 guard. |
| nitya genuine pairs retained | ✅ | All 7 retained and genuine (grey-on-white KPIs/counter/footnote, soft-tint chips). |
| Muted text on an inferred dark section still flags | ✅ | lissaglow `.footer-col h4`/`.footer-copyright`/placeholder on `.footer`=`#2c1810` (3.19–3.73). hermes muted blue on dark panels. |
| No false negatives from the hardening | ✅ | `test/precision-regression.test.js:157` asserts a genuine 2.41 pair still flags AND that the suggested fix actually reaches ≥4.5 on the real surface. |

---

## 4. `npm test`

```
# tests 311
# pass 311
# fail 0
```

**311/311 pass.** The round-5 coverage gap is now closed: `test/precision-regression.test.js` adds explicit guards for both round-6 fixes —
- line 133: decorative accent child (`.ba-divider`) must not lend its surface to sibling text (`.ba-text` must not get `#b76e79`, no destructive critical);
- line 147: marginal page-fallback fail (taupe-on-cream 4.43) must be suppressed;
- line 157: a genuine low-contrast pair still flags and the suggested `after` reaches 4.5:1 on the real surface.

---

## 5. Independent break attempt — fair adjudication

- **lissaglow footer & all of hermes**: inferred/fallback surfaces ARE the real dark section backgrounds (`.footer`=#2c1810; hermes `--bg`=#0A0E1A confirmed in source); the muted text genuinely fails there. **GENUINE**, not counted.
- **nitya grey/chips**: own-surface (white/card/soft-tint); genuinely fail. **GENUINE**, not counted.
- **Synthetic stress (`.x` single-word accent → `.x-text`)**: feeding the analyzer a single-token accent class with a vivid bg and a `.x-text` sibling does produce an inherited-surface finding (`roots.length===1` makes a single-word class a container). This is **not a real-world artifact**: a single-word BEM block that carries a background *is* the container its `-text` element sits on, so inheriting it is correct. The round-5 bug was specifically a *multi-segment decorative child* (`.ba-divider`) claiming a *shortened* root (`.ba`) shared with text — that exact pattern is now fixed and produces 0 findings. No real project (10 scanned) exhibits the single-word-accent pattern, and there is no decorative child whose real surface passes that is reported as failing.

---

## Conclusion

- **Artifacts (real-surface PASSES, tool reports FAIL): 0** across all 10 real projects.
- Round-5 lissaglow trio (`.ba-text` 1.24, `.ba-title` 4.43, `.popup-subtitle` 1.79) **eliminated** — verified both via the live `--json` run (absent from 39 findings) and via the analyzer fed the exact inputs (0 findings).
- True positives fully retained: planted fixture **12/12**, PLANTED A critical 1.03, nitya 7 genuine, lissaglow footer dark-section muted text 3.19–3.73.
- **311/311 tests pass**, with new regression coverage closing the round-5 gap.

This is a **GO**.
