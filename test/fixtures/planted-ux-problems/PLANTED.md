# PLANTED UX Problems — Ground Truth

A deliberately broken fixture for RED-baseline grading of `ui-ux-suite`.
Every problem is tagged in-source with a `/* PLANTED[id]: ... */` comment.
All measured values below are **real** (contrast computed with the tool's own
`lib/color-engine.js`; spacing/typography confirmed via `lib/extractors.js` +
`lib/spacing-engine.js` + `lib/type-engine.js`).

Scanned by the tool: `.css`, `.scss`, `.sass`, `.tsx`, `.jsx`, `.vue`, `.svelte`
(see `lib/runner.js` `walkFiles`). **`index.html` is NOT scanned** — kept for
realism and to prove a serious tool should parse HTML.

A "serious" finding = **specific** (which element/selector) + **located**
(file:line/selector) + **measured** (the actual wrong value) + **fixed** (the
exact change to make).

| id | problem | file:line | measured wrong value | IDEAL finding (specific + located + measured + fix) |
|----|---------|-----------|----------------------|------------------------------------------------------|
| **A** | Near-white text on near-white bg | `src/styles.css:13` (`.hero-subtitle`) + `index.html:18` | `color:#fbfbfb` on `background:#ffffff` → **contrast 1.03:1** (WCAG AA needs 4.5:1) | `.hero-subtitle` at `src/styles.css:13`: text `#fbfbfb` on `#ffffff` = **1.03:1**, fails WCAG 2.1 AA (4.5:1) and even AA-large (3:1). Fix: change `color` to at least `#767676` (4.54:1 on white) or darker; keep bg white. |
| **B** | Buried / low-affordance primary CTA styled like a ghost link | `src/styles.css:20` (`.cta-primary`) + `src/components/SignupForm.jsx:23` (`<a class="cta-primary">continue</a>`) | primary action: `background:transparent; border:none; color:#9aa0a6` (**2.64:1** vs white), `padding:4px 6px`, `font-weight:400`, rendered as `<a>` not `<button>` | The primary CTA "continue" (`SignupForm.jsx:23`, styled `src/styles.css:20`) has no fill, no border, muted `#9aa0a6` text (2.64:1), 13px, 4×6px padding — indistinguishable from a tertiary link and below the 44px target. Fix: give it a solid `background` token (e.g. `--primary`), white text ≥4.5:1, `padding:12px 24px`, `font-weight:600`, and render it as a `<button>`/`role=button`. |
| **C** | Low-contrast section vs surroundings | `src/styles.css:35` (`.section-muted`) + `src/components/Card.scss:7` (`.product-card`) | section `background:#f4f5f6` vs page `#ffffff` → **1.09:1** (boundary invisible); section text `#c9ccd1` on `#f4f5f6` → **1.48:1** | `.section-muted` (`src/styles.css:35`) bg `#f4f5f6` differs from page `#ffffff` by only **1.09:1**, so the section has no visible boundary; its text `#c9ccd1` on that bg is **1.48:1** (fails AA). Fix: deepen the surface (e.g. `#eceef1` or add a `1px` border/shadow) and raise text to ≥`#595f66` for 4.5:1. |
| **D** | Tiny touch targets (< 44×44) | `src/styles.css:42` (`.icon-btn` 28×28) + `:48` (`.nav-link` 32px tall) + `SignupForm.jsx:26` | `.icon-btn` = **28×28px**; `.nav-link` height = **32px** — both under the WCAG 2.2 / iOS HIG 44×44 minimum | `.icon-btn` (`src/styles.css:42`) is **28×28px** and `.nav-link` (`:48`) is **32px** tall — below the 44×44px target (WCAG 2.2 §2.5.8, iOS HIG). Fix: set `min-width:44px; min-height:44px` (or expand the hit area via padding) on all interactive controls. |
| **E-alt** | Images missing `alt` | `SignupForm.jsx:14,15` + `index.html:23` | 3 `<img>` tags with **no `alt` attribute** | 3 `<img>` tags (`SignupForm.jsx:14`, `:15`, `index.html:23`) have no `alt`. Fix: add descriptive `alt` (e.g. `alt="Acme logo"`) for meaningful images and `alt=""` for decorative ones. |
| **E-label** | Form inputs with no `<label>` | `SignupForm.jsx:19,20` + `index.html:27,28` | `<input type="email">` & `<input type="password">` have **placeholder only, no `<label>`/`aria-label`** | The email & password inputs (`SignupForm.jsx:19-20`) rely on placeholders with no associated `<label for>` or `aria-label`. Fix: add `<label htmlFor="email">Email</label>` + `id="email"` (placeholders are not labels). |
| **F** | No responsive breakpoints / desktop-only layout | `src/styles.css:56` (`.layout width:1200px`) + `index.html` (no viewport meta) | hard-coded `width:1200px`, `.sidebar 320px`, `.content 880px`, **0 `@media` queries, no `max-width`, no `<meta viewport>`** | The layout (`src/styles.css:56`) is fixed at `1200px` with zero `@media` queries and no viewport meta — it cannot adapt below 1200px. Fix: replace fixed widths with fluid/`max-width` + a responsive grid, add `sm/md/lg` breakpoints, and add `<meta name="viewport" content="width=device-width,initial-scale=1">`. |
| **G** | Body text too small | `src/styles.css:70` (`.body-copy 11px`) + `src/components/Card.scss:15` (`.price 11px`) + `:76` (`.fine-print 12px`) | `.body-copy` = **11px** (`line-height:1.2`), `.price` = **11px**, `.fine-print` = **12px** — below the 16px ideal / 14px minimum | `.body-copy` (`src/styles.css:70`) is **11px / line-height 1.2** — below the 14px minimum (16px recommended) for body text. Fix: raise to `16px` with `line-height:1.5`. |
| **H** | Random off-scale spacing | `src/styles.css:82-90` (`.card`,`.card-header`) + `Card.scss:10-11` | spacing values **7px, 13px, 19px** (none divisible by 4 or 8); also 6px present | `.card`/`.card-header` (`src/styles.css:82`) use **7px, 13px, 19px** padding/margin/gap — off any 4px or 8px grid. Fix: snap to a token scale (e.g. 8px → `4/8/12/16/24`): `7→8`, `13→12`, `19→20`. |
| **I-colors** | Too many unique colors, no system | `src/styles.css:93-125` (`.swatch-01..33`) | **43 unique hex colors** extracted across the project, 0 CSS variables, 0 semantic tokens | 43 unique colors (`src/styles.css` swatch block) with no `--token` system or semantic roles. Fix: consolidate into a palette of ~8-12 tokens (primary/neutral scale + semantic success/error/warning) as CSS variables. |
| **I-fonts** | Too many font families | `src/fonts.css:5-9` | **5 distinct `font-family` declarations** (Playfair Display, Bebas Neue, Lobster, Pacifico, Comic Sans MS) | 5 font families (`src/fonts.css:5-9`) — use 1-2 max. Fix: pick one display + one body family and delete the rest. |
| **J** | No `:focus-visible` styles | `src/styles.css` (hover-only at `:128-130`, **no focus rules anywhere**) + `SignupForm.jsx` | **0 `:focus-visible` / `:focus` / `outline` rules**; only `:hover` exists | No `:focus-visible` styling anywhere — keyboard focus is invisible on the CTA, icon button, and nav links. Fix: add `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }` to all interactive elements. **NOTE:** the current tool FALSELY reports focus-visible as present because its regex matches the literal text `focus-visible` inside the `PLANTED[J]` source comment. |

## Reference: real measured contrast (computed with `lib/color-engine.js`)

| pair | foreground | background | ratio | WCAG AA (4.5:1)? |
|------|-----------|-----------|------:|:----------------:|
| A — hero-subtitle | `#fbfbfb` | `#ffffff` | **1.03:1** | FAIL |
| C — section surface vs page | `#f4f5f6` | `#ffffff` | **1.09:1** | FAIL (invisible boundary) |
| C — section text | `#c9ccd1` | `#f4f5f6` | **1.48:1** | FAIL |
| B — CTA text vs page | `#9aa0a6` | `#ffffff` | **2.64:1** | FAIL |
| Card.scss text | `#cfd2d6` | `#f4f5f6` | **1.39:1** | FAIL |
