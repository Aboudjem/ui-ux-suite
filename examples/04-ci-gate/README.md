# Example 04 — CI gate with `--fail-under`

Block merges when the design score drops below your threshold.

## The command

```bash
npx ui-ux-suite . --fail-under 7
```

Exit codes:
- `0` — score is at or above 7
- `1` — score is below 7 (CI fails the step)
- `2` — path not found
- `3` — insufficient evidence (too few files to score)

## GitHub Actions workflow

```yaml
# .github/workflows/design-audit.yml
name: Design audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Design audit (fail under 7)
        run: npx --yes ui-ux-suite . --fail-under 7
```

## JSON output for downstream processing

```bash
npx ui-ux-suite . --json 2>/dev/null | jq '{score: .scoreCard.overall, grade: .scoreCard.grade}'
```

```json
{
  "score": 4.9,
  "grade": "Needs Work"
}
```

## Thresholds by maturity

| Stage | Suggested threshold |
|:------|:------------------:|
| Early prototype | 5 |
| Beta / staging | 7 |
| Production | 8 |
