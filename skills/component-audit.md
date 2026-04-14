---
name: component-audit
description: Component consistency audit — state coverage, hierarchy, patterns
trigger: "component audit|UI consistency|component review"
---

# /component-audit — Component Consistency Audit

Focused audit of UI component quality using the `component-reviewer` agent.

## Flow

1. Inventory all UI components (Glob for component files)
2. Check state coverage per component type
3. Evaluate button hierarchy
4. Audit form quality
5. Check empty, loading, and error states
6. Assess cross-component consistency
7. Output findings with improvement suggestions

## Output

- Component inventory
- State coverage matrix (component x state)
- Button hierarchy assessment
- Form quality score
- Missing states per component
- Consistency findings
