---
description: Run a component-quality audit — state coverage, primitive consistency, cn()/CVA patterns. Scoped variant of /ui-ux-suite:audit.
argument-hint: "[path]"
model: sonnet
allowed-tools: [mcp__ui-ux-suite__uiux_audit_run, mcp__ui-ux-suite__uiux_scan_project, mcp__ui-ux-suite__uiux_score_dimension, mcp__ui-ux-suite__uiux_knowledge_query, Read, Grep, Glob]
---

# /ui-ux-suite:components — Component-quality audit

Scoped audit on component patterns.

## What you do

1. Resolve project path.
2. Call `uiux_audit_run` with `dimensions: ["components", "interaction"]`. Component quality and interaction polish are coupled in practice.
3. Present the component section of the report.
4. Glob `src/components/ui/**` (or `components/ui/**`) to count primitives if the report flags a low primitive count.

## What component audit covers
- Presence of a `cn()` / `clsx()` / `twMerge` utility
- CVA (`class-variance-authority`) variant pattern
- shadcn/ui primitives count (via `components.json`)
- Radix / Headless UI / Ark UI usage (a11y-primitive signal)
- State coverage from className: `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`, `dark:`, `group-hover:`
- Inline-component duplication heuristic (same button styles repeated 5+ times → missing primitive)
- Icon library presence (lucide-react, heroicons, phosphor-icons, @radix-ui/react-icons)

Don't count `<div>` as "low component quality" — devs use divs for layout intentionally. Focus on primitive reuse and state coverage.
