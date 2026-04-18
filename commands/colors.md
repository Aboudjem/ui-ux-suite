---
description: Run a color-only design audit — contrast, near-duplicates, dark mode, semantic coverage. Scoped variant of /ui-ux-suite:audit.
argument-hint: "[path]"
model: sonnet
allowed-tools: [mcp__ui-ux-suite__uiux_audit_run, mcp__ui-ux-suite__uiux_extract_colors, mcp__ui-ux-suite__uiux_check_contrast, mcp__ui-ux-suite__uiux_score_dimension, mcp__ui-ux-suite__uiux_knowledge_query, Read, Grep, Glob]
---

# /ui-ux-suite:colors — Color-only audit

Scoped audit focused on color system quality.

## What you do

1. Resolve project path (`$ARGUMENTS` or cwd).
2. Call `uiux_audit_run` with `dimensions: ["color"]` — this runs only color extraction and scoring, producing a focused report.
3. If the structured result shows contrast failures, run `uiux_check_contrast` on the top 5 flagged pairs to give the user exact WCAG and APCA numbers.
4. Present the color section of the markdown report.
5. Offer palette suggestions via the color-analyst agent if the score is below 7.

## What color audit covers
- WCAG 2.1 contrast (AA + AAA) and APCA Lc values
- Near-duplicate detection via deltaE (< 3.0 flagged)
- Color-count hygiene (too many or too few)
- Semantic coverage (primary, success, warning, destructive)
- Dark mode presence
- OKLCH adoption (2026 modern signal)
- CSS variable coverage

Keep it tight — just colors. For a full audit, tell the user to run `/ui-ux-suite:audit`.
