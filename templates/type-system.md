# Typography System Recommendation

## Font
- **Primary:** {{fontName}} ({{fontCategory}})
- **Fallback:** {{fallbackStack}}
- **Mono:** {{monoFont}}

## Type Scale ({{scaleRatio}} — {{scaleLabel}})

| Role | Size | Line Height | Weight | Letter Spacing | Fluid |
|------|------|-------------|--------|----------------|-------|
{{#scale}}
| {{role}} | {{px}}px / {{rem}}rem | {{lineHeight}} | {{weight}} | {{letterSpacing}} | {{clamp}} |
{{/scale}}

## Weight Strategy
| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, emphasis, navigation |
| Semibold | 600 | Headings, buttons, card titles |
| Bold | 700 | Strong emphasis, hero headings |

## Loading Strategy
- `font-display: swap` on all @font-face declarations
- Preload primary font weight (400) and semibold (600)
- Use variable font if available (single file, all weights)
- Subset to Latin characters if international support not needed
