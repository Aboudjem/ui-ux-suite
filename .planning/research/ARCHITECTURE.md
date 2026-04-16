# Architecture Research — Plugin Packaging & Distribution

## Current Structure (already good)

```
ui-ux-suite/
  lib/           # 11 JS engine modules (2,934 lines)
  agents/        # 12 specialized agent definitions
  skills/        # 14 skill definitions with triggers
  knowledge/     # 19 knowledge base documents (3,081 lines)
  commands/      # 14 command definitions
  templates/     # 5 output templates
  manifest.json  # Claude Code plugin manifest
  package.json   # npm package definition
```

## Distribution Channels

### 1. Claude Code Plugin (Primary)
```bash
claude plugin add github:Aboudjem/ui-ux-suite
```
- Requires: valid `manifest.json` with agents, skills, mcpServer
- manifest.json already exists and is correctly structured
- MCP server at `lib/mcp-server.js` exposes 14 tools

### 2. npm (Secondary)
```bash
npm install -g ui-ux-suite
# or
npx ui-ux-suite
```
- Requires: `bin` field in package.json pointing to CLI entry
- Currently missing: CLI entry point for standalone usage
- Consider: thin CLI wrapper that runs the audit runner directly

### 3. GitHub (Discovery)
- README is the storefront
- Topics/tags for discoverability: `claude-code`, `claude-code-plugin`, `ui-ux`, `design-audit`, `accessibility`, `design-system`
- GitHub description matches npm description

## Files Needed for OSS Launch

| File | Purpose | Priority |
|------|---------|----------|
| README.md | Complete rewrite with KPIs, examples, badges | P0 |
| LICENSE | MIT license file (declared but file missing) | P0 |
| CONTRIBUTING.md | Fork → install → test → PR workflow | P0 |
| CODE_OF_CONDUCT.md | Contributor Covenant | P1 |
| SECURITY.md | Responsible disclosure | P1 |
| .github/workflows/ci.yml | GitHub Actions CI | P0 |
| .gitignore | Proper ignores for Node.js project | P0 |
| CHANGELOG.md | Version history starting from 0.1.0 | P1 |
| examples/ | Sample audit output for different project types | P1 |

## Cross-Platform Considerations

- Zero dependencies = works everywhere Node.js runs
- No native modules, no build step
- Pure JavaScript (not TypeScript) = no compilation needed
- File system operations use `fs` and `path` (cross-platform)
- CSS parsing uses regex (no native dependencies)

## Build Order

1. **Repo hygiene** — .gitignore, LICENSE, cleanup
2. **README** — The compelling pitch with evidence
3. **CI** — GitHub Actions for validation
4. **Community files** — CONTRIBUTING, CODE_OF_CONDUCT, SECURITY
5. **GitHub repo** — Create, push, configure topics
6. **npm publish** — Package and publish
