# Design Engineer Craft — April 2026

> Source: X/Twitter deep scout — Rauno Freiberg (Vercel), Emil Kowalski (Linear), shadcn, Jhey Tompkins (Google), Anthony Hobday, Paco Coursey, Josh Comeau, Schoger/Wathan, Adam Argyle
> 42 evidence items — the craft details that define design engineering in 2026

---

## The Philosophy (from the top voices)

### shadcn — "Speed beats delight. Always."
> "Somewhere along the way, design engineering became about animations and slick demos. In reality, it's mostly deciding what NOT to animate. Emil gets this. Speed beats delight. Always."

### Vercel blog — official definition
> "Design teams put resources towards polished interactions, no dropped frames, no cross-browser inconsistencies, and accessibility. Rather than handing off a completed design, a Designer sketches the start and iterates with a Design Engineer in Figma or code."

### Paco Coursey (Linear) — what the craft IS
> "Details. Imbuing every aspect of your work with care. Animate those icons. Brand that scrollbar. Polish that :active state. Load a single typeface glyph to render the world's best ampersand. Animate transitions between sequential tooltip appearances. Manually measure text to avoid widow lines."

### Paco Coursey — contrarian reframe
> "UX = Speed. What we call 'delightful UX' is just delivering a faster path to user goals."

### shadcn on design system design
> "shadcn/ui is like a black shirt. Clean, simple, designed to outlast trends."

---

## Rauno Freiberg's Interface Laws (Vercel Staff Design Engineer)

From `github.com/raunofreiberg/interfaces` — the definitive "what makes a good interface" checklist:

1. **Animation duration should not be more than 200ms**
2. **Apply `-webkit-font-smoothing: antialiased`** for legibility
3. **Font weight shouldn't change on hover/selected** — use color instead
4. **Use `box-shadow` for focus rings, not `outline`**
5. **Decorative elements (glows, gradients) should `pointer-events: none`**
6. **Use `@media (hover: hover)` to hide hover states on touch devices**
7. **Input font size minimum 16px** to prevent iOS zoom
8. **Dropdown menus should trigger on `mousedown`, not `click`**
9. **Avoid banding** — use radial gradients instead of scaling/blurring rectangles
10. **Bypass React's render lifecycle** with refs for real-time values

---

## Emil Kowalski's Animation Laws (Linear Design Engineer)

From `emilkowal.ski/ui/great-animations` + `animations.dev` course:

1. **Keep animations shorter than 300ms** for snappy feel
2. **Use ease-out** — creates "quick response" impression
3. **Animate ONLY `transform` and `opacity`** — they trigger only composite step (no layout/paint)
4. **If animations don't run at 60fps, everything else becomes useless**
5. **Use CSS or WAAPI instead of `requestAnimationFrame`** for busy main threads
6. **Never animate keyboard-initiated actions** — users repeat hundreds of times daily, animations become drag
7. **Allow users to interrupt animations** smoothly mid-transition
8. **Respect `prefers-reduced-motion`** in CSS
9. **Use spring animations** for natural physics-mimicking motion
10. **CSS animations run off the main thread** — Framer Motion's `x/y/scale` shorthand uses `requestAnimationFrame` which stutters; use full `transform` string for hardware acceleration

### Emil's `clip-path` magic
```css
/* Image reveal */
.reveal { clip-path: inset(0 0 100% 0); }
.reveal.visible { clip-path: inset(0 0 0 0); }

/* Tab switcher without jarring color transitions */
.tab { clip-path: inset(0px 75% 0px 0% round 17px); }
```
Hardware-accelerated, no layout shifts. "Small details like this add up."

---

## Jhey Tompkins's CSS-Only Magic (Google Chrome DevRel)

### 1. Magnetic hover with zero JS
```css
article { anchor-name: --develop; }
ul:has(li:hover) { --anchor: --develop; }
ul::after {
  inset: anchor(var(--anchor) top) anchor(var(--anchor) right);
}
```

### 2. Intentional hover reveal with transition-delay
```css
a::after {
  mix-blend-mode: difference;
  scale: 0 1;
  transform-origin: 100% 50%;
  transition: scale 0.2s;
}
a:hover::after {
  scale: 1 1;
  transform-origin: 0 50%;
  transition-delay: 0.15s;
}
```

### 3. Sticky + clip-path scroll header reveal
```css
main { clip-path: inset(var(--padding) 0 0 0); }
.title { position: sticky; }
```
"Sticky element inside clipped container = revealed on scroll."

### 4. Animated borders with offset-path (2024+)
```css
.glow::after {
  offset-path: rect(0 100% 100% 0 round var(--radius));
  animation: loop;
}
@keyframes loop { to { offset-distance: 100%; } }
```

---

## Anthony Hobday's Safe Design Rules

From `anthonyhobday.com/sideprojects/saferules/` — 28 rules citing universally. Highlights:

1. **Use close-to-black and close-to-white** instead of pure
2. **Saturate neutrals with <5% of primary color** (warm your grays)
3. **Drop shadow blur = 2x distance value** (4px down → 8px blur)
4. **Button horizontal padding = 2x vertical padding**
5. **Nested corner radius = outer radius - gap distance**
6. **NO shadows in dark interfaces** (contradicts other advice — Hobday argues shadows are "logically wrong" in dark mode)
7. **As elements get closer to user, they should get lighter** (light + dark modes)
8. **Body text ≥16px**
9. **~70 characters per line**
10. **12 columns for horizontal grids**
11. **Everything should align with something else**
12. **Keep background-container brightness delta ≤12% dark mode, ≤7% light mode**
13. **Don't place multiple visual divides (borders, lines, bg transitions) adjacent**
14. **Lower the contrast of icons paired with text** via opacity/color

---

## Josh Comeau's Shadow System (the canonical guide)

### Rules
- **Match shadow hue to environment** — `hsl(220deg 60% 50% / 0.7)` not `rgba(0,0,0,0.2)`
- **Stack multiple layers** — small (1 layer), medium (3), large (5)
- **As elements rise: offset↑, blur↑, opacity↓**
- **Page-wide ratio: vertical offset = 2x horizontal**

### Three-tier system
```css
/* Small */
box-shadow: 0.5px 1px 1px hsl(220deg 60% 50% / 0.7);

/* Medium (3 stacked) */
box-shadow:
  1px 2px 2px hsl(220deg 60% 50% / 0.333),
  2px 4px 4px hsl(220deg 60% 50% / 0.333),
  3px 6px 6px hsl(220deg 60% 50% / 0.333);

/* Large (5 stacked) */
box-shadow:
  1px 2px 2px hsl(220deg 60% 50% / 0.2),
  2px 4px 4px hsl(220deg 60% 50% / 0.2),
  4px 8px 8px hsl(220deg 60% 50% / 0.2),
  8px 16px 16px hsl(220deg 60% 50% / 0.2),
  16px 32px 32px hsl(220deg 60% 50% / 0.2);
```

### Use CSS variables
```css
:root { --shadow-color: 220deg 60% 50%; }
.card { box-shadow: 1px 2px 4px hsl(var(--shadow-color) / 0.5); }
```

---

## AliGrids / PixelJanitor Dashboard Formulas

### Dark UI depth (1071 likes)
```css
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.02),  /* 1px inner shadow @ 2% */
  0 0 0 0 rgba(0,0,0,0),                 /* placeholder */
  0 1px 0 rgba(0,0,0,0.25);              /* 1px drop @ 25% */
```
**"The difference between good and great dark UI."**

### Production border-shadow formula
```css
.border-shadow {
  box-shadow:
    0px 0px 0px 1px rgba(0,0,0,0.06),
    0px 1px 2px -1px rgba(0,0,0,0.06),
    0px 2px 4px 0px rgba(0,0,0,0.04);
}
```

### Dashboard icon/typography rules (571 likes)
- 14px base font size
- 16px base icon size
- 1 / 1.2 / 1.5 stroke widths
- regular / medium / semibold font weights (never more)

### Tran Mau Tri Tam's production cheatsheet (1,113 likes)
- Typography: **Geist 16px & 14px** for body (regular + medium)
- Spacing: **4px rule, no exceptions**
- Darkest neutral: **#141414**
- Radius: **8→40px range**
- Icons: **20px stroke 1.5px**
- Bound: **32px**
- "Shipped multiple products with this. Never looked back."

---

## Refactoring UI (Schoger + Wathan) — The 7 Tips

From `medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design`:

1. **Color + weight for hierarchy, not size** — dark/grey/light-grey tiers, weights 400-500 + 600-700 emphasis, never below 400
2. **On colored backgrounds** — reduce white opacity OR hand-pick matching hue
3. **Offset shadows vertically** — simulates downward light, more natural than blur/spread
4. **Replace borders with** — box-shadow, contrasting backgrounds, or increased spacing
5. **Never enlarge small icons** — enclose in colored shape containers
6. **Accent borders as visual flair** — colorful left border on alerts, active nav
7. **Button hierarchy** — primary=solid high-contrast, secondary=outline, tertiary=link

---

## Adam Argyle's 6 CSS Snippets 2025 (Google CSS DevRel)

### 1. Springy easing (natural feel)
```css
transition: transform 1s linear(
  0, 0.009, 0.035 2.1%, 0.139, 0.305 9.9%, 0.5, 0.695, 0.861 24.9%,
  0.965 37.1%, 1, 0.965, 0.861 75.2%, 0.5 85%, 0.139 95.2%, 0
);
```

### 2. `@property` for animatable colors
```css
@property --color {
  syntax: '<color>';
  initial-value: blue;
  inherits: false;
}
```

### 3. Cross-document view transitions
```css
@view-transition { navigation: auto; }
```
**One line for crossfade page transitions.**

### 4. Dialog with `@starting-style`
```css
dialog {
  opacity: 0;
  transform: translateY(20px);
  &[open] { opacity: 1; transform: translateY(0); }
  @starting-style {
    &[open] { opacity: 0; transform: translateY(20px); }
  }
}
```

### 5. Popover transitions
```css
[popover] { opacity: 0; transform: scale(0.95); }
[popover]:popover-open { opacity: 1; transform: scale(1); }
@starting-style {
  [popover]:popover-open { opacity: 0; transform: scale(0.95); }
}
```

### 6. Smooth accordion with `::details-content`
```css
details::details-content {
  block-size: 0;
  transition: block-size 300ms;
  interpolate-size: allow-keywords;
}
details[open]::details-content { block-size: auto; }
```

---

## The DESIGN.md Pattern (2025 viral trend)

> "Like README.md but for design systems. A plain markdown file that LLMs read to generate consistent UI."

- **`awesome-design-md` repo** (VoltAgent) — collection of DESIGN.md files extracted from 31 sites: Stripe, Vercel, Notion, Supabase, Linear, NVIDIA, Apple, Figma
- **Google Stitch** — agent respects existing DESIGN.md instead of recreating design systems
- **The new pattern** — drop DESIGN.md in your repo, AI agents build consistent UI from it

---

## The 2026 Design Engineer Stack (synthesized)

### Language
- **CSS-first** (native scroll-driven, view transitions, :has(), @property, clip-path)
- **Motion (motion.dev)** when React gesture + layout animations needed
- **GSAP 3.13+** (now free) for complex orchestration

### Typography
- **Geist** (16px & 14px, regular + medium) — replacing Inter
- **4-5 combinations max** (not infinite variations)
- `font-variant-numeric: tabular-nums`, `text-wrap: balance`

### Colors
- **OKLCH** everywhere (Radix Colors, OKLCH.com, accessiblepalette.com)
- **#141414** as darkest neutral (not pure black)
- Neutrals warmed with <5% primary color

### Spacing
- **4px or 8px grid** (no exceptions)
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

### Icons
- **20px size, 1.5px stroke** (Lucide or Phosphor)
- Lower contrast when paired with text

### Shadows
- **Multi-layered** (3-5 stacked)
- **Hue-matched** to environment
- Blur = 2x distance
- Single light source across page
- Dark UI: 1px inner white@2% + 1px drop black@25%

### Animation
- **< 200ms for UI** (< 300ms for content)
- **ease-out** for entrances, **ease-in** for exits
- **ONLY transform + opacity** — never width/height/top/left
- Respect `prefers-reduced-motion`
- CSS > WAAPI > Motion > GSAP (priority order)

### Focus
- `box-shadow` not `outline` for focus rings
- Visible + branded (not browser default blue)
- 2px solid + 4px halo (15% opacity)

### A11y non-negotiables
- `:focus-visible` on ALL interactive elements
- Skip-to-content link
- 44×44 touch targets
- `aria-label` on icon-only buttons
- No color-only information
- `prefers-reduced-motion` honored

---

## Contrarian Takes Worth Remembering

1. **shadcn:** "Speed beats delight. Always. Deciding what NOT to animate is the craft."
2. **Hobday:** "No shadows in dark interfaces" (contradicts common dark UI advice)
3. **Paco Coursey:** "UX = Speed. Delightful UX is just a faster path to user goals."
4. **Emil Kowalski:** "Never animate keyboard-initiated actions — users repeat them hundreds of times daily."
5. **Rauno Freiberg:** "Dropdown menus should trigger on `mousedown`, not `click`" (most products get this wrong)
6. **HN thread:** "Function must precede form — users prefer boring, intuitive interfaces over beautiful ones that don't work."
7. **r/webdev practitioners:** "Glassmorphism has performance costs we've been warning about for 9 years."
