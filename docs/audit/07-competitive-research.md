# 07 — Competitive & Tooling Research (Phase 6)

**Scope:** Fresh web research (May 2026) profiling the UI/UX / accessibility / CRO audit-tool landscape, plus a primary-source read of `ui-ux-suite` itself to validate where it can actually win. Every load-bearing claim below carries **Evidence** (file:line / fetched source URL / measured value) and **Confidence** (confirmed | likely | uncertain). Web findings are FRESH (searched 2026-05-29); the source-code findings are read from live code on branch `rebuild/uiux-10x`.

> **Author role:** Competitive/tooling scout. I do not modify `lib/`. This is a research artifact under `docs/audit/`.

---

## 0. Orchestrator's hypothesis — CONFIRMED with file:line evidence

> Hypothesis: "`lib/schema.js` defines a rich `createFinding({title,description,impact,fix,effort,before,after,laws})` but `lib/scoring.js` never calls it — every scorer emits a bare `{severity,msg,laws}` with a count-based generic string and NO location and NO concrete fix. `lib/browser.js` captures element-level data … but it's siloed, never woven into findings, and screenshots are never annotated."

**Verdict: CONFIRMED (confirmed).** This is the structural root cause of generic findings, and it is *also* the single biggest competitive liability — every serious rival (axe-core, UX-Ray, Stylelint) ships located + specific output, while ui-ux-suite currently does not.

- **`createFinding` exists and is rich.** `lib/schema.js:63` — `function createFinding({ dimension, severity, title, description, impact, fix, effort, before, after, laws })`. It even supports `before`/`after` code (`schema.js:73-74`). *Evidence: lib/schema.js:63-77. Confidence: confirmed.*
- **No scorer calls it.** `grep -rn "createFinding" lib/` returns exactly two hits: the definition (`schema.js:63`) and a single passthrough in the MCP server (`mcp-server.js:804` — `const finding = createFinding(params)`, just re-exposing the schema as an MCP tool). `lib/scoring.js` never imports or calls `createFinding`. *Evidence: grep over lib/ — only schema.js:63, schema.js:196 (export), mcp-server.js:9 (import), mcp-server.js:804 (call). Confidence: confirmed.*
- **Every scorer emits bare, count-based, location-less strings.** Examples read directly from `lib/scoring.js`:
  - `scoring.js:19` — `findings.push({ severity: 'critical', msg: `${critical.length} critical contrast failures (< 3:1)`, laws: ['aesthetic-usability-effect'] })`
  - `scoring.js:32` — `…msg: `${colorData.uniqueCount} unique colors - too many, consolidate to a system`…`
  - `scoring.js:77` — `…msg: `Body text too small (${typeData.bodySize}px) - minimum 14px, prefer 16px`…`
  - `scoring.js:125` — `…msg: `${a11yData.contrastFailures} contrast ratio failures`…`

  None carry a `file`, `line`, `selector`, the offending value+its location, or a concrete patch. The strings are *aggregate counts* ("5 failures", "23 unique colors") — they tell you a number, not *which* element/file:line is wrong or *what exact value* to change it to. *Evidence: lib/scoring.js:19,20,26,32,35,43,49,62,68,71,77,80,86,98,103,108,113,125,130,135,140,145,158-170,180-185. Confidence: confirmed.*
- **`browser.js` captures element-level data but it is siloed.** `lib/browser.js:160-161` captures `firstNodeTarget: v.nodes[0]?.target?.join(' > ')` (a CSS selector) and `firstNodeHtml: v.nodes[0]?.html?.slice(0, 200)`. `browser.js:121-141` measures per-element touch targets `< 44x44` with `tag/w/h/text`. `browser.js:143-151` takes screenshots — but `page.screenshot({ … fullPage: true })` is a **plain** capture with **no annotation/bounding boxes**, and the global instruction in CLAUDE.md explicitly warns `fullPage: true` causes oversized-image API failures. This deep-mode payload is returned as a separate `runBrowserAudit` result and is **never merged into the `createFinding` path or the scorecard**. *Evidence: lib/browser.js:88-99 (perRoute payload), 121-141 (touch), 143-151 (screenshot, fullPage:true), 153-163 (summarizeViolation). Confidence: confirmed.*

**Competitive implication (the through-line of this whole doc):** ui-ux-suite already *collects* the raw materials its competitors are famous for (selectors, measured pixel sizes, WCAG ratios) but *throws the specificity away* at the finding-emission step. The rebuild's job is not to acquire new capability — it is to *stop discarding* capability it already has, and wire `scoring.js` → `createFinding()` → located+measured+fixed findings. **This is the highest-leverage change in the entire competitive analysis.**

---

## 1. Method & sources

Searched 2026-05-29 via web search + targeted page fetch. Tool categories profiled per brief: Lighthouse, axe-core / axe DevTools, Pa11y / pa11y-ci, Stylelint & design-lint, Storybook a11y addon, contrast checkers (WCAG vs APCA), CRO / heuristic-audit tools (UX-Ray/Baymard, Capian, Omniconvert), and AI design-review tools (Figma AI Design Review, Design Buddy, Ornis, onBeacon, Review Raven). Primary sources cited inline and listed in §8.

**Caveat (uncertain):** Vendor pages and "best tool" listicles are marketing-biased. Where a claim is vendor-sourced (e.g., UX-Ray's "95% accuracy"), it is flagged. The 57%/30-40% automated-coverage figures recur across independent sources (Deque, Storybook docs, multiple analyses) and are treated as **likely** industry consensus, not gospel.

---

## 2. Per-tool profile — does WELL / CANNOT do / community still asks for

### 2.1 axe-core / axe DevTools (Deque)
- **Does well:** The de-facto accessibility engine; powers Storybook a11y addon, Pa11y (axe mode), Lighthouse-adjacent flows, and ui-ux-suite's own deep mode. Each violation is tied to a **specific WCAG criterion, impact level, exact CSS selector, computed ratio, colors involved, font size, and the failed threshold** — i.e. located + measured "evidence right there in the artifact." Runs anywhere there's a DOM (browser, headless Chromium, Node). *Evidence: deque.com/axe/axe-core/, access-proof.com/blog/what-is-axe-core-evidence-based-audits. Confidence: confirmed (this is also what ui-ux-suite consumes in browser.js).*
- **Cannot do:** Automatically detects ~**57%** of WCAG issues found in a first-time audit; the other ~43% (is alt text *descriptive*, is focus order *logical*, are error messages *helpful*) need human judgment. It is accessibility-only — no typography scale, color-system consolidation, spacing-grid, component-architecture, or visual-hierarchy scoring. *Evidence: deque.com/axe/axe-core/; access-proof.com. Confidence: likely (figure recurs across sources).*
- **Community still asks for:** Fix guidance, not just detection ("companies need solutions that … provide clear remediation guidance, rather than tools that require extensive technical expertise to interpret results"); fewer false positives ("tool fatigue", "long lists of false positives … overwhelm developers"). *Evidence: moldstud.com ultimate-guide; deque.com/blog/why-false-claims-and-false-positives-ruin…; dev.to/chris_devto/your-accessibility-score-is-lying-to-you. Confidence: likely.*

### 2.2 Lighthouse (Google)
- **Does well:** Free, built into Chrome DevTools/CI, runs ~40+ automated a11y audits plus performance/SEO/PWA. Familiar, zero-install, score-driven. *Evidence: developer.chrome.com/docs/lighthouse/accessibility/scoring; debugbear.com/blog/lighthouse-accessibility. Confidence: confirmed.*
- **Cannot do:** Catches only ~**30-40%** of real WCAG issues; "Additional Items To Manually Check" don't affect the score; **a 100 score does not mean accessible** (keyboard traps, meaningful alt text, logical reading order are excluded). A perfect score can give "a dangerous illusion of compliance." Purely page-runtime — cannot reason about source-code structure, design tokens, or component reuse. *Evidence: boia.org/blog/googles-lighthouse-accessibility-tests…; accessibility-test.org/blog/…/lighthouse-accessibility-score-insights-and-limitations; dev.to your-accessibility-score-is-lying. Confidence: likely.*
- **Community still asks for:** Findings that explain *why it matters* and *how to fix it*, and audits beyond a11y/perf into actual *design quality*. *Evidence: same sources. Confidence: likely.*

### 2.3 Pa11y / pa11y-ci
- **Does well:** Fast CLI, great for CI; runs against URL lists/sitemaps, behind auth, headless, SPA-aware; JSON/CSV output; swappable engine (HTML CodeSniffer ~68% catch, axe-core mode ~73%). *Evidence: github.com/pa11y/pa11y; github.com/pa11y/pa11y-ci; abstracta.us/blog/…comparing-axe-wdio-and-pa11y-ci; sparkbox.com pa11y review. Confidence: likely.*
- **Cannot do:** Weakest out-of-the-box detection of the major a11y tools; reports "do not offer a comprehensive overview or detailed grouping"; misses nuanced barriers (keyboard patterns, screen-reader compatibility). a11y-only; no design-system reasoning. *Evidence: sparkbox.com; accessibility-test.org deque-vs-pa11y-vs-accesslint. Confidence: likely.*
- **Community still asks for:** Better grouping/prioritization of results and richer remediation. *Evidence: sparkbox.com. Confidence: likely.*

### 2.4 Stylelint + @lapidist/design-lint
- **Does well:** Stylelint enforces CSS *syntax* and naming conventions; custom plugins can validate token usage (e.g. carbon-tokens, mozilla no-base-design-tokens). `@lapidist/design-lint` (new, 2025) "understands your design system" and scans JS/TS/CSS across React/Vue/Svelte/Web Components to keep tokens consistent. Source-based, runs pre-commit/CI. *Evidence: css-tricks.com/stylelint; github.com/carbon-design-system/stylelint-plugin-carbon-tokens; lapidist.net/articles/2025/introducing-lapidist-design-lint. Confidence: confirmed.*
- **Cannot do:** "Traditional linting tools like ESLint and Stylelint care about syntax, not whether your team is following tokens or components correctly." Surface checks only (naming, unknown custom props); **cross-token relationship checks require a build step**, not the pre-commit hook. No accessibility, no contrast science, no UX-law reasoning, no scoring, no screenshots. *Evidence: alwaystwisted.com/articles/where-to-lint-design-tokens; medium.com/@barshaya97 design-tokens-enforcement. Confidence: likely.*
- **Community still asks for:** Tools that judge *whether design decisions are correct*, not just whether syntax is valid — exactly the gap ui-ux-suite scores against. *Evidence: same. Confidence: likely.*

### 2.5 Storybook a11y addon (`@storybook/addon-a11y`)
- **Does well:** Built on axe-core; per-story violations/passes/incomplete tabs; since 8.5 can run the whole Storybook in one click with realtime feedback. Great for component-level dev. *Evidence: storybook.js.org/docs/writing-tests/accessibility-testing; storybook.js.org/blog/storybook-8-5. Confidence: confirmed.*
- **Cannot do:** Same ~57% axe ceiling; "only a partial replacement for manual testing"; "requires you to manually verify each story." Requires a *running Storybook* (not every project has one); a11y-only. *Evidence: storybook.js.org/docs; npmjs.com/package/@storybook/addon-a11y. Confidence: likely.*
- **Community still asks for:** Unified a11y test runs and less manual per-story verification (open tracking issue #29555). *Evidence: github.com/storybookjs/storybook/issues/29555. Confidence: confirmed.*

### 2.6 Contrast checkers — WCAG 2.x vs APCA
- **Does well:** WebAIM / colorcontrast.app / apcacontrast.com give instant pass/fail. APCA (Lightness-Contrast `Lc`) models *perceptual* readability and accounts for font weight & size; "more accurate than luminance-based methods" for mid-range and near-black colors where WCAG 2.x "far overstates contrast." *Evidence: weable.pro/…wcag-vs-apca-comparison; apcacontrast.com; capellic.com/insights/accessible-colors. Confidence: likely.*
- **Cannot do:** WCAG 2.x ignores font weight/size; APCA "is **not** part of the official WCAG 2.x standard" and **WCAG 3.0 is still draft** — so APCA cannot be cited as a *compliance* pass yet (use WCAG 2.1 for production). Checkers operate on color *pairs*, not on the real DOM/source — you must hand-feed colors; they don't find which `file:line` uses the failing pair. *Evidence: weable.pro; capellic.com. Confidence: likely.*
- **Community still asks for:** Auto-discovery of failing pairs *in context* + actionable "nearest passing color" suggestions. *Evidence: colorcontrast.app advertises color suggestions; WebAIM. Confidence: likely.* (ui-ux-suite already ships APCA + OKLCH + deltaE per its own README/CLAUDE.md — a genuine edge if findings are located.)

### 2.7 CRO / heuristic-audit tools — UX-Ray 2.0 (Baymard), Capian, Omniconvert
- **Does well (the tool to beat):** **UX-Ray 2.0** scans live URLs *or screenshots* against **346 research-backed Baymard heuristics**, detecting element-level details ("checkboxes, link styling, and/or normal text styling" for gallery indicators) and emitting a **"research-backed UX to-do list"** with each item grounded in a numbered Baymard guideline (e.g. #774). Claims **95% accuracy** vs human expert auditors across 79 sites/15+ languages, with line-by-line comparison spreadsheets published. Baymard cite a March 2025 Microsoft study putting *other* AI UX tools at 50/62/67/75%. *Evidence: baymard.com/blog/ai-heuristic-evaluations (fetched). Confidence: likely for capability; vendor-sourced for the 95% number — flagged uncertain.*
- **Cannot do:** **Ecommerce-only** and **live-URL/screenshot only** — it does *not* read your source repo, design tokens, or component code; covers only the ~346 of 700+ guidelines validated to ≥95% accuracy and "fails safely" by *omitting* uncertain issues. No code-level fix (it points to a guideline, not your `file:line`). Capian/Omniconvert lean on analytics/heatmaps/human collaboration, not source code. *Evidence: baymard.com/blog/ai-heuristic-evaluations; capian.co/use-cases/cro-ux; omniconvert.com/blog/cro-audit-tools. Confidence: likely.*
- **Community still asks for:** "Most effective programs combine AI + manual" — broad AI screening then expert prioritization. Implication: an *open, source-aware, non-ecommerce, fix-emitting* version of this is an open niche. *Evidence: saashero.net best-saas-ux-heuristic-tools. Confidence: likely.*

### 2.8 AI design-review tools (Figma plugins & assistants)
- **Does well:** Figma's official **AI Design Review Assistant** + community plugins (Design Buddy, Ornis, onBeacon, Review Raven, Floto) scan frames/flows/components in seconds for layout, hierarchy, accessibility, copy, even heatmaps; some are research-grounded (onBeacon, ex-Apple Siri team). Thoughtworks placed "AI Design Reviewer" on its Technology Radar. *Evidence: figma.com/solutions/ai-design-review-assistant; figma community plugins listed; thoughtworks.com/radar/tools/ai-design-reviewer. Confidence: confirmed they exist; likely on capability.*
- **Cannot do:** They operate on **Figma design files / canvas**, not on the **shipped code**. They can't tell you the *implemented* `font-size: 13px` in `Button.tsx:42` is wrong, or that your CSS uses 23 unique hex colors — they critique the mockup, not the build. No headless/CLI/CI mode, no source-of-truth-in-repo. *Evidence: figma.com/solutions/ai-design-review-assistant (Figma-canvas scoped). Confidence: likely.*
- **Community still asks for:** Reviews that follow the design *into code* and that run where engineers actually work (editor/terminal/CI), not only in Figma. *Evidence: thoughtworks radar (positions it as design-stage); gap inferred. Confidence: uncertain.*

---

## 3. Feature-gap table

Legend: ✅ strong · ◑ partial/limited · ❌ none · `src`=reads source repo · `url`=runs a URL.

| Capability | axe / axe DevTools | Lighthouse | Pa11y/-ci | Stylelint + design-lint | Storybook a11y | Contrast checkers | UX-Ray 2.0 | Figma AI reviewers | **ui-ux-suite (today)** | **ui-ux-suite (target)** |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Element-level **selector** in finding | ✅ | ◑ | ✅ | ◑(file) | ✅ | ❌ | ◑ | ◑ | ◑ (captured in browser.js, **not surfaced**) | ✅ |
| **file:line** location | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ (count strings only) | ✅ |
| **Measured wrong value** in finding | ✅(ratio/size) | ◑ | ◑ | ◑ | ✅ | ✅(pair) | ◑ | ◑ | ◑ (numbers exist, generic msg) | ✅ |
| **Concrete fix / before→after** | ❌ | ❌ | ❌ | ❌(autofix syntax only) | ❌ | ◑(suggest color) | ◑(guideline ref) | ◑(prose) | ❌ (schema supports it, unused) | ✅ |
| **UX-law citation** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ◑(Baymard #) | ◑ | ✅ (laws array on every finding) | ✅ |
| **Color science** (APCA/OKLCH/deltaE) | ◑(WCAG ratio) | ◑ | ◑ | ❌ | ◑ | ✅(APCA opt) | ❌ | ◑ | ✅ (color-engine.js) | ✅ |
| **Typography scale / spacing grid** audit | ❌ | ❌ | ❌ | ◑(tokens) | ❌ | ❌ | ◑ | ◑ | ✅ (type-/spacing-engine) | ✅ |
| **Component architecture** (cn/cva/primitives) | ❌ | ❌ | ❌ | ◑ | ❌ | ❌ | ❌ | ❌ | ✅ (scoring.js:153-170) | ✅ |
| **Weighted multi-dimension score** (12 dims) | ❌ | ◑(category) | ❌ | ❌ | ❌ | ❌ | ◑ | ◑ | ✅ (schema DIMENSIONS) | ✅ |
| Works **from source, no running app** | ◑ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌(Figma) | ✅ | ✅ |
| Works **from a URL** (deep mode) | ✅ | ✅ | ✅ | ❌ | ◑ | ❌ | ✅ | ❌ | ◑ (browser.js opt-in) | ✅ |
| Runs **headless in CI / AI editor** | ✅ | ✅ | ✅ | ✅ | ◑ | ❌ | ◑(SaaS) | ❌ | ✅ (Claude Code plugin/MCP) | ✅ |
| **Annotated screenshot** (boxes on issues) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ◑(screenshot in) | ◑ | ❌ (fullPage, unannotated) | ✅ |
| **Open-source / zero-dep** | ✅(lib) | ✅ | ✅ | ✅ | ✅ | mixed | ❌(SaaS) | ❌ | ✅ | ✅ |

**Reading the table:** No competitor combines columns *file:line location* + *measured value* + *before→after fix* + *UX-law citation* + *source-OR-url* + *multi-dimension design score* + *open-source/headless-in-editor*. ui-ux-suite's "target" column is the only one that fills all of them — but its "today" column shows it currently *forfeits* the three most decisive cells (file:line, before→after, annotated screenshot) despite already owning the harder ones (UX laws, color science, component architecture, 12-dim scoring). *Evidence: per-cell sources above + §0 source read. Confidence: confirmed for ui-ux-suite columns; likely for competitor cells.*

---

## 4. "Steal this" list (specific, attributable, actionable)

1. **axe-core's evidence-in-the-artifact format** — every finding ships rule + WCAG criterion + **selector** + computed value + failed threshold. *Steal:* make `createFinding` mandatory-populate `selector`/`file`/`line` + the measured value + the threshold it broke. (ui-ux-suite already captures `firstNodeTarget`/`firstNodeHtml` in `browser.js:160-161` — wire it through.) *Source: deque.com/axe.*
2. **UX-Ray's "research-backed to-do list" + numbered guideline references** — each item cites a specific Baymard guideline #. *Steal:* ui-ux-suite already attaches a `laws[]` array to findings (`scoring.js`), but it's a slug with no link/explanation. Render each as a cited, linked UX-law ("Fitts's Law — lawsofux.com/fittss-law", with the one-line *why*). This is a **stronger** version of what UX-Ray does, because ui-ux-suite's laws are first-class on the finding. *Source: baymard.com/blog/ai-heuristic-evaluations; lawsofux.com.*
3. **UX-Ray "fails safely"** — only emit findings above a confidence threshold; omit uncertain ones rather than guess. *Steal:* attach a `confidence` field to findings and suppress low-confidence noise. Directly answers the #1 community complaint (false-positive fatigue). *Source: baymard.com; deque.com/blog/why-false-claims-and-false-positives.*
4. **Stylelint / design-lint source-based token enforcement** — judge token *usage* in real JS/TS/CSS, not just syntax. *Steal:* ui-ux-suite already parses Tailwind/theme (`tailwind-parser.js`, `theme-parser.js`); emit findings like "raw `#3B82F6` at `Hero.tsx:28` — use `--color-primary` token" (located + fixed). *Source: lapidist.net design-lint; carbon-design-system/stylelint-plugin-carbon-tokens.*
5. **APCA perceptual contrast as a second opinion** — report APCA `Lc` *alongside* WCAG ratio with a clear "WCAG passes but perceptually weak" flag, while keeping WCAG 2.1 as the compliance verdict (APCA isn't normative yet). *Steal:* ui-ux-suite already has APCA in `color-engine.js`; surface it as dual-signal. *Source: weable.pro wcag-vs-apca; capellic.com.*
6. **Contrast checkers' "nearest passing color" suggestion** — don't just flag; propose the fix. *Steal:* for every contrast failure, compute and emit the minimal OKLCH lightness nudge that passes (before→after hex). *Source: colorcontrast.app.*
7. **Storybook 8.5 "one-click whole-suite + realtime"** — batch coverage with progress, not per-item nagging. *Steal:* run all 12 dimensions in one command with a single consolidated, prioritized report (ui-ux-suite already does multi-dim; keep it one-shot). *Source: storybook.js.org/blog/storybook-8-5.*
8. **Pa11y's grouping gap is an opportunity, not a feature to steal** — community complains Pa11y *doesn't* group/prioritize. *Steal the inverse:* ship the prioritized `topFindings` the scorecard schema already declares (`schema.js:32`), sorted by severity×weight. *Source: sparkbox.com pa11y review.*

---

## 5. Where ui-ux-suite WINS — positioning (validated + challenged)

**Positioning statement (validated):** *ui-ux-suite is the only open-source, headless, AI-editor-native design auditor that produces element-level findings that are located (file:line / selector), measured (the wrong value), law-cited (verified UX law), and fixed (before→after) — auditing your real shipped code OR a live URL, without modifying the app.*

Each clause, validated and challenged:

- **"Element-level located + measured"** — *Validated as a real gap:* no rival gives `file:line` from source (only Stylelint gives file, and it has no design judgment). *Challenged:* **ui-ux-suite does not do this today** (§0). This is aspirational until `scoring.js` is rewired to emit `file:line` + measured value. **Confidence the gap exists: confirmed. Confidence ui-ux-suite fills it today: refuted.**
- **"Verified UX-law citations"** — *Validated:* essentially unique. axe/Lighthouse/Pa11y/Stylelint cite *zero* UX laws; only UX-Ray cites (proprietary, ecommerce-only) Baymard guidelines. ui-ux-suite attaches `laws[]` to nearly every finding (`scoring.js` throughout) and ships 19 KB docs + `lib/knowledge.js`. *Challenged:* the laws are currently *slugs* with no rendered explanation or source link, and the brief demands "don't just parrot" — laws must be *verified against primaries* (lawsofux.com / NN/g), not asserted. **Confidence: likely-winning differentiator IF laws are rendered+sourced.**
- **"Audit-then-suggest fixes (never mutate)"** — *Validated:* a clean niche. Stylelint `--fix` mutates; Figma tools work on mockups; UX-Ray is read-only-SaaS. An OSS tool that emits *before→after patches without applying them* fits the AI-editor safety model. *Challenged:* the `before`/`after` fields exist (`schema.js:73-74`) but are **never populated** today. **Confidence the niche is open: likely. Confidence ui-ux-suite fills it today: refuted.**
- **"Works headless from source OR a URL, inside AI editors"** — *Validated & uniquely strong:* it's a native Claude Code plugin with an MCP server (`lib/mcp-server.js`, 37 KB) + optional Playwright deep mode (`browser.js`). Figma reviewers can't touch code; axe/Lighthouse/Pa11y can't read source; Stylelint can't take a URL. ui-ux-suite spans **both** source and URL **and** runs where the AI agent lives. *Challenged:* deep mode is opt-in peer-dep (`playwright-core`+`@axe-core/playwright`) and the URL path is the weaker half today. **Confidence: confirmed differentiator.**
- **"12-dimension weighted design score"** — *Validated:* broadest scope of any tool here (color, type, layout, components, a11y, hierarchy, interaction, responsive, polish, performance, IA, platform — `schema.js:8-21`). Nobody else scores design *holistically*; they each own one slice. *Challenged:* breadth is worthless if each dimension's findings are generic counts (§0). Breadth + specificity together is the moat; breadth alone is a vanity score. **Confidence: confirmed scope advantage; conditional on specificity.**

**Net competitive thesis (confidence: likely):** ui-ux-suite's moat is the *intersection* nobody else occupies — **source-aware + URL-aware + design-holistic + UX-law-cited + located/measured/fixed + open-source + AI-editor-native**. Every rival owns 1-2 of these; ui-ux-suite is architected for all of them. The rebuild's entire competitive value hinges on closing the §0 gap (wire `createFinding` with `file:line`/selector + measured value + before→after) and on rendering UX laws as *verified, sourced* citations rather than slugs. Until then, ui-ux-suite scores like axe/Lighthouse (counts + generic advice) but with broader scope — *adequate, not winning.*

---

## 6. Risks / honest weaknesses to defend against

- **False-positive fatigue is the category's #1 killer** (recurs across Deque, dev.to, moldstud). A 12-dimension tool that fires generic, location-less findings will feel *noisier* than axe, not better. *Mitigation:* per-finding `confidence`, "fail safely" suppression, prioritized `topFindings`. *Confidence: likely.*
- **"Score 100 = accessible" illusion** — ui-ux-suite emits a single overall grade (`schema.js:46-59`); a high grade could imply "design is good" when only automatable slices were checked. *Mitigation:* state automated-coverage caveat in every report header (mirror Lighthouse's "manual checks" disclaimer). *Confidence: likely.*
- **UX-law claims must be verified, not parroted** (brief's evidence rule + Wikipedia "signs of AI writing"). Asserting "violates Fitts's Law" without the measured target size + the primary source is exactly the generic-finding failure mode in a new costume. *Confidence: confirmed (per brief).*
- **APCA cannot be cited as compliance** (not in WCAG 2.x; WCAG 3.0 draft). Reporting APCA as a *pass* would be wrong. *Mitigation:* APCA = perceptual second opinion; WCAG 2.1 = verdict. *Confidence: likely.*
- **Screenshot pipeline is currently broken for the stated use** — `browser.js:149` uses `fullPage: true`, which the global CLAUDE.md flags as causing "image dimensions exceed max allowed size" API failures, and screenshots are unannotated. Any "annotated screenshot" win requires fixing capture (viewport-bounded ≤1920×1080) + drawing bounding boxes from the axe `target`/`boundingRect`. *Evidence: lib/browser.js:149; ~/.claude/CLAUDE.md Chrome screenshot rule. Confidence: confirmed.*

---

## 7. Headline recommendations (feeds Phase 8 ranked plan)

1. **Wire `scoring.js` → `createFinding()`** with mandatory `selector`/`file`/`line` + the measured wrong value + the broken threshold. This is the single highest-leverage competitive move (closes §0, matches axe, beats everyone on scope). *Confidence: confirmed priority.*
2. **Populate `before`/`after`** on every finding where a fix is computable (contrast→nearest-passing OKLCH; raw color→token; small body text→16px). *Confidence: likely.*
3. **Render `laws[]` as verified, sourced citations** (lawsofux.com / NN/g) with the measured reason, not bare slugs. *Confidence: likely.*
4. **Merge deep-mode element data into findings** — promote `firstNodeTarget`/`firstNodeHtml`/touch-target sizes from the siloed `runBrowserAudit` payload into the scorecard's findings. *Confidence: confirmed gap.*
5. **Add per-finding `confidence` + "fail safely" suppression + prioritized `topFindings`** to beat false-positive fatigue. *Confidence: likely.*
6. **Fix + annotate screenshots** (viewport-bounded, bounding boxes on offending elements). *Confidence: confirmed need.*
7. **Lead positioning on the intersection moat**, not on any single dimension. *Confidence: likely.*

---

## 8. Sources (fetched/searched 2026-05-29)

**Primary source code (live, branch `rebuild/uiux-10x`):** `lib/schema.js:8-21,46-77`; `lib/scoring.js:11-185`; `lib/browser.js:88-163`; `lib/mcp-server.js:9,804`; `~/.claude/CLAUDE.md` (Chrome screenshot rule); repo `CLAUDE.md` (APCA/OKLCH/deltaE, zero-dep, plugin distribution).

**Web (cited inline):**
- axe-core — https://www.deque.com/axe/axe-core/ ; https://access-proof.com/blog/what-is-axe-core-evidence-based-audits ; https://www.deque.com/axe/devtools/
- Lighthouse — https://developer.chrome.com/docs/lighthouse/accessibility/scoring ; https://www.boia.org/blog/googles-lighthouse-accessibility-tests-are-helpful-but-not-perfect ; https://accessibility-test.org/blog/testing-tools/lighthouse-accessibility-score-insights-and-limitations/ ; https://www.debugbear.com/blog/lighthouse-accessibility
- Pa11y — https://github.com/pa11y/pa11y ; https://github.com/pa11y/pa11y-ci ; https://sparkbox.com/foundry/pa11y_website_accessibility_audit_website_accessibility_checker ; https://abstracta.us/blog/accessibility-testing/automated-accessibility-testing-comparing-axe-wdio-and-pa11y-ci/
- Stylelint / design-lint — https://css-tricks.com/stylelint/ ; https://lapidist.net/articles/2025/introducing-lapidist-design-lint/ ; https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens ; https://www.alwaystwisted.com/articles/where-to-lint-design-tokens ; https://medium.com/@barshaya97_76274/design-tokens-enforcement-977310b2788e
- Storybook a11y — https://storybook.js.org/docs/writing-tests/accessibility-testing ; https://storybook.js.org/blog/storybook-8-5/ ; https://github.com/storybookjs/storybook/issues/29555 ; https://www.npmjs.com/package/@storybook/addon-a11y
- Contrast / APCA — https://weable.pro/products/weable-color/blog/wcag-vs-apca-comparison ; https://apcacontrast.com/ ; https://capellic.com/insights/accessible-colors ; https://colorcontrast.app/ ; https://webaim.org/resources/contrastchecker/
- CRO / heuristic — https://baymard.com/blog/ai-heuristic-evaluations ; https://capian.co/use-cases/cro-ux ; https://www.omniconvert.com/blog/cro-audit-tools/ ; https://www.saashero.net/design/best-saas-ux-heuristic-tools/
- AI design review — https://www.figma.com/solutions/ai-design-review-assistant/ ; https://designbuddy.net/ ; https://www.thoughtworks.com/radar/tools/ai-design-reviewer
- Tool-fatigue / false-positives & UX laws — https://www.deque.com/blog/why-false-claims-and-false-positives-ruin-digital-accessibility-programs/ ; https://dev.to/chris_devto/your-accessibility-score-is-lying-to-you-5fh2 ; https://moldstud.com/articles/p-ultimate-guide-to-accessibility-testing-tools-for-front-end-developers-a-complete-review ; https://lawsofux.com/jakobs-law/ ; https://www.looppanel.com/blog/laws-of-ux

**Confidence note:** UX-Ray's "95% accuracy" and all vendor "best tool" listicle claims are vendor/marketing-sourced (uncertain). The 57% (axe) and 30-40% (Lighthouse) automated-coverage figures recur across independent sources and are treated as likely industry consensus. All `ui-ux-suite` source-code claims are confirmed by direct file:line reads.
