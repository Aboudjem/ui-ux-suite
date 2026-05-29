# 00 — Plugin vs Skill vs Hybrid: Phase-7 Decision Evidence

**Repo:** `/Users/adamboudj/projects/ui-ux-suite` (branch `rebuild/uiux-10x`)
**Role:** Plugin & Skill Architect. Decide how `ui-ux-suite` should ship across editors so a developer can run a serious, located, measured design audit.
**Access date for live commands:** 2026-05-29. Tooling: `claude` CLI v2.1.156, `npm` registry, Node.
**Evidence discipline:** every load-bearing claim has Evidence (file:line / command output / source URL) + Confidence. Primary sources for spec claims are the reused research notes `01-skill-authoring.md` and `02-plugin-spec.md` under `/Users/adamboudj/projects/aws-cost-audit-skill/docs/research/`, which themselves cite the official `code.claude.com/docs` pages (accessed 2026-05-28).

---

## TL;DR — Recommended decision

**HYBRID, with the PLUGIN (MCP server + npx CLI) as the engine and a THIN `/design-audit` skill as the orchestration layer.** Keep agents and commands inside the same plugin. The plugin is the unit of distribution and multi-editor reach; the skill is the human/Claude entry point that sequences the deterministic MCP tools and the specialist agents into a located/measured/fixed report.

Status of the orchestrator's framing: this confirms the tool is *already* architected as a hybrid (a plugin that bundles 14 skills + 12 agents + 5 commands + a 17-tool MCP server + an npx CLI). The Phase-7 decision is therefore not "plugin OR skill" — it is **"keep the hybrid, fix the wiring defects, and make the thin-skill boundary explicit."** Two concrete defects block the hybrid from working as shipped (one is a hard validation failure). Both are evidenced and fixed below.

---

## Decision RULE (apply this, don't memorize the answer)

> **Compute = plugin. Judgment = skill. Reach = plugin (MCP + npx CLI).**
>
> 1. If the capability is **deterministic computation or file extraction** (contrast math, OKLCH parsing, token extraction, scoring, finding-assembly with file:line) → it belongs in **`lib/` behind an MCP tool / CLI subcommand**, because it must be byte-identical across every editor and must never depend on a model. *(17 such tools already exist — see Evidence E6.)*
> 2. If the capability is **orchestration or judgment** (which agents to dispatch, how to rank findings, how to phrase the before/after) → it belongs in a **skill or agent prompt**, because it benefits from model reasoning and only needs to run inside an agentic harness (Claude Code).
> 3. If the requirement is **"works in Cursor / VS Code+Copilot / Codex / Gemini / Windsurf / Continue.dev"** → it MUST be reachable as an **MCP server over stdio** (and/or a plain `npx` CLI), because those editors do **not** load Claude Code skills/agents/commands. Skills are Claude-Code-only (`02-plugin-spec.md:320-335`; `01-skill-authoring.md:202-211, 309`).
> 4. A skill should never re-implement compute that an MCP tool already does deterministically; it should **call the tool**. (Today `design-audit/SKILL.md:21-37` correctly references `uiux_*` tools rather than re-deriving math — keep it that way.)

Corollary: **Skill-only is disqualified** because it cannot reach the six non-Claude editors named in the mission. **Plugin-only is disqualified** because non-Claude editors can't run the in-repo agents/commands, and even in Claude Code a bare MCP tool list gives the model no opinionated "audit-then-suggest" workflow. The hybrid is the only shape that satisfies all editors AND a guided workflow.

---

## What is in the box today (inventory)

| Component | Count | Location | Evidence |
|---|---:|---|---|
| Plugin manifest | 1 | `.claude-plugin/plugin.json` | name `ui-ux-suite`, v0.3.0, MIT (`plugin.json:1-13`) |
| Marketplace manifest | 1 | `.claude-plugin/marketplace.json` | single-plugin, `source: "."` (`marketplace.json:9-19`) |
| Legacy manifest | 1 | `manifest.json` (root) | declares agents/skills/commands + `mcpServer` singular (`manifest.json:1-45`) |
| MCP config | 1 | `.mcp.json` | `npx ui-ux-suite --mcp` (`.mcp.json:1-9`) |
| npm package | 1 | `package.json` | `bin.ui-ux-suite`, `main: lib/mcp-server.js`, optional Playwright peers (`package.json:7-42`) |
| CLI entry | 1 | `bin/ui-ux-suite.js` | audit / `--mcp` / `--json` / `--version` / `--help` (`bin/ui-ux-suite.js:51-83`) |
| Skills | 14 | `skills/*/SKILL.md` | design-audit, color/type/layout/a11y/component/flow-audit, style-direction, design-tokens, theme-builder, refactor-plan, design-score, design-compare, design-checklist |
| Agents | 12 | `agents/*.md` | design-auditor + 11 specialists |
| Commands | 5 | `commands/*.md` | audit, colors, a11y, typography, components |
| MCP tools | 17 | `lib/mcp-server.js` TOOLS array | `mcp-server.js:23-268`, smoke-tested (E6) |

---

## Evidence

### E1 — `claude plugin validate .` FAILS today (HARD BLOCKER). Confidence: confirmed.

Command (run in repo root):
```
$ claude plugin validate .
Validating marketplace manifest: /Users/adamboudj/projects/ui-ux-suite/.claude-plugin/marketplace.json
✘ Found 1 error:
  ❯ plugins.0.source: Invalid input
✘ Validation failed
```
Because a `.claude-plugin/marketplace.json` exists, the validator validates the **marketplace**, not the plugin ("When pointed at a marketplace directory, the validator checks `marketplace.json` only" — `02-plugin-spec.md:309`). The single error is `plugins.0.source`. The current value is `"source": "."` (`marketplace.json:12`).

**Root cause = the self-source / relative-path gotcha** documented in research: a relative-path source "**Must start with `./`.** Resolved relative to the marketplace root" (`02-plugin-spec.md:122`). `"."` does not start with `./`, so the schema rejects it. This is the exact "self-source forbidden / single-plugin marketplace gotcha" the brief warned about, and **`claude plugin validate` is the source of truth** — it is currently red.

### E2 — The fix is `source: "./"` and it makes validation PASS. Confidence: confirmed (tested live).

In a throwaway copy at `/tmp/uiux-validate-test` I set `plugins[0].source = "./"` and re-ran:
```
$ claude plugin validate .
Validating marketplace manifest: /private/tmp/uiux-validate-test/.claude-plugin/marketplace.json
✔ Validation passed
```
**Recommended change (do NOT apply in this role — Phase 8/9 owns edits):** `.claude-plugin/marketplace.json:12` `"source": "."` → `"source": "./"`. One character. (Self-referential single-plugin marketplaces are legal — `02-plugin-spec.md:122,130` — the only requirement is the `./` prefix.)

### E3 — Plugin manifest itself is valid; only the marketplace wrapper is broken. Confidence: confirmed (tested live).

Removing `marketplace.json` in the temp copy and re-validating:
```
$ claude plugin validate .
Validating plugin manifest: /private/tmp/uiux-validate-test/.claude-plugin/plugin.json
⚠ Found 1 warning:
  ❯ root: CLAUDE.md at the plugin root is not loaded as project context. To ship context with your plugin, use a skill (skills/<name>/SKILL.md) instead.
✔ Validation passed with warnings
```
So `plugin.json` (`plugin.json:1-13`) is schema-valid. The only warning is the documented "CLAUDE.md at plugin root is not loaded as project context" note (`02-plugin-spec.md:232`) — cosmetic; the repo's `CLAUDE.md` is dev/project context, not shipped plugin context, so it's harmless but worth a `.npmignore`/exclusion note for the package.

### E4 — `ui-ux-suite@0.3.0` IS published on npm → the `npx` multi-editor path actually works. Confidence: confirmed.

```
$ npm view ui-ux-suite version
0.3.0
```
This is load-bearing: `.mcp.json` and the README config for Cursor/VS Code/Windsurf/Gemini/Continue all use `npx ui-ux-suite --mcp` (`.mcp.json:4-5`; README:78-107). That command only resolves if the package is on the public registry — and it is. (If it were not, every non-Claude-Code editor path would be dead. It is live.)

### E5 — The MCP server boots and speaks MCP correctly over stdio (zero-dep, hand-rolled JSON-RPC 2.0). Confidence: confirmed (smoke-tested).

```
$ printf '<initialize>\n<tools/list>\n' | node bin/ui-ux-suite.js --mcp
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"ui-ux-suite","version":"0.3.0"}}}
{"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"uiux_scan_project",...]}}
```
The server: implements MCP JSON-RPC 2.0 over stdin/stdout with **no SDK dependency** (`mcp-server.js:4`, `:911-1066`), handles `initialize`/`tools/list`/`tools/call`/`notifications/*` (`mcp-server.js:925-998`), advertises `protocolVersion 2024-11-05`. This is the keystone of multi-editor reach: a single zero-dep stdio binary that any MCP-capable editor can spawn. The zero-dep choice (no `@modelcontextprotocol/sdk`) is consistent with the project's stated zero-dependency philosophy and means `npx` cold-start has nothing to install beyond the package itself.

### E6 — 17 MCP tools exist; they are the deterministic compute layer. Confidence: confirmed.

`grep -cE "uiux_" lib/mcp-server.js` → tool defs at `mcp-server.js:23,35,47,59,71,94,107,122,136,149,161,175,190,218,234,259`. The set: scan, extract_colors/typography/spacing, check_contrast, score_dimension, score_overall, generate_palette/type_scale/spacing_scale/tokens, knowledge_query, laws_query, **audit_run**, audit_log, audit_report. `uiux_audit_run` is explicitly "the canonical way to audit a project in one call" chaining scan→extract→score→report (`mcp-server.js:218-231`). These belong on the plugin/CLI side per the decision RULE (deterministic compute). NOTE for Phase 8/9: this confirms the orchestrator's separate hypothesis lane — the audit tools accept rich located fields (`uiux_audit_log` takes `before`/`after`/`fix`/`effort`/`laws` — `mcp-server.js:234-256`) yet the scorers emit bare findings; the *schema* for located fixes exists at the MCP boundary, the scoring layer just doesn't fill it. (Out of scope for this artifact; flagged for the scoring lane.)

### E7 — MCP wiring into the plugin is IMPLICIT (auto-discovery), not declared. Confidence: confirmed (spec) + likely (runtime).

`plugin.json` contains **no** `mcpServers` field (`grep -niE "mcp" .claude-plugin/plugin.json` → no match). The MCP server reaches Claude Code only via the root **`.mcp.json`** default location ("MCP servers → `.mcp.json`" auto-discovery table, `02-plugin-spec.md:211`). This works but is fragile/non-obvious:
- The legacy `manifest.json` declares `"mcpServer": "lib/mcp-server.js"` (singular — `manifest.json:44`). That key is **non-standard**; the official manifest field is `mcpServers` (plural, a path to a config file) per `02-plugin-spec.md:183,211`. The root `manifest.json` is the deprecated format the project's own stack doc says to remove (CLAUDE.md: "`manifest.json` (root) … **Remove or redirect**").
- Recommendation (Phase 8/9): rely on `.mcp.json` auto-discovery (keep it), OR make wiring explicit by adding `"mcpServers": "./.mcp.json"` to `plugin.json`; then delete the redundant root `manifest.json` to remove the two-manifest ambiguity the stack doc already flags.

### E8 — README already documents 7 editor install paths. Confidence: confirmed.

`grep` of `README.md` shows install docs for: Claude Code plugin (`marketplace add Aboudjem/10x` / `Aboudjem/ui-ux-suite`, README:66-67,118-137), `claude mcp add` (README:78), Codex CLI (`codex mcp add … npx -y ui-ux-suite --mcp`, README:81), Cursor (README:86), VS Code+Copilot (README:91), Windsurf (README:96), Gemini CLI (README:101), Continue.dev (README:107). This matches the multi-harness distribution pattern the research identified as what the top repos do (`01-skill-authoring.md:292-293`). Gap: the README references TWO marketplaces — `Aboudjem/10x` (README:66) and `Aboudjem/ui-ux-suite` (README:133). The in-repo `marketplace.json` name is `ui-ux-suite` (`marketplace.json:2`), so `/plugin install ui-ux-suite@ui-ux-suite` is the one this repo serves; `@10x` requires the separate aggregate marketplace repo. Phase 8 should confirm both exist or drop one to avoid a dead install command.

---

## Why HYBRID and not the alternatives (mapped to the mission's editor list)

| Editor / harness | Loads CC skills? | Loads CC agents/commands? | Loads MCP server? | How this tool reaches it |
|---|:---:|:---:|:---:|---|
| Claude Code | yes | yes | yes (`.mcp.json`) | Plugin: `/design-audit` skill orchestrates agents + `uiux_*` tools |
| Cursor | no | no | yes | MCP: `npx ui-ux-suite --mcp` (README:86) |
| VS Code + Copilot | no | no | yes | MCP: `.vscode/mcp.json` (README:91) |
| Codex CLI | no | no | yes | MCP: `codex mcp add … npx -y …` (README:81) |
| Gemini CLI | no | no | yes | MCP: `~/.gemini/mcp_config.json` (README:101) |
| Windsurf | no | no | yes | MCP: `~/.codeium/windsurf/mcp_config.json` (README:96) |
| Continue.dev | no | no | yes | MCP: `.continue/mcpServers/...yaml` (README:107) |
| (any, no editor) | n/a | n/a | n/a | CLI: `npx ui-ux-suite [path] [--json]` (`bin/ui-ux-suite.js:56-82`) |

Spec basis for "non-CC editors don't load skills/agents/commands": skills live in CC-specific locations and "do not sync across surfaces" (`01-skill-authoring.md:202-211,309`; `02-plugin-spec.md:320-335`). Only the **MCP server** + **npx CLI** are cross-editor. Therefore the 6 non-Claude editors are reachable ONLY through the plugin's MCP/CLI layer — proving the plugin (not the skill) must carry the engine. The skill adds value exclusively inside Claude Code, as the opinionated "audit-then-suggest" conductor.

### The thin-skill boundary (what `/design-audit` should and should not do)

`design-audit/SKILL.md` today (`SKILL.md:1-58`) is already correctly thin in the right way (it calls `uiux_scan_project`, `uiux_score_overall`, `uiux_knowledge_query`, `uiux_laws_query` rather than doing math) but is **fat in prose** (dispatches 11 agents, prescribes wave strategy, describes report sections). Keep its judgment role; ensure it never duplicates compute:
- **Skill OWNS:** agent dispatch waves, ranking the top-N findings, phrasing before/after, writing the report file, deciding quick/deep depth. (Judgment → model.)
- **Skill DELEGATES (must call, never re-derive):** every contrast ratio, token extraction, score, law citation, and the located finding assembly → `uiux_*` tools / `lib/`. (Compute → deterministic.)
- Frontmatter is spec-clean (`name` matches dir `design-audit`, no reserved words `claude`/`anthropic`, third-person keyword-rich `description` — satisfies `01-skill-authoring.md:27,36-37`). Note the non-standard `trigger:` key (`SKILL.md:4`); the official field is `when_to_use` (`02-plugin-spec.md:356`). `trigger` is ignored by the loader (unrecognized fields are dropped, not errors — `02-plugin-spec.md:198`), so auto-activation currently rides on `description` only. Phase 8 should migrate `trigger:` → `when_to_use:` so the audit phrases actually count toward discovery.

---

## Recommended Phase-7 → Phase-8 action list (evidence-linked, not applied here)

1. **[BLOCKER]** `marketplace.json:12` `"."` → `"./"`. Verify with `claude plugin validate .` going green. (E1, E2)
2. Make MCP wiring explicit OR keep `.mcp.json` auto-discovery, then **delete the legacy root `manifest.json`** (non-standard `mcpServer` key + duplicate manifest; the stack doc already says remove it). (E7)
3. Migrate `design-audit/SKILL.md` `trigger:` → `when_to_use:` and keep the skill thin (delegate all compute to `uiux_*`). (Thin-skill boundary)
4. Reconcile the README's two marketplaces (`@10x` vs `@ui-ux-suite`) so no install command is dead. (E8)
5. Add `claude plugin validate . --strict` to CI as the release gate (warnings→errors), since the validator is the source of truth. (`02-plugin-spec.md:309,414`)
6. Keep the zero-dep stdio MCP server as the cross-editor engine; do not add an MCP SDK dependency. (E5)

---

## Sources

- Reused research (primary-citing): `/Users/adamboudj/projects/aws-cost-audit-skill/docs/research/01-skill-authoring.md`, `.../02-plugin-spec.md` (accessed 2026-05-28; cite `code.claude.com/docs/en/{plugins, plugin-marketplaces, plugins-reference, skills, discover-plugins}` and `platform.claude.com/docs/.../agent-skills/*`).
- Live commands (2026-05-29): `claude plugin validate .` (E1/E2/E3), `npm view ui-ux-suite version` (E4), stdio MCP smoke test via `node bin/ui-ux-suite.js --mcp` (E5).
- In-repo files cited inline by `path:line`.

## Uncertainties

- **`@10x` aggregate marketplace** (README:66) is a separate repo `Aboudjem/10x` not in this checkout — existence/validity UNVERIFIED here; this artifact only validated the in-repo `ui-ux-suite` marketplace. (E8)
- **Per-editor MCP discovery runtime** (Cursor/VS Code/etc. actually spawning `npx ui-ux-suite --mcp`) is asserted from README config + a confirmed stdio handshake (E5), not exercised inside each editor; cross-editor *spec* support is confirmed, *per-editor live runs* are likely-not-confirmed.
- **`.mcp.json` auto-discovery inside an installed plugin** is per the docs default-location table (`02-plugin-spec.md:211`); I confirmed the file exists and the server boots, but did not install the plugin into a clean CC profile to watch it register. Confidence: likely.
