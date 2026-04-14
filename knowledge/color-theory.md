# Color Systems for Product UI

> Palette construction, semantic mapping, harmony, dark mode, contrast systems.

---

## Color Spaces

### OKLCH (Recommended for 2026)
Perceptually uniform — equal numeric steps produce equal perceived differences. Superior to HSL for palette generation.
- `oklch(L% C H)` — Lightness (0-100%), Chroma (0-0.4), Hue (0-360)
- Browser support: 95%+ (Chrome 111+, Safari 15.4+, Firefox 113+)
- Used by Linear, Figma for theme generation
- CSS functions: `color-mix()`, `relative color syntax`, `light-dark()`

### HSL (Fallback)
Intuitive but NOT perceptually uniform — a 50% lightness blue looks darker than 50% yellow.
- Good for quick prototyping, not for systematic palette construction
- Still widely used in Tailwind and most design systems

---

## Palette Construction

### Neutral Scale (9-11 steps)
Every UI needs a complete neutral palette. Warm, cool, or brand-tinted.

| Step | Lightness | Usage |
|------|-----------|-------|
| 50 | ~98% | Subtle backgrounds |
| 100 | ~95% | Card backgrounds, alternating rows |
| 200 | ~90% | Borders (subtle) |
| 300 | ~82% | Borders (strong), disabled text bg |
| 400 | ~70% | Placeholder text |
| 500 | ~55% | Secondary text, icons |
| 600 | ~42% | Body text (secondary) |
| 700 | ~32% | Body text (primary) |
| 800 | ~24% | Headings |
| 900 | ~18% | High emphasis text |
| 950 | ~10% | Maximum contrast |

**Tip:** Tint neutrals with 2-5% of your brand hue for cohesion. Pure gray feels lifeless.

### Semantic Colors
| Role | Hue Range | Usage |
|------|-----------|-------|
| Success | 140-160 (green) | Confirmations, positive metrics, online status |
| Error | 0-10 (red) | Errors, destructive actions, alerts |
| Warning | 35-45 (amber/orange) | Warnings, caution, degraded states |
| Info | 200-220 (blue) | Information, hints, links, selection |

Each semantic color needs 3 variants: base (for text/icons), light (for backgrounds), dark (for emphasis/dark mode).

### Brand Color Integration
**60-30-10 rule adapted for UI:**
- 60% neutral (backgrounds, text, borders)
- 30% primary brand color (navigation, headers, key actions)
- 10% accent (CTAs, highlights, notifications)

---

## Color Harmony Systems

| Harmony | Description | Best for UI |
|---------|-------------|-------------|
| Monochromatic | Single hue, varied L/C | Minimal UIs, dark mode, elegant |
| Complementary | Opposite hues (180deg) | Primary + accent (use carefully — can clash) |
| Split-complementary | Base + 2 adjacent to complement | Most versatile for product UI |
| Analogous | Adjacent hues (30deg apart) | Backgrounds, gradients, calm palettes |
| Triadic | 3 equally spaced hues (120deg) | Playful/bold brands only |

---

## Surface & Layer System

### Light Mode
| Layer | Purpose | Example Value |
|-------|---------|---------------|
| Background | Page background | #ffffff |
| Surface | Cards, panels | #f9fafb |
| Elevated | Popovers, dropdowns | #ffffff + shadow |
| Overlay | Modal backdrop | rgba(0,0,0,0.5) |

### Dark Mode (NOT just inverted)
| Layer | Purpose | Example Value |
|-------|---------|---------------|
| Background | Page background | #0a0a0a (NOT #000) |
| Surface | Cards, panels | #141414 |
| Elevated | Popovers, dropdowns | #1e1e1e |
| Overlay | Modal backdrop | rgba(0,0,0,0.7) |

**Dark mode rules:**
1. Higher elevation = lighter surface (opposite of light mode)
2. Reduce color saturation by 10-20%
3. Text opacity hierarchy: 87% primary, 60% secondary, 38% disabled
4. Never pure black (#000) — use brand-tinted dark (#0a0a0a to #1a1a1a)
5. Shadows barely visible — use borders (1px rgba(255,255,255,0.1)) instead

---

## Color by Product Type

| Type | Primary Hue | Neutral Temp | Accent Strategy | Feel |
|------|-------------|-------------|-----------------|------|
| SaaS/Productivity | Blue (210-230) | Cool | Minimal, functional | Professional, trustworthy |
| Finance | Blue/Green (180-220) | Cool | Conservative | Stable, secure |
| Health/Wellness | Teal/Green (150-180) | Warm | Soft, calming | Approachable, caring |
| Media/Creative | Varies | Dark | Vibrant, high contrast | Engaging, immersive |
| Consumer/Social | Warm (0-30, 280-340) | Warm | Energetic | Fun, memorable |
| Enterprise | Blue/Gray | Neutral | Muted | Information-dense-friendly |
| E-commerce | Brand-driven | Neutral | Orange/Green CTAs | Conversion-optimized |

---

## Contrast Systems

### WCAG 2.x (Current Legal Standard)
| Context | Minimum Ratio |
|---------|--------------|
| Normal text | 4.5:1 (AA) |
| Large text (18px+ or 14px bold) | 3:1 (AA) |
| Non-text (icons, borders, focus) | 3:1 (AA) |
| Enhanced normal text | 7:1 (AAA) |

### APCA (Future Standard, use alongside WCAG)
| Context | Minimum Lc |
|---------|-----------|
| Body text | Lc 90 |
| Readable text, UI labels | Lc 75 |
| Placeholders, non-critical | Lc 60 |
| Large headlines, icons | Lc 45 |
| Decorative, borders | Lc 30 |

---

## Color-Blind Safe Design

- Never rely on color alone — always pair with text, icons, or patterns
- Blue + orange is the safest two-color combination (works for all types)
- Red/green distinction fails for 8% of males — add icons to success/error states
- Test with simulators: Chrome DevTools > Rendering > Emulate vision deficiency
- Patterns that work: shape coding, texture, position, size, labels
