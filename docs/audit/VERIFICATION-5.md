# VERIFICATION-5 — Final (Round 5) Adversarial Contrast Re-Review

**Subject:** ui-ux-suite @ `rebuild/uiux-10x`, v0.4.0
**Reviewer role:** Independent skeptical reviewer (re-derived from primaries)
**Date:** 2026-05-29
**Method:** Live `node bin/ui-ux-suite.js <dir> --json` + direct reading of `lib/static-contrast.js` and `lib/color-engine.js`. Every contrast finding re-graded by reading the cited `file:line`, resolving the element's REAL surface (own bg, or nearest real ancestor SECTION via descendant/BEM block root), and recomputing the ratio with `lib/color-engine`.
**Definition of ARTIFACT (per brief):** a finding whose REAL-surface ratio actually PASSES (≥4.5 normal, ≥3 large) but the tool reports a FAILING ratio against the wrong surface. (A finding that correctly fails on its real surface but shows a wrong ratio is GENUINE-but-misreported, not a blocker.)

---

## VERDICT: **NO-GO**

**Total artifacts across all projects: 3** (all in lissaglow). Target was 0.

The round-5 fix (BEM block-root surface inference) survived the page-surface misresolution that killed rounds 1–4, but it **introduced a new false-positive vector**: a decorative/accent CHILD element that sets a vivid background registers its color onto a *shared BEM block root*, and an unrelated text descendant of the same block then inherits that wrong surface. The result is wrong-surface critical findings with destructive "flip text to white" fixes on text that actually passes.

---

## 1. lissaglow — artifact vs genuine breakdown

Page surface resolved correctly: `--lg-cream` = `#faf7f5` (light). 56 contrast findings total (51 text seeds + 5 surface-separation). 20 are inference-based (no own solid bg). Adjudication of the inference-based set:

### ARTIFACTS (3) — real-surface ratio PASSES, tool reports a failing ratio

| # | Selector | file:line | Tool bg / ratio | REAL surface | REAL ratio | Why artifact |
|---|----------|-----------|-----------------|--------------|------------|--------------|
| 26 | `.ba-text` | `assets/lissa-base.css:1787` | `#b76e79` (rose) / **1.24:1 critical**, after `#ffffff` | `.before-after-card`=`rgba(255,255,255,.72)`→`#fff` inside `.before-after-section{#fff}` | taupe `#8b6d5d` on `#fff` = **4.73:1 PASS** | Block root `.ba` registered as rose from the decorative absolute badge `.ba-divider{background:var(--lg-rose)}` (a 44×44 circle between images). `.ba-text` wrongly inherits `.ba`→rose. Destructive fix would flip readable taupe to invisible white. |
| 25 | `.ba-title` | `assets/lissa-base.css:1786` | `#b76e79` (rose) / **4.43:1**, after `#ffffff` | same `#fff` card | espresso `#2c1810` on `#fff` = **16.86:1 PASS** | Same `.ba`→rose collision. Espresso heading on a white card is maximally readable; flagged as failing. |
| 47 | `.popup-subtitle` | `assets/lissa-base.css:2862` | `#c4993d` (gold) / **1.79:1 critical**, after `#ffffff` | `.email-popup{background:#fff}` (modal) → `.popup-content` (no bg) | taupe `#8b6d5d` on `#fff` = **4.73:1 PASS** | Block root `.popup` registered as gold from the accent chip `.popup-offer{background:var(--lg-gold)}`. `.popup-subtitle` (inside `.popup-content`, on white) wrongly inherits `.popup`→gold. |

Root cause in `lib/static-contrast.js`: `buildContainerSurfaceMap` registers EVERY backgrounded non-control element's color onto all of its BEM block roots (`blockRoots`). A small accent child (`.ba-divider`, `.popup-offer`) thus claims the section-wide block root (`.ba`, `.popup`). `inferSurface` then hands that color to any backgroundless text descendant sharing the root. The control-exclusion list (`btn|accept|...`) does not cover decorative dividers/offer-chips, so they leak. The ambiguity guard only trips when a root straddles light AND dark; here the only registrant of `.ba` is rose (dark-ish), so no conflict is detected.

### GENUINE (correctly fails on its real surface) — NOT artifacts

- **Footer muted text (findings 39, 40, 42):** `.footer-col h4` `#807470`, `.footer-newsletter-form input::placeholder` `#766964`, `.footer-copyright` `#766964`. Inferred surface `.footer`=`#2c1810` (espresso) — verified `.footer{background:var(--lg-espresso)}` is the real dark section. Ratios 3.19–3.73:1 genuinely fail on the dark footer. **This is the required true positive: genuinely-muted text on a dark section still flags.** (And gold/white footer brand text on espresso passes → correctly NOT flagged.)
- **Ivory-section muted text (findings 28, 29, 38, 46):** `.review-bar-label/count`, `.reassurance-text`, `.free-shipping-text` = taupe `#8b6d5d` on ivory `#f0e6e0` = 3.85:1. Real surface ivory is correct (real `.reviews-section`/`.product-section` are ivory). Genuine borderline fails.
- **Rose-button white text (findings 4, 6, 8, 10, 20, 23, 24, 33, 36, 41, 44):** all have `background: var(--lg-rose)` (#b76e79) or `--lg-rose-light` on their OWN rule. White on rose = 3.8:1 (2.24:1 on rose-light) — genuinely fails for normal text. Correct own-surface, genuine.
- **Gold/rose accent text on the light page (findings 2, 3, 5, 13, 27, 31, etc.):** gold `#c4993d` / rose `#b76e79` on cream/white = 2.47–3.8:1, genuine borderline fails on the correct light page surface.
- **`.feature-check` (finding 21):** own translucent tint `rgba(39,174,96,.1)` composited over white → green `#4a7c59` on `#e9f7ef` = 4.4:1. Correct own-surface, genuine borderline.
- **Surface-separation (findings 51–55):** gold badges / ivory & white sections vs cream page, all measured against the correctly-resolved page surface. Genuine.

lissaglow is a legitimately low-contrast cream/rose site; the ~50 genuine borderline findings are expected and fine. The 3 artifacts are the blocker.

---

## 2. Broad sweep — per-project artifact counts

| Project | Contrast findings | Page surface | Artifacts | Notes |
|---------|-------------------|--------------|-----------|-------|
| lissaglow | 56 | `#faf7f5` | **3** | `.ba-text`, `.ba-title`, `.popup-subtitle` (block-root collision) |
| hermes-personal-brand | 20 | null (dark, ambiguous) | **0** | All inferred surfaces map to real dark panels (`.install`=#12182a, `.code`/`.terminal`=#0c0c14, `.feature`=#1a2240, `.nav`=#07070d). Muted blue text genuinely fails on those dark surfaces. `.react-flow__attribution a` is a 3rd-party watermark on its own white minimap. Genuine. |
| nitya-capital | 7 | `#f8f9fb` | **0** | `.kpi-sub`/`.week-aside`/`.counter`/`.footnote` grey `#9ca3af` on white = 2.54:1, genuine. Chips genuine. The two `.sk-estimator-doc-link:hover` findings show a wrong ratio (1.34 vs real ~3.37) because the hover bg is the CSS named color `chocolate`, which `resolveColor` cannot parse (hex/rgb only) — but real ratio 3.37 (`chocolate`) / 2.77 (`cornflowerblue`) STILL FAILS 4.5, so by definition these are GENUINE-but-misreported, not artifacts. (See secondary issue below.) |
| ox | 0 | — | 0 | No contrast findings. |
| integra-brand | 0 | — | 0 | No contrast findings. |
| agent-authority-site | 0 | — | 0 | No contrast findings. |
| recap-studio | 0 | — | 0 | No contrast findings. |

**Sweep total: 0 artifacts outside lissaglow.** All 6 sweep projects clean.

### Secondary (non-blocking) quality issue
Named CSS colors (`chocolate`, `cornflowerblue`, and the whole CSS named-color set) are not resolved by `resolveColor`/`parseColorWithAlpha` (hex + rgb/rgba only). When a rule's OWN background is a named color, `solidBackgroundHex` returns null and the engine falls back to inference, producing a wrong (but in nitya's case still-failing) ratio. Not a GO blocker by the artifact definition, but it is a correctness gap that produces misleading ratios/surfaces and should be fixed alongside the block-root bug.

---

## 3. True positives retained

| Required TP | Status | Evidence |
|-------------|--------|----------|
| Planted fixture ≥12/12 | ✅ Retained | `test/fixtures/planted-ux-problems`: 47 findings total; 8 distinct contrast findings incl. the grouped swatch finding reporting **"12 pairs, worst 1.75:1"** plus PLANTED A/B/C and surface separations. All planted contrast/UX problems still detected; no false negatives from the hardening. |
| PLANTED A (`#fbfbfb` on own `#ffffff`) flags critical | ✅ | `.hero-subtitle` `src/styles.css:14` → **critical 1.03:1**. Genuine near-invisible text with its OWN background still flags (the bgFromPage<1.5 skip does NOT suppress it because the bg is its own, not page-inferred). |
| nitya genuine pairs retained | ✅ | All 7 nitya findings retained and genuine (grey-on-white KPIs, chips). |
| Muted text on a dark section still flags | ✅ | lissaglow `.footer-copyright`/`.footer-col h4` on `.footer`=#2c1810 (3.19–3.73:1) flagged; hermes muted blue on dark panels flagged. |
| Dark-theme text on own dark surface measured correctly | ✅ | hermes (pageBg=null, per-section inference) measures muted text on its real dark panels, not on white. |

No false negatives introduced. The hardening did not suppress any genuine finding.

---

## 4. `npm test`

```
# tests 309
# pass 309
# fail 0
```

**309/309 pass.** `test/precision-regression.test.js` confirmed to cover every required case:
- alpha composition over dark page (line 18)
- fg===bg never emitted (line 28)
- multi-site / light+dark pooling skipped (line 50)
- component-scoped (CSS Module) var does not clobber `:root` (line 63)
- descendant-of-dark-section white text not flagged (line 96)
- BEM block-root dark SECTION inference for descendants (line 108)
- mid-luminance / genuinely-muted text ON the inferred dark section still flags (line 122)

**Coverage gap:** none of these tests exercise the *inverse* failure mode found in this review — a backgrounded **accent/decorative child** poisoning a block root that a **light-section text descendant** then inherits. The suite proves the dark-section direction works but does not guard the regression that lissaglow exposes. A passing 309/309 suite is therefore consistent with the live artifacts; the tests are not testing the failing path.

---

## 5. Attempt to break it — fair adjudication

- The dark-footer and dark-panel findings (lissaglow footer, all of hermes) are **GENUINE**, not artifacts: their inferred surfaces are the real section backgrounds and the text genuinely fails there. I did not count them.
- The nitya `chocolate`/`cornflowerblue` hover findings show wrong ratios but still fail on the real surface (3.37 / 2.77 < 4.5) → **GENUINE-but-misreported**, not artifacts. Not counted as blockers.
- The lissaglow `.ba-text` / `.ba-title` / `.popup-subtitle` findings are **true ARTIFACTS**: the real surface is white, the real ratio PASSES (4.73 / 16.86 / 4.73), and the tool emits failing/critical ratios with destructive fixes. These are blockers.

---

## Conclusion

- **Artifacts (real-surface PASSES, tool reports FAIL): 3** — all lissaglow, all from the new BEM block-root collision where a decorative child (`.ba-divider`, `.popup-offer`) claims a section-wide block root that a light-section text descendant inherits.
- Sweep (6 projects): 0 artifacts.
- True positives fully retained; 309/309 tests pass.
- Because the artifact count is **3, not 0**, and includes a critical `1.24:1` finding with a fix that would make passing text invisible, this is a **NO-GO**.

### Minimal fix direction (for the implementer, not applied here)
1. Do not register a backgrounded element onto a block root SHORTER than its own token unless the element itself looks like a section/container (reuse the `analyzeSurfaceSeparation` section regex: `section|card|panel|...|footer|header|hero|banner`). A `.ba-divider` / `.popup-offer` should register only `.ba-divider` / `.popup-offer`, never `.ba` / `.popup`.
2. Alternatively, only let `inferSurface` use a block root when the registrant selector's last simple itself contains a container-ish suffix, or when the root is also confirmed by a descendant-combinator ancestor.
3. Resolve CSS named colors in `parseColorWithAlpha` (add the named-color table) so own-background rules using `chocolate`/`cornflowerblue`/etc. are measured on their real surface instead of falling through to inference.
4. Add precision-regression cases for: (a) accent child poisoning a block root shared with light-section text, and (b) named-color own background.
