# 01 — Discovery & Architecture Map (Phase 1)

Repo: `/Users/adamboudj/projects/ui-ux-suite` · branch `rebuild/uiux-10x` · version `0.3.0` (package.json:3, plugin.json)
Method: read of PRIMARY source (all `lib/*.js`, `bin/*.js`, sample skills/commands/agents/knowledge), a real CLI run on self + a synthetic fixture, and the full test suite (234 tests, all pass on Node v22.22.0).

---

## 0. TL;DR — the orchestrator hypothesis is CONFIRMED (with file:line)

> "schema.js defines a rich `createFinding(...)` but scoring.js never calls it — every scorer emits a bare `{severity,msg,laws}` with a count-based generic string and NO location and NO concrete fix. browser.js captures element-level data but is siloed, never woven into findings, and screenshots are never annotated."

**Verdict: CONFIRMED on every clause.** Evidence below (each is `file:line` + observed behavior, Confidence: confirmed unless noted).

1. `createFinding` exists at `lib/schema.js:63` and is exported (`schema.js:196`). Its ONLY non-test caller is `lib/mcp-server.js:804` inside `handleAuditLog` — a manual MCP tool an LLM calls by hand, NOT the audit pipeline. `lib/scoring.js` does NOT import or call `createFinding` (it imports only `{ DIMENSIONS, createScoreCard, calculateOverall }` at `scoring.js:6`). Confidence: confirmed (grep across `lib/ bin/ test/`).
2. Every static scorer pushes object literals shaped `{ severity, msg, laws }` — e.g. `scoring.js:19, 26, 32, 43, 49, 62, 68, 77, 98, 108, 113, 125, 130, 140, 145, 158-170, 180-191, 201-206, 217-224, 234-243, 253-257, 267-272, 282-287`. None contains `title/description/impact/fix/effort/before/after`. Confidence: confirmed.
3. The `msg` strings are count-based generic templates: `"${critical.length} critical contrast failures"`, `"${colorData.uniqueCount} unique colors - too many"`, `"${a11yData.missingAltText} images missing alt text"`. They state HOW MANY, never WHERE. Confidence: confirmed (and reproduced live — see §6).
4. No finding object in the audit path carries `file`, `line`, `selector`, `before`, or `after`. Confidence: confirmed (live JSON dump §6; the only `file:` ever attached to extracted data is a path-only label in `mcp-server.js:408`, on a standalone tool result that the scorers never read).
5. `lib/browser.js` (Playwright + axe) IS siloed: `runBrowserAudit` is called only at `mcp-server.js:719`; its result is attached as a separate top-level field `result.browserAudit` (`mcp-server.js:798`) and is never merged into `scoreCard.dimensions[].findings` or `topFindings`. Confidence: confirmed.
6. Screenshots are captured (`browser.js:143-151`, `page.screenshot({ fullPage:true })`) but never annotated, never referenced by a finding, and only written when `options.screenshotDir` is set — which the single caller (`mcp-server.js:719`, `{ routes:['/'] }`) does NOT set, so **in practice no screenshot is ever taken** today. Confidence: confirmed.

### The KEY question: is there ANY path that produces a file:line or selector for a static finding today?
**No.** Confidence: confirmed.
- Extractors discard `match.index`. Every extractor in `lib/extractors.js` uses `regex.exec(content)` / `.match()` loops and pushes only `match[0]`/captured values (`extractors.js:30-39` colors, `46-58` tailwind config, `63-99` typography, `112-130` spacing, `134-154` radius/shadow). Source offsets are computable (`match.index` is in scope) but thrown away.
- `lib/tailwind-parser.js` DOES track `match.index`/`lastIndex` (`tailwind-parser.js:98, 104, 107, 116, 119`) but only to walk balanced braces — it records no line numbers on the returned classes (`extractClassesFromJSX` returns a bare `Set` → array of class strings, `tailwind-parser.js:128`).
- `flagArbitraryValues` (`tailwind-parser.js:151-175`) produces the closest thing to a located finding (`{class, family, value, kind, hint}`) but **is dead code in the audit path** — zero callers in `runner.js`, `scoring.js`, or `mcp-server.js` (grep confirms; test-only).
- The runner reads files with `fs.readFileSync` and aggregates into `Set`s and counts (`runner.js:107-228`); file identity is lost the moment content is concatenated (e.g. `runner.js:225` joins ALL css into one `cssContent` blob; `runner.js:297` joins the JSX sample into one `jsxSample` blob). All downstream regex/`.includes` run on these blobs, so even the file is unknown, let alone the line.
- The dynamic deep mode (browser.js) IS the only place element-level location exists (`firstNodeTarget` selector at `browser.js:160`, `firstNodeHtml` at `browser.js:161`, per-element touch sizes at `browser.js:130-135`) — and it is siloed (clause 5/6 above).

### DOCUMENTATION-VS-CODE GAP (high-impact, not in the hypothesis but load-bearing for the rebuild)
`commands/audit.md` falsely promises located findings:
- Principle bullet: *"Cite the report. Every finding in the report includes a `file:line` reference."*
- "Output shape" example shows `"topFindings": [ { ... "file": "src/app/page.tsx:42" } ]`.
The engine emits no `file` field at all (§6). The command instructs the agent to "preserve" a `file:line` that never exists. The skill `design-audit/SKILL.md` and agents describe a rich multi-agent flow that the single `uiux_audit_run` tool does not produce. Confidence: confirmed. This gap is the cleanest justification for the rebuild: the product already claims to be located+specific; the engine just doesn't deliver it.

---

## 1. Stack (with evidence)

| Aspect | Value | Evidence | Confidence |
|---|---|---|---|
| Runtime | Node `>=18` declared; runs on v22 | `package.json:19-21`; ran on v22.22.0 | confirmed |
| Zero-dep (default install) | True — no `dependencies` key at all | `package.json` has only `peerDependencies`/`peerDependenciesMeta`, no `dependencies` | confirmed |
| Optional peer deps | `playwright-core >=1.59.0`, `@axe-core/playwright >=4.11.0`, both `optional:true` | `package.json:35-44`; loaded via dynamic `import()` in `browser.js:28-29` | confirmed |
| Language | Vanilla CommonJS JS (`require`/`module.exports`), no TS, no build step | every `lib/*.js` | confirmed |
| MCP transport | Hand-rolled JSON-RPC 2.0 over stdin/stdout, newline-delimited | `mcp-server.js:911-1057` | confirmed |
| Distribution | Claude Code plugin + npm CLI | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, root `manifest.json` (legacy, still shipped via `files[]` `package.json:31`), `bin.ui-ux-suite` `package.json:8` | confirmed |
| Test runner | `node:test` built-in (`npm test` → `node --test test/*.test.js`) | `package.json` scripts | confirmed |
| Manifest redundancy | THREE manifests coexist: `.claude-plugin/plugin.json`, root `manifest.json`, `.claude-plugin/marketplace.json` — CLAUDE.md flags root `manifest.json` for removal but `package.json:30` still ships it | files present + `package.json` `files[]` | confirmed |

---

## 2. Counts (enumerated)

| Artifact | Count | Names |
|---|---|---|
| MCP tools | **14** | uiux_scan_project, uiux_extract_colors, uiux_extract_typography, uiux_extract_spacing, uiux_check_contrast, uiux_score_dimension, uiux_score_overall, uiux_generate_palette, uiux_generate_type_scale, uiux_generate_spacing_scale, uiux_generate_tokens, uiux_knowledge_query, uiux_laws_query, uiux_audit_run, uiux_audit_log, uiux_audit_report — *(note: TOOLS array literally has 16 entries; `mcp-server.js:21-269`. The MCP-resources system-reminder advertises only 14 — `uiux_audit_log` and `uiux_audit_report` may be filtered/stale in the registry. The CODE truth is 16.)* |
| CLI flags | **6** | `[path]` positional, `--mcp`, `--json`, `--version`/`-v`, `--help`/`-h` (`bin/ui-ux-suite.js:20-59`) |
| Skills | **14** | a11y-audit, color-audit, component-audit, design-audit, design-checklist, design-compare, design-score, design-tokens, flow-audit, layout-audit, refactor-plan, style-direction, theme-builder, type-audit |
| Commands | **5** | a11y.md, audit.md, colors.md, components.md, typography.md |
| Agents | **12** | accessibility-auditor, color-analyst, component-reviewer, design-auditor, interaction-analyst, layout-analyst, performance-ux-analyst, platform-advisor, psychology-analyst, typography-analyst, ux-flow-analyst, visual-style-advisor |
| Knowledge docs | **21** (`*.md` incl. INDEX.md) | accessibility-guide, advanced-polish, anti-patterns, color-theory, component-patterns, dark-patterns, design-engineer-craft-2026, design-tools-2026, evidence-base, INDEX, insider-secrets-2026, laws-of-ux, libraries-tools, platform-conventions, principles, psychology, trends-2026, typography-theory, ux-flows, wow-animations-2026, wow-libraries-2026 *(tool descriptions say "19 knowledge files / 3,081 lines" — `mcp-server.js:176`; actual is 20 excluding INDEX, 21 including. Doc/code count drift.)* |
| Tests | **17** files / **234** tests / **89** suites, all passing | `test/*.test.js`; suite tail |
| `lib/*.js` modules | **13** | browser, color-engine, extractors, knowledge, mcp-server, oklch-parser, runner, schema, scoring, spacing-engine, tailwind-parser, theme-parser, type-engine |

---

## 3. MCP tools — what each returns (from handlers)

All wrap their handler result as `{ content:[{type:'text', text: JSON.stringify(result) }] }` (`mcp-server.js:970-978`). Every handler returns `{ success, ... }`.

| Tool | Handler @ | Returns (shape) | Carries location? |
|---|---|---|---|
| `uiux_scan_project` | `:277` | `{success, profile, diagnostics?, filesScanned:{css, packageJson}}` | path of pkg only |
| `uiux_extract_colors` | `:399` | `{success, totalFound, uniqueColors, colors[≤100], cssVariables, nearDuplicates[≤20]}`; each color tagged with `file` (relative PATH, no line) at `:408` | **path only**, scorers ignore it |
| `uiux_extract_typography` | `:436` | `{success, fonts, sizes, weights, lineHeights, letterSpacings, scaleDetection, weightStrategy}` | no |
| `uiux_extract_spacing` | `:467` | `{success, rawValues, analysis}` | no |
| `uiux_check_contrast` | `:483` | `{success, results:[{fg,bg,context, wcag:{ratio,normalText,largeText}, apca:{lc,level}}]}` | caller-supplied pairs only |
| `uiux_score_dimension` | `:509` | `{success, dimension, score, findings, confidence?}` | no |
| `uiux_score_overall` | `:530` | `{success, scoreCard, formatted}` | no |
| `uiux_generate_palette` | `:541` | `{success, palette:{brand, neutral, semantic, surfaces}}` | n/a (generator) |
| `uiux_generate_type_scale` | `:566` | `{success, ratio, scale}` | n/a |
| `uiux_generate_spacing_scale` | `:575` | `{success, baseUnit, scale}` | n/a |
| `uiux_generate_tokens` | `:584` | `{success, tokens:{color,typography,spacing,css?}, format}` | n/a |
| `uiux_knowledge_query` | `:598` | `{success, files?|content?|structured+markdown?|result}`; markdown search DOES return `{file,line,content}` (`:639`) — *the only `file:line` in the whole codebase, and it's for KB grep, not findings* | KB lines only |
| `uiux_laws_query` | `:655` | `{success, count, laws[]}` (24 laws w/ slug/name/tags) | n/a |
| `uiux_audit_run` | `:675` | **canonical**: `{success, projectPath, depth, durationMs, filesScanned, profile, overall, grade, perDimension, topFindings[≤10], colorsFound, typographyFound, spacingSummary, tailwindSummary, a11ySignals, layout, warnings?, markdown?, browserAudit?}` | **NO** — topFindings are `{severity,msg,laws,dimension}`; `browserAudit` is a sibling field, not woven in |
| `uiux_audit_log` | `:803` | `{success, findingId, totalFindings, finding}` — **only** path that calls `createFinding` (so the only rich finding shape, but built by an LLM by hand, not the engine) | only if LLM hand-supplies `before/after` |
| `uiux_audit_report` | `:821` | `{success, format, totalFindings, findings: groupedBySeverity}` | inherits from manual log |

---

## 4. Data flow — how one finding goes input → output

`bin/ui-ux-suite.js:72  auditProject(projectPath)`  → (note: **CLI passes NO options**; `runner.auditProject(projectPath, options={})` at `runner.js:125` **never reads `options`** — so `baseUrl`/`depth`/`dimensions` are inert in the CLI. The MCP handler passes them at `mcp-server.js:699` but the runner still ignores them; deep mode is bolted on only inside the MCP handler, §5.)

Static pipeline inside `runner.auditProject` (`runner.js:125-523`):
1. `walkFiles` collects `.css/.scss/.sass` and `.tsx/.jsx/.vue/.svelte` (`runner.js:129-130`, maxDepth 6, ignores node_modules etc. `runner.js:20-21`).
2. `detectProjectProfile` (`runner.js:42-100`) reads package.json (+monorepo paths) → framework/styling/componentLib/theme via `extractors.js` detectors.
3. Extract: colors → `Set` of hex/oklch + `cssVariables` map (`runner.js:102-123`, **file identity lost**); typography → `Set`s (`runner.js:158-168`); spacing → flat array (`runner.js:173-180`); tailwind classes from ≤100 JSX files merged into `Set` (`runner.js:185-195`); a11y signals counted from JSX+CSS (`runner.js:198-222`); CSS all concatenated to one `cssContent` blob (`runner.js:225`); JSX sample concatenated to one `jsxSample` blob (`runner.js:297`).
4. `modern2026` feature flags computed by regex/`.includes` on the blobs (`runner.js:240-282`).
5. Build `scoreInput` = 12 sub-objects of **booleans + counts only** (`runner.js:332-435`). No file, no line, no selector enters here.
6. `runFullScoring(scoreInput)` (`scoring.js:310-334`): for each dimension calls `ALL_SCORERS[id](data)`; each scorer subtracts from 10 and pushes `{severity,msg,laws}`. `topFindings` = flatten+sort by severity, slice 20 (`scoring.js:325-331`).
7. Back in runner: `null` scores floored to 6 (`runner.js:467-469`), then **2026 "bonus" additions** are applied directly to dimension scores (`runner.js:441-488`) — these bonuses produce NO findings and are not reflected in `topFindings`; they only inflate scores (e.g. `responsiveBonus` can add +5.0, `runner.js:444-447`). `calculateOverall` re-weights (`runner.js:489`).
8. `formatReport` (`runner.js:525-630`) renders markdown; `Top 10 Findings` just prints `f.msg` (`runner.js:606`); `buildActionPlan` (`runner.js:637-646`) buckets by severity + a `/focus|alt|contrast/i` regex on msg — so an `important`-severity alt finding never lands in "Quick wins" (observed §6).

**Net:** a finding is born at a `findings.push({severity,msg,laws})` site inside a scorer, where the scorer only ever saw a boolean/count — the per-element evidence (which file, which line, which value) was already discarded two steps earlier in the runner. There is no architectural seam where location could be re-attached downstream.

---

## 5. browser.js (deep mode) — siloed, and effectively off

- `runBrowserAudit(baseUrl, options)` (`browser.js:42`) lazy-imports peer deps (`browser.js:25-40`), launches chromium with CI-safe flags (`browser.js:60-63`), per route runs axe (`browser.js:85-87`), `measureTouchTargets` (`browser.js:121-141`, flags <44×44), optional screenshot (`browser.js:89`).
- Per-violation summary KEEPS element location: `firstNodeTarget` = axe target selector joined by ` > ` (`browser.js:160`), `firstNodeHtml` (`browser.js:161`). Touch targets keep `{tag,w,h,text}` examples (`browser.js:130-135`).
- Wiring: single caller `mcp-server.js:717-725` invokes `runBrowserAudit(baseUrl, { routes:['/'] })` — **no `screenshotDir`**, so `takeScreenshot` never runs (`browser.js:89` short-circuits to `null`). Result attached at `mcp-server.js:798` as `result.browserAudit`, a sibling of `topFindings`.
- The static `scorePlatform` checks `d.hasTouchTargets` (`scoring.js:287`) but the runner's `scoreInput.platform` (`runner.js:428-434`) NEVER sets `hasTouchTargets` — so even the one bridge point between browser data and a score is unconnected; the touch-target finding can only fire from hand-built input. Confidence: confirmed.
- CLI cannot reach deep mode at all (no `--deep`/`--baseUrl` flag; only `--mcp/--json/--version/--help`, `bin:20-59`).

---

## 6. Live ground truth (reproduced)

Real CLI run on the repo itself (0 css/jsx files) and on a synthetic fixture (`react`+`tailwind-v3`, a `.css` with `#3b82f6`/`#3b82f5` near-dupes + `font-size:11px` + `padding:7px`/`margin:13px`, a `.jsx` with `<img src="x"/>` no alt + 1 `hover:`):

- Findings emitted verbatim (no file, no line, no fix): `"Missing semantic colors: error, success, warning"`, `"1 images missing alt text"`, `"Only 1 hover: variants — interactive elements likely lack hover feedback"`, `"Inconsistent spacing values - adopt a spacing scale"`. The `<img>` with no alt is KNOWN to be in `src/page.jsx` but the finding never says so.
- The 11px body text, the off-grid 7px/13px, and the near-duplicate `#3b82f5` vs `#3b82f6` are all in `src/app.css` — none located, and the small-body-text critical never fired (body-size logic only reads CSS `font-size` through a 12–20px min filter, `runner.js:349`).
- Action Plan placed everything under "Medium effort (1-4 hours)"; the alt finding (severity `important`) was excluded from "Quick wins" because `buildActionPlan` requires severity `critical` for that bucket (`runner.js:638`).
- Raw JSON finding shape observed: `{ "severity": "important", "msg": "Missing semantic colors: ...", "laws": ["jakobs-law"] }` — exactly the bare triple.
- Tests: 234 pass / 0 fail. `test/scoring-citations.test.js` asserts findings carry `laws[]` (`:18,32,46` etc.) but **no test asserts any `file`, `line`, `selector`, `before`, or `after`** — the regression gate has zero specificity expectation. `test/audit-run.test.js` fixtures are synthetic temp dirs and never exercise screenshots/annotation.

---

## 7. Implications for the rebuild (the seams to cut)

1. **Carry location from the source of truth.** Extractors already have `match.index` in scope — the cheapest 10x win is a located-token model `{value, type, file, line, col}` (compute line via offset→line map per file). This requires extractors to receive the file path + retain offsets, and the runner to stop pre-concatenating into blobs (or to keep a parallel per-file index).
2. **Make scorers call `createFinding` with real `before/after`.** The rich schema already exists (`schema.js:63`); scorers must receive located evidence (the offending token + its file:line + the wrong value) and emit `{title, description, impact, fix, effort, before, after, laws}` instead of the count string.
3. **Weave browser.js into findings.** axe `firstNodeTarget`/`firstNodeHtml` and touch-target examples should become located accessibility/platform findings (and set `scoreInput.platform.hasTouchTargets`), not a sibling JSON blob. Turn on `screenshotDir` and annotate the captured element region.
4. **Fix the doc/code contract.** Either implement `file:line` (preferred — it's the whole thesis) or stop `commands/audit.md` from promising it. Add a regression test that fails if a finding lacks a location.
5. **Resolve count drift:** "19 knowledge files / 3,081 lines" (`mcp-server.js:176`) vs 20–21 actual; TOOLS has 16 entries vs 14 advertised.
