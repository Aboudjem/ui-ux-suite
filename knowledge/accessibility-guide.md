# Accessibility & Inclusive Design — Practical Guide

> Source: Deep research campaign "Accessibility & Inclusive Design (WCAG 2.2+)", April 2026
> Evidence: 25 validated chunks from W3C, WebAIM, Deque, Adrian Roselli, Sara Soueidan

---

## WCAG 2.2 (October 2023) — The Current Standard

### New AA Requirements (upgrade checklist from 2.1)
1. **2.4.11 Focus Not Obscured** — focused element must be at least partially visible (not hidden by sticky headers/footers)
2. **2.5.7 Dragging Movements** — all drag operations must have single-pointer alternatives (click to move, arrow keys)
3. **2.5.8 Target Size Minimum** — 24x24 CSS px minimum OR 24px spacing from adjacent targets
4. **3.3.8 Accessible Authentication** — no cognitive function tests (CAPTCHAs) as sole login method. Passkeys satisfy this.

### New A Requirements
5. **3.2.6 Consistent Help** — help mechanisms in same relative location across pages
6. **3.3.7 Redundant Entry** — don't re-ask for previously entered information in multi-step flows

### Removed
- **4.1.1 Parsing** — obsolete due to modern browser parsing

### WCAG 3.0 Status
- March 2026 draft released with new conformance sections
- APCA contrast not yet included
- Full release estimated 2028-2030
- Do NOT wait for WCAG 3.0 — build to WCAG 2.2 AA now

---

## APCA (Advanced Perceptual Contrast Algorithm)

### Why APCA > WCAG 2.x Contrast
WCAG 2.x contrast ratios can **pass while being unreadable** — especially on dark backgrounds. APCA produces perceptually accurate Lc values that account for font size, weight, and polarity (light-on-dark vs dark-on-light).

### APCA Lc Thresholds (memorize these 4)
| Lc Value | Use Case |
|----------|----------|
| **Lc 90** | Body text (small, normal weight) |
| **Lc 75** | Readable text (medium, UI labels, columns) |
| **Lc 60** | Non-critical text, placeholders, large body |
| **Lc 45** | Large headlines, icons, non-text elements |
| **Lc 30** | Decorative, borders, dividers |
| **Lc 15** | Minimum visible — decorative only |

### APCA Tooling (April 2026)
- Figma: Contrast plugin, Polychrom (Evil Martians)
- Stark: APCA in free tier
- Chrome DevTools: experimental APCA flag
- Not yet in any legal standard — use alongside WCAG 2.x, not instead of

---

## Focus Management

### Universal Focus Indicator (works on ALL backgrounds)
```css
:focus-visible {
  outline: 3px solid black;
  box-shadow: 0 0 0 6px white;
}
```

Enhanced "Oreo" variant for maximum visibility:
```css
:focus-visible {
  outline: 9px double black;
  box-shadow: 0 0 0 6px white;
}
```

Browser fallback:
```css
button:focus { outline: 3px solid black; }
button:focus:not(:focus-visible) { outline: none; }
button:focus-visible { outline: 3px solid black; box-shadow: 0 0 0 6px white; }
```

### Focus Trap for Modals
Use native HTML `<dialog>` with `showModal()` — provides free focus trapping, Escape-to-close, backdrop, and inert background. No library needed.

```html
<dialog id="modal" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm action</h2>
  <button onclick="this.closest('dialog').close()">Cancel</button>
  <button>Confirm</button>
</dialog>
```

### Skip Links
- First focusable element on the page
- Hidden until focused (visually)
- Targets `<main>` with tabindex="-1"

---

## ARIA Rules

### The First Rule of ARIA
"No ARIA is better than bad ARIA" — official W3C position.

### Decision Tree (before adding ARIA)
1. Can a native HTML element do this? → Use it (`<button>`, `<dialog>`, `<nav>`)
2. Does the element already have the right role? → Don't add redundant role
3. Is the content already in the DOM? → Use `aria-labelledby`, not `aria-label`
4. Does this need keyboard behavior? → ARIA doesn't add it — you must implement JS
5. None of the above → Use ARIA carefully

### Live Region Rules
- Region must exist in DOM BEFORE content changes
- If dynamically added, wait at least 2 seconds before injecting text
- Start empty, then populate
- `role="status"` = polite + atomic (status updates)
- `role="alert"` = assertive + atomic (critical warnings only)
- `aria-live="off"` still announces when element has focus

### Roving Tabindex (composite widgets)
```js
currentItem.setAttribute('tabindex', '-1');
nextItem.setAttribute('tabindex', '0');
nextItem.focus();
```

---

## Touch Targets

| Standard | Minimum Size |
|----------|-------------|
| WCAG 2.2 AA | 24x24 CSS px (or 24px spacing) |
| iOS HIG | 44x44 points |
| Material Design 3 | 48x48 dp |
| Recommendation | 44x44 CSS px for primary, 24x24 for secondary |

Spacing between targets: at least 8px.

---

## Testing Strategy

### The Accessibility Testing Pyramid
1. **Base: Design tokens** — enforce contrast at the source (prevent issues)
2. **Middle: Automated CI** — axe-core + Pa11y catch ~35% of issues on every commit
3. **Top: Manual testing** — screen readers, keyboard, cognitive review (catches remaining 65%)

### Automated Tools
| Tool | Coverage | Strengths |
|------|----------|-----------|
| axe-core | ~57% of issues | Zero false positives, powers Lighthouse |
| Pa11y | Complementary | Great for CI, different rule set |
| Lighthouse | WCAG-aligned | Built into Chrome |
| jest-axe | Component-level | Integrates with test suites |

Combined axe + Pa11y: ~35% coverage. The remaining 60-70% require manual testing.

### Screen Reader Testing Priority
1. NVDA + Chrome/Firefox (Windows) — strict DOM compliance, exposes real issues
2. VoiceOver + Safari (macOS/iOS) — always test
3. JAWS + Chrome/Edge (Windows) — enterprise contexts (compensates for bad markup — test with NVDA first)
4. TalkBack + Chrome (Android) — mobile apps

---

## Legal Landscape (April 2026)

| Jurisdiction | Key Facts |
|-------------|-----------|
| **ADA (US)** | 5,114 lawsuits in first half 2025 (+37% YoY). 45-46% target previously-sued companies. 22.6% target overlay-using sites. |
| **EAA (EU)** | Enforcement active since June 2025. Fines up to 3M EUR or 4% revenue. Each member state sets own penalties. |
| **FTC (US)** | Fined accessiBe $1M for false advertising. Overlays are legal liability, not protection. |
| **ADA Title II** | Deadline April 24, 2026 for public entities 50K+ population — WCAG 2.1 AA. |

---

## Quick Wins (high impact, low effort)

1. Add `:focus-visible` ring with brand color (2px solid, 2px offset)
2. Add skip-to-content link as first focusable element
3. Add `alt=""` to decorative images, descriptive alt to informational
4. Add `aria-label` to icon-only buttons
5. Add `prefers-reduced-motion` media query (no-motion-first approach)
6. Use semantic HTML landmarks (`<nav>`, `<main>`, `<header>`, `<footer>`)
7. Ensure form inputs have `<label for="id">` associations
8. Replace fixed `height` with `min-height` (zoom testing)
9. Add `autocomplete` attributes on common fields (name, email, tel)
10. Use `<dialog>.showModal()` instead of focus-trap libraries

---

## Design Tokens as Accessibility Guardrails

Define color tokens as verified contrast pairs:
```json
{
  "color-text-primary": { "value": "#1a1a1a", "apca-pair": "color-bg-primary", "lc": 90 },
  "color-bg-primary": { "value": "#ffffff" },
  "color-text-on-brand": { "value": "#ffffff", "apca-pair": "color-bg-brand", "lc": 78 },
  "color-bg-brand": { "value": "#2563eb" }
}
```

CI blocks merges on contrast violations. Eliminates entire categories of a11y bugs before they reach QA.

---

## Key Gotchas

- WCAG 2.x contrast can PASS while being unreadable on dark backgrounds — use APCA alongside
- `:focus-visible` heuristics are inconsistent across browsers — always test cross-browser
- Overlays increase lawsuit risk (22.6% of suits target overlay sites)
- JAWS compensates for bad markup — always test with NVDA first
- Zoom triggers responsive breakpoints (768px breakpoint fires at 200% on 1536px display)
- APG patterns are aspirational, not required — native HTML conforming to WCAG is valid
