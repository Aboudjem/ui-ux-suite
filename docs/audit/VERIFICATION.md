# Independent Verification — ui-ux-suite 10x rebuild

**Role:** Skeptical Reviewer (adversarial). I did not build this; every verdict below was
re-derived from primaries (live code + real runs), not from any summary.
**Branch:** `rebuild/uiux-10x`  ·  **Tool version:** v0.3.0 (banner) / schema reports `duration` etc.
**Date:** 2026-05-29  ·  **Test suite:** `297 pass / 0 fail` (93 suites), `node --test test/*.test.js`
**I modified no `lib/` or `test/` file** (`git status --short` shows only untracked `docs/audit/*.md`).

---

## Verdict table

| # | Claim | Verdict | Primary evidence | Correction |
|---|-------|---------|------------------|------------|
| 1 | RED→GREEN: planted fixture 0/12 → 12/12 specificity | **CONFIRMED (12/12 detected+located+measured+fixed)** | My own re-grade of `bin/ui-ux-suite.js test/fixtures/planted-ux-problems --json` → 48 located findings; every planted id A–J mapped to a genuine finding (table below) | None to the 12/12 headline. But 2 *extra* spurious findings exist (see #2/correction): `img0`@SignupForm.jsx:5 and `inp3`@:6 fire on `<img>`/`<input>` text inside **JSDoc comments** (img/input detectors are not comment-masked, unlike the focus detector). Does not reduce the 12/12. |
| 2 | Findings are CORRECT, not just present | **CONFIRMED with 1 CORRECTION** | Recomputed 6 contrast pairs with `lib/color-engine` (`contrastRatio(hexToRgb(fg),hexToRgb(bg))`); A=1.03, B=2.64, C-surf=1.09, C-text=1.48 all match ground truth exactly. Body size = **11px** (not 12px) confirmed: `typography-t5` measured `11px` @ styles.css:71. Focus finding fires correctly **despite** `focus-visible` in the styles.css:131 / SignupForm comments (detector is "mask-aware", located-audit.js:240). | `accessibility-c1` (`.product-card`): tool measures `#cfd2d6` on `#ffffff` = **1.52:1** and suggests `after:#757679` which reaches **4.54:1 on #ffffff** (self-consistent). But the true surface is the SCSS `$muted-bg=#f4f5f6` (unresolved), where real ratio = **1.39:1** and `#757679` reaches only **4.16:1 (FAILS 4.5)**. Conclusion "fails AA" is still correct; the chosen surface and `after` are off when a literal bg isn't on the same rule. Minor. |
| 3 | No new false positives on real-world input | **REFUTED — CRITICAL** | Ran on 8 real folders. `~/.recap/2026-04-25-ai-models` → **1 critical FALSE POSITIVE** (`.strength-cite,.src` "1:1"). `hermes-personal-brand` → **111 findings / 21 critical, 12 guaranteed false positives** (`body #000000 on #000000 = 1:1`, `.btn-primary #5070ff on #3050ff = 1.37:1`, etc.). 13 total **X-on-X (fg===bg)** mathematically-impossible findings across runs. | **Two root-cause bugs** (must-fix, file:line below). Note: nitya-capital findings (`.kpi-sub` `#9ca3af`/`#f8f9fb`=2.41:1) are **legit** — the engine is correct when no alpha/var-collision is involved. |
| 4 | UX-law citations valid + correctly applied | **CONFIRMED** | All emitted law slugs ∈ `schema.js LAWS_SLUGS` (21 slugs) across planted + 4 real runs — `INVALID = NONE`. `von-restorff-effect` resolves: `{name:"Von Restorff Effect", url:"https://lawsofux.com/von-restorff-effect/"}`. `fittss-law` is on the **touch-target** findings (`platform-tt0/tt1`) and **NOT** on body-text findings (those cite `aesthetic-usability-effect`). Accessibility findings cite WCAG SC (1.4.3, 2.4.7, 1.1.1, 3.3.2) with `laws:undefined`. | None |
| 5 | Audit writes NO files | **CONFIRMED** | Copied fixture to a temp dir, snapshotted (`find … stat` + per-file `shasum`), ran both `--json` and default audit, re-snapshotted: **identical listing, byte-identical SHA tree** `a1717fc2…` before==after (mtimes unchanged). | None |
| 6 | HTML report is XSS-safe | **CONFIRMED** | `report-html.js esc()` escapes `& < > " '` (lines 31-39); no raw `${finding.*}` interpolation bypasses it (grep). End-to-end: injected `<script>alert(1)</script>"><img src=x onerror=alert(2)>` into selector/file/title/desc/fix/before/after/measured/threshold/laws/wcag/dimension → rendered HTML has **0 live `<script>`, 0 live `onerror`, 0 raw payload occurrences; all 13 instances escaped to `&lt;script&gt;`**. | None |

---

## Claim 1 — RED→GREEN re-grade (my own 12/12)

Run: `node bin/ui-ux-suite.js test/fixtures/planted-ux-problems --json` → 48 located findings, overall 3.8 "Needs Work".

| id | planted problem | finding(s) | detected | located (file:line/sel) | measured | fixed | grade |
|----|-----------------|-----------|:--:|:--:|:--:|:--:|:--:|
| A | hero-subtitle #fbfbfb/#fff 1.03:1 | `accessibility-c2` | ✓ | styles.css:14 `.hero-subtitle` | 1.03:1 ✓ | `after #767676` → **4.54:1** ✓ | PASS |
| B | ghost-link CTA #9aa0a6 2.64:1, tiny, `<a>` | `accessibility-c3`(2.64) + `typography-t4`(13px) + `layout-s2`(pad) + `flows-cta6/10` + focus | ✓ | styles.css:23 / SignupForm.jsx:23 | 2.64:1 ✓ | `after #73777c` → **4.51:1** ✓ | PASS |
| C | section-muted surface 1.09 + text 1.48 | `hierarchy-c6`(surface 1.09) + `accessibility-c4`(text 1.48) | ✓ | styles.css:36 / :37 | 1.09 / 1.48 ✓ | border+shadow / `#6f7073`→**4.54** ✓ | PASS |
| D | icon-btn 28×28, nav-link 32 | `platform-tt0`(28×28) + `platform-tt1`(32) | ✓ | styles.css:43 / :50 | 28×28, 32 ✓ | `min 44×44` ✓ | PASS |
| E-alt | 3 imgs no alt | `img1`@14, `img2`@15, `img7`@idx:23 (+spurious `img0`@cmt:5) | ✓ | exact lines ✓ | "no alt" ✓ | `<img alt>` ✓ | PASS |
| E-label | inputs no label | `inp4`@19, `inp5`@20, `inp8/9`@idx (+spurious `inp3`@cmt:6) | ✓ | exact lines ✓ | "no label" ✓ | `<label htmlFor>` ✓ | PASS |
| F | fixed 1200px, 0 @media | `responsive-fw0`(1200) + `responsive-fw1`(880) | ✓ | styles.css:57 / :65 | width:1200px ✓ | `max-width+100%` ✓ | PASS* |
| G | body 11px, price 11px, fine-print 12px | `typography-t5`(body 11) + `t0`(price 11) + `t6`(fine 12) + 4 more | ✓ | styles.css:71, Card.scss:15, styles.css:77 | **11px** ✓ (not 12) | `16px/1.5` ✓ | PASS |
| H | off-scale 7/13/19px | `layout-s0..s8` (9 findings) | ✓ | Card.scss + styles.css lines | 7,13,19,6 ✓ | snap to 8/12/20 ✓ | PASS |
| I-colors | 43 colors, no system | 8 color findings (`color-nd0..7`) + `accessibility-c0` (18 swatch) ; JSON `colors.total=43` | ✓ | swatch lines | ΔE values ✓ | consolidate tokens ✓ | PASS |
| I-fonts | 5 families | `typography-ff0` | ✓ | fonts.css:5 | "5 families: Playfair…Comic Sans" ✓ | 1–2 + vars ✓ | PASS |
| J | no :focus-visible (despite cmt text) | `accessibility-f0` | ✓ | styles.css:22 `.cta-primary` | "0 focus rules" ✓ | `:focus-visible{outline}` ✓ | PASS |

**My independent score: 12 / 12.** The headline RED→GREEN claim holds.
\* F is detected via fixed widths; the `evidence.measured` text says "3 @media" which is **wrong** — the
fixture has **zero** real `@media`; the 3 are inside CSS comments (styles.css:55, :67; Card.scss:18).
Cosmetic in the measured string only; the finding itself is correct.

---

## Claim 3 — false positives (the must-fix). REFUTED.

Ran on: `~/.recap/2026-04-25-ai-models`, `integra-status-vercel`, `chain-recovery-report`,
`integra-brand-clone`, `hermes-personal-brand`, `ox/site`, `nitya-capital/roadmap-v1`,
`plugin-visibility-brief`.

**Guaranteed false positives (fg === bg, mathematically impossible real finding): 13**
- recap `upgrade.css:185` `.strength-cite,.src` → "Text `#00e0ff` on `#00e0ff` = 1:1" (critical)
- hermes `dashboard/.../globals.css:27` `body` → "`#000000` on `#000000` = 1:1" (critical)
- hermes `website/.../styles.module.css:207` `.srcPillActive` → "`#ffd700` on `#ffd700` = 1:1"
- + 10 more in hermes (`.filterChip`, `.catButton`, `.platformPill`, …) plus many `1.37:1`
  alpha-strip FPs (`.btn-primary`, `.install-tab.active`).

### Root cause #1 (dominant) — alpha channel stripped from `rgba()` backgrounds
`lib/static-contrast.js:41-46` `rgbFuncToHex` reads only `m[1..3]` (r,g,b) and discards alpha; a
faint tint such as `background: rgba(0,224,255,0.08)` (8% cyan over a dark page) is treated as a
**solid `#00e0ff`** fill. `solidBackgroundHex("rgba(0,224,255,0.08)") => "#00e0ff"`.

Minimal repro (public API):
```
analyzeTextContrast([
  {selector:"body",  prop:"background", value:"#150830"},
  {selector:".pill", prop:"color",      value:"#00e0ff"},
  {selector:".pill", prop:"background", value:"rgba(0,224,255,0.08)"},
])
→ [{ severity:"critical", fg:"#00e0ff", bg:"#00e0ff", ratio:1, suggestion:"#00606e" }]
```
The suggested fix `#00606e` would make perfectly-readable light-cyan text **unreadable** on the dark page.

### Root cause #2 — `var(--fg)`/`var(--bg)` collapses to same hex, and rgba fallbacks
- hermes `body { color: var(--foreground); background: var(--background) }` with `--background`
  redeclared (`:root #ffffff`, then `@media dark #0a0a0a`) → resolves both sides to `#000000`,
  emitting `#000000 on #000000`. Body text is never invisible-on-itself in a shipped page; this is
  a structural false positive from var-map "last-wins" (`buildVarMap`, static-contrast.js:49-54)
  colliding with media-query overrides.
- `.srcPillActive { color: var(--pill-color,#ffd700); background: var(--pill-bg, rgba(255,215,0,0.06)) }`
  → fallback rgba stripped to `#ffd700` → 1:1.

### Why tests didn't catch it
`test/static-contrast.test.js` has **zero** `rgba()`-with-alpha cases and **zero** var-collision
cases (grep: only `#hex` pairs). 297/297 tests pass but never exercise the real-world input that
breaks. The dark-theme guard (`resolvePageBackground` → null) only handles *page* bg, not per-rule
rgba tints.

**Counter-evidence the engine is otherwise sound:** nitya-capital findings (`.kpi-sub` `#9ca3af`
on `#f8f9fb` = 2.41:1) are **correct** — var resolution and pairing work when alpha is absent.

---

## Claim 2 — spot-checks (≥5)

Recomputed with the tool's own `lib/color-engine`:

| pair | recomputed | tool/ground-truth | match |
|------|-----------:|-------------------|:--:|
| A `#fbfbfb`/`#ffffff` | 1.03 | 1.03 | ✓ |
| B `#9aa0a6`/`#ffffff` | 2.64 | 2.64 | ✓ |
| C surface `#f4f5f6`/`#ffffff` | 1.09 | 1.09 | ✓ |
| C text `#c9ccd1`/`#f4f5f6` | 1.48 | 1.48 | ✓ |
| `after #767676`/`#ffffff` | **4.54** (≥4.5) | A fix | ✓ |
| `after #73777c`/`#ffffff` | **4.51** (≥4.5) | B fix | ✓ |
| `after #757679`/`#f4f5f6` | **4.16 (<4.5)** | c1 fix on *true* surface | ✗ (see #2 correction) |

- **11px not 12px:** `typography-t5` `.body-copy` measured `11px` @ styles.css:71 — correct.
- **focus despite comment:** `accessibility-f0` fires even though `focus-visible` appears literally
  in styles.css:131 and SignupForm comments — the focus detector is comment-mask-aware
  (located-audit.js:240-253). Correct.
- **img/input over-detection:** the `<img>`/`<input>` detectors (located-audit.js:361,376) run over
  raw content with **no** comment masking, so the literal `<img>`/`<input>` in the JSDoc header
  (SignupForm.jsx:5-6) produce `img0`/`inp3` spurious findings.

---

## GO / NO-GO

**NO-GO for release** (as a tool whose marquee feature is contrast auditing on real projects).

The RED→GREEN demo (claim 1), correctness on the fixture (claim 2), law citations (4), read-only
audit (5), and XSS-safety (6) all hold. But claim 3 — explicitly flagged as the highest-risk area —
is **refuted with a critical, reproducible defect**: the contrast engine emits garbage critical
false positives (13 mathematically-impossible `fg===bg` findings, plus more) on ordinary
real-world CSS that uses `rgba()` tints or `var()` themes — the single most common pattern in modern
dark-mode/Tailwind/Next.js styling. The bad fixes would actively harm real designs. Shipping this
would make the tool's flagship feature untrustworthy on the first real project a user points it at.

### Must-fix (file:line)
1. **`lib/static-contrast.js:41-46` (`rgbFuncToHex`) — alpha ignored.** When `rgba()` alpha < ~0.95,
   either (a) composite the tint over the resolved page/parent background before measuring, or
   (b) treat the rule's background as indeterminate and **skip** (like the dark-theme guard), rather
   than treating a faint tint as an opaque fill. Add tests for `rgba(...,0.08)` over dark + light.
2. **`lib/static-contrast.js:197-204` + `buildVarMap` (49-54) — fg===bg must never emit.** Guard:
   if resolved `fg === bg`, skip (it is definitionally an unresolved/aliased pairing, not a real
   contrast failure). Also reconsider "last-wins" var resolution when a var is redeclared inside a
   media query (hermes `--background`).
3. **`lib/located-audit.js:361,376` — comment-mask the `<img>`/`<input>` detectors** the same way the
   focus detector (line 240) already is, to drop the JSDoc-comment false positives (img0@5, inp3@6).
4. **(minor) `lib/located-audit.js` responsive `measured`** — the "N @media" count includes `@media`
   inside comments (planted fixture reports "3 @media" with zero real ones); strip comments before
   counting. Cosmetic; the finding itself is correct.
5. **(minor) accuracy of c1 surface** — resolve SCSS `$var`/same-rule literal backgrounds so
   `.product-card` is measured/fixed against `#f4f5f6`, not the page `#ffffff` (current `after`
   reaches only 4.16:1 on the true surface).

Add regression fixtures for items 1–3 to the test suite before re-review.
