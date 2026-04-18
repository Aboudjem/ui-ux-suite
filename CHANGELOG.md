# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-04-18

### Added — v1.1 UX Rework

- **Five slash commands** at the plugin root: `/ui-ux-suite:audit` (full 12-dimension audit), `/ui-ux-suite:colors`, `/ui-ux-suite:a11y`, `/ui-ux-suite:typography`, `/ui-ux-suite:components`. Each dispatches to the single `uiux_audit_run` MCP tool with scoped `dimensions`, so users get one command, one report, no tool-chaining.
- **New MCP tool `uiux_audit_run`**: single entry point that exposes the full `lib/runner.js:auditProject` pipeline. Returns structured JSON + formatted markdown in one call. Supports `projectPath` (defaults to `cwd`), `dimensions` (scope), `depth: "quick"|"deep"`, `baseUrl`, and `format: "full"|"summary"|"json"`.
- **Eight new dimension scorers** in `lib/scoring.js`: `components`, `hierarchy`, `interaction`, `responsive`, `polish`, `performance`, `flows`, `platform`. Each returns `{ score, findings, confidence }` where `confidence` is `high|medium|insufficient` — the first two dimensions previously silently failed with "No scorer for dimension"; now all 12 work. Exports `ALL_SCORERS`.
- **Tailwind v4 `@theme` and `@theme inline` parser** in `lib/theme-parser.js`: hand-rolled CSS block extractor with brace-depth, string, and comment tracking. Zero dependencies. Categorizes declarations into colors, fonts, radii, shadows, spacing, breakpoints, and other.
- **Honest stack detection** in `lib/extractors.js`: `detectStyling` now differentiates `tailwind-v3` from `tailwind-v4` via the version in `package.json` and flags `panda-css`, `vanilla-extract`, `stitches`. New `detectAnimationLib`, `detectIconLib`, and `detectThemeSystemDetails` functions report which component, theme, and icon libraries a project uses.
- **TSX/JSX/Vue/Svelte className extraction** in `lib/tailwind-parser.js`: balanced-brace capture handles JSX expression containers, ternaries, template literals (including `${...}` embedded expressions), and `cn()`/`clsx()`/`cva()`/`twMerge()`/`tv()` calls. Adds Vue `:class` binding and Svelte `class:foo` directive support.
- **Breakpoint bucketing** via `bucketByBreakpoint(classes)` and `analyzeResponsiveCoverage(classes)` — sorts classes into `base`/`sm`/`md`/`lg`/`xl`/`2xl`, surfaces `distinctBreakpoints` and `ratioResponsive` for the new responsive scorer.
- **Arbitrary-value flagging** via `flagArbitraryValues(classes)` — detects `text-[10px]`, `p-[13px]`, etc. and reports them as off-scale usage for the polish scorer.
- **Optional Playwright + axe-core deep mode** in `lib/browser.js`: `uiux_audit_run({ depth: "deep", baseUrl })` launches `playwright-core` + `@axe-core/playwright` behind a dynamic `import()` probe. Disables noisy axe rules (`region`, `landmark-one-main`) by default, launches with `chromiumSandbox:false` + `--disable-dev-shm-usage` for CI/Docker, and measures touch targets smaller than 44x44. When peer deps are missing, returns `PLAYWRIGHT_MISSING` with the exact install command.
- **Declared peer dependencies** in `package.json`: `playwright-core >=1.59.0` and `@axe-core/playwright >=4.11.0`, both marked `optional: true` via `peerDependenciesMeta`. No new default install weight.
- **Expanded project profile** in `lib/schema.js`: `createProjectProfile()` now includes `animationLib`, `iconLib`, `themeSignals`, `isTailwindV4`, and `tailwindV4Theme` (block count, inline/default split, token counts).
- **Loud failure messages** from `uiux_scan_project`: replaces silent `null` with structured `diagnostics[]` (`no-package-json`, `styling-unknown`, `component-lib-unknown`, `theme-system-unknown`) and an `error` + `hint` pair when the path is invalid.
- **Action plan** section in `formatReport`: quick wins (< 1 hour), medium effort (1-4 hours), major improvements (4+ hours), derived from critical and important findings.
- **Low-confidence score section** in the report: dimensions with `confidence: "insufficient"` are surfaced so directional scores are not mistaken for final ones.
- **5 new test files**: `test/audit-run.test.js` (12 tests), `test/theme-parser.test.js` (12), `test/stack-detection.test.js` (14), `test/tailwind-extraction-v2.test.js` (13), `test/scoring-v2.test.js` (21), `test/browser.test.js` (4). Total: 234 passing tests (up from 148).

### Changed

- `uiux_score_dimension` returns a structured error with `available` (the 12 valid dimension ids) and `hint` when an unknown dimension is passed, instead of only `error`. Still succeeds on all 12 dimensions (previously only 4).
- `uiux_scan_project` reads CSS files and infers `themeSystem` from `@theme`/`:root{--*}`/`next-themes` rather than returning `null`.
- `lib/runner.js:detectProjectProfile` takes an optional `cssContent` argument so v4 `@theme` detection can run during profiling.
- `lib/runner.js:auditProject` now builds a full 12-dimension `scoreInput` and feeds real data to each scorer; the previous "fill unscored dimensions with heuristics" fallback is removed because all scorers are now present.
- `formatReport` expands the Project Profile section with animation, icon, theme signal lines and `@theme` block count.

### Fixed

- Classes inside JSX expression containers like `className={isActive ? "bg-blue-500" : "bg-gray-200"}` are now extracted (previously truncated by the non-balanced `{([^}]*)}` regex).
- Classes inside `${...}` interpolations inside template literals are now walked recursively.
- `extractClassesFromJSX` handles Vue `:class` and Svelte `class:directive` syntax.
- `@theme` tokens inside CSS comments and strings are no longer picked up as real theme blocks.

### Peer Dependencies (new)

```json
"peerDependencies": {
  "playwright-core": ">=1.59.0",
  "@axe-core/playwright": ">=4.11.0"
},
"peerDependenciesMeta": {
  "playwright-core": { "optional": true },
  "@axe-core/playwright": { "optional": true }
}
```

To enable `depth: "deep"`:
```bash
npm i -D playwright-core @axe-core/playwright
npx playwright install chromium
```

## [0.2.0] - 2026-04-17

### Added

- **24 Laws of UX integration**: every finding now cites the UX law it violates (Hick's, Fitts's, Miller's, Jakob's, Doherty, Peak-End, Gestalt, and 17 others). Reports end with a Laws of UX Coverage table that counts violations per law.
- `knowledge/laws-of-ux.md`: 24 law entries with definitions, when-it-applies, violation examples, fix examples, and primary-source citations (Hick 1952, Fitts 1954, Miller 1956, Wertheimer 1923, Postel 1980, Sweller 1988, Iyengar 2000, and more).
- `KNOWLEDGE.laws` structured block in `lib/knowledge.js`: queryable via `queryKnowledge('laws', slug)` with 9 fields per entry (name, slug, definition, whenItApplies, violationExample, fixExample, tags, source).
- New MCP tool `uiux_laws_query` with AND-composed filters on name, dimension, surface, and cognitiveProcess.
- `uiux_audit_log` MCP tool now accepts optional `laws: string[]` on findings with soft validation against `KNOWLEDGE.laws` keys (unknown slugs are dropped with a warning, not rejected).
- `formatScoreCard` renders inline law citations (`- violates Hick's Law.`) and appends a sorted Laws of UX Coverage markdown table. Byte-compatible output for findings without `laws[]`.
- `collectLawsCoverage` helper exported from `lib/scoring.js` for direct use.
- 6 specialist agents (psychology-analyst, interaction-analyst, ux-flow-analyst, layout-analyst, accessibility-auditor, design-auditor) now load `knowledge/laws-of-ux.md` in their Required Reading.
- `knowledge/INDEX.md` manifest + agent-mapping rows updated.
- README: new "Grounded in 24 UX laws" section between "What it scores" and "Works with any stack"; expanded References section with 22 primary sources grouped by theme.
- 3 new test files (`test/knowledge-laws.test.js`, `test/scoring-citations.test.js`, `test/mcp-laws-query.test.js`) covering the 24-law contract, licensing guard, scorer propagation, renderer behavior, and MCP tool handlers.
- `.github/workflows/release.yml`: OIDC trusted publishing on `v*` tag push.

### Changed

- `createFinding` in `lib/schema.js` accepts an optional `laws: string[]` parameter and passes it through end-to-end. Empty arrays normalize to `undefined`.
- `handleAuditLog` now returns the created finding so MCP clients can inspect `laws[]` end-to-end.
- `formatScoreCard`: em-dashes swapped to hyphens in the Overall line and scoreBar fallback (user-facing copy rule).
- README: trimmed verbosity, installation paths consolidated behind `<details>`, references moved to the end in smaller type, expanded Contributing guide.
- `manifest.json` skill paths updated to `skills/<name>/SKILL.md` directory format for Claude Code plugin compatibility.
- `package.json` test script no longer quotes the glob pattern (fixes Node 18 compatibility in CI).

### Fixed

- CI workflow: test glob now expands on both Node 18 and Node 22.
- CI workflow: manifest validation now finds the correct SKILL.md paths.
- README display-name mismatches (`Pragnanz` ASCII, shortened `Tesler's Law`) resolved to match `KNOWLEDGE.laws` entries.
- `lib/scoring.js` `formatScoreCard`: `f.dimension` now safely falls back to `'general'` when callers bypass `runFullScoring`.
- `handleLawsQuery`: slug matching is now case-insensitive, consistent with the name substring match.

### Security

- Licensing guard: automated test enforces that no `source` field in `KNOWLEDGE.laws` contains a `lawsofux.com` string. All prose is authored fresh from primary sources under the project's MIT license.

## [0.1.0] - 2026-04-16

### Added

- **12-dimension scoring engine** with weighted overall grade (color, typography, layout, components, accessibility, hierarchy, interaction, responsive, polish, performance, flows, platform)
- **Color engine**: WCAG 2.1 contrast, APCA contrast, deltaE near-duplicate detection, palette generation, dark mode surfaces
- **Typography engine**: type scale detection, fluid type generation (clamp), weight strategy recommendations
- **Spacing engine**: consistency analysis, grid detection, breakpoint extraction, container width analysis
- **OKLCH parser**: modern color space support
- **Tailwind parser**: class extraction from JSX, state coverage detection, variant analysis
- **End-to-end runner**: full project audit orchestration with framework auto-detection
- **2026-aware scoring**: View Transitions API, scroll-driven CSS, container queries, @property animations, OKLCH adoption, Tailwind v4 detection
- **14 MCP tools**: scan, extract, score, generate, knowledge query, audit log/report
- **12 specialized agents**: design-auditor, color-analyst, typography-analyst, layout-analyst, component-reviewer, accessibility-auditor, interaction-analyst, psychology-analyst, visual-style-advisor, platform-advisor, ux-flow-analyst, performance-ux-analyst
- **14 slash command skills**: design-audit, color-audit, type-audit, layout-audit, a11y-audit, component-audit, flow-audit, style-direction, design-tokens, theme-builder, refactor-plan, design-score, design-compare, design-checklist
- **19 knowledge base documents** (3,081 lines): accessibility, color theory, typography theory, component patterns, platform conventions, psychology, principles, anti-patterns, dark patterns, UX flows, 2026 trends, libraries, animations, design tools, insider secrets, design engineer craft, advanced polish, evidence base
- **Evidence base** with 30+ quantified research findings and confidence levels
