# CLI reference

```bash
npx ui-ux-suite [path] [flags]
```

`path` defaults to the current directory. Everything below is `npx ui-ux-suite . <flag>`.

## Output

| Flag | What it does |
|:--|:--|
| (none) | Markdown report on stdout, banner on stderr |
| `--json` | Machine-readable JSON on stdout, banner on stderr, so `\| jq` works |
| `--html FILE` | Standalone dark-theme HTML report written to `FILE` |
| `--sarif FILE` | SARIF 2.1.0 written to `FILE`, for GitHub code scanning |

`--sarif` emits one rule per dimension that produced a finding, maps severity onto the SARIF
level enum, and attaches a location only when the finding names a real file. A failed SARIF
write exits 1, because a CI artifact that silently did not appear is worse than a loud failure.
A failed `--html` write only warns, which is the older contract and is kept.

## Gating

| Flag | What it does |
|:--|:--|
| `--fail-under N` | Exit 1 when the overall score is below `N` |
| `--write-baseline FILE` | Record today's findings and score to `FILE`, then exit 0 |
| `--baseline FILE` | Compare this run against `FILE` and report the difference |
| `--fail-on-regression` | With `--baseline`, exit 1 on a new finding or a score drop |

`--baseline` without `--fail-on-regression` reports and exits 0, so you can watch the diff before
you enforce it. A baseline entry is keyed on dimension, file and line, so a finding that moves to
a different file or line reads as new. Two known limits, both deliberate: inserting a line above
an issue shifts its key, and a resolved finding replaced by a different finding on the same line
leaves the count unmoved. A baseline written by another tool, or in a newer format, is rejected
rather than silently accepted.

## Filtering

| Flag | What it does |
|:--|:--|
| `--tags a,b` | Show only findings carrying any of these tags |
| `--exclude-tags a,b` | Drop findings carrying any of these tags. Exclude wins |
| `--list-tags` | Print every tag this audit produced, then exit |

Tags are derived from what each finding already cites, never invented:

- `dimension:<id>`, for example `dimension:accessibility`
- `severity:<level>`, one of `critical`, `important`, `suggestion`, `nice-to-have`
- `wcag:<criterion>` plus a conformance tag, `wcag2a`, `wcag2aa` or `wcag2aaa`
- `law:<slug>`, validated against the law allow-list, for example `law:fittss-law`
- `nielsen:<n>`, for a Nielsen heuristic

Filtering changes what is reported. It never recomputes the score, and the baseline comparison
reads the unfiltered audit, so a narrowed run cannot hide a regression or move `--fail-under`.

## Other

| Flag | What it does |
|:--|:--|
| `--mcp` | Start as an MCP server over stdio |
| `--version`, `-v` | Print the version |
| `--help`, `-h` | Print usage |

## Exit codes

| Code | Meaning |
|:--:|:--|
| 0 | Audit completed, no gate tripped |
| 1 | Audit error, a gate tripped, or a SARIF write failed |
| 2 | Path not found |
| 3 | Insufficient evidence to score |

## Recipes

```bash
# Ship a SARIF file to GitHub code scanning
npx ui-ux-suite . --sarif ui-ux.sarif

# Freeze today's debt, then fail only on something new
npx ui-ux-suite . --write-baseline .uiux-baseline.json
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression

# Accessibility only, and skip the low-priority noise
npx ui-ux-suite . --tags dimension:accessibility --exclude-tags severity:nice-to-have

# Pull one finding out of the JSON
npx ui-ux-suite . --json | jq '.topFindings[0]'
```

## Deep mode

Static analysis is the default and needs no browser. Deep mode is opt-in: install the optional
peer dependencies (`playwright-core`, `@axe-core/playwright`) and pass a `baseUrl` through the
MCP tool or a skill to also measure live contrast, flag touch targets under 44 by 44 pixels, and
screenshot routes. With the dependencies absent it degrades to source-based findings rather than
failing.
