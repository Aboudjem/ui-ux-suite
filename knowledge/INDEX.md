# Knowledge Base Index

This index maps every knowledge file to the agents and dimensions that should read it during audits.

## File Manifest

| File | Topics | Used By Agents |
|:-----|:-------|:---------------|
| `evidence-base.md` | statistics, research, citations | all agents |
| `accessibility-guide.md` | WCAG, ARIA, focus, screen readers | accessibility-auditor, component-reviewer |
| `color-theory.md` | harmony, contrast, semantics, dark mode | color-analyst, visual-style-advisor |
| `typography-theory.md` | scale, fonts, readability, line height | typography-analyst |
| `component-patterns.md` | states, buttons, forms, loading | component-reviewer, interaction-analyst |
| `platform-conventions.md` | iOS, Android, web patterns | platform-advisor |
| `psychology.md` | cognitive load, Gestalt, trust, persuasion | psychology-analyst |
| `principles.md` | design heuristics, core rules | design-auditor, all agents |
| `anti-patterns.md` | common mistakes, what to avoid | all agents |
| `dark-patterns.md` | deceptive design, manipulation detection | psychology-analyst, accessibility-auditor |
| `ux-flows.md` | navigation, onboarding, IA | ux-flow-analyst |
| `trends-2026.md` | modern CSS, View Transitions, OKLCH | all agents |
| `wow-libraries-2026.md` | component libraries, shadcn, Radix | component-reviewer, visual-style-advisor |
| `wow-animations-2026.md` | scroll-driven, view transitions, motion | interaction-analyst, performance-ux-analyst |
| `design-tools-2026.md` | tooling landscape, Figma, Storybook | visual-style-advisor |
| `insider-secrets-2026.md` | practitioner tips, craft details | all agents |
| `design-engineer-craft-2026.md` | Vercel, Linear, shadcn engineering | visual-style-advisor, component-reviewer |
| `advanced-polish.md` | shadows, micro-interactions, refinement | visual-style-advisor, interaction-analyst |
| `libraries-tools.md` | component library comparison | component-reviewer, platform-advisor |

## Agent-to-Knowledge Mapping

### design-auditor (orchestrator)
Read before every audit: `principles.md`, `evidence-base.md`, `anti-patterns.md`, `trends-2026.md`

### color-analyst
Read: `color-theory.md`, `evidence-base.md`, `trends-2026.md`

### typography-analyst
Read: `typography-theory.md`, `evidence-base.md`

### layout-analyst
Read: `principles.md`, `evidence-base.md`

### accessibility-auditor
Read: `accessibility-guide.md`, `dark-patterns.md`, `evidence-base.md`

### component-reviewer
Read: `component-patterns.md`, `libraries-tools.md`, `wow-libraries-2026.md`

### interaction-analyst
Read: `wow-animations-2026.md`, `advanced-polish.md`, `trends-2026.md`

### psychology-analyst
Read: `psychology.md`, `dark-patterns.md`, `evidence-base.md`

### visual-style-advisor
Read: `advanced-polish.md`, `design-engineer-craft-2026.md`, `design-tools-2026.md`, `insider-secrets-2026.md`

### platform-advisor
Read: `platform-conventions.md`, `libraries-tools.md`

### ux-flow-analyst
Read: `ux-flows.md`, `psychology.md`

### performance-ux-analyst
Read: `wow-animations-2026.md`, `trends-2026.md`
