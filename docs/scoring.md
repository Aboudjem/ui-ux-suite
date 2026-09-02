# How the score is built

Every audit ends with one number out of 10. It is a weighted average of 12 dimension scores.
The weights live in `lib/schema.js` and are the single source of truth; this page mirrors them.

One detail worth knowing before you set a threshold: each dimension scorer clamps its result to
the 1 to 10 range, so neither a dimension score nor the overall ever reaches 0, however bad the
project is. Read the scale as 1 to 10 in practice.

## The 12 weighted dimensions

| Dimension | Weight | What it checks |
|:----------|:------:|:---------------|
| Accessibility | 12% | Focus visible, alt text, labels, target size, reduced motion |
| Color System | 10% | WCAG and APCA contrast, duplicate hues, semantic roles, dark mode |
| Typography System | 10% | Scale consistency, font count, body size, line height |
| Layout and Spacing | 10% | Grid, off-scale values, breakpoints, container widths |
| Component Quality | 10% | States: hover, focus, disabled, loading, error |
| Visual Hierarchy | 10% | Type scale, information priority, scannability |
| Interaction Quality | 8% | Animation timing, easing, feedback |
| Responsiveness | 8% | Breakpoints, container queries, viewport meta |
| Visual Polish | 7% | Shadow quality, radius tokens, off-scale arbitrary values |
| Performance UX | 5% | Loading states, perceived speed |
| Information Architecture | 5% | Validation, navigation, command palette |
| Platform Appropriateness | 5% | Dark mode, component library, accessibility primitives |

Accessibility carries the most weight because it affects the most users, and because its
findings are the ones with an external standard behind them.

## How a dimension score is produced

Each dimension starts at 10. Every rule that fires subtracts a fixed amount set by that rule,
attaches a finding, and the result is clamped to the 1 to 10 range (`Math.max(1, Math.min(10, ...))`
at the end of every scorer in `lib/scoring.js`). Findings carry a severity of
`critical`, `important`, `suggestion` or `nice-to-have`, which drives ranking and the `severity:`
tags, not the size of the deduction.

A dimension the audit could not evidence at all is scored `null` and dropped from the weighted
average rather than counted as zero, so a project with no components is not punished for a
component score it never earned. The remaining weights renormalise over what was measured
(`calculateOverall` in `lib/schema.js`).

## Reading a run

```
**Overall: 3.7/10 - Needs Work**

| Dimension | Score | Weight |
|-----------|-------|--------|
| Color System | 3.8/10 |####......| | 10% |
| Typography System | 1.5/10 |##........| | 10% |
| Accessibility | 1.6/10 |##........| | 12% |
```

That block is real output from `npx ui-ux-suite test/fixtures/planted-ux-problems`, the
deliberately broken fixture shipped with the repo. It is supposed to score badly.

## Gating on the score

```bash
npx ui-ux-suite . --fail-under 7
```

Exits 1 when the overall score is below 7. Use it when you want an absolute bar.

If your project starts below the bar you want, freeze today's debt instead and gate on new
findings only:

```bash
npx ui-ux-suite . --write-baseline .uiux-baseline.json
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
```

Filtering with `--tags` or `--exclude-tags` changes what the report shows, never what the score
is. `--fail-under` and the baseline comparison both read the unfiltered audit, so a narrowed
report cannot hide a regression.
