# Example 03 — Contrast check: `uiux_check_contrast`

Check any color pair against WCAG 2.2 and APCA in one tool call — no audit needed.

## Via the MCP tool

```json
{
  "tool": "uiux_check_contrast",
  "arguments": {
    "foreground": "#fbfbfb",
    "background": "#ffffff"
  }
}
```

Result:

```json
{
  "foreground": "#fbfbfb",
  "background": "#ffffff",
  "wcagRatio": 1.03,
  "apcaLc": 0,
  "wcagAA": false,
  "wcagAAA": false,
  "wcagAALarge": false,
  "pass": false,
  "suggestion": "Change foreground to #767676 for 4.54:1 (meets WCAG AA normal text)"
}
```

## The real finding from the planted fixture

```
Low text contrast on `.hero-subtitle`: 1.03:1
  src/styles.css:14   ·   WCAG 1.4.3 Contrast (Minimum) (AA)
  measured: 1.03:1 (APCA Lc 0)
  fix: change color on `.hero-subtitle` from #fbfbfb to #767676
       (meets 4.5:1 on #ffffff), or darken further.
```

This is what sets ui-ux-suite apart: the tool finds `#fbfbfb` at `styles.css:14` in your
source and tells you it fails. Not "your contrast may be low" — the exact file, the exact
line, the exact ratio, and the exact fix.

## WCAG thresholds at a glance

| Context | Required ratio |
|:--------|:--------------|
| Normal text (AA) | 4.5:1 |
| Large text / UI components (AA) | 3:1 |
| Normal text (AAA) | 7:1 |
| Large text (AAA) | 4.5:1 |
