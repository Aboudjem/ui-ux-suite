# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-09-02

CI surfaces, install surfaces, and a new visual identity. The engine and the 12 weights are
unchanged; the suite grows from 311 to 356 tests across 28 test files.

### Added

- **`--sarif FILE`** writes SARIF 2.1.0 for GitHub code scanning, one rule per dimension that
  produced a finding, with a location only where the evidence names a real file. Validated
  against the OASIS 2.1.0 schema. `lib/report-sarif.js`, `test/report-sarif.test.js`.
- **Baseline gating.** `--write-baseline FILE` records today's findings and score, then
  `--baseline FILE --fail-on-regression` exits 1 only on a new finding or a score drop, so a
  project already in debt can still gate on new problems. `lib/baseline.js`, `test/baseline.test.js`.
- **Rule tags.** `--tags` and `--exclude-tags` filter findings by `dimension:`, `severity:`,
  `wcag:` plus a conformance level, `law:` and `nielsen:`, all derived from what each finding
  already cites. `--list-tags` prints the vocabulary a run produced. Filtering never recomputes
  the score and never reaches the baseline. `lib/tags.js`, `test/tags.test.js`.
- **`npx skills add Aboudjem/ui-ux-suite`** as the primary path for any agent that is not Claude
  Code, covering 70+ agents. `install.sh` now delegates to it, and `--legacy` keeps the original
  symlink behavior for machines with no npx. New `--global` passes `-g`.
- **`docs/editors.md`**, a 16-agent install table plus MCP snippets for Claude Code, Cursor,
  VS Code, Codex, Gemini CLI, Windsurf, Continue, OpenCode and Zed.
- **`docs/cli.md`, `docs/scoring.md`, `docs/science.md`, `docs/faq.md`, `docs/comparison.md`**,
  holding the flag reference, the 12 weights, the WCAG and UX-law citations, the FAQ and the
  comparison table that used to live in the README.
- **`server.json`** for the Official MCP Registry, and a PNG logo mark at 1024 and 512.

### Changed

- **New visual identity.** Neon Noir hero banners for the README, the logo banners and the
  scorecard diagrams restyled in place at the same filenames and viewBoxes, and a re-rendered
  1280x640 social preview with the logo mark composited in.
- **README rewritten** from 382 lines to 167, to the plugin skeleton: one first screen, one
  install block above the first heading, one editor table in place of the 87-line install matrix,
  and one verbatim finding kept above the fold. The four translations under `READMEs/` are
  refreshed from it.
- **Skill frontmatter follows the spec.** The non-spec `trigger:` and `when_to_use:` keys are
  gone from all 14 `SKILL.md` files and their phrasing is folded into `description:`.
- **Contributing** moved out of the README into `CONTRIBUTING.md`, which now states the four
  rules a PR is sent back for.

### Fixed

- **A tag filter no longer reaches the baseline.** `--tags` ran before the baseline was built, so
  a narrowed `--write-baseline` recorded a partial baseline and a narrowed run could hide a
  regression outside the filter. The CLI now snapshots the audit before filtering, and both
  writes and compares that snapshot.
- **The CLI resolved its project path** by excluding only the values of `--html` and
  `--fail-under`, so `--sarif out.sarif` would have audited `out.sarif`. Replaced with one parser
  that consumes every value flag.
- **SARIF conformance.** The run now declares `columnKind`, `artifactLocation.uri` is
  percent-encoded, and a failed SARIF write exits 1 instead of printing a note and exiting 0.
- **Aggregate findings carry no `dimension` field**, so half the SARIF results would have shipped
  an empty `ruleId`. All three new modules fall back to the dimension they were scored under.
- **Version parity.** `plugin.json` was 0.5.0 while `package.json` was 0.5.1, which failed the CI
  manifest check. All five version-carrying files now move together.

## [0.5.0] - 2026-05-30

Portability and discoverability pass. No engine behaviour changes; the 311-test suite stays green.

### Added

- **Multi-CLI installers.** `install.sh` (POSIX) and `install.ps1` (PowerShell) symlink the 14 skills into a target CLI's skills directory (Gemini, Codex, OpenCode, Pi, Vibe, VS Code/Copilot, Trae, OpenClaw, Antigravity, Hermes, Cline, Kimi), with `--update` and `--uninstall`. The MCP server (`npx ui-ux-suite --mcp`) remains the universal fallback.
- **Dual-mode discovery manifests.** `.cursor-plugin/plugin.json` and `.copilot-plugin/plugin.json` mirror `.claude-plugin/plugin.json` (name, version, description, author, homepage, repository, license, keywords, skills) and each carry an `mcp` block for the `npx ui-ux-suite --mcp` server.
- **GitHub Pages site.** `site/index.html` (dark landing page) deployed by `.github/workflows/deploy-pages.yml`, reusing the shipped `demo.gif` and the `docs/demo/sample-audit.html` sample report.
- **Localized READMEs.** Full translations under `READMEs/` (zh-CN, ja, es, fr) with a language-switcher row, an install matrix, and a Star History chart added to the English README.
- **Contributor notes** in `CLAUDE.md`: the host-agnostic-agents rationale, the installer target-dir table, the manifests-to-keep-in-sync list, and a version-bump checklist.

### Changed

- **Host-agnostic agents.** Dropped the `model:` frontmatter from all 12 agents so each host CLI uses its own default model. Frontmatter keeps `name`, `description`, and `tools`. The deeper-reasoning intent for `design-auditor` and `psychology-analyst` is now documented in `CLAUDE.md`, not pinned in frontmatter.
- Demo video and a CI-status badge in the README; published the 311-test count.
- Aligned the dimension labels in the docs to the schema.
- Corrected the scorecard SVGs: removed a non-existent `/uiux-fix` command and emoji (the tool is audit-only).

### Removed

- The stray `.claude-plugin/marketplace.json` and the README "Or directly from this repo" self-marketplace install block. The 10x hub (`claude plugin marketplace add Aboudjem/10x`) is the canonical marketplace.
- Internal rebuild docs and audit artifacts.

### Fixed

- `.github/FUNDING.yml` now points at `Aboudjem` (the previous `adamboudj` handle 404'd).
- Removed em-dashes from `CLAUDE.md`, `docs/VIDEO-EMBED.md`, and the user-facing templates (`audit-report.md`, `score-card.md`, `type-system.md`).
- Animated SVGs now respect `prefers-reduced-motion`.

## [0.4.1] - 2026-05-28

### Changed

- Bumped all version references to 0.4.1 (plugin.json, package.json, marketplace.json).
- Fixed stale WCAG 2.1 references in package.json description to WCAG 2.2 (consistent with README, llms.txt, AGENTS.md, and the engine behaviour since v0.4.0).
- Updated knowledge document counts from 19 to 21 throughout (lib/mcp-server.js, skills/design-audit/SKILL.md, CONTRIBUTING.md, CLAUDE.md).
- Fixed CONTRIBUTING.md: corrected MCP tool count (14→16), command count (14→5), removed reference to deleted root manifest.json.
- Replaced full Contributor Covenant body in CODE_OF_CONDUCT.md with the by-reference form (pledge + link + contact).
- Removed hardcoded version from templates/audit-report.md footer (no-drift).
- Updated social-preview.svg version badge text from v0.2.0 to v0.4.1.
- Added "Part of the 10x marketplace" cross-link to llms.txt and AGENTS.md.
- Linked docs/demo/ sample files from README near the top.
- Added markdown link-check and secret scan steps to CI workflow.

## [0.4.0] - 2026-05-29

### Added: the specificity rebuild

- **Located + measured + fixed findings.** Every emitted finding now carries
  `evidence: { file, line, col, selector, measured, threshold }` plus a concrete `fix` and a
  `before`/`after`. On the 12-problem planted fixture (`test/fixtures/planted-ux-problems/`),
  specificity rose from **0/12 to 12/12**: each problem is now detected **and** located **and**
  measured **and** fixed. The extractors carry `{value, file, line, col, selector}` from source
  through scoring instead of concatenating all CSS into one blob and emitting bare
  `{severity, msg}` strings.
- **Static contrast engine (WCAG 2.2 + APCA).** Source-based contrast is computed directly from
  CSS without a browser: WCAG 2.2 ratios and APCA Lc, with the real measured value reported in
  each finding (e.g. `.hero-subtitle` `#fbfbfb` on `#ffffff` = `1.03:1`).
- **Standalone HTML report** via `--html FILE`: a dark-theme report with the ranked findings.
- **CLI flags + exit codes.** `--json` (clean document on stdout, banner to stderr for `| jq`),
  `--fail-under N` (CI gate), `--html FILE`, `--mcp`. Exit codes: `0` ok · `1` audit error or
  below `--fail-under` · `2` path not found · `3` insufficient evidence.
- **Zero-evidence guard.** When a project lacks enough evidence to score, the audit returns
  `insufficientEvidence: true` with `overall`/`grade` set to `null` and no findings, instead of
  emitting a misleadingly confident number.

### Changed

- **Corrected UX-law citations.** Fixed the broken `von-restorff` slug to `von-restorff-effect`,
  stored the canonical `law-of-pragnanz` deep-link URL (Law of Prägnanz), and stopped tagging
  accessibility findings with UX laws; those now cite the WCAG success criterion (`1.4.3`,
  `1.4.11`, `2.5.8`, `2.4.7`, `1.1.1`, `3.3.2`). A pinned allow-list test fails if any emitted
  `laws:[...]` value is not a verified slug.
- **Audit-then-suggest formalized.** The audit path is strictly read-only; a test asserts an
  audit run creates or modifies no files under the audited project.

### Fixed

- **`claude plugin validate` blocker.** Changed `.claude-plugin/marketplace.json` `source`
  from `"."` to `"./"` (single-plugin marketplaces require the `./` prefix), renamed the
  `skills/design-audit/SKILL.md` frontmatter key `trigger:` to the official `when_to_use:`, and
  removed the legacy root `manifest.json`. `claude plugin validate .` now passes (exit 0).

## [0.3.0] - 2026-04-18

### Added: v1.1 UX Rework

- **Five slash commands** at the plugin root: `/ui-ux-suite:audit` (full 12-dimension audit), `/ui-ux-suite:colors`, `/ui-ux-suite:a11y`, `/ui-ux-suite:typography`, `/ui-ux-suite:components`. Each dispatches to the single `uiux_audit_run` MCP tool with scoped `dimensions`, so users get one command, one report, no tool-chaining.
- **New MCP tool `uiux_audit_run`**: single entry point that exposes the full `lib/runner.js:auditProject` pipeline. Returns structured JSON + formatted markdown in one call. Supports `projectPath` (defaults to `cwd`), `dimensions` (scope), `depth: "quick"|"deep"`, `baseUrl`, and `format: "full"|"summary"|"json"`.
- **Eight new dimension scorers** in `lib/scoring.js`: `components`, `hierarchy`, `interaction`, `responsive`, `polish`, `performance`, `flows`, `platform`. Each returns `{ score, findings, confidence }` where `confidence` is `high|medium|insufficient`; the first two dimensions previously silently failed with "No scorer for dimension", but now all 12 work. Exports `ALL_SCORERS`.
- **Tailwind v4 `@theme` and `@theme inline` parser** in `lib/theme-parser.js`: hand-rolled CSS block extractor with brace-depth, string, and comment tracking. Zero dependencies. Categorizes declarations into colors, fonts, radii, shadows, spacing, breakpoints, and other.
- **Honest stack detection** in `lib/extractors.js`: `detectStyling` now differentiates `tailwind-v3` from `tailwind-v4` via the version in `package.json` and flags `panda-css`, `vanilla-extract`, `stitches`. New `detectAnimationLib`, `detectIconLib`, and `detectThemeSystemDetails` functions report which component, theme, and icon libraries a project uses.
- **TSX/JSX/Vue/Svelte className extraction** in `lib/tailwind-parser.js`: balanced-brace capture handles JSX expression containers, ternaries, template literals (including `${...}` embedded expressions), and `cn()`/`clsx()`/`cva()`/`twMerge()`/`tv()` calls. Adds Vue `:class` binding and Svelte `class:foo` directive support.
- **Breakpoint bucketing** via `bucketByBreakpoint(classes)` and `analyzeResponsiveCoverage(classes)`: sorts classes into `base`/`sm`/`md`/`lg`/`xl`/`2xl`, surfaces `distinctBreakpoints` and `ratioResponsive` for the new responsive scorer.
- **Arbitrary-value flagging** via `flagArbitraryValues(classes)`: detects `text-[10px]`, `p-[13px]`, etc. and reports them as off-scale usage for the polish scorer.
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
