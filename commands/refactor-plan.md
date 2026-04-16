---
name: refactor-plan
description: Prioritized redesign action plan with quick wins, medium effort, and major rework
trigger: "refactor plan|redesign plan|improvement plan|what should I fix first"
---

# /refactor-plan: Prioritized Redesign Plan

Generate a prioritized action plan for improving the project's design.

## Flow

1. Run quick audit across all dimensions (fast scan, not deep)
2. Score each dimension
3. Rank findings by: user impact x (1 / effort)
4. Group into phases:
   - **Quick Wins** (< 1 hour): contrast fixes, focus rings, font-display swap, semantic HTML
   - **Medium Effort** (1-4 hours): spacing consolidation, type scale, color system, loading states
   - **Major Rework** (4+ hours): full theme rebuild, component state coverage, responsive overhaul, dark mode
5. Output phased action plan

## Output

Prioritized action plan with specific tasks, effort estimates, and expected impact.
