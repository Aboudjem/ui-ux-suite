# 06 — Online Research Scout (Phase 5)

**Role:** Fresh web research (2024–2026 primary sources) to ground the `ui-ux-suite` 10x rebuild.
**Repo:** `/Users/adamboudj/projects/ui-ux-suite` (branch `rebuild/uiux-10x`)
**Date:** 2026-05-29
**Method:** Every claim below is tied to a primary/authoritative URL (see Sources). Where a recommendation touches repo code, the exact `lib/<file>:<line>` is cited so the rebuild can act on it. Confidence is noted per claim.

> **Repo-grounding note (why this research matters):** I confirmed the orchestrator's hypothesis against live code before researching. `lib/scoring.js` pushes **bare** finding objects — e.g. `lib/scoring.js:19` emits `{ severity: 'critical', msg: '${critical.length} critical contrast failures (< 3:1)', laws: [...] }` — and **never** calls `createFinding()`. `lib/schema.js:63` defines a rich `createFinding({ title, description, impact, fix, effort, before, after, laws })` that is unused by scorers. `lib/browser.js` captures element-level evidence (`firstNodeTarget` at `:160`, `firstNodeHtml` at `:161`, per-element touch-target sizes at `:121–141`, screenshots at `:143–151`) but a grep of `lib/scoring.js` for `firstNodeTarget|firstNodeHtml|touchTargets|screenshot` returns **zero** matches — the deep-mode data is siloed. `takeScreenshot` (`lib/browser.js:149`) uses `fullPage:true` with **no element clip and no annotation**. This research targets exactly those gaps.

---

## 1. Nielsen's 10 Usability Heuristics (canonical, exact list)

Source of truth: Nielsen Norman Group, *"10 Usability Heuristics for User Interface Design"*, **last updated January 30, 2024** (introduced 1994; the 10 themselves unchanged). Confidence: **confirmed**.

| # | Canonical name | One-line definition |
|---|----------------|---------------------|
| 1 | **Visibility of System Status** | Keep users informed about what is going on through timely, appropriate feedback. |
| 2 | **Match Between the System and the Real World** | Speak the users' language; follow real-world conventions, not internal jargon. |
| 3 | **User Control and Freedom** | Provide clearly marked "emergency exits" — undo/redo — for mistaken actions. |
| 4 | **Consistency and Standards** | Same words/actions mean the same thing; follow platform conventions. |
| 5 | **Error Prevention** | Design to prevent problems before they occur (confirmations, constraints). |
| 6 | **Recognition Rather than Recall** | Make options visible; minimize what the user must remember. |
| 7 | **Flexibility and Efficiency of Use** | Accelerators/shortcuts for experts; let users tailor frequent actions. |
| 8 | **Aesthetic and Minimalist Design** | No irrelevant content; every extra unit competes with the essentials. |
| 9 | **Help Users Recognize, Diagnose, and Recover from Errors** | Plain-language errors that state the problem and suggest a solution. |
| 10 | **Help and Documentation** | Provide searchable, task-focused help when needed. |

**Steal-this:** Use these 10 as a *stable finding taxonomy* alongside Laws of UX. Several scoring.js findings already map cleanly: missing focus indicators → #1 Visibility / #5; no empty states (`lib/scoring.js:269`) → #1 + #10; inconsistent type/spacing → #4 Consistency; "44×44 touch" → #5/#7. Tag each finding with `nielsen: <heuristic#>` so the report can group by heuristic, not just by the 12 internal dimensions.

---

## 2. Laws of UX — canonical names + URL slugs (for `laws` field validation)

Source of truth: **lawsofux.com** (Jon Yablonski; v2.0 expanded set). The site now lists **30+ laws/principles** including newer additions (Cognitive Load, Choice Overload, Chunking, Mental Model, Working Memory, Selective Attention, Paradox of the Active User, Flow, Cognitive Bias). Confidence: **confirmed** for names; slugs **likely** (derived from observed live URLs + naming pattern — validate by fetching each before shipping the KB).

Verified live slugs (fetched directly): `fittss-law`, `hicks-law`, `jakobs-law`, `millers-law`, `postels-law`, `law-of-pr%C3%A4gnanz` (Prägnanz; the ä is percent-encoded in the live URL), `law-of-common-region`.

Canonical name → slug map (the rebuild's KB should store this verbatim):

| Canonical name | Slug | Used in scoring.js today? |
|----------------|------|---------------------------|
| Aesthetic-Usability Effect | `aesthetic-usability-effect` | yes |
| Doherty Threshold | `doherty-threshold` | yes |
| Fitts's Law | `fittss-law` | yes (spelled `fittss-law`) |
| Goal-Gradient Effect | `goal-gradient-effect` | no |
| Hick's Law | `hicks-law` | no |
| Jakob's Law | `jakobs-law` | yes |
| Law of Common Region | `law-of-common-region` | no |
| Law of Proximity | `law-of-proximity` | yes |
| Law of Prägnanz | `law-of-pr%C3%A4gnanz` (display "Law of Prägnanz") | yes (as `law-of-pragnanz`) |
| Law of Similarity | `law-of-similarity` | yes |
| Law of Uniform Connectedness | `law-of-uniform-connectedness` | yes |
| Miller's Law | `millers-law` | yes |
| Occam's Razor | `occams-razor` | no |
| Pareto Principle | `pareto-principle` | no |
| Parkinson's Law | `parkinsons-law` | no |
| Peak-End Rule | `peak-end-rule` | yes |
| Postel's Law | `postels-law` | yes |
| Serial Position Effect | `serial-position-effect` | no |
| Tesler's Law (Law of Conservation of Complexity) | `teslers-law` | yes |
| Von Restorff Effect | `von-restorff-effect` | yes (as `von-restorff`) |
| Zeigarnik Effect | `zeigarnik-effect` | no |

**Two confirmed slug bugs in current code** (so the link-out in `lib/scoring.js:379` / `:357` resolves to a real page):
- scoring.js uses `law-of-pragnanz` but the live slug is `law-of-pr%C3%A4gnanz` (Prägnanz). Confidence: **confirmed** (live URL fetched).
- scoring.js uses `von-restorff` (line 191) but the canonical slug is `von-restorff-effect`. Confidence: **likely** (pattern-consistent; validate by fetch before shipping).

**Steal-this:** Ship a `LAWS_SLUGS` allow-list in the KB and add a unit test that asserts every `laws: [...]` value emitted by scorers exists in that list (catches typos like the two above and the `von-restorff` shortname). Store the canonical display name + the deep-link URL so the report can render `[Fitts's Law](https://lawsofux.com/fittss-law/)`.

---

## 3. WCAG 2.2 — exact thresholds for the automated checks

All from W3C WCAG 2.2 Recommendation (W3C, 05 Oct 2023) + Understanding docs. Confidence: **confirmed**.

### 1.4.3 Contrast (Minimum) — Level AA
- **Normal text:** ≥ **4.5:1**.
- **Large text:** ≥ **3:1**. "Large" = **≥ 18pt (≈24px) normal** OR **≥ 14pt (≈18.5px) bold** (1pt = 1.333px).
- Incidental/disabled text and logotypes are exempt.
- "3:1 means at least 3:1 — 2.99:1 is a fail." (Hard boundary, no rounding up.)

### 1.4.11 Non-text Contrast — Level AA
- UI component states and graphical objects (icons, focus rings, input borders, chart segments) must be ≥ **3:1** against adjacent colors.

### 2.5.8 Target Size (Minimum) — Level AA (new in 2.2)
- Targets ≥ **24×24 CSS px**, **OR** pass the **spacing exception**: a 24px-diameter circle (12px radius) centered on the target must not overlap any other target's circle.
- Note: the older AAA criterion **2.5.5 Target Size (Enhanced)** is **44×44 CSS px** — this is the number `lib/browser.js:129` measures against. **This is a real mismatch to fix:** the code says "WCAG 2.2 Target Size" in its header comment (`lib/browser.js:17`) but enforces the **AAA 44px** number, not the **AA 24px** one.

### 2.4.7 Focus Visible — Level AA (since 2.0)
- Keyboard focus must have a *visible* indicator. (No numeric threshold; "visible" was never normatively defined here — that's what 2.4.13 fixes.)

### 2.4.11 Focus Not Obscured (Minimum) — Level AA (new in 2.2)
- When an element receives focus, it must not be **entirely hidden** by author-created content (e.g. sticky headers, cookie banners). At least partial visibility required.

### 2.4.13 Focus Appearance — Level AAA (new in 2.2)
- Focus indicator area ≥ the area of a **2px-thick perimeter** of the component, **and** ≥ **3:1** contrast between focused and unfocused states (the changed pixels). This is the measurable backbone for "visible focus."

**Steal-this:**
1. Split the contrast check into **1.4.3 (text, 4.5/3)** and **1.4.11 (non-text/UI, 3:1)** — current scoring.js lumps everything as "contrast failures (< 3:1)" / "(< 4.5:1)" (`lib/scoring.js:19–20`) and applies the wrong threshold to UI elements (it should be 3:1 for borders/icons, not 4.5:1).
2. Fix the target-size criterion: report **24×24 (AA / 2.5.8)** with the spacing exception as the default gate, and surface **44×44 (AAA / 2.5.5, iOS HIG)** as an *enhanced* recommendation — don't conflate them as scoring.js/browser.js do today.
3. Add **2.4.11 Focus Not Obscured** (deep mode: focus each interactive element, check it isn't fully covered by a fixed-position element) — almost no automated tool checks this.
4. Implement **2.4.13** measurably: in deep mode, capture focused vs unfocused bounding box + computed outline and compute the 3:1 / 2px-perimeter test.

---

## 4. APCA vs WCAG 2.x contrast — how/why they differ + when each applies

Sources: APCA official docs (Myndex), W3C (WCAG 3 draft incorporates APCA), independent analyses. Confidence: **confirmed** on mechanism; **likely** on exact Lc thresholds (APCA tables are still evolving pre-WCAG-3).

**Mechanism difference:**
- **WCAG 2.x** = a *ratio* of relative luminance ((L1+0.05)/(L2+0.05)). It is **polarity-blind** and is known to **overstate** contrast for dark colors — a 4.5:1 pair near black can be functionally unreadable. It's the **legally required** standard today (ADA/Section 508/EN 301 549 all reference WCAG 2.x).
- **APCA** = *perceptual* model producing a signed **Lc** (Lightness Contrast) value. It is **polarity-aware** (input order matters: text vs background), models font size/weight, and is **uniform** — Lc 60 is the same perceived contrast across the lightness range. It is the candidate algorithm for **WCAG 3** (years away from being a recommendation).

**APCA Lc threshold guide (official "easy intro"):**

| Lc | Use case |
|----|----------|
| **Lc 90** | Preferred for fluent body text (14px/400 floor). |
| **Lc 75** | Minimum for body-text columns (18px/400). |
| **Lc 60** | Other content text (24px/400 or 16px/700). |
| **Lc 45** | Large/headline text (36px/400 or 24px/700), pictograms with detail. |
| **Lc 30** | Placeholder/disabled, large solid icons (minimum "interactive but not great"). |
| **Lc 15** | Absolute floor for any non-text that must be discernible; below = treat as invisible. |
- Positive Lc = dark text on light bg (light mode); **negative** Lc = light text on dark bg (dark mode). AAA tier ≈ "+Lc 15".

**When each applies (the rule the tool should encode):**
- **Default / scoring:** WCAG 2.x (it's what compliance, lawsuits, and `axe-core` use; don't penalize a score on a non-normative algorithm).
- **Advisory / dark-mode + fixing:** show APCA Lc alongside, *especially for dark themes* where WCAG 2.x mis-grades. Use APCA's polarity to explain why a dark-mode pair "passes WCAG but reads poorly."

**Steal-this:** Report **both** numbers per pair: `WCAG 2.x ratio (PASS/FAIL @ AA)` for compliance + `APCA Lc (suggested min Lc for this font size/weight)` for the fix. The repo already has an `apca` path implied in CLAUDE.md ("WCAG 2.1, APCA, OKLCH, deltaE") — wire it into the *finding output*, not just the score.

---

## 5. OKLCH / ΔE for near-duplicate detection + contrast-safe color suggestions

Sources: ColorAide distance docs, color-distance guides, OKLCH/Oklab references. Confidence: **confirmed** on thresholds.

**Near-duplicate thresholds (ΔE2000 / ΔE00):**
- **ΔE00 ≈ 1.0** = just-noticeable difference under lab conditions.
- **ΔE00 ≤ 2.0** = typically imperceptible in real viewing.
- **ΔE00 ≤ 3.0** = good **palette-dedup threshold** — colors below this are "probably redundant."

This **confirms** the repo's existing intent: `lib/schema.js:153` comments `nearDuplicates: [] // colors within deltaE < 3`. The threshold is correct; the gap is that the *finding* (`lib/scoring.js:26`, "N near-duplicate colors - consolidate") names a count but never names **which two hex values** are duplicates or **which to keep**.

**OKLCH for suggestions (why it beats HSL/hex math):**
- OKLCH is **perceptually uniform in lightness** — changing `L` predictably changes perceived brightness, so you can *darken text by a known amount until it crosses 4.5:1* without hue shift. HSL "lightness" is not perceptually uniform and produces muddy/shifted colors.
- ΔE2000 (CIEDE2000) remains the **industry-standard** distance metric for "are these two the same color"; OKLCH distance is an acceptable modern approximation when staying in CSS color spaces.

**Steal-this:**
1. **Near-duplicate finding (specific):** instead of "8 near-duplicate colors," emit `#3B82F6` and `#3C83F7` are ΔE00 = 1.4 (imperceptible) → keep `#3B82F6`, replace 3 usages of `#3C83F7` in `src/styles/buttons.css:42, src/components/Card.tsx:18`. (`before`/`after` fields in `createFinding` were built for exactly this.)
2. **Contrast-fix suggestion (computed):** for each failing text pair, compute the *minimum OKLCH L adjustment* that reaches 4.5:1 (or the APCA Lc target) and emit the corrected hex as the `after` value — a real, paste-able fix, not "increase contrast."

---

## 6. CRO / conversion-audit patterns (with numbers)

Sources: Baymard Institute, CRO audit playbooks. Confidence: **confirmed** for the headline Baymard stats; **likely** for vendor-blog effect sizes (cite as illustrative, not guaranteed).

- **Checkout/form friction is the #1 measurable killer.** Baymard: **17–18% of users abandon** because checkout was "too long/complicated"; average flow = **5.2 steps / 11.8 form fields**; better checkout design alone can yield **~35% conversion lift** on large sites. → Audit signal: **count form fields per form; flag forms > ~7 fields and multi-step flows without a progress indicator.**
- **CTA specificity matters.** Specific action labels ("Create account", "Get yours today") beat generic ("Next", "Submit"); one cited case: "Next" → "Create account" raised completion **+14%**. → Audit signal: **flag generic button text** (`Submit`, `Next`, `Click here`, `Button`) in JSX/HTML.
- **Trust signals near the decision point.** Reviews, security badges, guarantees, press logos placed *adjacent to the CTA/price*. → Audit signal: **detect absence of trust cues near forms/checkout** (no `testimonial`, `review`, `badge`, `guarantee`, `secure` patterns near a `<form>`/CTA).
- **Friction is cumulative:** "a stack of small frictions" — vague headline + slow image + extra field + awkward mobile CTA. This maps perfectly to a *located, summed* findings model.

**Steal-this:** Add a lightweight **CRO dimension** (static-analyzable): generic CTA labels, form field count, missing progress indicator on multi-step forms, no trust signals near conversion points, missing/empty `<meta>` value prop in hero. Each finding is *located* (file:line of the `<button>`/`<form>`) and *measured* (field count, label string).

---

## 7. Copy / UX-writing audit + cognitive-load + trust frameworks

Sources: UX-writing best-practice guides, Smashing Magazine (Jun 2024). Confidence: **confirmed** as established best practice.

**UX-writing checklist (all statically detectable in JSX/HTML strings):**
- **Generic/ambiguous button & link labels** — "Click here", "Submit", "Learn more" (×N identical), "Read more". Replace with outcome-specific verbs.
- **Error messages that don't help** — detect raw/technical strings ("Error", "Invalid input", "Something went wrong") with no recovery guidance → maps to **Nielsen #9**.
- **Double negatives** in microcopy (e.g. "don't not save") — measurably raise cognitive load.
- **Empty states with no guidance** (`lib/scoring.js:269` already flags missing empty-state *components*; extend to flag empty states whose copy is blank/placeholder).
- **Title-case vs sentence-case inconsistency** across buttons (consistency, Nielsen #4).
- **Placeholder used as label** (accessibility + recall failure, Nielsen #6).

**Cognitive-load reduction principles (encode as laws):**
- Fewer words = lower load; put the **most important info first**; avoid double negatives. (Maps to Miller's Law / Cognitive Load / Hick's Law.)

**Trust framework signals to detect:** social proof (reviews/testimonials), authority (press/certifications), security (HTTPS/secure-checkout/privacy copy), risk-reversal (money-back/guarantee/free-trial copy), specificity (real numbers vs vague claims).

**Steal-this:** A **copy linter** pass that greps rendered text nodes / JSX string literals for the patterns above and emits *located* findings ("Button at `src/Hero.tsx:31` reads 'Submit' — rename to the outcome, e.g. 'Start free trial'"). This is the single biggest source of *specific* findings that current scoring.js (which never reads text content) entirely misses.

---

## 8. Screenshot capture + ANNOTATION tooling (the siloed-evidence fix)

Sources: Playwright `Locator`/`ElementHandle`/screenshot docs, Sharp+SVG compositing guides, Playwright CLI `--annotate` (2024). Confidence: **confirmed**.

**Element bounding-box capture (already half-built in the repo):**
- `locator.boundingBox()` → `{ x, y, width, height }` relative to the main-frame viewport. `lib/browser.js:122–137` already reads `getBoundingClientRect()` per element for touch targets — the same data is needed for annotation.
- **Clip to an element:** `page.screenshot({ clip: { x, y, width, height } })`, or directly `locator.screenshot({ path })` to capture just the offending component. This is the upgrade for `lib/browser.js:149` (currently `fullPage: true`, capturing the whole page and clipping nothing).

**Drawing labeled boxes — two viable approaches, ranked for THIS repo:**

1. **PREFERRED (zero new runtime deps): inject overlay DOM before screenshotting.** Before `page.screenshot()`, `page.evaluate()` to absolutely-position a `<div>` outline + a small label chip over each finding's `boundingBox`, screenshot, then remove them. This draws labeled boxes using the browser you already launched — **no Sharp/Canvas dependency**, which matters because CLAUDE.md mandates **zero runtime deps** (Sharp would violate that). It also respects the "never mutate the audited app" rule because the overlay is injected into a *throwaway* page in the audit's own browser context, not the source.
2. **Fallback (post-process): Sharp + SVG composite.** Sharp has no native text; you build an SVG with `<rect>` + `<text>` and `image.composite([{ input: svgBuffer }])`. Powerful but adds a heavy native dependency — keep it out of the default path; only acceptable if it were a deep-mode-only optional peer dep like playwright already is.

**Playwright extras worth knowing:** masking (`mask: [locator]` overlays a pink `#FF00FF` box — useful to redact secrets in audit screenshots), and aria-snapshots can append each element's `[box=x,y,width,height]` for coordinate-driven tooling.

**Steal-this:**
1. Change `takeScreenshot` (`lib/browser.js:143–151`) from a single `fullPage` shot to **per-finding element clips** keyed by the axe `firstNodeTarget` selector (`lib/browser.js:160`) and by each under-sized touch target.
2. Add an **annotation step** (approach #1) that draws a labeled red box over each violating element and writes `docs/audit/screenshots/<route>-<findingId>.png`, then puts that path into the finding's `evidence` so the report can embed it. This is the missing weave between `browser.js` element data and the finding output.

---

## 9. The overlooked, high-signal checks most audit tools MISS

Automated tools catch only **~30–40% of WCAG issues** (W3C/industry consensus); the rest needs judgment or DOM-state probing. These are high-signal, mostly *automatable in deep mode*, and rarely implemented:

1. **Reflow @ 400% zoom / 320px (WCAG 1.4.10):** load at **320 CSS px wide** and detect horizontal scroll / clipped content. Almost no static tool checks this; Playwright makes it trivial (set viewport, check `document.scrollWidth > innerWidth`). Confidence: **confirmed**.
2. **Text-spacing override (WCAG 1.4.12):** inject the WCAG text-spacing CSS (line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em, paragraph 2em) and detect overlap/clipping. Confirmed gap in most tools.
3. **Accessible-name mismatch / "name in label" (WCAG 2.5.3):** an icon button with `aria-label="Search"` but visible text "Go" — *axe passes the alt-exists check but the names disagree*. High false-confidence area.
4. **Focus Not Obscured (2.4.11)** and **Focus Appearance (2.4.13)** — see §3; need focus-then-measure, which static + even basic axe runs skip.
5. **Logical tab order vs DOM/visual order:** tab through, record focus rects, flag when tab order zig-zags against reading order. Keyboard-only experience that automation "can't replicate" — but a scripted tab-walk approximates it.
6. **Color as the only signal:** links distinguished from body text by color alone (no underline/weight) — fails 1.4.1 Use of Color; detectable by comparing link vs paragraph computed styles.
7. **Animation/`prefers-reduced-motion` actually honored at runtime:** scoring.js checks for the *media query's presence* (`lib/scoring.js:205`), but not whether animations actually stop — deep mode can set the emulation and diff.
8. **Hit-target spacing (2.5.8 spacing exception):** the 24px-circle overlap test — measurable from the bounding boxes already collected, but no one computes the overlap.
9. **Real contrast over gradients/images:** static CSS parsing can't see text over a background image; only a rendered screenshot + sampled pixels can. This is where deep mode beats static scanning decisively.

**Steal-this:** Items **1, 2, 6, 8** are cheap wins available *today* from `lib/browser.js`'s existing Playwright page with a few `page.evaluate`s; items **3, 5** are medium effort but produce the kind of "specific + located" findings that justify the 10x claim. Implement at least 1, 2, 3, 6, 8 in deep mode.

---

## STEAL THIS FOR THE REBUILD (condensed, prioritized)

1. **Route every scorer through `createFinding()`** (`lib/schema.js:63`) — the rich schema already exists and is wasted. Every finding must carry `title`, `description`, `impact`, `fix`, `before`, `after`, `effort`, `laws`, plus a new **`evidence: { file, line, selector, measured, screenshot }`** field. (Refutes nothing — *confirms* the orchestrator's hypothesis: scorers emit bare `{severity,msg,laws}` at `lib/scoring.js:19+` and never call the constructor.)
2. **Weave deep-mode data into findings.** Map each axe violation's `firstNodeTarget`/`firstNodeHtml` (`lib/browser.js:160–161`) and each under-min touch target (`:121–141`) into a `createFinding` with selector + measured size + clipped, annotated screenshot. Today this data dies in `summarizeBrowserAudit`.
3. **Annotate screenshots** via injected overlay DOM (zero-dep, approach §8.1) and clip per element (`page.screenshot({clip})` / `locator.screenshot()`), replacing the `fullPage` shot at `lib/browser.js:149`.
4. **Fix the contrast model:** split 1.4.3 (text 4.5/3) from 1.4.11 (non-text 3:1); report **WCAG 2.x ratio (compliance)** + **APCA Lc (advisory, esp. dark mode)**; compute the **OKLCH L-adjusted `after` hex** that reaches threshold.
5. **Fix the target-size mismatch:** gate on **AA 24×24 (2.5.8)** + spacing exception; surface **44×44** as AAA/iOS-enhanced — don't call 44px "WCAG 2.2" (`lib/browser.js:17,129`).
6. **Validate `laws` slugs** against a canonical `LAWS_SLUGS` list (§2) in a unit test; fix `law-of-pragnanz` → `law-of-pr%C3%A4gnanz` and `von-restorff` → `von-restorff-effect`.
7. **Add a copy/UX-writing linter** (§7) and a **CRO dimension** (§6) — both produce *located* findings from text content that the current static engine never reads. Biggest specificity ROI.
8. **Add the overlooked deep-mode checks** (§9): reflow@320px, text-spacing override, color-only links, hit-target spacing overlap, accessible-name mismatch.
9. **Dual taxonomy:** tag findings with both `nielsen:<#>` (§1) and `laws:[slugs]` (§2) so reports group by recognized frameworks, raising credibility.
10. **Zero-dep guardrail:** all of the above stays inside Node built-ins + the *optional* playwright/axe peer deps. Do **not** add Sharp/Canvas to the default install (violates CLAUDE.md zero-dep mandate); annotation uses the already-launched browser.

---

## Sources

**Heuristics & Laws**
- [Nielsen Norman Group — 10 Usability Heuristics (updated Jan 30, 2024)](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Laws of UX — home/index (Jon Yablonski)](https://lawsofux.com/)
- [Laws of UX — Fitts's Law](https://lawsofux.com/fittss-law/) · [Hick's Law](https://lawsofux.com/hicks-law/) · [Jakob's Law](https://lawsofux.com/jakobs-law/) · [Miller's Law](https://lawsofux.com/millers-law/) · [Postel's Law](https://lawsofux.com/postels-law/) · [Law of Prägnanz](https://lawsofux.com/law-of-pr%C3%A4gnanz/) · [Law of Common Region](https://lawsofux.com/law-of-common-region/)
- [Laws of UX v2.0 announcement (Jon Yablonski)](https://jonyablonski.com/articles/2021/laws-of-ux-v2.0/)

**WCAG 2.2**
- [WCAG 2.2 Recommendation (W3C)](https://www.w3.org/TR/WCAG22/)
- [Understanding 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [axe / Deque — color-contrast rule thresholds](https://dequeuniversity.com/rules/axe/4.8/color-contrast)
- [Understanding 2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)
- [What's New in WCAG 2.2 (W3C WAI)](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [New Success Criteria in WCAG 2.2 (Vispero)](https://vispero.com/resources/new-success-criteria-in-wcag22/)
- [TestParty — WCAG 2.4.11 Focus Appearance / 2.4.13](https://testparty.ai/blog/wcag-focus-appearance-minimum)
- [WebAIM — Contrast and Color Accessibility](https://webaim.org/articles/contrast/)

**APCA vs WCAG / Color science**
- [APCA — Easy Intro (Lc thresholds, polarity)](https://git.apcacontrast.com/documentation/APCAeasyIntro.html)
- [APCA — README / documentation](https://git.apcacontrast.com/documentation/README.html)
- [Myndex/SAPC-APCA — WCAG 2 vs APCA comparison (discussion #30)](https://github.com/Myndex/SAPC-APCA/discussions/30)
- [weable — WCAG 2.x vs APCA comparison](https://weable.pro/products/weable-color/blog/wcag-vs-apca-comparison)
- [ColorAide — Color Distance and Delta E (ΔE00 thresholds)](https://facelessuser.github.io/coloraide/distance/)
- [Color distance / ΔE guide (Jarhalab)](https://colors.jarhalab.com/guides/how-to-calculate-color-distance)

**CRO / UX writing / cognitive load**
- [Baymard Institute — What Is a Conversion Audit?](https://baymard.com/learn/conversion-audit)
- [Plerdy — CRO website audit: 12 steps](https://www.plerdy.com/blog/how-to-conduct-a-cro-audit-of-a-website/)
- [Smashing Magazine — Improve Your Microcopy (Jun 2024)](https://www.smashingmagazine.com/2024/06/how-improve-microcopy-ux-writing-tips-non-ux-writers/)
- [Parallel HQ — UX writing best practices](https://www.parallelhq.com/blog/ux-writing-best-practices)

**Screenshot + annotation tooling**
- [Playwright — Locator (boundingBox, screenshot)](https://playwright.dev/docs/api/class-locator)
- [Playwright — ElementHandle](https://playwright.dev/docs/api/class-elementhandle)
- [Scrnify — Screenshot specific elements with Playwright](https://scrnify.com/blog/playwright-screenshot-element-guide)
- [DigitalOcean — Process images in Node.js with Sharp (SVG composite)](https://www.digitalocean.com/community/tutorials/how-to-process-images-in-node-js-with-sharp)
- [microsoft/playwright-cli v0.1.9 release (--annotate)](https://github.com/microsoft/playwright-cli/releases/tag/v0.1.9)

**Limits of automated tools / overlooked checks**
- [Inclusive Web — What automated accessibility tools can't catch](https://www.inclusiveweb.co/accessibility-resources/the-hidden-gaps-what-automated-accessibility-testing-tools-cant-catch)
- [Make Things Accessible — Semi-automated accessibility testing tools](https://www.makethingsaccessible.com/guides/semi-automated-accessibility-testing-tools/)
- [W3C WAI — Web Accessibility Evaluation Tools List](https://www.w3.org/WAI/test-evaluate/tools/list/)
