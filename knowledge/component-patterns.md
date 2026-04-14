# Component Patterns & Best Practices

> State coverage, component hierarchy, interaction patterns, loading UX.

---

## State Coverage Checklist

Every interactive component should handle these states:

| State | Trigger | Visual Indicator |
|-------|---------|-----------------|
| Default | Resting | Base appearance |
| Hover | Mouse over (desktop) | Subtle background change, cursor pointer |
| Active/Pressed | Being clicked | Slight scale down or color darken |
| Focus-visible | Keyboard focus | Focus ring (2px solid brand, 2px offset) |
| Disabled | Not available | Reduced opacity (0.5), cursor not-allowed, tooltip explaining why |
| Loading | Performing action | Spinner replacing label, disabled interaction |
| Error | Something wrong | Red border, error message below |
| Success | Action completed | Green check, success message |
| Empty | No data/content | Illustration + message + CTA |
| Skeleton | Loading placeholder | Shimmer animation matching layout shape |

---

## Button Hierarchy

| Level | Visual Treatment | Usage | Max per Section |
|-------|-----------------|-------|-----------------|
| Primary | Filled, brand color | Main action | 1 |
| Secondary | Outlined or muted fill | Supporting action | 2-3 |
| Ghost/Tertiary | Text-only, subtle hover | Tertiary action | No limit |
| Destructive | Red/danger fill or outline | Delete, remove, cancel | 1 |
| Link | Looks like text link | Navigation, not form actions | No limit |

**Button sizing:** Small (28-32px), Medium (36-40px), Large (44-48px). Touch targets: 44px minimum on mobile.

**Loading state:** Replace label with spinner, keep button width, disable clicks.

---

## Form Best Practices

1. **Always visible labels** — never placeholder-only (disappears on focus, a11y failure)
2. **Group related fields** and label the groups
3. **Inline validation** — debounced as user types (not on every keystroke)
4. **Error messages say what to fix** — "Enter a valid email (e.g., name@example.com)" not "Invalid input"
5. **Mark optional fields** not required (most fields should be required)
6. **Use appropriate input types** — `email`, `tel`, `url`, `number` trigger correct keyboards
7. **autocomplete attributes** — `name`, `email`, `tel`, `address-line1` for faster filling
8. **Multi-step forms:** show progress, allow going back, save state between steps

---

## Loading Patterns

| Pattern | Best For | Implementation |
|---------|----------|---------------|
| Skeleton screens | Content areas, lists, cards | Content-shaped placeholders with shimmer (1.5-2s loop) |
| Spinners | Button clicks, form submits | Small spinner (16-20px), centered in action area |
| Progress bars | File uploads, exports, multi-step | Determinate bar with percentage |
| Optimistic updates | Likes, follows, toggles | Instant UI update, rollback on server error |
| Progressive loading | Images, heavy content | Show available content, load more in background |

**Decision framework:**
- User initiated a specific action? → Spinner
- Page/section loading content? → Skeleton
- Long operation with known progress? → Progress bar
- Low-risk social action? → Optimistic update

### Skeleton Screen Rules
- Match actual content layout (prevents layout shift)
- Use `aria-busy="true"` on loading containers
- Shimmer animation: linear gradient moving right, 1.5-2s duration
- Never skeleton for longer than 3 seconds — if it takes longer, show a message

---

## Navigation Patterns

| Pattern | When to Use | Platform |
|---------|------------|----------|
| Top bar | Global nav, few items (5-7) | Desktop |
| Sidebar | Many sections, deep hierarchy | Desktop (collapsible on tablet) |
| Bottom tab bar | Mobile primary nav (3-5 items) | iOS, Android |
| Breadcrumbs | Deep hierarchy, need wayfinding | Desktop (hide on mobile) |
| Tabs | Same-level content switching | All platforms |
| Command palette | Power users, many actions | Desktop (Cmd+K) |

**Hamburger menu:** Acceptable on mobile only. NEVER the sole navigation on desktop.

---

## Feedback Components

### Toasts/Notifications
- Auto-dismiss: 3-5 seconds for info, manual dismiss for errors
- Pause timer on hover
- Position: top-right (desktop), top-center (mobile)
- Stack from top, limit visible to 3
- Include undo action for reversible operations

### Inline Messages
- Use for contextual feedback near the triggering action
- Color-coded: green (success), red (error), amber (warning), blue (info)
- Include icon + text (never color alone)

### Confirmation Dialogs
- ONLY for destructive/irreversible actions
- Say what will happen: "Delete 5 items? This cannot be undone."
- Destructive button: red, right side. Cancel: left side, secondary style.

---

## Empty States

Every data view needs an empty state with:
1. **Illustration or icon** — visual context
2. **Clear message** — what this area is for
3. **Primary CTA** — action to populate it
4. **Optional:** template/sample data to demonstrate value

**Three types:**
- No data yet (first use) → guide to create
- No results (search/filter) → suggest adjusting criteria
- Error state → explain and offer retry

---

## Component Libraries (April 2026)

| Library | Architecture | A11y | Customization | Best For |
|---------|-------------|------|---------------|----------|
| shadcn/ui | Copy-paste, Radix-based | Excellent (Radix) | Full control | Most React projects |
| Radix Primitives | Headless, unstyled | Gold standard | Total freedom | Custom design systems |
| MUI v6 | Opinionated, styled | Good | Theme-based | Material Design apps |
| Mantine v7 | Full-featured | Good | CSS vars + theme | Quick prototyping |
| Ark UI | Headless, multi-framework | Very good | Total freedom | Vue/Solid/React |
| Headless UI | Headless, Tailwind-focused | Good | Tailwind styling | Simple Tailwind projects |
