# Multi-Editor MCP/CLI Smoke (Independent Verification)

**Verifier role:** Independent verification pass. I did NOT build this; every claim below is
re-derived from the live code (`bin/ui-ux-suite.js`, `lib/mcp-server.js`) and real command
output captured on this machine. No `lib/` or `test/` file was modified.

- **Repo:** `/Users/adamboudj/projects/ui-ux-suite` (branch `rebuild/uiux-10x`)
- **Date:** 2026-05-29
- **Node:** v22.22.0 · **npx:** 10.9.4
- **Package:** `ui-ux-suite@0.3.0` (published to npm — `npm view ui-ux-suite version` → `0.3.0`)
- **Bin:** `/Users/adamboudj/projects/ui-ux-suite/bin/ui-ux-suite.js` (mode `rwxr-xr-x`, shebang `#!/usr/bin/env node`)

## Verdict summary

| Path | Result |
|------|--------|
| CLI: `--version` / `-v` | **PASS** — prints `0.3.0`, exit 0 |
| CLI: `--help` / `-h` | **PASS** — prints usage, exit 0 |
| CLI: audit run (human report) | **PASS** — scorecard + located findings, exit 0 |
| CLI: `--json` stdout purity (banner on stderr) | **PASS** — stdout parses as JSON, `\| jq` works |
| CLI: exit code 2 (missing dir) | **PASS** |
| CLI: exit code 3 (insufficient evidence) | **PASS** |
| CLI: exit code 1 (`--fail-under` gate) | **PASS** (bonus; documented but not in task) |
| MCP stdio: `initialize` | **PASS** |
| MCP stdio: `tools/list` (16 tools) | **PASS** |
| MCP stdio: `tools/call uiux_audit_run` returns located findings | **PASS** — 48 located findings w/ `evidence.file:line:selector` |
| MCP stdio: published `npx ui-ux-suite@0.3.0 --mcp` end-to-end | **PASS** |
| MCP stdio: error envelopes (unknown method / bad path / ping) | **PASS** |
| Full test suite (`node --test`) | **PASS** — 297/297, 0 fail |

**Overall: PASS on both the CLI path and the MCP stdio path.** First-class as both a CLI and an
MCP stdio server. Editor configs below are copy-paste ready.

---

## Path 1 — CLI smoke

### 1a. `--version` / `-v` (exit 0)

```
$ node bin/ui-ux-suite.js --version
0.3.0
exit=0
$ node bin/ui-ux-suite.js -v
0.3.0
exit=0
```

Source: `bin/ui-ux-suite.js:27-30` — `--version`/`-v` → `console.log(pkg.version); process.exit(0)`.

### 1b. `--help` / `-h` (exit 0)

```
$ node bin/ui-ux-suite.js --help   # exit=0
ui-ux-suite v0.3.0
Audit a project's UI/UX and get SPECIFIC, located, measured findings with a concrete fix.

Usage:
  npx ui-ux-suite [path]               Audit a project (default: current directory)
  npx ui-ux-suite [path] --json        JSON output (banner -> stderr, so `| jq` works)
  npx ui-ux-suite [path] --html FILE   Write an HTML report (dark theme) to FILE
  npx ui-ux-suite [path] --fail-under N Exit 1 if overall score < N (CI gate)
  npx ui-ux-suite --mcp                Start as MCP server (Claude Code, Cursor, VS Code, …)
  npx ui-ux-suite --version | --help
```

Source: `bin/ui-ux-suite.js:32-56`.

### 1c. Audit run (human-readable report, exit 0)

```
$ node bin/ui-ux-suite.js test/fixtures/planted-ux-problems   # exit=0

# stderr (banner only):
ui-ux-suite v0.3.0
Scanning: /Users/adamboudj/projects/ui-ux-suite/test/fixtures/planted-ux-problems

# stdout (report, head):
# Design Audit Report
**Duration:** 0.04s
**Files scanned:** 3 CSS, 1 JSX/TSX/Vue/Svelte, 1 HTML
...
**Overall: 3.8/10 - Needs Work**
| Color System | 3.8/10 | ... | Typography System | 1.5/10 | ... | Accessibility | 1.6/10 | ...
```

### 1d. `--json` stdout purity — banner on **stderr**, JSON on **stdout**

This is the load-bearing DX claim (so `| jq` works). Verified by writing stdout and stderr to
separate files and parsing stdout alone:

```
$ node bin/ui-ux-suite.js test/fixtures/planted-ux-problems --json 2>json.err 1>json.out
cli exit=0

$ node -e 'JSON.parse(fs.readFileSync("json.out"))...'
PARSE OK: overall=3.8, grade=Needs Work, located=48

$ cat json.err          # stderr is the banner ONLY (not JSON):
ui-ux-suite v0.3.0
Scanning: .../test/fixtures/planted-ux-problems

$ ... --json | jq -r '.located.findings[0] | "\(.evidence.file):\(.evidence.line) | \(.title)"'
src/styles.css:106 | 18 `.swatch*` color variants fail WCAG AA contrast (worst 1.14:1)
```

Source: `bin/ui-ux-suite.js:68-69` writes the banner with `process.stderr.write(...)`; `:81-82`
writes `JSON.stringify(result)` to `process.stdout`. stdout is a single clean JSON document.

> Note for consumers: per-finding location is under `finding.evidence` (`{file, line, selector,
> measured, threshold}`), not top-level `finding.file`/`finding.line` (those are `null`). All 48
> located findings carry a populated `evidence` block. e.g. `src/styles.css:106`, selector
> `.swatch*`, measured `worst 1.14:1`, threshold `4.5:1`.

### 1e. Exit codes (0 ok · 2 missing dir · 3 insufficient evidence · 1 CI gate)

```
$ node bin/ui-ux-suite.js /tmp/does-not-exist-xyz-123      # exit=2
Error: directory not found: /tmp/does-not-exist-xyz-123

$ mkdir /tmp/empty && node bin/ui-ux-suite.js /tmp/empty   # exit=3
Insufficient evidence: no CSS/JSX/HTML found — nothing to audit.

$ node bin/ui-ux-suite.js test/fixtures/planted-ux-problems --fail-under 7   # exit=1
Overall 3.8 is below --fail-under 7.
```

Source mapping: `bin/ui-ux-suite.js:71-74` → exit 2; `:97-100` → exit 3; `:101-104` → exit 1
(`--fail-under`); normal completion → exit 0. All four exit codes confirmed observationally.

---

## Path 2 — MCP stdio smoke

Driven by piping newline-delimited JSON-RPC 2.0 into
`node bin/ui-ux-suite.js --mcp` (transport: `lib/mcp-server.js:1045-1093`, line-buffered NDJSON
over stdin/stdout). Sequence: `initialize` → `notifications/initialized` → `tools/list` →
`tools/call uiux_audit_run`. The notification correctly produced **no** response (3 sends with
ids + 1 notification → exactly 3 response lines). stderr was empty; exit 0.

### 2a. `initialize`

```json
{
  "protocolVersion": "2024-11-05",
  "capabilities": { "tools": {} },
  "serverInfo": { "name": "ui-ux-suite", "version": "0.3.0" }
}
```

### 2b. `tools/list` — 16 tools

```
tool count: 16
uiux_scan_project, uiux_extract_colors, uiux_extract_typography, uiux_extract_spacing,
uiux_check_contrast, uiux_score_dimension, uiux_score_overall, uiux_generate_palette,
uiux_generate_type_scale, uiux_generate_spacing_scale, uiux_generate_tokens,
uiux_knowledge_query, uiux_laws_query, uiux_audit_run, uiux_audit_log, uiux_audit_report
has uiux_audit_run: true
```

### 2c. `tools/call` → `uiux_audit_run` `{projectPath: <fixture>, format: "summary"}`

```
isError: false
content[0].type: text
payload.success: true
overall: 3.8   grade: Needs Work
locatedFindingCount: 48

# top located findings (dimension | evidence.file:line | selector | title):
accessibility | src/styles.css:106 | .swatch*      | 18 `.swatch*` color variants fail WCAG AA contrast (worst 1.14:1)
accessibility | src/components/Card.scss:9 | .product-card | Low text contrast on `.product-card` — 1.52:1
accessibility | src/styles.css:14  | .hero-subtitle | Low text contrast on `.hero-subtitle` — 1.03:1
accessibility | src/styles.css:23  | .cta-primary   | Low text contrast on `.cta-primary` — 2.64:1
accessibility | src/styles.css:37  | .section-muted | Low text contrast on `.section-muted` — 1.48:1
```

**Confirmed: the MCP `tools/call` returns located findings** with concrete `evidence.file:line`,
selector, and measured-vs-threshold values — identical finding model to the CLI `--json` path
(both read `audit.located.findings`; `lib/mcp-server.js:751-754`, `818-831`).

### 2d. Published `npx` binary end-to-end (proves editor snippets resolve for real)

The package is published, so the `npx ...` snippets below are not aspirational:

```
$ printf '...initialize...tools/list...' | npx --yes ui-ux-suite@0.3.0 --mcp
npx initialize serverInfo: {"name":"ui-ux-suite","version":"0.3.0"}
npx tools/list count: 16, has uiux_audit_run: true
# npx stderr: clean (no npm chatter leaked into stdout)
```

### 2e. Error envelopes (editors probe these)

```
resources/list (unsupported)  -> JSON-RPC error -32601 "Method not found: resources/list"
tools/call w/ bad projectPath -> isError=false, payload.success=false,
                                 error="Project path not found: /no/such/path"   (graceful)
ping                          -> result: {}
```

Source: `lib/mcp-server.js:1033-1042` (unknown method → -32601), `:675-686` (bad path → graceful
`success:false` payload), `:1033-1035` (ping). stderr clean throughout. A bad path is returned as
a domain error in the payload (`isError` stays false) rather than crashing the transport — correct
for keeping the stdio stream alive across an editor session.

---

## Path 3 — Per-editor MCP setup snippets (copy-paste)

**Two equivalent stdio commands** (both verified to launch the server above):

- **Published (recommended):** `npx -y ui-ux-suite --mcp`
- **Local / pinned to this checkout:** `node /Users/adamboudj/projects/ui-ux-suite/bin/ui-ux-suite.js --mcp`

> **Skills/agents/commands vs MCP — important distinction.** The repo bundles **14 skills**
> (`skills/`: a11y-audit, color-audit, component-audit, design-audit, design-checklist,
> design-compare, design-score, design-tokens, flow-audit, layout-audit, refactor-plan,
> style-direction, theme-builder, type-audit), **12 agents** (`agents/`), and **5 slash commands**
> (`commands/`). These are loaded **only by Claude Code** when installed as a *plugin* (via the
> `.claude-plugin/` manifest / a marketplace). Every other editor below consumes the **MCP server
> only** — they get the 16 `uiux_*` tools but **not** the bundled skills/agents/slash-commands.
> `uiux_audit_run` (the one-call full audit) is exposed over MCP, so the core capability is
> available everywhere.

### Claude Code

**Option A — project `.mcp.json`** (already present in this repo at repo root; checked-in form):

```json
{
  "mcpServers": {
    "ui-ux-suite": {
      "command": "npx",
      "args": ["ui-ux-suite", "--mcp"],
      "env": {}
    }
  }
}
```

**Option B — `claude mcp add` (CLI):**

```bash
# published binary, project scope
claude mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp

# or pin to this local checkout
claude mcp add ui-ux-suite -- node /Users/adamboudj/projects/ui-ux-suite/bin/ui-ux-suite.js --mcp
```

**Option C — install as a full plugin** (this is the ONLY path that also loads the 14 skills,
12 agents, and 5 slash commands; `.claude-plugin/marketplace.json` is present):

```bash
/plugin marketplace add Aboudjem/ui-ux-suite
/plugin install ui-ux-suite
```

> **Claude Code is the only editor that loads the bundled skills/agents/commands.** All others
> below are MCP-tools-only.

### Cursor — `~/.cursor/mcp.json` (global) or `<project>/.cursor/mcp.json` (project)

```json
{
  "mcpServers": {
    "ui-ux-suite": {
      "command": "npx",
      "args": ["-y", "ui-ux-suite", "--mcp"]
    }
  }
}
```

### VS Code / GitHub Copilot — `<project>/.vscode/mcp.json`

VS Code uses a top-level `servers` key (not `mcpServers`):

```json
{
  "servers": {
    "ui-ux-suite": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "ui-ux-suite", "--mcp"]
    }
  }
}
```

Alternatively in user `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "ui-ux-suite": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "ui-ux-suite", "--mcp"]
      }
    }
  }
}
```

### Codex CLI — `~/.codex/config.toml`

Codex configures MCP servers in TOML:

```toml
[mcp_servers.ui-ux-suite]
command = "npx"
args = ["-y", "ui-ux-suite", "--mcp"]
```

### Gemini CLI — `~/.gemini/settings.json` (global) or `<project>/.gemini/settings.json`

```json
{
  "mcpServers": {
    "ui-ux-suite": {
      "command": "npx",
      "args": ["-y", "ui-ux-suite", "--mcp"]
    }
  }
}
```

### Windsurf — `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "ui-ux-suite": {
      "command": "npx",
      "args": ["-y", "ui-ux-suite", "--mcp"]
    }
  }
}
```

### Continue.dev — `~/.continue/config.yaml` (or `<project>/.continue/config.yaml`)

```yaml
mcpServers:
  - name: ui-ux-suite
    command: npx
    args:
      - "-y"
      - "ui-ux-suite"
      - "--mcp"
```

> For any editor, swap the published command for the local checkout if you want to track this
> branch: `command: "node"`, `args: ["/Users/adamboudj/projects/ui-ux-suite/bin/ui-ux-suite.js", "--mcp"]`.

---

## What I verified vs. what I asserted

- **Verified by real execution (primaries):** every CLI exit code (0/1/2/3), `--json` stdout
  purity + `jq` pipe, the full MCP `initialize`/`tools/list`/`tools/call` round-trip over stdio
  (both `node <path>` and published `npx`), MCP error envelopes, located-finding content, and the
  297-test suite (0 failures). Command outputs pasted above.
- **Cross-checked against source:** exit-code lines and stdout/stderr split in `bin/ui-ux-suite.js`;
  JSON-RPC handling and the located-finding model in `lib/mcp-server.js`.
- **Not independently launched (config-shape only):** the Cursor/VS Code/Codex/Gemini/Windsurf/
  Continue config files use each tool's documented MCP schema; the *command they invoke*
  (`npx -y ui-ux-suite --mcp`) is the exact command I drove end-to-end, so the server side is
  proven. The only unproven element per-editor is whether that editor's config parser accepts the
  block — which is the editor's responsibility, not this package's.
