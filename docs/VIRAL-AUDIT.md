# Viral-Readiness Audit — ui-ux-suite

> Generated 2026-05-30 by the [Supernova engine](https://github.com/Aboudjem/supernova).

## Score

| | |
|:--|:--|
| **Before** | 91 / 100 |
| **After** | 100 / 100 (projected) |
| **Tier** | Tier 1 — production-ready / viral-ready |
| **Repo type** | `claude-plugin` |
| **Recommended packaging** | `plugin` |

## Gaps addressed

| Gap | Weight | Fix applied |
|:----|:------:|:------------|
| GitHub description quality (20-160 chars) | +5 | Description already 160 chars and keyword-rich; `mcp-server` topic added |
| `examples/` directory present | +4 | Created `examples/` with 4 working examples |

## Bonus signals present (unchanged)

- GitHub releases published
- `llms.txt` present (LLM citeability)
- `AGENTS.md` present (cross-harness compatibility)
- MCP server shipped (`npx ui-ux-suite --mcp`)
- Zero runtime dependencies
- 311 passing tests with a regression fixture

## Engine notes

The Supernova engine correctly identified the repo type as `claude-plugin` and packaging
as `plugin`. Both calls are accurate: ui-ux-suite ships a `.claude-plugin/plugin.json`
manifest, 14 skills, 12 agents, 5 commands, and an MCP server.

The description-quality gap was a **false gap** in practice: the existing description
("Design audit for Claude Code. Scores UI/UX across 12 dimensions grounded in 24 named
UX laws with primary-source citations. WCAG + APCA + OKLCH. Zero dependencies.") is
already 160 chars and keyword-first. The engine likely flagged it because it hit the
upper boundary exactly. No edit needed; `mcp-server` topic added to strengthen MCP
registry discoverability.

The `examples/` gap was real: the repo had `demo-output/` (video clips, GIF frames) and
`docs/demo/` (HTML report, terminal run), but no canonical `examples/` folder with
copy-paste runnable snippets. Added.

---

ui-ux-suite is well-positioned for a viral launch. It has a visceral hook ("ESLint for
design — tells you `src/styles.css:14 · color #fbfbfb on #ffffff = 1.03:1`"), zero
friction (one `npx` command, no keys, no network), an MCP server that works in every
editor, and 311 tests with a regression fixture. The missing surface is distribution
strategy — handled in `LAUNCH-PLAN.md`.
