# Platform Conventions — Browser, iOS, Android

> Navigation patterns, touch targets, gestures, safe areas, responsive strategy.

---

## Navigation by Platform

| Platform | Primary Nav | Secondary Nav | Power User |
|----------|-----------|---------------|------------|
| iOS | Bottom tab bar (max 5) | Navigation stack + back | - |
| Android | Bottom navigation (3-5) | Navigation drawer, top tabs | - |
| Desktop | Sidebar or top bar | Breadcrumbs, tabs | Cmd+K command palette |
| Tablet | Collapsible sidebar | Bottom bar or tabs | - |

**Rules:**
- Desktop: never hamburger as sole navigation
- Mobile: bottom navigation preferred (thumb-reachable)
- Tablet: sidebar that collapses to icons or bottom bar

---

## Touch Targets

| Standard | Minimum | Recommended |
|----------|---------|-------------|
| WCAG 2.2 AA | 24x24 CSS px | 44x44 CSS px |
| iOS HIG | 44x44 pt | 44x44 pt |
| Material Design 3 | 48x48 dp | 48x48 dp |

**Spacing between targets:** at least 8px to prevent accidental taps.

**Thumb zone:** Bottom 60% of mobile screen is easy reach. Place primary actions there.

---

## Platform-Specific Components

| Component | iOS | Android | Web |
|-----------|-----|---------|-----|
| Confirmation | Action Sheet (bottom) | Bottom Sheet / Dialog | Modal / Dialog |
| Selection | Picker wheel | Dropdown / Bottom Sheet | Select / Combobox |
| Date input | Date picker wheel | Calendar picker | Input type="date" or custom |
| Alerts | System alert (centered) | Material Dialog | Modal |
| Toggle | UISwitch | Material Switch | Custom toggle |
| Pull to refresh | Native rubber band | Material indicator | Custom (if needed) |

**Key rule:** Modals on mobile should become bottom sheets or full-screen pages.

---

## Safe Areas

```css
/* Handle notches, Dynamic Island, home indicator */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);

/* Viewport meta tag required */
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

**Common issues:**
- Bottom navigation hidden behind home indicator
- Content behind Dynamic Island / notch
- Landscape mode on phones with notch

---

## Responsive Strategy (2026)

### Container Queries + Media Queries
- **Container queries:** Component-level responsiveness (card adapts to sidebar width)
- **Media queries:** Viewport-level layout (sidebar shows/hides), user preferences, print

### Breakpoints
| Name | Value | Target |
|------|-------|--------|
| sm | 640px | Mobile landscape, small tablet |
| md | 768px | Tablet portrait |
| lg | 1024px | Small desktop, tablet landscape |
| xl | 1280px | Desktop |
| 2xl | 1536px | Large desktop |

### Container Widths
| Context | Max Width |
|---------|-----------|
| Reading content | 680-720px |
| App content | 1200-1280px |
| Wide (dashboards) | 1440px |
| Full width | 100% + padding (immersive only) |

---

## Gesture Conventions

| Gesture | iOS | Android | Web |
|---------|-----|---------|-----|
| Swipe back | Edge swipe → navigate back | System back gesture | - |
| Pull to refresh | Pull down → refresh | Pull down → refresh | Custom implementation |
| Long press | Context menu, preview | Context menu, selection | Right-click equivalent |
| Swipe to delete | Swipe left → actions | Swipe → actions | - |
| Pinch to zoom | Native on images | Native on images | CSS touch-action |

---

## Dark Mode by Platform

| Platform | Trigger | Implementation |
|----------|---------|---------------|
| iOS | System Settings > Display | `UIUserInterfaceStyle`, `@media (prefers-color-scheme: dark)` |
| Android | System Settings > Display | `Configuration.uiMode`, `@media (prefers-color-scheme: dark)` |
| Web | OS setting or manual toggle | `@media (prefers-color-scheme: dark)` + class toggle |

**Rule:** Support `prefers-color-scheme` auto-matching AND provide a manual toggle. 64.6% of users expect auto-matching.

---

## PWA Capabilities (2026)

**What PWAs can do:** Offline, push notifications, app icon, full screen, file handling, share target, background sync, badging.

**What PWAs still can't do well:** Bluetooth (limited), NFC (limited), health sensors, Siri/Google Assistant integration, App Store discovery.

**When PWA is sufficient:** Content apps, dashboards, tools, internal business apps.

**When native is required:** AR/VR, health tracking, hardware-intensive features, App Store presence needed for discovery.
