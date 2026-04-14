# Timeless Design Principles

> Core heuristics and layout principles with concrete UI implications.

---

## Nielsen's 10 Heuristics (with modern extensions)

### 1. Visibility of System Status
Always show what's happening. Users should never wonder "did that work?"
- **UI implications:** Loading indicators, save confirmations, sync status, progress bars, toast notifications, real-time validation
- **Modern extension:** Optimistic updates with rollback, streaming indicators for AI, connection status badges

### 2. Match Between System and Real World
Use the user's language, not developer jargon.
- **UI implications:** Labels say "Delete account" not "Deactivate resource", dates say "Yesterday" not "2026-04-13T00:00:00Z"
- **Modern extension:** Locale-aware formatting, context-sensitive terminology, AI-generated explanations

### 3. User Control and Freedom
Undo, back, escape, cancel — always available.
- **UI implications:** Undo for destructive actions, clear navigation history, close buttons on all overlays, cancel on long operations
- **Modern extension:** Command palette (Cmd+K) for power users, keyboard shortcuts, bulk undo

### 4. Consistency and Standards
Same action = same result everywhere.
- **UI implications:** Button styles consistent, icons mean the same thing, navigation in same position, same terminology throughout
- **Modern extension:** Design tokens enforce consistency at the system level

### 5. Error Prevention
Constraints > error messages. Prevent errors before they happen.
- **UI implications:** Disabled states with explanations, input masks, type-appropriate keyboards, confirmation for destructive actions, autosave
- **Modern extension:** AI-powered smart defaults, predictive validation, soft limits before hard limits

### 6. Recognition Over Recall
Show options, don't make users memorize.
- **UI implications:** Dropdown menus, recent items, search with suggestions, visible labels (not placeholder-only), breadcrumbs
- **Modern extension:** Command palette with fuzzy search, AI-suggested actions, recently used items

### 7. Flexibility and Efficiency
Shortcuts for experts, simplicity for beginners.
- **UI implications:** Keyboard shortcuts, bulk operations, saved filters, templates, customizable dashboards
- **Modern extension:** Progressive disclosure, expert mode toggle, AI adapting to user proficiency

### 8. Aesthetic and Minimalist Design
Every element must earn its space.
- **UI implications:** Remove decorative elements that don't serve function, reduce visual noise, whitespace is not wasted space
- **Modern extension:** Strategic minimalism — minimal but with personality and craft

### 9. Help Users Recognize, Diagnose, Recover from Errors
Plain language errors with solutions.
- **UI implications:** "Your password needs 8+ characters" not "Error 422", inline field errors, suggest fixes, recovery actions
- **Modern extension:** AI-powered error resolution, contextual help, auto-retry for transient failures

### 10. Help and Documentation
Contextual, searchable, task-oriented.
- **UI implications:** Tooltips, onboarding tours, contextual help panels, searchable docs, interactive guides
- **Modern extension:** AI copilot as contextual help, in-app command search, video walkthroughs

---

## Layout Principles

### Proximity
Related items close together, unrelated items far apart. This is the most powerful grouping mechanism — spacing communicates relationships.

### Alignment
Everything should align to something. Misaligned elements create visual tension and reduce perceived quality. Use a grid or alignment guides.

### Repetition
Consistent patterns reduce learning cost. Once a user learns how one card works, all cards should work the same way.

### Contrast
Important things should be visually distinct. Use size, color, weight, or spacing to create clear visual differences between primary and secondary content.

### Hierarchy
Visual weight guides attention order. The most important element should be the most visually prominent. Hierarchy is created through: size > color > weight > position.

### Balance
Symmetrical (formal, stable) or asymmetrical (dynamic, energetic) — choose intentionally based on product personality.

---

## Interaction Principles

- **Direct manipulation** over abstract commands — drag to reorder, click to edit inline
- **Immediate feedback** for every action — within 100ms
- **Reversible actions** where possible — undo, cancel, revert
- **Progressive disclosure** — simple first, details on demand
- **Reduce interaction cost** — fewer clicks, less typing, smarter defaults
- **Forgiveness** — accept varied input formats, confirm destructive actions, auto-save
