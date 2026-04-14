# Design Libraries & Tools Reference

> Recommendations by category for design audit tool recommendations.

---

## Component Libraries (2026)

| Library | Type | Framework | A11y | Bundle | When to Use |
|---------|------|-----------|------|--------|-------------|
| shadcn/ui | Copy-paste | React | Excellent | Zero (copy) | Default choice for React + Tailwind |
| Radix Primitives | Headless | React | Gold standard | Small | Custom design systems |
| Ark UI | Headless | React/Vue/Solid | Very good | Small | Multi-framework projects |
| MUI v6 | Styled | React | Good | Large | Material Design apps |
| Mantine v7 | Full-featured | React | Good | Medium | Rapid prototyping |
| Headless UI | Headless | React/Vue | Good | Small | Simple Tailwind projects |
| React Aria | Hooks | React | Excellent | Small | Accessibility-critical apps |

---

## CSS Tools

| Tool | Category | When to Use |
|------|----------|-------------|
| Tailwind v4 | Utility framework | Default for most projects (CSS-first config, @theme) |
| Open Props | CSS custom properties | Framework-agnostic design tokens |
| UnoCSS | Atomic CSS engine | Performance-critical, custom utility needs |
| Lightning CSS | Bundler/minifier | Build performance (Rust-based) |
| PostCSS | Transform pipeline | When specific transforms needed |
| vanilla-extract | Type-safe CSS | TypeScript-first styling |

---

## Animation Libraries

| Library | Size | Use Case | Performance |
|---------|------|----------|-------------|
| CSS native | 0KB | Transitions, simple animations | Best (compositor) |
| Motion (formerly Framer Motion) | ~30KB | React gesture + animation | Good |
| GSAP | ~25KB | Complex timelines, scroll | Excellent |
| Lottie | ~50KB | After Effects animations | Good (canvas) |
| Rive | ~150KB | Interactive state machines | Excellent |
| CSS scroll-driven | 0KB | Scroll-linked animations | Best (native) |

**Decision:** Use CSS native first. Add Motion for React gesture needs. GSAP for complex timelines. Lottie/Rive for designer-created animations.

---

## Icon Systems

| Library | Icons | Style | Tree-Shake | License |
|---------|-------|-------|------------|---------|
| Lucide | 1500+ | Outline (1.5px) | Yes | MIT |
| Phosphor | 9000+ | 6 weights | Yes | MIT |
| Heroicons | 300+ | Outline + Solid | Yes | MIT |
| Tabler Icons | 5400+ | Outline (1.5px) | Yes | MIT |
| Radix Icons | 300+ | 15px outline | Yes | MIT |

**Rules:** Pick ONE style and stick with it. Never mix outline and filled icons. Consistent stroke width throughout.

---

## Charting Libraries

| Library | Type | Customization | A11y | Best For |
|---------|------|--------------|------|----------|
| Recharts | React/SVG | High | Basic | Most React dashboards |
| Nivo | React/SVG/Canvas | Very high | Good | Beautiful data viz |
| Tremor | React (Recharts-based) | Themed | Basic | Quick dashboard metrics |
| D3 | Low-level SVG | Total | Manual | Complex custom viz |
| shadcn charts | React (Recharts) | shadcn themed | Basic | shadcn/ui projects |

---

## Accessibility Testing

| Tool | Type | Coverage | Integration |
|------|------|----------|-------------|
| axe-core | Engine | ~57% | Lighthouse, jest-axe, Playwright |
| Pa11y | CLI | Complementary | CI pipelines |
| Lighthouse | Browser | WCAG-aligned | Chrome built-in |
| Stark | Design tool | Visual checks | Figma, Sketch |
| jest-axe | Unit test | Component-level | Jest test suites |

**Combined axe + Pa11y: ~35% automated coverage. Manual testing covers the remaining 65%.**

---

## Color Tools

| Tool | Purpose |
|------|---------|
| Radix Colors | Pre-built accessible color scales |
| Leonardo (Adobe) | APCA-based palette generation |
| OKLCH.com | OKLCH color picker and converter |
| Coolors | Quick palette generation |
| Contrast (Figma) | WCAG + APCA contrast checking |
| Chrome DevTools | Emulate color blindness, experimental APCA |

---

## Typography Tools

| Tool | Purpose |
|------|---------|
| Google Fonts | Free web fonts, hosting, API |
| Bunny Fonts | Privacy-friendly Google Fonts alternative |
| Fontsource | Self-hosted npm packages for fonts |
| Fontjoy | AI font pairing suggestions |
| Type Scale | Visual type scale calculator |

---

## Image Optimization

| Tool | Type | Best For |
|------|------|----------|
| next/image | Component | Next.js projects (auto optimization) |
| sharp | Server | Node.js image processing |
| Cloudinary | CDN | Multi-format delivery, transforms |
| Squoosh | Manual | One-off compression |
| AVIF/WebP | Format | Modern image formats (90%+ support) |

---

## Design Linting

| Tool | What It Checks |
|------|---------------|
| Stylelint | CSS/SCSS code quality, property order |
| eslint-plugin-jsx-a11y | JSX accessibility issues |
| Biome | CSS formatting + linting (Rust-based) |
| Design token validators | Token file schema compliance |
