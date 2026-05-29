# VERIFICATION-3 — Third Skeptical Re-Review (contrast false-positive audit)

**Branch:** `rebuild/uiux-10x`
**Reviewer:** Independent adversarial skeptic (did not write the code)
**Method:** Re-derived from primaries — live `node bin/ui-ux-suite.js <dir> --json` runs + reading `lib/static-contrast.js` and `lib/located-audit.js`; every cited ratio independently recomputed with `lib/color-engine`.
**Date:** 2026-05-29

## FINAL VERDICT: **NO-GO**

A new, systematic false-positive class survives the rebuild. On a real project (`lissaglow`),
**16 CRITICAL contrast findings are artifacts** caused by descendant elements of dark/gradient
sections being judged against the light page surface. This is the same *surface-misresolution*
failure family that drove the two prior NO-GOs (Round 1 alpha/fg===bg, Round 2 multi-site pooling)
— only the trigger is different: the engine has **no ancestor/descendant surface inheritance**, so a
`color:#fff` element inside a `.footer{background:#2C1810}` (dark espresso) is mis-measured as
`#ffffff on #faf7f5 = 1.07:1`. The auto-suggested "fix" is actively destructive.

---

## Verdict table

| Check | Target | Result | Pass? |
|---|---|---|---|
| 1. hermes near-1:1 contrast FPs | 0 | **0** (was 43 criticals) | YES |
| 1. hermes 18 remaining findings genuine | all genuine | **18/18 genuine** (recomputed) | YES |
| 2. Sweep ≥8 projects, near-1:1 FPs | 0 everywhere | **lissaglow: 16 artifacts** | **NO** |
| 3. Planted fixture true positives | 12/12 | **13/13** classes | YES |
| 3. nitya genuine pair #9ca3af/#f8f9fb≈2.41 | flags | **2.41:1 flagged** | YES |
| 3. coherent single-site dark theme | measures correctly | YES (unit + live) | YES |
| 4. Adversarial break tests | no false 1:1 | 1 real FP class found (descendant surface) | **NO** |
| 5. `npm test` | ~306 pass | **306 pass, 0 fail** | YES |
| 5. precision-regression coverage | alpha/fg===bg/multi-site/component-var | all 4 covered | YES |

---

## 1. hermes-personal-brand (the repo that produced 43 FPs) — CLEAN

- **18 contrast findings, all severity `important`, ratios 3.13–4.36:1. ZERO criticals. ZERO near-1:1.**
- The 43 false "light-on-near-white" criticals are gone. Per-site scoping (`siteOf`) + conflicting-surface→null both confirmed working.
- All 18 independently recomputed and **GENUINE**:
  - `#3050ff on #0a0e1a = 3.41:1` (tool: 3.41) — `a` link color on the dark page `var(--bg)=#0A0E1A`. Real AA fail.
  - `#506090 on #0a0e1a = 3.13:1` (tool: 3.13) — `--text-muted` on dark page. Real AA fail. (13 occurrences.)
  - `#5070ff` on alpha-composited card surfaces (`rgba(48,80,255,0.14)` over `#0A0E1A` → `#0f173a`, ratio 4.24:1) — alpha compositing verified byte-exact against the tool. Real AA fail.
  - Tool correctly did **not** flag `#8090bb` (text-dim, 6.07:1 pass) or `#5070ff` on the bare page (4.68:1 pass).
- No suspicious findings. The `firstHex`/Lc-digit regex produced one spurious "1:1" string match in my first grep; manual inspection confirms every measured ratio is ≥3.13.

## 2. Multi-project sweep (10 projects)

| Project | Contrast findings | near-1:1 FPs | Worst ratio | Notes |
|---|---|---|---|---|
| hermes-personal-brand | 18 | **0** | 3.13 | all genuine (dark-blue on dark page) |
| nitya-capital | 7 | **0** | 2.41 | all genuine; #9ca3af/#f8f9fb=2.41 retained |
| integra-dashboard-frontend | 0 | 0 | – | no resolvable surfaces / passes |
| integra-ai-strategy | 0 | 0 | – | – |
| openclaw-dashboard | 0 | 0 | – | – |
| chain-recovery-report | 0 | 0 | – | – |
| pawntoking | 0 | 0 | – | – |
| marvelousfrance | 0 | 0 | – | – |
| planted fixture | 8 | 6 (all GENUINE) | 1.03 | intentional planted near-white-on-white |
| **lissaglow** | **85** | **19 (16 artifacts + 3 genuine)** | 1.03 | **descendant-surface misresolution** |

**Total near-1:1 across the sweep: 25.** Of these:
- **6 (planted)** = intentional ground-truth true positives (PLANTED A/C/Card.scss).
- **3 (lissaglow surface-separation)** = GENUINE (ivory `#F0E6E0` section on cream `#FAF7F5` page = 1.15:1, no border/shadow — same legitimate class as PLANTED C).
- **16 (lissaglow text-contrast) = ARTIFACTS.** ← the blocker.

## 2a. lissaglow artifact root cause (NEW issue)

`lib/static-contrast.js::analyzeTextContrast` resolves a rule's surface from **only its own
`background`** (line 295-296) composited over the single resolved page surface. It has **no model of
which container a selector sits inside**. lissaglow is a coherent single-light-theme page
(`body{background:var(--lg-cream)=#FAF7F5}`), so `resolvePageBackground` correctly returns `#faf7f5`.
But the page contains **dark sections**:

- `.footer / .site-footer { background: var(--lg-espresso) = #2C1810 }` (lissa-base.css:2282)
- `.marquee-section, .social-proof-bar { background: var(--lg-espresso) = #2C1810 }` (:1097)
- `.cookie-banner { background: rgba(26,26,26,0.95) }` (:2494)
- `.reviewer-avatar { background: linear-gradient(...rose...) }` (:2028) — gradient → falls back to page

Their child selectors correctly use white/translucent-white text. The engine has no own-background
for the child, falls back to the **light page**, and emits impossible `#ffffff on #faf7f5 = 1.03–1.07:1`.

**16 of these are emitted as `critical`** with destructive auto-fixes. Concrete example
(`.footer-brand .logo, .footer-brand-name`, lissa-base.css:2305):

- Tool reports: `#ffffff on #faf7f5 = 1.07:1 (critical)`; fix → `color: #8f8f8f`.
- Reality (recomputed): white text sits on `#2C1810` = **16.86:1 (passes AAA)**.
- Following the suggested `#8f8f8f` on the **real** `#2C1810` surface drops contrast to **5.21:1** — the "fix" makes a perfect element worse.

Full artifact list (all lissa-base.css): `.marquee-item/.social-proof-item` :1114; `.cookie-text` /
`.cookie-btn-decline` (dark `rgba(26,26,26,.95)` banner); `.reviewer-avatar` (rose gradient);
and 11 `.footer-*` selectors (:2305, :2317, :2331, :2342, :2362, :2376, :2390, :2402, :2415, :2452, :2459).

This is squarely the surface-misresolution family the rebuild set out to eliminate; it was simply not
exercised by the hermes (multi-site) or single-coherent-theme test cases.

## 3. True positives retained

- **Planted fixture: 13/13 problem classes detected** (A near-white-on-white 1.03; B ghost CTA #9aa0a6 2.64; C boundary 1.09 + text #c9ccd1 1.48; D touch targets; E-alt/E-label; F fixed 1200px/viewport; G 11px; H 7/13/19px; I-colors swatch series; I-fonts 5 families; J focus-visible — now correctly flagged via the mask-aware detector, fixing the old comment-regex false-negative noted in PLANTED.md). Planted near-1:1 are intentional ground truth, not regressions.
- **nitya genuine pair retained:** `#9ca3af on #f8f9fb = 2.41:1` flagged at roadmap-v1/styles.css:90/117/213; plus #059669/#ecfdf5=3.58, #d97706/#fef3c7=2.86, #6b7280/#f3f4f6=4.39 — all genuine, 0 FPs.
- **Coherent single-site dark theme measures correctly:** unit test passes; live break-test `#1a1e2a on #0a0e1a = 1.16:1` is a *real* dark-on-dark fail (correct), and a coherent dark page with light text emits nothing false.

## 4. Adversarial break tests (constructed)

| Case | Result | Verdict |
|---|---|---|
| Global var defined ONLY in `@media` | 0 findings (surface→null, skipped) | SAFE |
| `:root.dark` class-scoped dark theme | 0 findings (light+dark surfaces → ambiguous → null) | SAFE |
| `color-mix()` text color | 0 findings (unresolvable, skipped) | SAFE |
| `currentColor` background | 0 findings (no false fg===bg 1:1) | SAFE |
| hex8 translucent text `#11111122` over white | 1 finding `#dfdfdf/#fff=1.33` | CORRECT (13% black over white is genuinely faint) |
| Card with `rgba()` border | text `#888/#fff=3.54` only; border ignored | CORRECT |
| **Site split across files (light siteA/ + dark siteB/)** | 0 findings; per-site `siteOf` isolates | SAFE |
| **Single coherent dark site, files at depth** | `1.16:1` genuine dark-on-dark | CORRECT |
| **Descendant of dark section in a light page** (lissaglow class) | false `#fff/#faf7f5=1.07` critical | **BROKEN** |

Eight of nine break vectors are handled correctly. The ninth — the descendant-surface case — is the
real-world failure reproduced by lissaglow.

## 5. Tests

- `npm test` → **306 pass / 0 fail / 0 skipped** (matches expected ~306).
- `precision-regression.test.js` covers all four prior must-fixes: alpha compositing (faint rgba tint),
  fg===bg guard, multi-site light+dark pooling, and component-scoped (CSS-Module) var precedence vs `:root`.
  **Gap:** there is no test for a `color`-only descendant of a dark/gradient *container* (no own background)
  in an otherwise light single-theme page — exactly the uncovered class that lissaglow exposes.

---

## What would flip this to GO

The engine must stop assuming a backgroundless text rule sits on the page surface when evidence points
to a darker container. Minimum viable options (any one):

1. **Skip rather than assume** when a `color`-only selector's resolved page surface contradicts the text
   luminance (e.g. near-white text resolved onto a near-white page with `ratio < ~1.3` and APCA Lc 0 →
   treat as indeterminate surface and skip, same conservative philosophy already used for translucent/var
   surfaces). This alone would suppress all 16 lissaglow artifacts with negligible true-positive loss
   (genuine near-white-on-near-white, like PLANTED A `#fbfbfb/#ffffff`, would still be caught only when the
   element's *own* surface confirms it — which is the honest signal).
2. **Light ancestor inference:** map descendant selectors (`.footer-*`, `.marquee-item`) to the nearest
   ancestor selector (`.footer`, `.marquee-section`) that declares a background, and composite there.
3. At minimum, **never emit `critical`** for a sub-1.3:1 white-on-near-white text pair derived from the
   *page fallback* (`bgFromPage`), since that configuration is almost always a missing-surface artifact —
   the very lesson of Rounds 1–2.

Add a regression test mirroring the lissaglow footer/marquee shape before re-review.

---

## Bottom line for the caller

- **hermes near-1:1 FP count: 0** (down from 43). All 18 remaining hermes findings are genuine.
- **Total near-1:1 across the sweep: 25 — but 16 are genuine artifacts in lissaglow; the other 9 are true positives** (6 intentional planted + 3 genuine ivory-on-cream surface boundaries).
- True positives fully retained (planted 13/13, nitya 2.41 retained, dark themes correct).
- 306/306 tests pass.
- **Verdict: NO-GO** — a real, critical-severity contrast false-positive class (descendant elements of dark/gradient sections judged against a light page) survives, with destructive auto-fixes. Same surface-misresolution family as the prior two NO-GOs.
