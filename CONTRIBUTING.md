# Contributing to UI/UX Suite

Glad you're here. Whether it's a scoring improvement, a new knowledge document, or a bug fix, it all moves the project forward.

## Getting set up

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/ui-ux-suite.git
cd ui-ux-suite

# No install needed, zero dependencies
# Validate everything loads
npm test
```

You'll need **Node.js 18+**. That's it. No build step, no compilation.

## Where things live

```
lib/                    # Engine modules (the core logic)
  schema.js             # Shared schemas: scores, tokens, findings
  extractors.js         # CSS/Tailwind value extraction
  color-engine.js       # Color math: contrast, APCA, deltaE, palettes
  type-engine.js        # Typography: scale detection, fluid type gen
  spacing-engine.js     # Spacing: consistency, grid, breakpoints
  scoring.js            # 12-dimension weighted scoring system
  knowledge.js          # Built-in knowledge base query engine
  mcp-server.js         # MCP server with 16 tools
  oklch-parser.js       # OKLCH color space parser
  tailwind-parser.js    # Tailwind class extraction from JSX
  runner.js             # End-to-end audit orchestrator

agents/                 # 12 specialized agent definitions (.md)
skills/                 # 14 slash command skill definitions (.md)
commands/               # 5 slash commands (.md)
knowledge/              # 21 design knowledge documents (.md)
templates/              # Output templates (audit report, score card, etc.)
```

## What to work on

### Good first issues

- Add a new knowledge document (with research citations)
- Improve an extractor to handle edge cases
- Add a new framework detector

### Bigger contributions

- New scoring dimension (e.g., animation quality, error handling UX)
- Framework-specific extractors (Vue SFC, Svelte styles)
- Additional MCP tools

## Making changes

1. **Create a branch** from `main`
2. **Make your changes** and keep commits focused
3. **Run tests**: `npm test`
4. **Submit a PR** with a clear description of what and why

## The four house rules

These are the ones a PR gets sent back for.

- **A bug fix ships with a test** that would have caught the bug.
- **A new scoring rule cites its source.** Either a WCAG success criterion or a named UX law from
  the allow-list in `LAW_META`, and it emits a `createFinding(...)` carrying
  `evidence: { file, line, selector, measured, threshold }` plus a `fix`. A finding with no file
  and no measured value is not a finding this project ships.
- **No new runtime dependency.** The suite is zero-dependency by design. A dev dependency is a
  conversation; a runtime one is a no.
- **No em-dash in user-facing copy.** Use a comma, a colon, parentheses, or a new sentence.

## Code style

- Vanilla JavaScript (no TypeScript, no build step)
- CommonJS `require()` / `module.exports`
- Zero external dependencies. Use only Node.js built-ins
- Functions over classes where possible
- Descriptive variable names over comments

## Knowledge base contributions

When adding to `knowledge/`:
- Include source citations for all claims
- Use confidence levels: HIGH, MEDIUM, LOW
- Prefer quantified findings over qualitative opinions
- Keep entries actionable. "Do this" not just "consider this"

## Questions?

Open an issue. We're happy to help.
