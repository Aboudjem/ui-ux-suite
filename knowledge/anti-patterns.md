# Common Design Mistakes & Anti-Patterns

> What NOT to do. Each anti-pattern includes why it's wrong and what to do instead.

---

## Redesign Traps

- **Redesigning everything at once** — Ship incremental improvements. Full redesigns alienate existing users and multiply risk.
- **Optimizing for first impression over returning users** — Power users generate most value. Don't sacrifice efficiency for "wow."
- **Adding visual complexity to seem "modern"** — Complexity without usability benefit is decoration. Strategic minimalism wins.
- **Breaking muscle memory** — Moving established elements forces users to relearn. Change must justify disruption.
- **Not measuring before/after** — Without baselines, you can't know if the redesign helped or hurt.

---

## Color Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|---------------|-----|
| Pure black (#000) text | Too harsh contrast, causes halation | Use dark gray (#1a1a1a or similar) |
| Insufficient contrast on muted text | Placeholder/disabled text often fails WCAG | Check ALL text, not just body |
| Too many accent colors | Colors compete for attention, no hierarchy | 1 primary + 1 accent max. Use neutrals for everything else |
| Dark mode = inverted light mode | Wrong surface hierarchy, eye strain | Redesign: higher elevation = lighter, reduce saturation |
| No surface elevation system | Cards, popovers, modals look the same depth | Define 4 levels: background → surface → elevated → overlay |
| Color-only information | Color-blind users miss it entirely | Always pair color with text, icon, or pattern |

---

## Typography Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|---------------|-----|
| Too many fonts (3+) | Visual noise, performance cost, inconsistency | 1-2 fonts maximum (1 for UI, 1 optional for display/code) |
| No type scale | Random sizes create visual chaos | Pick a ratio (1.200 or 1.250) and generate a scale |
| Body text < 16px on mobile | Unreadable without zooming, a11y failure | 16px minimum for body text everywhere |
| Line height < 1.4 for body | Text feels cramped and hard to read | 1.5-1.7 for body, 1.1-1.3 for headings |
| Measure > 80 characters | Lines too long to track, reading comprehension drops | 45-75 chars desktop, 30-45 mobile |
| Too many weights loaded | Performance cost, unnecessary variation | 3-4 weights max: 400, 500, 600, 700 |

---

## Layout Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|---------------|-----|
| Inconsistent spacing | Random px values create visual noise | Adopt a 4px or 8px base spacing scale |
| No visual grouping | Everything equally spaced = everything equal importance | Use proximity: tighter spacing within groups, larger between |
| Content too wide on large screens | Line length exceeds readable measure | Max-width on content containers (720px reading, 1280px app) |
| No whitespace around CTAs | Primary actions don't stand out | Surround important actions with generous whitespace |
| Dense UI on mobile | Touch targets too small, content unreadable | Increase padding, enlarge touch targets (44x44), reduce columns |

---

## Component Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|---------------|-----|
| No button hierarchy | All buttons look the same = none are primary | Clear primary/secondary/ghost/destructive hierarchy |
| Placeholder-only inputs | Labels disappear on focus, a11y failure | Always use visible `<label>` elements |
| Centered modals on mobile | Awkward, hard to dismiss, poor thumb reach | Use full-screen sheets or bottom sheets on mobile |
| No empty states | Blank screens confuse users | Illustration + message + CTA for every empty state |
| No loading states | Users think the app is broken | Skeleton screens for content, spinners for actions |
| Missing disabled explanations | Button is disabled but user doesn't know why | Tooltip or nearby text explaining the prerequisite |

---

## Interaction Mistakes

| Mistake | Why It's Wrong | Fix |
|---------|---------------|-----|
| No click/tap feedback | User unsure if action registered | Visual feedback within 100ms (scale, color, ripple) |
| Animations > 300ms | State changes feel sluggish | 150-200ms for micro-interactions, 200-300ms for transitions |
| Animations < 100ms | Feels glitchy, barely visible | At least 150ms for user to perceive the change |
| Hover-only affordances | Invisible on touch devices | Always have a non-hover indicator (visible borders, labels) |
| Decorative animation without purpose | Distracting, slows perceived performance | Every animation should answer "what does this communicate?" |

---

## Hidden Friction

| Friction | Impact | Fix |
|----------|--------|-----|
| Sign-up wall before value | Users bounce — they don't know if the product is worth it | Show value first, require auth for save/share |
| Multi-step forms without progress | Users don't know how much is left, abandon | Step indicator: "Step 2 of 4" |
| Error messages that don't say what to fix | Users can't recover, retry blindly | "Password needs 1 uppercase letter" not "Invalid password" |
| Confirmation for non-destructive actions | Unnecessary friction on safe operations | Only confirm destructive/irreversible actions |
| Exact-match search | Users can't find things with typos or synonyms | Fuzzy search, auto-suggest, "did you mean?" |
| Settings buried in nested menus | Users can't find controls | Search in settings, flat structure, 4-5 top-level categories |
| Notifications that can't be configured | Users get annoyed and disable all | Granular notification preferences |
