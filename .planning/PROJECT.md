# UI/UX Design Intelligence Suite

## What This Is

A Claude Code plugin that gives any developer instant, evidence-based design auditing across 12 dimensions — color, typography, layout, accessibility, interaction quality, and more. It scans real project files (CSS, JSX, Tailwind configs), produces quantified scores (1-10 per dimension, weighted overall), and generates actionable fix recommendations with before/after code. Think "ESLint for design" — but powered by 19 knowledge base documents, 12 specialized agents, and real color science (WCAG 2.1, APCA, OKLCH, deltaE).

## Core Value

**Any developer can audit their project's design quality in one command and get a prioritized, evidence-backed action plan — no design background needed.**

## Requirements

### Validated

- ✓ 12-dimension scoring engine (color, typography, layout, components, a11y, hierarchy, interaction, responsive, polish, performance, flows, platform) — existing
- ✓ Color engine with WCAG contrast, APCA contrast, deltaE near-duplicate detection, palette generation — existing
- ✓ Typography engine with scale detection, fluid type generation, weight strategy — existing
- ✓ Spacing engine with consistency analysis, grid detection, breakpoint extraction — existing
- ✓ Tailwind class extraction and analysis from JSX — existing
- ✓ OKLCH color parser — existing
- ✓ 14 MCP tools (scan, extract, score, generate, knowledge query, audit log/report) — existing
- ✓ 12 specialized agents (design-auditor, color-analyst, typography-analyst, layout-analyst, component-reviewer, accessibility-auditor, interaction-analyst, psychology-analyst, visual-style-advisor, platform-advisor, ux-flow-analyst, performance-ux-analyst) — existing
- ✓ 14 skills (design-audit, color-audit, type-audit, layout-audit, a11y-audit, component-audit, flow-audit, style-direction, design-tokens, theme-builder, refactor-plan, design-score, design-compare, design-checklist) — existing
- ✓ 19 knowledge base documents covering accessibility, trends, principles, psychology, anti-patterns, color theory, typography theory, component patterns, platform conventions, 2026 libraries/tools/animations, insider secrets, design engineer craft — existing
- ✓ End-to-end runner that orchestrates full project audit — existing
- ✓ 2026 modern feature scoring (View Transitions API, scroll-driven CSS, container queries, @property animations, OKLCH adoption, Tailwind v4 detection) — existing
- ✓ Evidence base with quantified research findings and confidence levels — existing

### Active

- [ ] Open source packaging (README, LICENSE, CONTRIBUTING, examples, CI)
- [ ] GitHub repository creation with proper metadata
- [ ] npm publishable package configuration
- [ ] Compelling README with KPIs, evidence, visual examples
- [ ] Installation and usage documentation for all config types
- [ ] Example output / demo audit report
- [ ] GitHub Actions CI (lint, test, validate manifest)
- [ ] .gitignore cleanup and repo hygiene
- [ ] Badge system (npm, CI, license, stars)
- [ ] Social proof and discoverability optimization (SEO, topics, description)

### Out of Scope

- Web dashboard / GUI — CLI-first, plugin-first
- Paid tier / SaaS model — pure open source
- Browser extension — Claude Code plugin only for v1
- Figma integration — future consideration
- Runtime CSS injection — read-only analysis only

## Context

The plugin is already feature-complete with deep design intelligence. The gap is entirely in **packaging, documentation, and open source hygiene**. The codebase has:

- 11 JS engine modules (~2,500 lines of tested code)
- 12 agent definitions with specialized prompts
- 14 skill definitions with trigger patterns
- 19 markdown knowledge documents with research-backed content
- Evidence base with 30+ quantified findings from 2024-2026 research
- 2026-aware scoring that detects modern CSS features (View Transitions, scroll-driven animations, container queries, OKLCH)

Reference project: **sniff** (github.com/Aboudjem/sniff) — similar structure, strong README with ASCII art, badges, clear examples, one-command install.

## Constraints

- **Platform**: Claude Code plugin (manifest.json format)
- **Runtime**: Node.js (no external dependencies — zero-dep by design)
- **License**: MIT (already declared)
- **Install**: Must work via `claude plugin add` from GitHub URL
- **Compatibility**: Must work with any frontend project (React, Vue, Svelte, Angular, vanilla)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Zero dependencies | Simpler install, no supply chain risk, faster load | — Pending |
| Evidence-based README | User wants KPIs, research citations, numbers to build trust | — Pending |
| sniff-style branding | Proven approach: ASCII art, clear commands, badges, visual examples | — Pending |
| npm + GitHub dual distribution | Plugin install via GitHub, standalone use via npx | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-16 after initialization*
