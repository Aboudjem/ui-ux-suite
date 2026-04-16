---
name: design-audit
description: Full project design audit — orchestrates all agents, scores across 12 dimensions, generates prioritized action plan
trigger: "audit design|design review|UX audit|how does my design look|review my UI|design audit"
---

# /design-audit — Full Project Design Audit

Run a comprehensive design audit on the current project or a specified path.

## Usage
```
/design-audit              # Audit current project
/design-audit /path/to/project  # Audit specific project
```

## Flow

1. **Scan project** — Use `uiux_scan_project` to detect framework, styling, component library, theme system
2. **Display profile** — Show the user what was detected, ask for confirmation
3. **Dispatch agents** — Launch all relevant specialist agents in parallel:
   - `color-analyst` — Color system diagnosis
   - `typography-analyst` — Typography system diagnosis
   - `layout-analyst` — Layout, spacing, grid analysis
   - `component-reviewer` — Component quality and consistency
   - `accessibility-auditor` — WCAG compliance check
   - `interaction-analyst` — Motion, transitions, feedback
   - `psychology-analyst` — Cognitive load, hierarchy, trust
   - `visual-style-advisor` — Style direction evaluation
   - `platform-advisor` — Platform convention adherence
   - `ux-flow-analyst` — Navigation and user flows
   - `performance-ux-analyst` — Loading and perceived speed
4. **Aggregate scores** — Use `uiux_score_overall` to calculate weighted total
5. **Generate report** — Full markdown report with:
   - Project design profile
   - Score card (12 dimensions)
   - Top 20 findings ranked by impact
   - Detailed per-dimension reports
   - Prioritized action plan (quick wins / medium / major)

## Agent dispatch strategy

Launch agents in parallel waves:

**Wave 1** (always): color-analyst, typography-analyst, layout-analyst, accessibility-auditor, component-reviewer
**Wave 2** (always): interaction-analyst, psychology-analyst, visual-style-advisor
**Wave 3** (if applicable): platform-advisor (if mobile/cross-platform), ux-flow-analyst (if has routing), performance-ux-analyst (if has data fetching/images)

## Output

Full audit report saved to `design-audit-report.md` in the project root.
Score card displayed inline for quick overview.
