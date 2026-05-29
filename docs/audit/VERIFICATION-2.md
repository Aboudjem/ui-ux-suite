# VERIFICATION-2 — Re-review of the contrast-precision must-fixes

**Reviewer role:** independent, adversarial Skeptical Reviewer (re-review). I did NOT write the fixes.
**Repo / branch:** `/Users/adamboudj/projects/ui-ux-suite` @ `rebuild/uiux-10x`
**Commit under review:** `8e9f4c3` (five must-fixes + `test/precision-regression.test.js`)
**Method:** every verdict re-derived from primaries — live `bin/ui-ux-suite.js <dir> --json` runs on real folders + reading `lib/`. No summary was trusted.
**Date:** 2026-05-29

---

## Verdict at a glance

**NO-GO.**

The five named must-fixes (1–5) are each genuinely resolved *for single-file / single-site input*, and the literal Phase-11 TARGET — **zero `fg===bg` "1:1" findings** — is met everywhere (0 exact fg===bg across every project scanned). All 303 tests pass; the planted fixture still grades **12/12**; the genuine low-contrast true positive is retained with a correct suggestion.

BUT the **disease behind the original NO-GO is not cured**, only its most literal symptom. `lib/located-audit.js:489-490` concatenates the CSS declarations of **every file in the project** into one array and calls `analyzeTextContrast(cssDecls)` **once**, so `resolvePageBackground` resolves **one global surface for the entire project**. On a multi-site repo (`hermes-personal-brand`: 3 independent sites) the light site's `--background:#ffffff` becomes the surface for the dark sites, producing **43 impossible "light-text-on-near-white" critical contrast findings** — reported to the user verbatim as `1:1`, `1.04:1`, `1.13:1` criticals. This is the exact failure mode the first review rejected ("impossible near-1:1 contrast from a misresolved surface"); the `fg===bg` guard does not catch it because the two hexes differ by a hair (`#fafaf6` vs `#fafafa`, `#e8ecff` vs `#fafafa`).

A reviewer cannot ship a contrast engine that emits 43 false criticals on a real personal-brand repo.

---

## 1. Must-fix verdict table (primary evidence)

| # | Must-fix | Resolved? | Primary evidence |
|---|----------|-----------|------------------|
| 1 | rgba()/hex8 alpha composited over surface; translucent-over-unknown → skip | **YES** | `lib/static-contrast.js:88-92` (`compositeOver`), `:118-125` (`resolveBackgroundHex`). Live: `analyzeTextContrast` on `#00e0ff14` and `rgba(0,224,255,8%)` tints over `#0a0a14` → **0 findings** (correctly composited, not stripped). Adversarial run below. |
| 2 | Guard skips any pairing where resolved fg === bg | **YES (exact match only)** | `lib/static-contrast.js:256-257`: `if (fg.toLowerCase() === bg.toLowerCase()) continue;`. Live: **0 exact fg===bg** across nitya, hermes, fixture, integra-status-vercel, chain-recovery-report, agent-authority-site, integra-brand, ox. ⚠️ Catches *exact* equality only — see NEW ISSUE: near-equal misresolved pairs leak. |
| 3 | Base (:root) var defs win over @media redeclarations | **YES** | `lib/static-contrast.js:97-106` (`buildVarMap`: `Object.assign({}, atRule, base)`). Test `precision-regression.test.js:38-48` passes: base `--background:#ffffff` wins over `@media dark #0a0a0a`. |
| 4 | SCSS `$vars` resolved | **YES** | `lib/static-contrast.js:76-77` (`resolveColorRGBA` SCSS branch) + `:101` (`buildVarMap` accepts `$`-prefixed props). Test `precision-regression.test.js:62-70` passes (surface measured against resolved `$muted-bg #f4f5f6`). |
| 5 | `<img>`/`<input>` detectors + @media count comment-masked | **YES** | `lib/located-audit.js:356-363` (`markupMask` = `codeMask` + HTML `<!-- -->`), `:374-410` (img/input gated on `inCode`), `:452-453` (@media count strips comments first). End-to-end CLI run: commented `<img>`/`<input>` ignored, only real markup flagged; commented `@media` not counted → "0 media queries". Output pasted below. |
| 6 | `test/precision-regression.test.js` (6 tests) | **YES** | `node --test …/precision-regression.test.js` → `# tests 6 / # pass 6 / # fail 0`. Covers alpha-tint (#1), fg===bg (#2), base-over-@media (#3), SCSS vars (#5), genuine-pair-retained, comment-masked markup (#3-markup). |

`npm test` → **`# tests 303 / # pass 303 / # fail 0`** (background run, exit 0).

---

## 2. True positives retained — planted fixture 12/12

`node bin/ui-ux-suite.js test/fixtures/planted-ux-problems --json` → 47 located findings; mapped to the 12 PLANTED ids in `PLANTED.md`:

| PLANTED id | Caught by | Evidence |
|------------|-----------|----------|
| A near-white text | `accessibility-c2` | `src/styles.css:14` `.hero-subtitle` **1.03:1** ✓ |
| B buried CTA | `accessibility-c3` | `src/styles.css:23` `.cta-primary` **2.64:1** ✓ |
| C low-contrast section + text | `accessibility-c4` (text 1.48:1) + `hierarchy-c7` (surface **1.09:1**) ✓ |
| D tiny touch targets | `platform-tt0` (28×28) + `platform-tt1` (32px) ✓ |
| E-alt missing alt ×3 | `accessibility-img0/img1/img5` (SignupForm:14,15 + index.html:23) ✓ |
| E-label inputs no label | `accessibility-inp2/inp3/inp6/inp7` ✓ |
| F no responsive | `responsive-fw0` `1200px … 0 media queries` (critical) ✓ |
| G body text too small | `typography-t5` `.body-copy 11px` + `typography-t0` `.price 11px` ✓ |
| H off-scale spacing | `layout-s4/s5/s6` `7px/13px/19px` ✓ |
| I-colors too many colors | `accessibility-c0` (18 swatches fail) + 8× `color-nd*` ✓ |
| I-fonts 5 families | `typography-ff0` ✓ |
| J no :focus-visible | `accessibility-f0` "No visible keyboard focus indicator anywhere" — **still fires despite `focus-visible` text in the PLANTED[J] comment at styles.css:127/131** (comment-mask works) ✓ |

**Score: 12/12.**

Genuine low-contrast pair (`#9ca3af` on `#f8f9fb`) still flags, recomputed with `lib/color-engine`:
```
genuine pair: ratio 2.41:1 (APCA 43.8), severity critical, suggestion "#6f737c"
suggestion #6f737c on #f8f9fb -> 4.51:1  (>=4.5? true)
```
True positive + actionable, passing suggestion retained. ✓

---

## 3. Adversarial break attempts (single-file engine) — all PASS

`analyzeTextContrast` driven directly (no false 1:1 produced):
```
hex8 #00e0ff14 over dark:           0 findings   (alpha composited, not stripped)
rgba % alpha (8%) over dark:        0 findings   (% alpha parsed)
var only in @media:                 0 findings   (resolved, no bogus surface)
nested var chain (a->b->c):         0 findings   (chain followed)
color-mix() fg & bg:                0 findings   (unparseable -> skipped, NOT 1:1)
aliased identical via vars:         0 findings   (fg===bg guard fires)
translucent fg over translucent bg: 0 findings   (both composited over known page)
hex4 #9993 (20% grey) over white:   1 finding -> #ebebeb on #ffffff = 1.19:1  (genuine: faint text IS low-contrast) ✓
```
The single-file resolver (`resolveBackgroundHex`, `compositeOver`, `buildVarMap`, the fg===bg guard) is **robust**. I could not break it with the prompt's stress cases.

End-to-end comment-mask via CLI (`/tmp/uiux-cmt-test`):
```
img findings lines:   [5]  (commented <img> at line 2 ignored; only real markup flagged)
input findings lines: [5]  (commented <input> at line 3 ignored)
fixed-width finding:  "Fixed 1200px width on `.layout` with 0 media queries"  (commented @media NOT counted)
```

---

## 4. NEW ISSUE (blocking) — cross-file surface pooling re-creates the original defect

**Where:** `lib/located-audit.js:489-490`
```js
let cssDecls = [];
for (const { rel, content } of cssFiles) cssDecls = cssDecls.concat(scanCss(content, rel).declarations);
// ... detectContrast(cssDecls, 0)  -> analyzeTextContrast(cssDecls) ONCE for the whole project
```
`analyzeTextContrast` (`lib/static-contrast.js:227-229`) builds ONE `varMap` and ONE `pageBg` from the **union of every file's declarations**. There is no per-file (or per-site) scoping. So on a repo with multiple independent stylesheets, the page surface of one site bleeds into the contrast math of another.

**Deterministic reproduction** (two separate sites in `hermes-personal-brand` pooled like the runner does):
```
POOLED --bg: #0A0E1A   --background: #ffffff
POOLED resolvePageBackground => #ffffff
false ~1:1 findings from pooling: 4
   landingpage/style.css:159 .nav-logo        | #e8ecff on #ffffff = 1.17:1
   landingpage/style.css:434 .install-widget  | #e8ecff on #ffffff = 1.17:1
   ...
```
`landingpage/style.css` is an unambiguously dark site — `:root{ --bg:#0A0E1A } body{ background:var(--bg); color:var(--text /*#E8ECFF*/) }` (`landingpage/style.css:18,61-64`). `#e8ecff` on `#0A0E1A` is ~16:1 (excellent). The tool scores it against `#ffffff` (the `dashboard/src/app/globals.css:1-2` light `--background`) → **false 1.17:1 critical**.

A second variant of the same bug: `[data-theme="dark"] .heroTitle { color:#fafaf6 }` (`website/src/pages/skills/styles.module.css:55-56`) — a dark-theme-scoped selector — is scored against the light page surface `#fafafa` → reported as a literal **"1:1 (APCA Lc 0)"** critical (`accessibility-c53`). `resolvePageBackground` ignores `[data-theme="dark"]` selector scope entirely.

**Full live count on the real repo** (`bin/ui-ux-suite.js hermes-personal-brand --json`), classifier = light text (lum>0.6) on near-white surface (lum>0.85):
```
hermes-personal-brand  contrast=96  fgEQbg=0  lightOnLight(FALSE CRITICAL)=43
   dashboard/src/app/globals.css:27 body          | #ffffff on #fafafa
   landingpage/style.css:83 strong                | #ffffff on #fafafa
   landingpage/style.css:333 .hero-title          | #ffffff on #fafafa
   ... (43 total; reported as 1:1 / 1.04:1 / 1.13:1 / 1.17:1 criticals)
```

This is the same class of impossible-contrast false positive the first VERIFICATION rejected, just no longer *exactly* equal. The `fg===bg` guard is a band-aid over a value that should never have been computed against the wrong surface.

---

## 5. Per-project false-positive counts (before → after)

"Before" = the v0.3/early-rebuild engine the first review condemned (assumed-white surface + alpha stripping + var collisions produced impossible 1:1s broadly). "After" = commit `8e9f4c3`, measured live here.

| Project (real `.css`/`.html`) | files | contrast findings | exact fg===bg (TARGET=0) | impossible near-1:1 false criticals (after) |
|---|---:|---:|---:|---:|
| nitya-capital (single site) | 72 | 7 | **0** | **0** (all 7 are genuine — e.g. `#9ca3af` on `#f8f9fb` 2.41:1, the planted-style true positive) |
| integra-status-vercel | 38 | 0 | **0** | **0** |
| chain-recovery-report | 26 | 0 | **0** | **0** |
| agent-authority-site | 24 | 0 | **0** | **0** |
| **hermes-personal-brand (3 sites)** | 19 | 96 | **0** | **43** ⛔ |
| integra-brand | 9 | 0 | **0** | **0** |
| integra-brand-clone | 6 | 0 | **0** | **0** |
| ox | 5 | 0 | **0** | **0** |
| integra-design-system | 4 | 0 | **0** | **0** |
| psy-reports | 3 | 0 | **0** | **0** |
| nitya-ai-stack | 2 | 0 | **0** | **0** |
| ~/.recap/2026-04-25-ai-models (HTML-only) | — | 0 | **0** | **0** |

**Net:** exact `fg===bg` = 0 everywhere (literal target met). Single-site projects are clean. The cross-file pooling bug produces **43 false criticals on one real multi-site repo**, which is a shipping blocker for "the marquee feature."

---

## 6. Reasoning for the verdict

GO criteria I applied: (a) zero impossible-contrast false positives on real folders; (b) true positives retained (fixture 12/12 + genuine pair); (c) tests green; (d) cannot be broken by the named adversarial cases.

- (b) ✓ 12/12 + genuine pair with passing suggestion.
- (c) ✓ 303/303 + 6/6 precision regressions.
- (d) ✓ single-file engine survives every adversarial case (hex8, % alpha, @media-only var, nested var, color-mix, aliased-identical, translucent-over-translucent).
- (a) ✗ **43 impossible "light-on-near-white" critical contrast findings** on `hermes-personal-brand`, caused by `located-audit.js:489-490` pooling all files' declarations into one global surface resolution. This is the original NO-GO defect in a near-miss disguise.

The must-fixes did exactly what they claimed (1–6 all verified resolved). They were just scoped to the wrong layer: the resolver was hardened, but the **call site feeds it cross-contaminated data**. One real-world repo out of eleven trips it — but it trips it 43 times, with the worst-possible label ("1:1 critical"), on a public personal-brand site.

### Required fix to flip to GO
Scope `analyzeTextContrast` / `resolvePageBackground` **per file** (or per CSS "site root"), not per project — e.g. group `cssFiles` and call the analyzer once per file with only that file's declarations (or per top-level directory / per stylesheet that owns its own `:root`). Additionally, `resolvePageBackground` should respect dark-theme selector scope (`[data-theme="dark"]`, `.dark`, `@media (prefers-color-scheme: dark)`) so a dark-scoped text color is not scored against a light surface. After that, re-run on `hermes-personal-brand` and confirm `lightOnLight == 0` while nitya-capital still reports its 7 genuine findings.

---

## FINAL: **NO-GO**

Zero exact `fg===bg` (literal target met), 12/12 fixture, 303 tests green, single-file engine unbreakable — but **43 impossible near-1:1 critical contrast false positives on a real multi-site repo** (`located-audit.js:489-490` global-surface pooling) re-create the defect that caused the first NO-GO. The marquee feature still misreports the contrast of dark-themed pages. Fix the per-file scoping and re-verify.
