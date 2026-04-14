# Typography Systems for Apps

> Font selection, type scales, readability, performance, current best fonts.

---

## Font Psychology & Selection

| Category | Personality | Best For | Top Picks (2026) |
|----------|------------|----------|-------------------|
| Geometric Sans | Modern, clean, precise | SaaS, tech, dev tools | Inter, Geist, DM Sans, Outfit |
| Humanist Sans | Friendly, warm, approachable | Consumer, health, education | Plus Jakarta Sans, Nunito Sans, Source Sans 3 |
| Grotesque Sans | Neutral, professional, versatile | Enterprise, finance, any | Instrument Sans, General Sans, Satoshi |
| Serif | Authoritative, editorial, refined | Media, editorial, luxury | Merriweather, Lora, Playfair Display, Fraunces |
| Monospace | Technical, code-like, exact | Dev tools, terminal, data | JetBrains Mono, Fira Code, Geist Mono |

### Font Pairing Rules
- Pair fonts with contrasting personality but similar x-height
- Safe combo: geometric sans (headings) + humanist sans (body)
- Safe combo: serif (headings) + sans-serif (body)
- Never pair two fonts from the same category (two geometric sans = visual conflict)
- 1 font is fine. 2 is max for most apps. 3+ is almost always a mistake.

---

## Type Scale Systems

### Scale Ratios
| Ratio | Name | Use Case |
|-------|------|----------|
| 1.067 | Minor Second | Very dense: dashboards, data tables |
| 1.125 | Major Second | Compact: admin panels, utilities |
| 1.200 | Minor Third | **Balanced — most common for apps** |
| 1.250 | Major Third | Spacious: marketing, editorial |
| 1.333 | Perfect Fourth | Bold: landing pages, magazines |
| 1.414 | Augmented Fourth | Dramatic: hero sections only |

### Recommended Scale (1.200 ratio, 16px base)

| Role | Size | Line Height | Weight | Letter Spacing |
|------|------|-------------|--------|----------------|
| Display | 48px / 3rem | 1.1 | 700 | -0.02em |
| H1 | 36px / 2.25rem | 1.15 | 700 | -0.015em |
| H2 | 28px / 1.75rem | 1.2 | 600 | -0.01em |
| H3 | 22px / 1.375rem | 1.25 | 600 | 0 |
| H4 | 18px / 1.125rem | 1.3 | 600 | 0 |
| Body | 16px / 1rem | 1.5 | 400 | 0 |
| Body Small | 14px / 0.875rem | 1.5 | 400 | 0 |
| Caption | 12px / 0.75rem | 1.4 | 400 | 0.01em |
| Label | 13px / 0.8125rem | 1.2 | 500 | 0.02em |

### Fluid Typography with clamp()
```css
--font-size-h1: clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem);
--font-size-body: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
```

---

## Line Height Rules

| Context | Line Height | Why |
|---------|-------------|-----|
| Display/hero headings | 1.0-1.1 | Tight for visual impact |
| Headings (h1-h3) | 1.1-1.25 | Compact but readable |
| Subheadings (h4-h6) | 1.25-1.35 | Transition to body |
| Body text | 1.5-1.7 | Optimal readability |
| Small text/captions | 1.4-1.5 | Needs more relative spacing |
| Buttons/labels | 1.0-1.2 | Single line, compact |

---

## Measure (Line Length)

| Context | Characters | Why |
|---------|-----------|-----|
| Desktop body | 45-75 | Research-backed optimal range |
| Mobile body | 30-45 | Smaller screens, shorter attention |
| Maximum | 80 | Beyond this, reading comprehension drops |
| Headings | No strict limit | But avoid very long single-line headings |

**Implementation:** `max-width: 65ch` on text containers.

---

## Font Weight Strategy

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions, form values |
| Medium | 500 | Labels, emphasis, navigation items |
| Semibold | 600 | Headings, buttons, card titles |
| Bold | 700 | Strong emphasis, hero headings |

**Rules:**
- Load 3-4 weights maximum (performance)
- Variable fonts can serve all weights from one file
- Body text should never use weights below 300 (too light to read)
- Weight contrast should be obvious — 400 vs 500 is subtle, 400 vs 700 is clear

---

## Font Loading & Performance

### Strategies
1. **font-display: swap** — show text immediately in fallback, swap when loaded (best for most)
2. **Preload critical fonts** — `<link rel="preload" href="font.woff2" as="font" crossorigin>`
3. **Variable fonts** — single file serves all weights, reduces requests
4. **Subsetting** — strip unused characters (Latin-only: ~30KB vs ~200KB full Unicode)
5. **size-adjust** — minimize layout shift when fallback swaps to web font

### System Font Stacks (zero-cost performance)
```css
/* Sans-serif */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace */
font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
```

### OpenType Features for UI
```css
/* Tabular numbers for aligned data */
font-variant-numeric: tabular-nums;

/* Balanced heading line wrapping */
text-wrap: balance;

/* Optical sizing for variable fonts */
font-optical-sizing: auto;
```
