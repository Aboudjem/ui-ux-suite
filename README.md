<div align="center">

<br />

<pre>
    ┌─────────────────────────┐
    │  ◆  ◇  ◆  ◇  ◆  ◇  ◆ │
    │                         │
    │    u i / u x  s u i t e │
    │                         │
    │  design intelligence    │
    │  for claude code        │
    │                         │
    │  ◇  ◆  ◇  ◆  ◇  ◆  ◇ │
    └─────────────────────────┘
</pre>

### ESLint for design. Powered by research, not opinions.

12 dimensions · 14 tools · 19 knowledge docs · 0 dependencies

[![npm](https://img.shields.io/npm/v/ui-ux-suite?color=cb3837&logo=npm&label=npm)](https://www.npmjs.com/package/ui-ux-suite)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-≥18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![CI](https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml)

</div>

<br />

## Install it

```bash
claude plugin add github:Aboudjem/ui-ux-suite
```

That's the whole setup. Zero config. Zero dependencies.

<br />

## What you get

Run `/design-audit` on any project and get a quantified score card across **12 design dimensions**:

```
# Design Score Card

Overall: 7.2/10 — Good

| Dimension          | Score   | Weight |
|--------------------|---------|--------|
| Color System       | 8.0/10  | 10%    |
| Typography System  | 6.5/10  | 10%    |
| Layout & Spacing   | 7.0/10  | 10%    |
| Component Quality  | 7.5/10  | 10%    |
| Accessibility      | 6.0/10  | 12%    |
| Visual Hierarchy   | 7.0/10  | 10%    |
| Interaction Quality| 8.0/10  | 8%     |
| Responsiveness     | 9.0/10  | 8%     |
| Visual Polish      | 7.5/10  | 7%     |
| Performance UX     | 7.0/10  | 5%     |
| Info Architecture  | 6.5/10  | 5%     |
| Platform Fit       | 8.0/10  | 5%     |

## Top Findings

- [!] **accessibility**: No visible focus indicators for keyboard navigation
- [!] **typography**: No consistent type scale detected — sizes appear random
- [*] **color**: 24 unique colors — too many, consolidate to a system
- [*] **accessibility**: No prefers-reduced-motion support
- [-] **color**: 6 near-duplicate colors — consolidate
```

Every finding includes **severity**, **dimension**, and **actionable fix** with before/after code.

<br />

## Why this exists

|  | Manual review | Lighthouse | **ui/ux suite** |
|--|--------------|-----------|-----------------|
| Color system analysis | Subjective | None | WCAG 2.1 + APCA dual contrast, deltaE near-duplicates, semantic role detection |
| Typography audit | Subjective | Font-size only | Scale detection, fluid type gen, weight strategy, 2026 font recs |
| Accessibility | Manual | axe-core (30-40% coverage) | Focus indicators, skip links, reduced-motion, ARIA, touch targets |
| Design tokens | N/A | N/A | Full generation: color, type, spacing, CSS vars, Tailwind format |
| Modern CSS detection | N/A | N/A | View Transitions, scroll-driven CSS, container queries, OKLCH, @property |
| Framework awareness | N/A | N/A | Auto-detects React, Vue, Svelte, Next.js, Tailwind, shadcn |
| Knowledge base | Your brain | None | 19 research docs, 3,081 lines of curated design intelligence |
| Evidence-backed | Depends | Partially | 30+ quantified findings with HIGH/MEDIUM/LOW confidence levels |

<br />

## The numbers behind it

Every recommendation is backed by research with confidence ratings:

| Finding | Value | Confidence | Source |
|---------|-------|------------|--------|
| Users form opinion in | **50ms** | HIGH | Academic research |
| Users ghost bad design | **88%** | MEDIUM | UX survey |
| ADA lawsuits 2025 H1 | **5,114** (+37% YoY) | HIGH | WebAIM, UsableNet |
| Smartphone dark mode adoption | **81.9%** | HIGH | Mobile analytics |
| Navigation design improves task completion by | **37%** | MEDIUM | UX study |
| Overlay sites in lawsuits | **22.6%** | HIGH | UsableNet 2025 |
| Automated a11y tools coverage | **30-40%** of issues | HIGH | Deque, W3C |
| Bento grid task completion improvement | **23%** | MEDIUM | UX study |
| Skeleton loading reduces abandonment | **40%** | MEDIUM | Product experiments |

Full evidence base: [`knowledge/evidence-base.md`](knowledge/evidence-base.md)

<br />

## What it checks

<table>
<tr>
<td width="50%" valign="top">

**Color System** (10%)

Contrast ratios (WCAG 2.1 + APCA), near-duplicate detection (deltaE), semantic color roles, dark mode analysis, color count, palette generation with brand color input.

</td>
<td width="50%" valign="top">

**Typography** (10%)

Scale detection (ratio analysis), font count, minimum body size, line height, fluid type generation (clamp), weight strategy recommendations.

</td>
</tr>
<tr>
<td valign="top">

**Layout & Spacing** (10%)

Spacing consistency (base unit detection), grid system analysis, breakpoint extraction, container width analysis, off-scale value flagging.

</td>
<td valign="top">

**Accessibility** (12%)

Focus indicators, skip links, alt text, reduced-motion support, ARIA usage, contrast failures, touch target sizing.

</td>
</tr>
<tr>
<td valign="top">

**Component Quality** (10%)

State coverage (hover, focus, active, disabled, loading, error), button hierarchy, form best practices, loading patterns.

</td>
<td valign="top">

**Visual Hierarchy** (10%)

Type scale consistency, information priority, scannability analysis, heading structure.

</td>
</tr>
<tr>
<td valign="top">

**Interaction Quality** (8%)

Animation timing, easing patterns, feedback presence, motion principles, Framer Motion detection.

</td>
<td valign="top">

**Responsiveness** (8%)

Breakpoint count, container queries, Tailwind responsive variant usage, media query analysis.

</td>
</tr>
<tr>
<td valign="top">

**Visual Polish** (7%)

Multi-layer shadows, @property gradients, tokenized border radii, shadow color matching.

</td>
<td valign="top">

**Performance UX** (5%)

Scroll-driven animations, View Transitions API, loading state patterns, perceived speed.

</td>
</tr>
<tr>
<td valign="top">

**Information Architecture** (5%)

Command palette detection (cmdk), i18n support, form validation (zod/yup), navigation flows.

</td>
<td valign="top">

**Platform Fit** (5%)

Dark mode toggle (next-themes), component library detection (shadcn, Radix), a11y primitives, icon system.

</td>
</tr>
</table>

<br />

## 2026-aware scoring

The suite detects modern CSS features that most tools miss:

| Feature | What it detects | Bonus applied to |
|---------|----------------|-----------------|
| View Transitions API | `@view-transition`, `::view-transition` | Interaction, Performance |
| Scroll-driven CSS | `animation-timeline: view\|scroll` | Interaction, Performance |
| Container queries | `@container` | Responsiveness |
| @property animations | `@property --*` | Visual Polish |
| OKLCH color space | `oklch()` values (50+ = adoption) | Color System |
| Tailwind v4 | `@import 'tailwindcss'`, `@theme` | Layout, Responsiveness |
| @starting-style | `@starting-style` for dialog transitions | Interaction |
| Design tokens | 100+ CSS variables | Color System |

<br />

## 14 slash commands

| Command | What it does |
|---------|-------------|
| `/design-audit` | Full 12-dimension audit with score card and action plan |
| `/design-score` | Quick overall score without detailed findings |
| `/color-audit` | Deep color system analysis — contrast, duplicates, semantics |
| `/type-audit` | Typography system — scale, fonts, sizing, line heights |
| `/layout-audit` | Spacing, grid, breakpoints, container widths |
| `/a11y-audit` | Accessibility fundamentals — WCAG compliance check |
| `/component-audit` | Component state coverage and pattern quality |
| `/flow-audit` | Navigation, user flows, information architecture |
| `/style-direction` | Style recommendation based on product type |
| `/design-tokens` | Generate complete token set (color, type, spacing) |
| `/theme-builder` | Build theme from brand color with dark mode |
| `/refactor-plan` | Prioritized action plan — quick wins to major improvements |
| `/design-compare` | Compare two projects or before/after states |
| `/design-checklist` | Pre-launch design quality checklist |

<br />

## 12 specialized agents

| Agent | Role | Model |
|-------|------|-------|
| `design-auditor` | Master orchestrator — dispatches specialists, aggregates scores | Opus |
| `color-analyst` | Color system diagnosis — contrast, harmony, palettes | Sonnet |
| `typography-analyst` | Type system — scale, readability, font recommendations | Sonnet |
| `layout-analyst` | Layout, spacing, grid, density analysis | Sonnet |
| `component-reviewer` | Component quality, state coverage, patterns | Sonnet |
| `accessibility-auditor` | WCAG compliance, focus, keyboard, ARIA | Sonnet |
| `interaction-analyst` | Motion, transitions, feedback quality | Sonnet |
| `psychology-analyst` | Cognitive load, hierarchy, trust signals | Sonnet |
| `visual-style-advisor` | Style direction evaluation and recommendations | Sonnet |
| `platform-advisor` | Platform convention adherence | Sonnet |
| `ux-flow-analyst` | Navigation and user flow analysis | Sonnet |
| `performance-ux-analyst` | Loading states, perceived speed, image handling | Sonnet |

<br />

## 14 MCP tools

| Tool | What it does |
|------|-------------|
| `uiux_scan_project` | Detect framework, styling, component lib, theme system |
| `uiux_extract_colors` | Extract all colors from CSS, Tailwind, tokens |
| `uiux_extract_typography` | Extract fonts, sizes, weights, line heights |
| `uiux_extract_spacing` | Extract padding, margin, gap values |
| `uiux_check_contrast` | WCAG 2.1 + APCA contrast for color pairs |
| `uiux_score_dimension` | Score a specific design dimension (1-10) |
| `uiux_score_overall` | Calculate weighted overall design score |
| `uiux_generate_palette` | Generate palette from brand color with dark mode |
| `uiux_generate_type_scale` | Generate type scale (fixed or fluid clamp) |
| `uiux_generate_spacing_scale` | Generate spacing scale from base unit |
| `uiux_generate_tokens` | Complete token set: color, type, spacing, CSS vars |
| `uiux_knowledge_query` | Query built-in design knowledge base |
| `uiux_audit_log` | Append finding to audit log |
| `uiux_audit_report` | Generate formatted audit report |

<br />

## 19 knowledge documents

The built-in knowledge base covers:

| Document | Lines | What it covers |
|----------|-------|---------------|
| `evidence-base.md` | Research findings with confidence levels (HIGH/MEDIUM/LOW) |
| `accessibility-guide.md` | WCAG, ARIA, focus management, screen readers |
| `color-theory.md` | Harmony, semantics, dark mode rules, product palettes |
| `typography-theory.md` | Scale ratios, font recommendations, readability |
| `component-patterns.md` | State checklist, button hierarchy, form patterns, loading |
| `platform-conventions.md` | iOS, Android, web platform-specific patterns |
| `psychology.md` | Cognitive load, Gestalt principles, trust signals |
| `principles.md` | Core design principles and heuristics |
| `anti-patterns.md` | Common design mistakes and how to avoid them |
| `dark-patterns.md` | Deceptive design patterns — detection and avoidance |
| `ux-flows.md` | Navigation patterns, onboarding, information architecture |
| `trends-2026.md` | CSS features, AI patterns, style directions rated |
| `wow-libraries-2026.md` | 15 component libraries deep-dived with recommendations |
| `wow-animations-2026.md` | Animation techniques, scroll-driven, view transitions |
| `design-tools-2026.md` | Design tooling landscape and recommendations |
| `insider-secrets-2026.md` | 35 practitioner tips from pros with 10+ years |
| `design-engineer-craft-2026.md` | Craft details from Vercel, Linear, shadcn engineers |
| `advanced-polish.md` | Shadow techniques, micro-interactions, visual refinement |
| `libraries-tools.md` | Component library comparison and selection guide |

Total: **3,081 lines** of curated, research-backed design intelligence.

<br />

## Works with everything

| Framework | Styling | Component Library |
|-----------|---------|------------------|
| React | Tailwind CSS | shadcn/ui |
| Next.js | CSS Modules | MUI |
| Vue | SCSS/Sass | Chakra UI |
| Nuxt | styled-components | Ant Design |
| Svelte | CSS-in-JS | Radix |
| Angular | Vanilla CSS | Mantine |
| Vanilla | Any | Headless UI |

Auto-detected from `package.json`, config files, and source analysis. No configuration needed.

<br />

## How it works

```
Your Project                    ui/ux suite
┌──────────┐                   ┌──────────────────────┐
│ CSS      │──extract──────────│ Color Engine          │
│ JSX/TSX  │──extract──────────│ Typography Engine     │
│ Tailwind │──extract──────────│ Spacing Engine        │
│ Config   │──detect───────────│ Framework Detection   │
└──────────┘                   │ Tailwind Parser       │
                               │ OKLCH Parser          │
                               ├──────────────────────┤
                               │ Scoring Engine        │
                               │ (12 weighted axes)    │
                               ├──────────────────────┤
                               │ 19 Knowledge Docs     │
                               │ (3,081 lines)         │
                               ├──────────────────────┤
                               │ 12 Specialized Agents │
                               │ 14 MCP Tools          │
                               └──────────┬───────────┘
                                          │
                                    Score Card
                                    + Findings
                                    + Action Plan
```

<br />

## Zero dependencies

This plugin has **zero npm dependencies**. The entire codebase is vanilla Node.js using only built-in modules (`fs`, `path`). This means:

- **Instant install** — no `node_modules` to download
- **Zero supply chain risk** — no transitive dependencies to audit
- **Maximum compatibility** — works on any Node.js 18+ installation
- **Tiny footprint** — 2,934 lines of engine code, nothing else

<br />

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for the setup guide.

Areas where help is appreciated:
- New scoring dimensions
- Framework-specific extractors
- Knowledge base additions (with citations)
- Bug reports and feature requests

<br />

## License

[MIT](LICENSE) — Adam Boudjemaa
