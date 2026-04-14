---
name: a11y-audit
description: Accessibility audit — WCAG 2.2, contrast, focus, keyboard, screen reader, touch targets
trigger: "accessibility audit|a11y review|WCAG check|accessibility check|a11y audit"
---

# /a11y-audit — Accessibility Audit

Focused accessibility audit using the `accessibility-auditor` agent.

## Flow

1. Check contrast ratios with `uiux_check_contrast`
2. Audit focus indicators (grep for :focus, outline patterns)
3. Check touch targets
4. Evaluate heading structure
5. Check ARIA usage
6. Check keyboard navigation patterns
7. Check motion sensitivity support
8. Output severity-ranked findings with specific fixes

## Output

- Contrast audit results (WCAG AA/AAA + APCA)
- Focus indicator assessment
- Keyboard navigation assessment
- Screen reader readiness
- Touch target analysis
- Quick wins list (high-impact, low-effort fixes)
- Full findings ranked by severity
