# UX Flow Design & Information Architecture

> Source: Deep research campaign, 24 evidence chunks, 14 clusters, 135 tactics.

---

## Information Architecture Principles

### Research Methods
| Method | What It Answers | Participants | When |
|--------|----------------|-------------|------|
| Card sorting (open) | How users naturally group content | 30-50 | Before IA design |
| Card sorting (closed) | Do users agree with your categories | 30-50 | Validating proposed IA |
| Tree testing | Can users find items in your structure | 50+ | After IA design |
| First-click testing | Do users start in the right place | 20+ | After initial prototype |

### Key Metrics
- **Success rate:** Can users find the item? (target: >80%)
- **Directness:** Did they go straight or backtrack? (target: >60%)
- **Time to find:** How long? (benchmark against competitors)

---

## Navigation Taxonomy

| Pattern | Structure | Best For |
|---------|-----------|----------|
| Flat | All sections at one level | Simple apps (5-7 sections) |
| Deep | Nested hierarchies | Complex enterprise, documentation |
| Hub-and-spoke | Central hub, spokes for features | Mobile apps, dashboards |
| Faceted | Multiple filter dimensions | E-commerce, content-heavy |
| Linear | Step-by-step sequence | Onboarding, checkout, wizards |

**Rule:** Keep depth < 3 levels. If users need more than 2 clicks to reach any feature, add search or shortcuts.

**Evidence:** Well-designed navigation improves task completion by 37%. 30-40% of mobile usability problems are navigation-related.

---

## Onboarding Patterns

| Pattern | Conversion Impact | Best For |
|---------|------------------|----------|
| Checklist-driven | +50% retention at 10 weeks (HubSpot) | SaaS with setup steps |
| Progressive (learn-as-you-go) | 30-50% faster initial completion | Complex tools |
| Empty-state-driven | Contextual, low-friction | Content/data apps |
| Product tour (tooltip) | Good for feature discovery | Feature launches |
| Freemium (try before signup) | 140% higher conversion than free trial | Consumer apps |

### Time to Value
The critical metric. Reduce friction to the first "aha" moment:
1. Show value before requiring signup
2. Pre-fill smart defaults
3. Offer templates/samples
4. Guide the first action explicitly

---

## Wizard / Stepper Patterns

- **Optimal steps:** 3-7 (beyond 7, users abandon)
- **Progress indicator:** Always show "Step X of Y"
- **Backward navigation:** Must preserve entered data
- **Validation:** Inline on submit, not on blur (less disruptive)
- **Branching:** Show/hide steps based on previous answers
- **Save & resume:** For long flows, save state and allow return

---

## Command Palette (Cmd+K)

- Originated from Spotlight (2005), now standard in SaaS
- **3 variations:** Universal (search everything), Contextual (current context), Recent-first
- **Performance ceiling:** 2,000-3,000 items before degradation
- **Implementation:** cmdk (React), ninja-keys (web component)
- Every product with 10+ actions should have one

---

## Progressive Disclosure

- **Exactly 2 levels:** visible and expandable (more creates confusion)
- **30-50% faster** initial task completion
- **70-90%** feature discoverability maintained
- **Patterns:** Accordions, "Show more" links, expandable sections, advanced settings toggle, detail panels

---

## Dashboard Design

- **5-second rule:** User should comprehend the dashboard's story in 5 seconds
- **KPI placement:** Top-left (first scan position in LTR cultures)
- **Widget layout:** Most important at top-left, action items at top-right
- **Customization:** Per-role defaults, user-adjustable
- **Density options:** Condensed (40px rows), Regular (48px), Relaxed (56px)

---

## Error Flows

| Error Type | Recovery Pattern |
|-----------|-----------------|
| 404 Not Found | Helpful page with search, home link, popular pages |
| Permission Denied | Explain why, suggest requesting access, show who to contact |
| Network Error | Auto-retry with backoff, manual retry button, offline indicator |
| Session Expiry | Save state before redirect, auto-login return to same page |
| Validation Error | Inline field error, plain language, suggest fix |

**Key principle:** "Resume" not "Restart" after failures. Never make users re-enter data.

---

## Empty / Zero-Data States

### Three Types
1. **No data yet** (first use) → Guide to create first item, offer templates
2. **No results** (search/filter) → Suggest adjusting criteria, show popular items
3. **Error state** → Explain what happened, offer retry

### Anatomy
- Illustration or icon (visual context)
- Positive title ("Start your first project" not "No projects found")
- Brief description
- Primary CTA (action to resolve the empty state)
- Optional: starter content / templates

---

## Notification Architecture

- **Badges:** Glanceable counts, clear when viewed
- **Inbox:** Persistent, browsable, filterable notification center
- **Synchronize counts** across tabs/devices
- **Granular preferences:** Let users control each notification type
- **Rule:** Never send notifications users didn't ask for

---

## Settings Architecture

- **Search in settings:** 5x findability improvement
- **4-5 top-level categories** maximum
- **Progressive complexity:** General → Advanced → Developer
- **Layout types:** Flat list, grouped sections, sidebar + detail, tabs
- **Dangerous settings:** Require confirmation, separated visually

---

## Deep Linking & State

- **URL-as-state:** Filters, sorts, active tabs reflected in URL
- **Shareable URLs:** Any view should be linkable
- **Synthetic back stacks:** Deep links should create sensible back navigation
- **Never break browser history:** Avoid replaceState for navigable views
- **Preserve state:** Returning from a detail page should maintain list scroll position and filters
