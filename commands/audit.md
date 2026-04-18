---
description: Run a full UI/UX design audit on the current project. Scores 12 dimensions and produces a markdown report with prioritized findings.
argument-hint: "[path] [--deep] [--dimensions=color,typography,...]"
model: opus
allowed-tools: [mcp__ui-ux-suite__uiux_audit_run, mcp__ui-ux-suite__uiux_scan_project, mcp__ui-ux-suite__uiux_extract_colors, mcp__ui-ux-suite__uiux_extract_typography, mcp__ui-ux-suite__uiux_extract_spacing, mcp__ui-ux-suite__uiux_score_overall, mcp__ui-ux-suite__uiux_knowledge_query, mcp__ui-ux-suite__uiux_laws_query, Read, Grep, Glob, Bash]
---

# /ui-ux-suite:audit — Full design audit

Run a complete design audit on the user's project. This is the canonical entry point — one command, one report.

## What you do

1. **Resolve the project path.**
   - If `$ARGUMENTS` starts with a path, use it.
   - Otherwise use the current working directory (`pwd`).
   - Flags: `--deep` enables Playwright + axe-core (requires `playwright-core` + `@axe-core/playwright` peer deps). `--dimensions=color,typography,...` limits scoring.

2. **Call `uiux_audit_run`** with the resolved path and flags. This single MCP tool chains scan → extract → score → report and returns both structured JSON and markdown. It exposes `lib/runner.js:auditProject()` — the full 12-dimension pipeline including 2026 modern-CSS feature detection.

3. **If `uiux_audit_run` is unavailable** (older install, MCP bridge not running), fall back to the manual pipeline:
   - `uiux_scan_project` → `uiux_extract_colors` → `uiux_extract_typography` → `uiux_extract_spacing` → `uiux_score_overall`
   - Then consult the `design-auditor` subagent via the Task tool for specialist analysis.

4. **Present the markdown report to the user.** Do not re-summarize findings — the report is already formatted. Use the structured JSON only if the user asks for specific numbers.

5. **Offer next steps.** After showing the report, suggest the 3 highest-impact fixes and ask whether the user wants code patches.

## Principles

- **One command, one answer.** No chaining. No "which tool should I run?" decision tree.
- **Fail loud.** If stack detection returns `null` for styling/componentLib/themeSystem, say "I could not detect X because Y" (e.g., "no `package.json` found at `<path>`") — never show silent `null`.
- **Cite the report.** Every finding in the report includes a `file:line` reference. Preserve those when discussing findings.
- **Opinion over diplomacy.** Rank findings by impact on real users, not by ease of fix.

## Output shape

The `uiux_audit_run` tool returns:

```json
{
  "success": true,
  "overall": 7.4,
  "grade": "Good",
  "perDimension": { "color": 8.2, "typography": 7.1, ... },
  "topFindings": [ { "severity": "critical", "dimension": "accessibility", "msg": "...", "laws": ["fittss-law"], "file": "src/app/page.tsx:42" } ],
  "markdown": "# Design Audit Report\n...",
  "json": { /* full structured audit */ }
}
```

Show the `markdown` field. Reference `topFindings` when discussing fixes.
