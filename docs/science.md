# What the findings stand on

Every finding cites something outside the tool's opinion. This page names the sources and shows
how to check them yourself.

## Contrast is computed, not estimated

Contrast ratios come from the project's own math in `lib/color-engine.js`, which implements both
the WCAG 2.2 relative-luminance ratio and APCA lightness contrast. Nothing is looked up or
approximated. The fixture's `1.03:1` for `#fbfbfb` on `#ffffff` is reproducible:

```bash
npx ui-ux-suite test/fixtures/planted-ux-problems
```

The color engine also does OKLCH parsing and deltaE near-duplicate detection, which is how the
audit can say two of your brand colors are the same color.

## Accessibility findings cite a WCAG success criterion

Findings name the exact criterion rather than "fails accessibility". The citation table lives in
`WCAG_SC` in `lib/schema.js` and holds twelve criteria today:

| Criterion | Name | Level |
|:--|:--|:--:|
| 1.1.1 | Non-text Content | A |
| 1.4.1 | Use of Color | A |
| 1.4.3 | Contrast (Minimum) | AA |
| 1.4.10 | Reflow | AA |
| 1.4.11 | Non-text Contrast | AA |
| 1.4.12 | Text Spacing | AA |
| 2.4.7 | Focus Visible | AA |
| 2.4.11 | Focus Not Obscured (Minimum) | AA |
| 2.5.5 | Target Size (Enhanced) | AAA |
| 2.5.8 | Target Size (Minimum) | AA |
| 3.1.1 | Language of Page | A |
| 3.3.2 | Labels or Instructions | A |

Each becomes a `wcag:<criterion>` tag plus a conformance tag (`wcag2a`, `wcag2aa`, `wcag2aaa`),
so you can filter a run down to exactly the level you are held to.

## UX findings cite a named law

A UX finding names a law from an allow-list of 21 (`LAW_META` in `lib/schema.js`), each linking
to its canonical page on [lawsofux.com](https://lawsofux.com/). The shipped broken fixture
triggers thirteen of them: Fitts's Law, Miller's Law, Tesler's Law, Jakob's Law, Postel's Law,
the Doherty Threshold, the Law of Proximity, the Law of Similarity, the Law of Pragnanz, the
Peak-End Rule, the Von Restorff Effect, Occam's Razor and the Aesthetic-Usability Effect.

A wrong citation is worse than no citation, so the allow-list is pinned by a test and a law that
is not on it cannot reach a finding. The prose in `knowledge/` is written fresh from primary
sources under this project's MIT license, and an automated test asserts that no `source` field in
`KNOWLEDGE.laws` carries a `lawsofux.com` string.

## The regression gate

`npm test` runs 356 tests across 28 test files. They are not smoke tests. The suite walks the
twelve planted problems in the shipped fixture and asserts that each one still produces a finding
carrying `evidence.file`, `evidence.line` and a `fix`, so a change that makes the tool vaguer
fails the build even when it still "detects" the problem.

Not every finding is located. On that fixture the audit produces 92 findings and 46 of them carry
a file, a line and a fix; the rest are project-level judgments, like the font-family count, that
have no single line to point at. The regression gate covers the located half, which is the half
you act on.

`test/fixtures/planted-ux-problems/PLANTED.md` holds the ground truth for that fixture: each
planted problem, the file and line it lives on, the real measured wrong value, and the finding a
serious tool should produce. It is worth reading before you trust any design linter, including
this one.

## What it does not do

- It does not run your app unless you ask for deep mode and give it a URL.
- It does not judge taste. There is no rule for "this looks dated".
- It does not edit your files. See the guarantee in the README.
