# Phase 1: Repo Hygiene - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Clean the codebase so it's safe and professional for public exposure as an open source project. This phase covers: .gitignore, LICENSE file, package.json metadata completion, manifest.json validation, and removal of any internal paths or dev artifacts from committed files.

</domain>

<decisions>
## Implementation Decisions

### Gitignore Scope
- **D-01:** Exclude all internal dev artifacts: `.deep-research/`, `.omc/`, `.planning/`, `.claude-plugin/`, `node_modules/`, `.env`, `.DS_Store`
- **D-02:** Keep knowledge/ and templates/ — these ARE part of the plugin and should be public
- **D-03:** Do NOT exclude agents/, skills/, commands/ — these are core plugin functionality

### Package Identity
- **D-04:** npm package name: `ui-ux-suite` (check availability, fallback to `@aboudjem/ui-ux-suite` if taken)
- **D-05:** Add `bin` field pointing to a thin CLI entry point for future `npx` support
- **D-06:** Keywords: `claude-code`, `claude-code-plugin`, `ui`, `ux`, `design`, `audit`, `accessibility`, `color`, `typography`, `design-system`, `design-tokens`, `tailwind`, `css`, `wcag`, `apca`
- **D-07:** Add `engines` field: `{"node": ">=18"}`
- **D-08:** Add `repository`, `homepage`, `bugs` fields pointing to github.com/Aboudjem/ui-ux-suite
- **D-09:** Add `files` field to control npm package contents (include lib/, agents/, skills/, knowledge/, commands/, templates/, manifest.json)

### License Copyright
- **D-10:** Full MIT license text with `Copyright (c) 2026 Adam Boudjemaa`
- **D-11:** LICENSE file at repository root

### Manifest Validation
- **D-12:** Keep root `manifest.json` as the plugin manifest — it's already correctly structured with agents, skills, and mcpServer fields
- **D-13:** Verify all agent/skill file paths in manifest resolve to actual files

### Claude's Discretion
- File ordering and organization within .gitignore
- Exact wording of package.json description (keep current or refine)
- Whether to add a .npmignore vs using package.json `files` field (prefer `files`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Plugin Structure
- `manifest.json` — Plugin manifest defining agents, skills, and MCP server entry point
- `package.json` — npm package configuration

### Requirements
- `.planning/REQUIREMENTS.md` — REPO-01 through REPO-05 define success criteria

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `manifest.json` — Already valid Claude Code plugin manifest with 12 agents, 14 skills, 1 MCP server
- `package.json` — Already has name, version, description, author, license, main, scripts, keywords

### Established Patterns
- Zero dependencies — project has no node_modules dependencies, only uses Node.js built-ins
- All engines in `lib/` use CommonJS `require()` — no build step needed
- Knowledge base is pure markdown — no compilation

### Integration Points
- `lib/mcp-server.js` is the MCP entry point (already declared in manifest and package.json main)
- All 12 agent .md files referenced by path in manifest.json
- All 14 skill .md files referenced by path in manifest.json

</code_context>

<specifics>
## Specific Ideas

- Follow sniff project structure as reference (LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, .github/workflows/)
- README is Phase 2 — do NOT write the full README in this phase, just ensure the repo is clean

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-repo-hygiene*
*Context gathered: 2026-04-16*
