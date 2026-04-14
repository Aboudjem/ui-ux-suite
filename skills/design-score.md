---
name: design-score
description: Quick design score card — 12 dimensions, top 5 improvements, under 2 minutes
trigger: "design score|score my design|rate my UI|quick audit"
---

# /design-score — Quick Design Score Card

Fast score across 12 dimensions. Takes under 2 minutes.

## Flow

1. Fast scan of project styling and component files
2. Quick-score each dimension (heuristic-based, not deep audit)
3. Calculate weighted overall score
4. Identify top 5 highest-impact improvements
5. Output concise score card

## Output

```
Design Score: 7.2/10 — Good

Color System:     8/10  |########..|
Typography:       6/10  |######....|
Layout & Spacing: 7/10  |#######...|
Components:       7/10  |#######...|
Accessibility:    5/10  |#####.....|
Visual Hierarchy: 8/10  |########..|
Interaction:      6/10  |######....|
Responsiveness:   7/10  |#######...|
Visual Polish:    8/10  |########..|
Performance UX:   6/10  |######....|
IA & Flows:       7/10  |#######...|
Platform:         8/10  |########..|

Top 5 Improvements:
1. [critical] Add focus indicators for keyboard navigation
2. [important] Body text contrast is 3.2:1 — needs 4.5:1
3. [important] Consolidate 47 unique colors to ~20
4. [suggestion] Add skeleton screens for data loading
5. [suggestion] Establish consistent spacing scale (currently 23 unique values)
```
