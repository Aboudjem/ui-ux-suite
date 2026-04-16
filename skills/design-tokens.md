---
name: design-tokens
description: Generate or improve a complete design token system covering color, typography, spacing, radius, shadows, motion
trigger: "design tokens|generate tokens|token system"
---

# /design-tokens: Generate Design Token System

Generate a complete design token system for the project.

## Usage
```
/design-tokens                    # Auto-detect brand color, generate full system
/design-tokens #3b82f6            # Generate from specific brand color
/design-tokens --format tailwind  # Output as Tailwind config
/design-tokens --format css-vars  # Output as CSS custom properties
/design-tokens --format json      # Output as JSON tokens
```

## Flow

1. Read existing tokens/theme (if any)
2. Determine brand color (from existing or user input)
3. Generate complete token system with `uiux_generate_tokens`:
   - **Color**: primary, secondary, neutral (11 steps), semantic (success/error/warning/info), surfaces (light + dark)
   - **Typography**: font, scale (8 steps), line heights, weights
   - **Spacing**: 4px base scale (16 steps)
   - **Border radius**: 4 steps (sm, md, lg, full)
   - **Shadows**: 3 levels (sm, md, lg)
   - **Motion**: duration + easing tokens
4. Output in requested format

## Output Formats

- **css-vars**: `:root { --color-primary: ...; }` with dark mode media query
- **tailwind**: `tailwind.config.js` theme extension
- **json**: W3C Design Tokens Community Group format
- **js**: JavaScript module export
