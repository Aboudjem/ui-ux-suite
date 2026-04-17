---
name: design-checklist
description: Interactive pre-launch design quality checklist
trigger: "design checklist|launch checklist|pre-launch design"
---

# /design-checklist: Pre-Launch Design Checklist

Interactive checklist covering all design quality aspects before launch.

## Checklist Categories

### Visual Consistency
- [ ] Color system defined with CSS variables or tokens
- [ ] Typography scale with clear hierarchy
- [ ] Consistent spacing scale (4px or 8px base)
- [ ] Consistent border-radius
- [ ] Consistent shadow system
- [ ] Icon style consistent (all outline or all filled)
- [ ] Consistent capitalization (sentence case for UI)

### State Coverage
- [ ] Button states: hover, active, focus, disabled, loading
- [ ] Input states: focus, error, disabled, filled
- [ ] Empty states for all data views
- [ ] Loading states (skeletons or spinners)
- [ ] Error states with recovery actions
- [ ] Skeleton screens for initial load

### Responsive
- [ ] Works on mobile (375px)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1440px)
- [ ] No horizontal scroll on any breakpoint
- [ ] Touch targets 44x44 on mobile
- [ ] Text readable without zoom on mobile

### Accessibility
- [ ] Contrast ratios pass WCAG AA (4.5:1 text, 3:1 large/non-text)
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigable (all actions reachable via Tab)
- [ ] Skip-to-content link
- [ ] Alt text on images
- [ ] Form labels associated with inputs
- [ ] prefers-reduced-motion supported
- [ ] Heading hierarchy correct (h1 > h2 > h3)

### Dark Mode (if applicable)
- [ ] Proper surface hierarchy (not just inverted)
- [ ] Reduced saturation on vivid colors
- [ ] Text contrast maintained
- [ ] Images/illustrations adapt to dark

### Performance
- [ ] Images lazy loaded
- [ ] Fonts preloaded with font-display: swap
- [ ] Above-fold content loads first
- [ ] No layout shift during load

### Polish
- [ ] Favicon works at all sizes
- [ ] og:image / social sharing meta
- [ ] Custom error pages (404, 500)
- [ ] Smooth transitions on interactive elements
- [ ] Custom selection color
- [ ] Branded focus ring
- [ ] Print styles (if content is printable)

For each unchecked item, the agent provides specific fix guidance.
