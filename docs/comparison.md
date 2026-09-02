# How it compares

ui-ux-suite does not replace Lighthouse or axe. It covers the gap they leave: design quality
read out of your source, with a fix you can paste.

The differentiator in one line: located and measured and fixed, with a WCAG success criterion
or a named UX law behind it, from your source files or a running URL, in one zero-dependency
command.

| | ui-ux-suite | Lighthouse | axe-core | CSS and design linters |
|:--|:--:|:--:|:--:|:--:|
| Points at the exact `file:line` plus selector | yes | no, URL only | no, DOM node only | yes, lint rules |
| Reports the measured wrong value | yes | partial | yes, contrast | no |
| Gives a concrete before to after fix | yes | no | no | partial, autofix |
| Cites WCAG 2.2 and APCA | yes | WCAG only | WCAG only | no |
| Cites named Laws of UX | yes | no | no | no |
| Works on static source with no running URL | yes | no, needs a URL | no, needs a DOM | yes |
| Works on a running URL | yes, opt-in | yes | yes | no |
| Covers 12 design dimensions beyond accessibility | yes | partial | accessibility only | per rule |
| Zero runtime dependencies | yes | no | no | no |

## When to reach for something else

- **You need a performance budget.** Lighthouse measures load, not layout. Use it.
- **You need a full DOM accessibility sweep of a live page.** axe-core is the reference
  implementation and ui-ux-suite calls it for you in deep mode.
- **You want code style enforced on save.** That is a linter's job, and a linter is faster at it.

ui-ux-suite is the pass that runs when none of those can tell you that your body copy is 11px,
your primary button is a ghost link, and 43 colors are doing the work of 8.
