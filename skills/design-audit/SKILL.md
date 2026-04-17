---
name: design-audit
description: Full project design audit that orchestrates all agents, scores across 12 dimensions, generates prioritized action plan
trigger: "audit design|design review|UX audit|how does my design look|review my UI|design audit"
---

# /design-audit: Full Project Design Audit

Run a comprehensive design audit on the current project or a specified path.

## Usage
```
/design-audit              # Audit current project
/design-audit /path/to/project  # Audit specific project
```

## Flow

1. **Load knowledge base** - Read the knowledge index and all 19 knowledge files:
   - Use `uiux_knowledge_query` with `listFiles: true` to get the full inventory
   - Every agent reads its assigned knowledge files (see `knowledge/INDEX.md` for the mapping)
   - The evidence base, principles, anti-patterns, and trends files are required reading for ALL agents
2. **Scan project** - Use `uiux_scan_project` to detect framework, styling, component library, theme system
3. **Display profile** - Show the user what was detected, ask for confirmation
4. **Dispatch agents** - Launch all relevant specialist agents in parallel (each reads its knowledge files first):
   - `color-analyst` - Color system diagnosis
   - `typography-analyst` - Typography system diagnosis
   - `layout-analyst` - Layout, spacing, grid analysis
   - `component-reviewer` - Component quality and consistency
   - `accessibility-auditor` - WCAG compliance check
   - `interaction-analyst` - Motion, transitions, feedback
   - `psychology-analyst` - Cognitive load, hierarchy, trust
   - `visual-style-advisor` - Style direction evaluation
   - `platform-advisor` - Platform convention adherence
   - `ux-flow-analyst` - Navigation and user flows
   - `performance-ux-analyst` - Loading and perceived speed
4. **Aggregate scores** - Use `uiux_score_overall` to calculate weighted total
5. **Generate report** - Full markdown report with:
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

Each finding may cite one or more UX laws inline (for example, `[!] psychology: 12-item nav menu - violates Hick's Law, Choice Overload`). When any finding carries laws, the report ends with a `## Laws of UX Coverage` markdown table summarizing violation counts and worst offenders per law. Agents look up law display names and primary-source citations from `knowledge/laws-of-ux.md` and the `uiux_laws_query` MCP tool.
