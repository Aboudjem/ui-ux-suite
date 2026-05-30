# Example 02 — MCP tool call: `uiux_audit_run`

Call `uiux_audit_run` directly as an MCP tool from Claude Code, Cursor, VS Code, or any MCP-capable client.

## Setup (one-line, per editor)

```bash
# Claude Code
claude mcp add ui-ux-suite npx ui-ux-suite --mcp

# Cursor (~/.cursor/mcp.json)
# { "mcpServers": { "ui-ux-suite": { "command": "npx", "args": ["ui-ux-suite", "--mcp"] } } }

# VS Code + Copilot (.vscode/mcp.json)
# { "servers": { "ui-ux-suite": { "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"] } } }
```

## Tool call

Once the server is running, invoke:

```json
{
  "tool": "uiux_audit_run",
  "arguments": {
    "projectPath": "examples/01-cli-audit/src",
    "depth": "quick",
    "format": "full"
  }
}
```

### What you get back

```json
{
  "scoreCard": {
    "overall": 4.9,
    "grade": "Needs Work",
    "dimensions": [
      { "name": "Accessibility",     "score": 3.9, "weight": 0.12 },
      { "name": "Color System",      "score": 7.9, "weight": 0.10 },
      { "name": "Typography System", "score": 2.8, "weight": 0.10 }
    ],
    "topFindings": [
      {
        "severity": "critical",
        "dimension": "color",
        "title": "Low text contrast on `.hero-subtitle` — 1.03:1",
        "evidence": {
          "file": "styles.css",
          "line": 8,
          "selector": ".hero-subtitle",
          "measured": "1.03:1",
          "threshold": "4.5:1"
        },
        "fix": "change color on `.hero-subtitle` from #fbfbfb to #767676",
        "wcag": ["1.4.3"]
      }
    ]
  }
}
```

Every finding carries `evidence.file`, `evidence.line`, `evidence.selector`,
`evidence.measured`, `evidence.threshold`, a concrete `fix`, and a `wcag` or `laws`
citation. No guessing, no generic advice.

## Other useful tools

| Tool | When to use |
|:-----|:------------|
| `uiux_check_contrast` | Check a single color pair instantly |
| `uiux_scan_project` | Detect the framework and styling approach |
| `uiux_extract_colors` | Pull all colors with `file:line:selector` |
| `uiux_laws_query` | Ask about a specific Law of UX |
| `uiux_generate_palette` | Generate an OKLCH-based color system |
