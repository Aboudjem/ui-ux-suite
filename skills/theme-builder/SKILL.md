---
name: theme-builder
description: Build a light/dark theme from scratch or improve an existing one, with a complete surface, text, and interactive color system. Use when the user asks to build or create a theme, use the theme builder, or set up a light and dark theme.
---

# /theme-builder: Build or Improve Theme

Build a complete light + dark theme from a brand color, or improve an existing theme.

## Flow

1. Determine brand color and style direction
2. Generate palette with `uiux_generate_palette`:
   - Brand: primary, primary-foreground
   - Neutral: 11-step scale from lightest to darkest
   - Semantic: success, error, warning, info (each with base, light, dark)
   - Surfaces: background, surface, elevated, overlay
   - Text: primary, secondary, muted, inverse
   - Borders: default, strong, muted
   - Interactive: focus ring, selection, hover overlay
3. Generate dark mode variant (proper dark mode, not inverted)
4. Output in project-appropriate format (CSS vars, Tailwind, shadcn theme)

## Output

Complete theme configuration ready to paste into the project.
