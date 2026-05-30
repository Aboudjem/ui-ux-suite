# Example 01 — CLI audit on a sample component

Audit the sample component with `npx ui-ux-suite` and see the located, measured, fixed findings.

## Sample component

`src/` contains a small React component with deliberate design problems planted for demonstration.

## Run it

```bash
npx ui-ux-suite examples/01-cli-audit/src
```

Human-readable report (default):

```
ui-ux-suite v0.5.0
Scanning: examples/01-cli-audit/src

# Design Audit Report

Overall: 3.7/10 - Needs Work
```

JSON output (machine-readable, banner goes to stderr):

```bash
npx ui-ux-suite examples/01-cli-audit/src --json | jq '.scoreCard.overall'
# → 3.7
```

HTML report (standalone, dark-theme):

```bash
npx ui-ux-suite examples/01-cli-audit/src --html examples/01-cli-audit/report.html
open examples/01-cli-audit/report.html
```

## Expected output

See [`expected-output.txt`](expected-output.txt) for the verbatim terminal output from a real run.

## What the findings look like

Every finding is **located** (file:line + selector), **measured** (real wrong value), **fixed** (exact diff), and **cited** (WCAG SC or named UX law):

```
Low text contrast on `.hero-subtitle`: 1.03:1
  src/styles.css:14   ·   WCAG 1.4.3 Contrast (Minimum) (AA)
  measured: 1.03:1 (APCA Lc 0)
  fix: change color on `.hero-subtitle` from #fbfbfb to #767676
       (meets 4.5:1 on #ffffff), or darken further.
```

That is the whole point: **not "improve your contrast" — the exact line, the measured ratio, and the exact fix.**
