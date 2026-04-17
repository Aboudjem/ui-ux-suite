# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
