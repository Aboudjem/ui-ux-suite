# Command surface — design decisions

## What's visible in the `/` menu

| Command | Visible | Reason |
|:--------|:-------:|:-------|
| `audit` | yes | Master orchestrator — runs the full 12-dimension pipeline. This is the one command users need. |
| `a11y` | no | Covered by `audit --dimensions=accessibility`. Claude invokes it directly when asked "check contrast" or "fix focus rings". |
| `colors` | no | Covered by `audit --dimensions=color`. |
| `components` | no | Covered by `audit --dimensions=components,interaction`. |
| `typography` | no | Covered by `audit --dimensions=typography,hierarchy`. |

**Before:** 5 commands visible. **After:** 1 command visible.

## Why

The owner is ADHD. A five-item `/` menu where four entries are scoped variants of the
fifth is pure friction — the user has to mentally diff them before picking one. Hiding
the dimension-scoped commands removes that decision entirely.

No capability is lost. `user-invocable: false` only suppresses the command from the
menu; Claude can still invoke each scoped command when context calls for it (e.g., a
user asking "just check my contrast" routes to `a11y` internally). The scoped commands
also remain directly invocable by typing the full name if needed.

## Skills (separate surface, unchanged)

The `skills/` directory has 14 entries covering design-audit, design-score,
design-tokens, theme-builder, style-direction, refactor-plan, flow-audit, layout-audit,
color-audit, component-audit, a11y-audit, type-audit, design-checklist, design-compare.
Skills are trigger-matched by Claude, not listed in the `/` menu, so they don't
contribute to menu clutter. No changes made here.
