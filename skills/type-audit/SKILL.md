---
name: type-audit
description: Typography-only audit covering font selection, type scale, readability, hierarchy, and performance. Use when the user asks to audit typography, run a typography or type audit, review fonts, fix their fonts, or work on the type system.
---

# /type-audit: Typography System Audit

Focused audit of the project's typography system.

## Flow

1. Extract typography values with `uiux_extract_typography`
2. Detect type scale (mathematical ratio or random)
3. Evaluate font choice, pairing, readability, hierarchy
4. Check performance (font loading, number of weights)
5. Generate improved type system with `uiux_generate_type_scale`
6. Output complete type token system

## Output

- Current type inventory (fonts, sizes, weights, line heights)
- Scale detection result
- Readability score
- Recommended type system (font, scale, hierarchy)
- Fluid typography values (clamp())
- Performance recommendations
