---
description: Run a typography-only audit — scale detection, font count, body size, line height, fluid type. Scoped variant of /ui-ux-suite:audit.
argument-hint: "[path]"
model: sonnet
allowed-tools: [mcp__ui-ux-suite__uiux_audit_run, mcp__ui-ux-suite__uiux_extract_typography, mcp__ui-ux-suite__uiux_generate_type_scale, mcp__ui-ux-suite__uiux_score_dimension, mcp__ui-ux-suite__uiux_knowledge_query, Read, Grep, Glob]
---

# /ui-ux-suite:typography — Typography-only audit

Scoped audit on typographic hygiene.

## What you do

1. Resolve project path.
2. Call `uiux_audit_run` with `dimensions: ["typography", "hierarchy"]`. Hierarchy scoring depends on type-scale detection so they pair naturally.
3. Present the typography section of the report.
4. If body text is under 16px or no type scale is detected, offer to generate a fluid scale via `uiux_generate_type_scale`.

## What typography audit covers
- Detected type scale (ratio 1.125 / 1.2 / 1.25 / 1.333 / 1.5 etc.)
- Font count (flags > 2 families)
- Body text size (warns < 16px, critical < 14px)
- Line height (warns < 1.5 on body)
- Font-weight strategy (light/regular/bold balance)
- Fluid type via `clamp()` (2026 modern signal)
- `next/font` / geist usage (performance signal)
- Hierarchy signals (h1/h2/h3 ratios, single-h1-per-page expectation)

Offer a generated scale only when the user's current setup is demonstrably off — don't "recommend" a scale when one exists.
