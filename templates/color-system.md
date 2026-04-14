# Color System Recommendation

## Brand Colors
| Role | Value | Usage |
|------|-------|-------|
| Primary | {{primary}} | Main actions, links, active states |
| Primary Foreground | {{primaryFg}} | Text on primary color |

## Neutral Scale
| Step | Value | Usage |
|------|-------|-------|
{{#neutralScale}}
| {{step}} | {{hex}} | {{usage}} |
{{/neutralScale}}

## Semantic Colors
| Role | Base | Light | Dark | Usage |
|------|------|-------|------|-------|
| Success | {{success.base}} | {{success.light}} | {{success.dark}} | Confirmations, positive metrics |
| Error | {{error.base}} | {{error.light}} | {{error.dark}} | Errors, destructive actions |
| Warning | {{warning.base}} | {{warning.light}} | {{warning.dark}} | Warnings, caution states |
| Info | {{info.base}} | {{info.light}} | {{info.dark}} | Information, hints |

## Surface Colors (Light Mode)
| Surface | Value | Usage |
|---------|-------|-------|
| Background | {{light.background}} | Page background |
| Surface | {{light.surface}} | Cards, panels |
| Elevated | {{light.elevated}} | Popovers, dropdowns |
| Overlay | {{light.overlay}} | Modal backdrop |

## Surface Colors (Dark Mode)
| Surface | Value | Usage |
|---------|-------|-------|
| Background | {{dark.background}} | Page background |
| Surface | {{dark.surface}} | Cards, panels |
| Elevated | {{dark.elevated}} | Popovers, dropdowns |
| Overlay | {{dark.overlay}} | Modal backdrop |
