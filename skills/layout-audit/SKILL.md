---
name: layout-audit
description: Layout and spacing audit covering grid, spacing consistency, density, responsive behavior
trigger: "audit layout|spacing review|fix my spacing|layout audit|grid audit"
---

# /layout-audit: Layout and Spacing Audit

Focused audit of layout, spacing, grid, and responsive design.

## Flow

1. Extract spacing values with `uiux_extract_spacing`
2. Detect spacing scale and base unit
3. Evaluate grid system, density, whitespace
4. Check responsive breakpoints and container widths
5. Generate spacing scale with `uiux_generate_spacing_scale`
6. Output recommendations

## Output

- Spacing analysis (unique values, consistency score, off-grid values)
- Grid system detection
- Density assessment
- Breakpoint analysis
- Recommended spacing scale
- Container width recommendations
