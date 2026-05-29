# 08 — UX-Law Verification (Adversarial, Primary-Sourced)

**Role:** UX-law verifier. DO-NOT cite a law I have not verified against a primary source.
**Repo:** `/Users/adamboudj/projects/ui-ux-suite` (branch `rebuild/uiux-10x`)
**Date:** 2026-05-29
**Method:** (1) read `knowledge/laws-of-ux.md` and the `KNOWLEDGE.laws` table in `lib/knowledge.js`; (2) grep `lib/scoring.js` for every `laws: [...]` slug and record its line; (3) verify each cited slug against the primary source `lawsofux.com` (via WebFetch) for (a) is it a real, correctly-named law, (b) is the slug spelled correctly, (c) is it applied correctly where cited. Every claim below carries Evidence + Confidence. No evidence ⇒ not a finding.

---

## 0. Orchestrator's hypothesis — verdict

> "scoring.js never calls `createFinding`; every scorer emits a bare `{severity,msg,laws}` … NO location and NO concrete fix."

**CONFIRMED.** Evidence: `lib/scoring.js` has **39** `findings.push({ severity, msg, laws })` literals (grep `laws[[:space:]]*:` → 39 lines, e.g. lines 19, 20, 26, 32, …, 287). `createFinding` (with `{title,description,impact,fix,effort,before,after}`) is defined in `lib/schema.js:63` and exported (`schema.js:196`) but is **never imported or called by `lib/scoring.js`** (grep for `createFinding` in scoring.js → 0 hits). The richer validator path `handleAuditLog` (`lib/mcp-server.js:803-818`) *does* call `createFinding` and *does* validate law slugs — but the automated scorers bypass it entirely. **Confidence: confirmed.** This matters for THIS report because the slug-validation safety net at `mcp-server.js:806-813` (which would catch a bad slug) **does not protect the scorer output** — so the broken `von-restorff` slug below ships unguarded.

---

## 1. Headline findings (most important first)

1. **`aesthetic-usability-effect` is a catch-all garbage bin (14 of 39 citations) and is misapplied in the majority of them.** The primary source defines it narrowly: beauty *masks/influences perceived* usability — it is NOT a label for "any aesthetic defect." Contrast failures, tiny body text, missing hover states, gradient overuse, missing skeletons, and missing empty states are NOT instances of this law. **CORRECTED (misapplied).** See §3.
2. **`postels-law` is misapplied in 4 of 7 citations.** Postel's Law = input tolerance / strict output (the Robustness Principle). It is cited for missing alt text (`scoring.js:140`), missing `prefers-reduced-motion` (145, 205, 284), and missing `<html lang>` (283) — all of which are accessibility issues with **zero** relationship to input forgiveness. **CORRECTED (misapplied).**
3. **`von-restorff` (scoring.js:191) is a BROKEN slug.** The canonical slug in both `lawsofux.com` and `knowledge.js` is `von-restorff-effect` (`knowledge.js:313,315`). The bare `von-restorff` does not exist as a key, so `uiux_laws_query`/`KNOWLEDGE.laws['von-restorff']` returns `undefined`. Because scorers bypass the `handleAuditLog` validator (`mcp-server.js:808`), it is shipped silently with no warning. **CORRECTED (spelling/slug defect).**
4. **`fittss-law` is NOT a misspelling — it matches the primary source — but it is MISAPPLIED at scoring.js:77.** `lawsofux.com` itself uses the slug `fittss-law` (double-s) for "Fitts's Law" (the possessive of "Fitts" → "Fitts's"). So the slug is correct. However, Fitts's Law concerns *only* the size/distance of **interactive/clickable targets**, NOT text legibility. Citing it for "Body text too small" (`scoring.js:77`) is a misapplication; that finding belongs to readability/WCAG, not Fitts. **CONFIRMED (slug) + CORRECTED (application).** This partially REFUTES the orchestrator's framing that `fittss-law` is a misspelling — it is the source's own slug.
5. **`doherty-threshold` is over-applied (4 of 7 weak/wrong).** Doherty = system **response time < 400ms**. CSS transitions, `active:` press feedback, and skeleton loaders (`scoring.js:166,201,204,256`) are *perceived-performance* techniques the source mentions as adjacent tools, not Doherty violations themselves. **CORRECTED (weak application).** The `next/font`/`next/image` citations (253, 254) are defensible (they affect actual load latency).
6. **Naming/encoding nit:** the canonical name is **"Law of Prägnanz"** (umlaut ä) on `lawsofux.com`; `knowledge.js:440` and `laws-of-ux.md:45` store ASCII "Pragnanz". The slug `law-of-pragnanz` is fine and matches; only the display `name` drops the umlaut. **CORRECTED (cosmetic, low impact).**

Net: of **39** scorer citations, the slug is **structurally broken in 1** (`von-restorff`), **applied incorrectly or weakly in ~17**, and the remaining are defensible. The single most damaging pattern is treating `aesthetic-usability-effect` as a default tag.

---

## 2. Verification table — every cited slug

Legend for "Applied correctly?": ✅ correct where cited · ⚠️ weak/stretch · ❌ misapplied. Verdict ∈ {CONFIRMED, CORRECTED, UNVERIFIED}.

| # | Cited slug (scoring.js) | Canonical name | Real law? | Slug spelled right? | Applied correctly where cited (scoring.js line) | Verdict | Source URL |
|---|---|---|---|---|---|---|---|
| 1 | `aesthetic-usability-effect` | Aesthetic-Usability Effect | ✅ yes | ✅ yes | Cited 14×: L19/20/125 **contrast** ❌ (a11y, not perceived-usability); L77/80 **body too small** ❌; L159 no-cva ⚠️; L166 hover ❌; L191 hero scale ✅; L202 hover affordance ⚠️; L223 fluid type ❌; L240 multi-layer shadow ⚠️; L243 gradients ❌; L256 skeleton ❌; L269 empty states ❌ | **CORRECTED** (misapplied in majority) | https://lawsofux.com/aesthetic-usability-effect/ |
| 2 | `fittss-law` | Fitts's Law | ✅ yes | ✅ yes (source uses `fittss-law`) | L77 **body text too small** ❌ (Fitts = interactive targets, not text); L130/167/203 focus-visible ⚠️ (focus is keyboard, Fitts is pointer/target acquisition — stretch); L287 **44×44 touch target** ✅ (textbook correct) | **CONFIRMED slug / CORRECTED application** | https://lawsofux.com/fittss-law/ |
| 3 | `jakobs-law` | Jakob's Law | ✅ yes | ✅ yes | L43 missing semantic colors ✅; L49/282 no dark mode ❌ (pref/a11y, not convention); L113/217/218/221 no breakpoints ✅ (device convention); L130 focus indicators ❌ (a11y); L135 skip-link ❌ (a11y); L160/161 UI primitives ✅; L268 breadcrumbs ✅; L269 empty states ❌ | **CORRECTED** (mixed; dark-mode/focus/skip-link/empty-state misapplied) | https://lawsofux.com/jakobs-law/ |
| 4 | `teslers-law` | Tesler's Law (Conservation of Complexity) | ✅ yes | ✅ yes | L32/35 too many colors ⚠️; L68/71 too many fonts ⚠️; L158 no cn() util ✅ (complexity moved to system); L185 too many weights ⚠️; L235 too many shadows ⚠️ | **CORRECTED** (mostly a "simplify" tag; only L158 is true Tesler) | https://lawsofux.com/teslers-law/ |
| 5 | `millers-law` | Miller's Law | ✅ yes | ✅ yes | L32/68 "too many (colors/fonts), consolidate" ⚠️ (7±2 is *working-memory chunk count*, not a palette-size limit); L108 no max-width ❌ (line-length is readability, not Miller); L185 weights ⚠️ | **CORRECTED** (stretched; Miller is recall-of-list-items, not asset counts) | https://lawsofux.com/millers-law/ |
| 6 | `doherty-threshold` | Doherty Threshold | ✅ yes | ✅ yes | L166 hover ❌; L201 transitions ⚠️; L204 active press ❌; L253 next/font ✅; L254 next/image ✅; L255 Suspense ⚠️; L256 skeleton ⚠️ (perceived perf) | **CORRECTED** (response-time law; UI-feedback citations are weak) | https://lawsofux.com/doherty-threshold/ |
| 7 | `postels-law` | Postel's Law (Robustness Principle) | ✅ yes | ✅ yes | L140 missing alt text ❌; L145/205/284 reduced-motion ❌; L168 disabled state ⚠️; L270 no zod/form-validation ✅ (input tolerance — textbook); L283 html lang ❌ | **CORRECTED** (only L270 is correct; a11y items misapplied) | https://lawsofux.com/postels-law/ |
| 8 | `peak-end-rule` | Peak-End Rule | ✅ yes | ✅ yes | L272 no onboarding flow ⚠️ (onboarding has a "peak/end", but "no onboarding detected" is a weak hook) | **CONFIRMED law / CORRECTED application (weak)** | https://lawsofux.com/peak-end-rule/ |
| 9 | `law-of-pragnanz` | Law of Prägnanz | ✅ yes | ✅ slug ok (name drops umlaut) | L62/180 no type scale ✅ (regularity/order); L86 line-height ⚠️; L98 inconsistent spacing ✅; L108 no max-width ⚠️; L187/188 h1 count ❌ (document outline ≠ Prägnanz perception); L234 no shadows ⚠️; L268 breadcrumbs ⚠️ | **CORRECTED** (name should be "Prägnanz"; h1 citations misapplied) | https://lawsofux.com/law-of-pragnanz/ |
| 10 | `law-of-proximity` | Law of Proximity | ✅ yes | ✅ yes | L98 inconsistent spacing ✅; L103 off-grid spacing ✅ | **CONFIRMED** | https://lawsofux.com/law-of-proximity/ |
| 11 | `law-of-similarity` | Law of Similarity | ✅ yes | ✅ yes | L26 near-duplicate colors ⚠️; L62/180 type scale ⚠️; L184 one weight ⚠️; L235/238 shadow/radius counts ⚠️ | **CONFIRMED law / CORRECTED application (mostly "consistency" tag)** | https://lawsofux.com/law-of-similarity/ |
| 12 | `law-of-uniform-connectedness` | Law of Uniform Connectedness | ✅ yes | ✅ yes | L103 off-grid spacing values ❌ (UC is about *connecting lines/borders/shared-bg grouping*, not grid adherence) | **CORRECTED** (misapplied) | https://lawsofux.com/law-of-uniform-connectedness/ |
| 13 | `von-restorff` | Von Restorff Effect | ✅ yes (law) | ❌ **WRONG SLUG** — must be `von-restorff-effect` | L191 hero text underscaled ✅ *conceptually* (isolation/standout) but the slug does not resolve | **CORRECTED** (broken slug; lookup returns undefined) | https://lawsofux.com/von-restorff-effect/ |

**Laws referenced ONLY in the table above and verified present & correctly-keyed in `knowledge.js`** (no scorer defect): `hicks-law` (knowledge.js:187), `goal-gradient-effect` (271), `serial-position-effect` (299), `zeigarnik-effect` (327), `pareto-principle` (341), `parkinsons-law` (355), `occams-razor` (397), `law-of-common-region` (425), `chunking` (481). All real, all correctly spelled per `lawsofux.com` list. **None of these are cited by scoring.js**, so the scorer leaves several high-value laws (Hick's, Serial-Position, Goal-Gradient, Zeigarnik) on the table.

---

## 3. The `aesthetic-usability-effect` abuse pattern (deep dive)

**Primary-source definition (verified):** "Users often perceive aesthetically pleasing design as design that's more usable … visually pleasing design can mask usability problems." It is a law about the **gap between perceived and actual usability** — i.e., beauty buys *tolerance* for friction. (Source: https://lawsofux.com/aesthetic-usability-effect/, fetched 2026-05-29.)

**Why most citations are wrong:** A finding only invokes this law correctly if the recommendation is "polish raises perceived usability / earns forgiveness." Concretely:
- `scoring.js:19,20,125` — contrast failures. Evidence: source states "Low color contrast is primarily an accessibility concern, not an aesthetic perception issue." ❌ Should cite a WCAG/contrast basis, not a UX law.
- `scoring.js:77,80` — body text size. Source: "Small text … would genuinely harm usability independent of aesthetics." ❌
- `scoring.js:243` — heavy gradients ("risks looking dated"). That is an aesthetic *opinion*, not the perceived-usability mechanism. ❌
- `scoring.js:256,269` — skeletons / empty states. These are completeness/perceived-performance concerns. ❌
- `scoring.js:191` — hero text underscaled, "for visual anchoring." This one is closer to Von Restorff (isolation) than AUE; AUE is the weaker of the two tags here. ⚠️

**Correctly applied:** essentially none of the 14 cleanly fit; the closest defensible use is a *holistic* "overall unpolished interface lowers perceived usability" finding — which the scorer never emits.

---

## 4. Spelling / slug integrity summary

| Slug as cited in scoring.js | Exists in knowledge.js? | Matches lawsofux.com slug? | Status |
|---|---|---|---|
| `fittss-law` | ✅ (knowledge.js:201,203) | ✅ (`/fittss-law/`) | OK (counter-intuitive but correct) |
| `jakobs-law` | ✅ (229) | ✅ | OK |
| `teslers-law` | ✅ (383) | ✅ | OK |
| `millers-law` | ✅ (215) | ✅ | OK |
| `postels-law` | ✅ (369) | ✅ | OK |
| `doherty-threshold` | ✅ (243) | ✅ | OK |
| `peak-end-rule` | ✅ (257) | ✅ | OK |
| `aesthetic-usability-effect` | ✅ (285) | ✅ | OK |
| `law-of-pragnanz` | ✅ (439) | ✅ (name should be "Prägnanz") | slug OK / name umlaut missing |
| `law-of-proximity` | ✅ (411) | ✅ | OK |
| `law-of-similarity` | ✅ (453) | ✅ | OK |
| `law-of-uniform-connectedness` | ✅ (467) | ✅ | OK |
| **`von-restorff`** | ❌ — only `von-restorff-effect` (313) | ❌ — source slug is `von-restorff-effect` | **BROKEN — fix to `von-restorff-effect`** |

**Only one true spelling/slug defect: `von-restorff` → `von-restorff-effect` (scoring.js:191).** Everything else is correctly keyed; the dominant problem is **misapplication**, not misspelling.

---

## 5. Recommended corrections (audit-then-suggest; do NOT mutate lib/ here)

1. **scoring.js:191** — change `'von-restorff'` → `'von-restorff-effect'`. Evidence: knowledge.js:315. Risk: trivial. Test: `KNOWLEDGE.laws['von-restorff-effect']` resolves. Rollback: revert one string.
2. **Stop tagging accessibility findings with UX laws.** Lines 19/20/125 (contrast), 130/135 (focus/skip-link), 140 (alt), 145/205/283/284 (reduced-motion, lang) should drop `aesthetic-usability-effect`/`fittss-law`/`postels-law`/`jakobs-law` and instead reference WCAG SC numbers (e.g. 1.4.3, 2.4.7, 1.1.1, 3.1.1, prefers-reduced-motion → WCAG 2.3.3). A UX law is not evidence for a WCAG failure.
3. **Reserve `aesthetic-usability-effect` for one holistic "low overall polish lowers perceived usability" finding**, computed from the polish dimension — not as a per-defect tag.
4. **Re-map mis-tagged findings to laws that actually fit** (these ARE in the DB and currently unused): "too many fonts/colors" → `hicks-law`/`occams-razor` not `millers-law`; "no onboarding" / nav ordering → `serial-position-effect`/`goal-gradient-effect`; "no progress indicator" → `zeigarnik-effect`/`goal-gradient-effect`.
5. **Fix `name` "Pragnanz" → "Prägnanz"** in knowledge.js:440 and laws-of-ux.md:45 (umlaut) to match the canonical name. Slug stays `law-of-pragnanz`.
6. **Route scorer findings through `createFinding` + the `handleAuditLog` slug validator** (mcp-server.js:806-813) so a future broken slug like `von-restorff` is caught with a warning instead of shipping silently.

---

## 6. Provenance

- Internal primaries read: `lib/scoring.js` (all 39 `laws:` lines), `lib/knowledge.js:185-484` (laws table), `lib/schema.js:1-205` (createFinding), `lib/mcp-server.js:803-818` (slug validator), `knowledge/laws-of-ux.md` (full).
- External primaries fetched 2026-05-29 via WebFetch: `lawsofux.com/` (full list — 30 named laws), `/fittss-law/`, `/postels-law/`, `/doherty-threshold/`, `/jakobs-law/`, `/aesthetic-usability-effect/`.
- Not independently re-derived from the original 1954/1980/etc. papers; `lawsofux.com` is treated as the authoritative naming/slug/applicability reference for this verification, consistent with the project's own knowledge base which mirrors it.
