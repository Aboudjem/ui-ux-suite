# Phase 1: Repo Hygiene - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 01-repo-hygiene
**Areas discussed:** gitignore scope, package identity, license copyright, manifest completeness
**Mode:** Auto (all decisions auto-selected with recommended defaults)

---

## Gitignore Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Exclude all internal dev artifacts | .deep-research/, .omc/, .planning/, .claude-plugin/, node_modules/, .env, .DS_Store | ✓ |
| Minimal excludes | Only node_modules and .env | |

**User's choice:** [auto] Exclude all internal dev artifacts
**Notes:** knowledge/, templates/, agents/, skills/, commands/ are part of the plugin and must remain public

---

## Package Identity

| Option | Description | Selected |
|--------|-------------|----------|
| ui-ux-suite (check availability) | Use current name, fallback to scoped @aboudjem/ui-ux-suite | ✓ |
| New memorable name | Create a brand name like sniff did | |

**User's choice:** [auto] ui-ux-suite with availability check
**Notes:** Add bin, engines, repository, homepage, bugs, files fields to package.json

---

## License Copyright

| Option | Description | Selected |
|--------|-------------|----------|
| Copyright 2026 Adam Boudjemaa | Standard MIT with current year | ✓ |
| Copyright 2026-present Adam Boudjemaa | Range format for ongoing updates | |

**User's choice:** [auto] Copyright (c) 2026 Adam Boudjemaa
**Notes:** MIT license, single file at repo root

---

## Manifest Completeness

| Option | Description | Selected |
|--------|-------------|----------|
| Keep root manifest.json as-is | Already valid with agents, skills, mcpServer | ✓ |
| Migrate to .claude-plugin/plugin.json | New directory-based format | |

**User's choice:** [auto] Keep root manifest.json
**Notes:** Verify all file paths resolve to actual files

## Claude's Discretion

- .gitignore organization and ordering
- package.json description wording refinement
- files field vs .npmignore (prefer files)

## Deferred Ideas

None
