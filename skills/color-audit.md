---
name: color-audit
description: Color-only audit — extract, evaluate, and recommend improvements for the project's color system
trigger: "audit colors|color review|fix my colors|color palette|color system|color audit"
---

# /color-audit — Color System Audit

Focused audit of the project's color system.

## Flow

1. Extract all colors with `uiux_extract_colors`
2. Map color roles (primary, secondary, neutral, semantic, surface, text)
3. Check contrast ratios for all foreground/background pairs with `uiux_check_contrast`
4. Evaluate harmony, consistency, coverage, dark mode
5. Generate improved color system with `uiux_generate_palette`
6. Output light + dark mode palettes with token values

## Output

- Current color inventory (unique colors, near-duplicates, CSS variables)
- Contrast audit (WCAG + APCA for all pairs)
- Harmony analysis
- Semantic role coverage
- Recommended complete color system (CSS vars or Tailwind config)
- Light + dark mode palettes
