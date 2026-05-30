# examples/

Working examples of ui-ux-suite in action.

| Example | What it shows |
|:--------|:--------------|
| [`01-cli-audit/`](01-cli-audit/) | Run `npx ui-ux-suite` on a sample component — terminal output, JSON output, and the HTML report |
| [`02-mcp-tool-call/`](02-mcp-tool-call/) | Call `uiux_audit_run` directly as an MCP tool (Claude Code / Cursor / VS Code) |
| [`03-contrast-check/`](03-contrast-check/) | `uiux_check_contrast` for a single color pair — WCAG 2.2 + APCA result |
| [`04-ci-gate/`](04-ci-gate/) | `--fail-under 7` in a GitHub Actions workflow |

Each example folder contains:
- a small **sample component** (the target being audited)
- the **command** to run
- the **expected output** (captured from a real run)

All examples are read-only audits — nothing in the sample component is modified.
