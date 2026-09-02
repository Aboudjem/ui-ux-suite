# Editors and agents

ui-ux-suite reaches an editor two ways. Pick whichever fits.

- **Skills.** The 14 `/design-*` skills load into any agent that reads the Agent Skills format.
  One command installs them: `npx skills add Aboudjem/ui-ux-suite -a <agent>`.
- **MCP server.** `npx -y ui-ux-suite --mcp` starts a stdio MCP server that exposes the audit,
  scoring, contrast and token tools. Works in every MCP-capable client, no skills needed.

Both run locally. Nothing is uploaded, and no API key is involved.

## Install the skills

```bash
npx skills add Aboudjem/ui-ux-suite -a codex
npx skills add Aboudjem/ui-ux-suite -a cursor -y
npx skills add Aboudjem/ui-ux-suite -a github-copilot --global
npx skills add Aboudjem/ui-ux-suite --list        # see the 14 skills without installing
```

`-a` takes a comma-separated list, so `-a codex,cursor,gemini-cli` installs to three at once.
`-y` skips the scope prompt, `-g` installs globally instead of into the current project.

| Agent | `-a` code | Where the skills land (global) |
| --- | --- | --- |
| Claude Code | `claude-code` | `~/.claude/skills/` (or use the plugin, below) |
| Cursor | `cursor` | `~/.cursor/skills/` |
| Codex | `codex` | `~/.codex/skills/` |
| GitHub Copilot, VS Code | `github-copilot` | `~/.copilot/skills/` |
| Gemini CLI | `gemini-cli` | `~/.gemini/skills/` |
| OpenCode | `opencode` | `~/.config/opencode/skills/` |
| Windsurf | `windsurf` | `~/.codeium/windsurf/skills/` |
| Zed | `zed` | `~/.agents/skills/` |
| Cline | `cline` | `~/.agents/skills/` |
| Kimi Code CLI | `kimi-code-cli` | `~/.agents/skills/` |
| Antigravity | `antigravity` | `~/.gemini/antigravity/skills/` |
| Mistral Vibe | `mistral-vibe` | `~/.vibe/skills/` |
| Trae | `trae` | `~/.trae/skills/` |
| Pi | `pi` | `~/.pi/agent/skills/` |
| OpenClaw | `openclaw` | `~/.openclaw/skills/` |
| Hermes Agent | `hermes-agent` | `~/.hermes/skills/` |

The full table of supported agents lives at
[vercel-labs/skills](https://github.com/vercel-labs/skills#supported-agents).

In Claude Code the plugin is the shorter route, because it brings the skills and the MCP server
together:

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

### install.sh

`install.sh <platform>` is the offline path. It now delegates to `npx skills add` for the
platform you name, and `install.sh <platform> --legacy` keeps the original behavior of
symlinking `skills/` straight into that CLI's directory, for machines with no npx.

```bash
curl -fsSL https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/install.sh | bash -s codex
./install.sh codex --legacy      # symlink, no npx
./install.sh all                 # every platform at once
./install.sh codex --update      # refresh
./install.sh codex --uninstall   # remove
```

On Windows, run `install.ps1 <platform>` from a checkout. Symlinks need Developer Mode or an
elevated shell.

## Add it as an MCP server

The command is the same everywhere: `npx -y ui-ux-suite --mcp`. Only the config file and its
shape change.

**Claude Code**

```bash
claude mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
claude mcp add --scope project ui-ux-suite -- npx -y ui-ux-suite --mcp
```

**Cursor**, in `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global)

```json
{
  "mcpServers": {
    "ui-ux-suite": { "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"] }
  }
}
```

**VS Code and GitHub Copilot**, in `.vscode/mcp.json`. The top-level key is `servers`, not
`mcpServers`. This is VS Code's own schema and it is the odd one out.

```json
{
  "servers": {
    "ui-ux-suite": { "type": "stdio", "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"] }
  }
}
```

**Codex**, in `~/.codex/config.toml`

```toml
[mcp_servers.ui-ux-suite]
command = "npx"
args = ["-y", "ui-ux-suite", "--mcp"]
```

Or `codex mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp`.

**Gemini CLI**, in `~/.gemini/settings.json` (global) or `.gemini/settings.json` (project)

```json
{
  "mcpServers": {
    "ui-ux-suite": { "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"] }
  }
}
```

Or `gemini mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp`.

**Windsurf**, in `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "ui-ux-suite": { "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"] }
  }
}
```

**Continue**, in `.continue/mcpServers/ui-ux-suite.yaml` or the `mcpServers` block of `config.yaml`

```yaml
mcpServers:
  - name: ui-ux-suite
    command: npx
    args: ["-y", "ui-ux-suite", "--mcp"]
```

**OpenCode**, in `opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "ui-ux-suite": {
      "type": "local",
      "command": ["npx", "-y", "ui-ux-suite", "--mcp"],
      "enabled": true
    }
  }
}
```

**Zed**, in `settings.json`. The key is `context_servers` and `command` is a plain string, not a
nested object.

```json
{
  "context_servers": {
    "ui-ux-suite": { "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"], "env": {} }
  }
}
```

## No editor at all

The CLI stands on its own and needs no install:

```bash
npx ui-ux-suite .                          # report
npx ui-ux-suite . --json | jq              # JSON, banner goes to stderr
npx ui-ux-suite . --sarif ui-ux.sarif      # SARIF 2.1.0 for GitHub code scanning
npx ui-ux-suite . --fail-under 7           # CI gate on the overall score
```
