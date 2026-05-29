# AGENTS.md — ui-ux-suite

> Guidance for AI coding agents working with or invoking this repo. Companion to
> [README.md](README.md) (which is for humans). This file follows the
> [AGENTS.md](https://agents.md/) convention: standard Markdown, no required fields.

## What this tool is

ui-ux-suite is a zero-dependency design linter. It audits a project's CSS, JSX, HTML, and
Tailwind config and returns findings that are **located** (`file:line` + selector),
**measured** (the real wrong value), and **fixed** (a concrete `before` → `after`), across
12 design dimensions grounded in WCAG 2.2, APCA contrast, and the Laws of UX. It is
**audit-then-suggest**: every run is read-only and never edits the audited project.

## How an AI agent should invoke it

### Preferred: the MCP tool `uiux_audit_run`

The MCP server runs over stdio with zero dependencies. Start it with `npx ui-ux-suite --mcp`,
then call the `uiux_audit_run` tool. Arguments:

- `projectPath` (string, default `cwd`) — the directory to audit.
- `dimensions` (string[], optional) — scope to specific dimensions; omit for all 12.
- `depth` (`"quick"` | `"deep"`, default `"quick"`) — `"deep"` needs a `baseUrl` and the
  optional peer deps; otherwise use `"quick"` (static, no browser).
- `baseUrl` (string, optional) — running app URL for deep mode.
- `format` (`"full"` | `"summary"` | `"json"`, default `"full"`).

The result includes `scoreCard.overall`, `scoreCard.grade`, `scoreCard.dimensions[]`, and
`scoreCard.topFindings[]`. Each finding carries
`evidence: { file, line, col, selector, measured, threshold }`, a `fix`, `before`/`after`,
and a citation (`wcag: []` success criteria and/or `laws: []` slugs).

When `insufficientEvidence` is `true`, `overall`/`grade` are `null` and there are no
findings — report that the project lacked enough evidence rather than inventing a score.

Other useful tools: `uiux_scan_project` (stack detection), `uiux_check_contrast` (WCAG +
APCA for a color pair), `uiux_extract_colors` / `uiux_extract_typography` /
`uiux_extract_spacing` (values with file/line/selector), `uiux_score_dimension`,
`uiux_score_overall`, `uiux_laws_query`, `uiux_knowledge_query`.

### Alternative: the CLI

```bash
npx ui-ux-suite .                      # human-readable report
npx ui-ux-suite . --json | jq          # machine-readable JSON (banner → stderr)
npx ui-ux-suite . --html report.html   # standalone HTML report
npx ui-ux-suite . --fail-under 7        # CI gate
```

Exit codes: `0` ok · `1` audit error or below `--fail-under` · `2` path not found ·
`3` insufficient evidence. The `--json` stream is a clean document on stdout (the banner is
written to stderr), so it is safe to pipe into `jq` or any parser.

## Self-contained facts an agent can rely on

- **Read-only.** The audit creates, edits, and deletes nothing under the audited path.
  Applying a fix is a separate, explicit action the user must request.
- **Zero runtime dependencies.** Node built-ins only. `playwright-core` and
  `@axe-core/playwright` are optional peer deps for deep mode only.
- **Citations are pinned.** UX-law slugs come from an allow-list verified against
  lawsofux.com; accessibility findings cite a WCAG success criterion (e.g. `1.4.3`,
  `1.4.11`, `2.5.8`, `2.4.7`, `1.1.1`, `3.3.2`), not a UX law. A wrong citation is treated
  as worse than none.
- **Frameworks.** React, Next.js, Vue, Svelte, Angular, vanilla. Styling: Tailwind v3/v4,
  CSS Modules, SCSS, styled-components, Emotion, vanilla-extract, plain CSS. Auto-detected.

## Project layout

```
bin/ui-ux-suite.js   CLI entry (audit + --mcp + --json + --html + --fail-under)
lib/                 Engine: runner, scoring, located-audit, color/type/spacing engines,
                     static-contrast, locator, schema, mcp-server
skills/              14 Claude Code skills (each skills/<name>/SKILL.md)
agents/              12 specialist agents
commands/            5 top-level slash commands
knowledge/           21 evidence-backed knowledge docs
templates/           report templates
test/                node:test suites + test/fixtures/planted-ux-problems (regression gate)
```

## Build, test, validate

```bash
npm test                         # full suite (node:test, zero deps)
node --test test/<file>.test.js  # run a single test file
claude plugin validate .          # validate the Claude Code plugin + marketplace (exit 0 = ok)
```

## Done criteria for a change

- Tests pass (`npm test`), including the 12-problem fixture regression gate.
- Every emitted finding carries `evidence.file`, `evidence.line`, and a `fix`.
- No new runtime dependencies.
- `claude plugin validate .` exits 0.

## Commit conventions

Commit under the maintainer's git identity. Conventional, imperative subject lines
(`fix:`, `feat:`, `docs:`). No em-dashes in user-facing copy.

## Ecosystem

Part of the [10x Claude Code plugin marketplace](https://github.com/Aboudjem/10x). Install all marketplace tools with:

```bash
claude plugin marketplace add Aboudjem/10x
```
