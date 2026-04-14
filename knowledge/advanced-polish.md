# Advanced Polish — Design "Cheatcodes"

> Subtle details that separate good UI from world-class. Each is implementable with CSS/JS.

---

## Premium Polish Checklist

### Colors & Surfaces
- Slightly warm neutral palette instead of pure gray (adds personality without distraction)
- 1px subtle border on cards in light mode (adds definition without heavy shadows)
- Custom selection color matching brand: `::selection { background: oklch(85% 0.15 250); }`
- Caret color on inputs: `caret-color: var(--color-primary);`
- Never pure black (#000) for text — use #1a1a1a or brand-tinted dark

### Shapes & Borders
- Border-radius consistency: pick ONE value and scale it (4, 8, 12, 16)
- Nested border-radius math: outer = inner + padding (prevents visual mismatch)
- Subtle box-shadow system: 3 levels (sm/md/lg) with consistent color and direction

### Typography Details
- `font-variant-numeric: tabular-nums` in data tables and counters (columns align)
- `text-wrap: balance` on headings (even line lengths)
- `-webkit-font-smoothing: antialiased` on macOS (smoother rendering)
- Consistent capitalization: sentence case for UI, title case only for proper nouns
- Optical sizing for variable fonts: `font-optical-sizing: auto`

### Interactive Elements
- Smooth transitions on ALL interactive elements (150-200ms ease-out)
- Button padding: slightly wider horizontally than vertically (e.g., 12px 20px not 16px 16px)
- Input fields same height as adjacent buttons (alignment)
- Focus ring matching brand color (not default blue): `outline: 2px solid var(--color-primary); outline-offset: 2px`
- Custom scrollbar styling (subtle, matches theme)

### Feedback & States
- Toast notifications that auto-dismiss but pause on hover
- Proper text truncation with ellipsis AND title attributes
- Links distinguishable without color alone (underline + color)
- Smooth scroll: `scroll-behavior: smooth` with `prefers-reduced-motion` fallback

### Content & Data
- Number formatting locale-aware: `Intl.NumberFormat`
- Date formatting context-aware: "today", "yesterday", full date for older
- Responsive images with srcset/sizes
- Skeleton placeholders matching actual content dimensions

### Meta & Launch
- Favicon working at all sizes (including SVG favicon with dark mode support)
- og:image / social sharing meta configured
- Custom error pages (404, 500) maintaining brand with recovery options
- Print styles for printable content

---

## Shadow Systems

### Three-Level Shadow Scale
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
```

### Colored Shadows (premium feel)
```css
.card-primary {
  box-shadow: 0 4px 14px 0 oklch(60% 0.15 250 / 0.25);
}
```

### Dark Mode Shadows
- Shadows less visible on dark backgrounds — use border + subtle glow instead
- `box-shadow: 0 0 0 1px rgb(255 255 255 / 0.1)` for card edges

---

## Border Radius System

```css
:root {
  --radius-sm: 4px;   /* Small elements: badges, tags, chips */
  --radius-md: 8px;   /* Default: buttons, inputs, cards */
  --radius-lg: 12px;  /* Larger elements: modals, panels */
  --radius-xl: 16px;  /* Feature cards, hero sections */
  --radius-full: 9999px; /* Pills, avatars, toggles */
}
```

**Nested radius rule:** If a card has `border-radius: 12px` and `padding: 8px`, inner elements should use `border-radius: 4px` (12 - 8 = 4).

---

## Gradient Systems

### Subtle Depth Gradients
```css
.surface-elevated {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0.4));
}
```

### Gradient Text (sparingly)
```css
.gradient-heading {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Motion Choreography

### Staggered Animations
```css
.list-item { animation: fadeUp 300ms ease-out both; }
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Reduced Motion Fallback
```css
@media (prefers-reduced-motion: reduce) {
  .list-item { animation: none; opacity: 1; }
}
```

---

## What Makes Premium Products Feel Premium

Based on analysis of Linear, Vercel, Stripe, Raycast, Arc:

1. **Monochrome + one accent** — restraint in color creates sophistication
2. **Consistent 4px grid** — everything aligns, nothing feels off
3. **Subtle transitions everywhere** — no jarring state changes
4. **Custom everything** — scrollbars, selection, focus, cursors
5. **Keyboard-first** — Cmd+K, shortcuts, power-user efficiency
6. **Skeleton loading** — content-shaped placeholders, not spinners
7. **OKLCH/LCH color** — perceptually uniform, professional palette
8. **Dark-first design** — light mode secondary, dark mode primary
9. **Inter or system fonts** — clean, readable, performant
10. **Attention to whitespace** — generous spacing that makes content breathe

---

## Anti-Wow: When Polish Becomes Kitsch

- Animations that delay content access (loading screens that are too elaborate)
- Cursor effects that interfere with clicking
- Sound effects in web apps (almost always unwelcome)
- Parallax that causes motion sickness
- Easter eggs that break functionality
- Glass effects that make text unreadable
- Performance cost > visual benefit = cut it
