<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-light.svg">
  <img alt="ui-ux-suite" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-light.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml"><img src="https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/ui-ux-suite"><img src="https://img.shields.io/npm/v/ui-ux-suite?color=00D4FF&logo=npm&label=npm&style=flat-square" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-00D4FF?style=flat-square" alt="License MIT"></a>
  <a href="https://github.com/Aboudjem/ui-ux-suite/stargazers"><img src="https://img.shields.io/github/stars/Aboudjem/ui-ux-suite?style=flat-square&color=00D4FF" alt="Stars"></a>
</p>

<p align="center"><b>English</b> · <a href="READMEs/zh-CN.md">简体中文</a> · <a href="READMEs/ja.md">日本語</a> · <a href="READMEs/es.md">Español</a> · <a href="READMEs/fr.md">Français</a></p>

<p align="center"><b>ESLint for design. It finds the exact line, the measured wrong value, and the exact fix.</b></p>

<p align="center">
  <a href="#what-it-does">What it does</a> · <a href="#install">Install</a> · <a href="#use-it">Use it</a> · <a href="#what-you-get">What you get</a> · <a href="#works-in-your-editor">Works in your editor</a> · <a href="#good-to-know">Good to know</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

## What it does

Most design review tells you to improve your contrast. This tells you that `.hero-subtitle` on
line 14 of `src/styles.css` is `#fbfbfb` on `#ffffff`, which measures 1.03 to 1, and that
`#767676` would pass. Same shape as a linter error, applied to design.

It reads your CSS, JSX, HTML and Tailwind classes. By default nothing is executed, nothing
leaves your machine, and no key is ever needed. Findings come in two kinds. A located finding,
which is most of what you act on, carries three things:

- **Located.** The file, the line and the selector.
- **Measured.** The real wrong value, not an adjective.
- **Fixed.** The exact `before` to `after` change, plus the WCAG criterion or named UX law it rests on.

The rest are project-level, like "5 font families, use 1 or 2". They score and they name the
problem, but there is no single line to point at.

## Install

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

That is Claude Code. For any other agent that reads the Agent Skills format, install the 14
skills straight from this repo:

```bash
npx skills add Aboudjem/ui-ux-suite
```

The command-line tool needs no install step: `npx ui-ux-suite .` runs it.

<details>
<summary><b>Or add it as a dev dependency</b></summary>

```bash
npm install -D ui-ux-suite
```

```json
{ "scripts": { "design-audit": "ui-ux-suite . --fail-under 7" } }
```

Requires Node 18 or newer. Zero runtime dependencies, so this pulls nothing else.
</details>

## Use it

**1. Point it at a project.**

```bash
npx ui-ux-suite .
```

You get a ranked list of findings and a weighted score out of 10 across 12 dimensions. No
config file, no setup step.

**2. Read a finding.** This is real output from the broken fixture shipped in this repo, which
scores 3.7 out of 10 because it is supposed to:

```
- **Where:** `src/styles.css:14` · selector `.hero-subtitle`
- **Measured:** 1.03:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#fbfbfb` on `#ffffff` measures 1.03:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Fix:** Change `color` on `.hero-subtitle` from `#fbfbfb` to `#767676` (meets 4.5:1 on `#ffffff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)
```

Run it yourself with `npx ui-ux-suite test/fixtures/planted-ux-problems` from a checkout.

**3. Put it in CI.** Pick the output and the gate that fit your pipeline:

```bash
npx ui-ux-suite . --json | jq              # machine-readable, banner goes to stderr
npx ui-ux-suite . --html report.html       # standalone HTML report
npx ui-ux-suite . --sarif ui-ux.sarif      # SARIF 2.1.0 for GitHub code scanning
npx ui-ux-suite . --fail-under 7           # exit 1 when the score drops below 7
npx ui-ux-suite . --write-baseline .uiux-baseline.json   # freeze today's debt
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
npx ui-ux-suite . --tags dimension:accessibility --exclude-tags severity:nice-to-have
```

Every flag is in [docs/cli.md](docs/cli.md).

## What you get

- **A ranked report** in Markdown, JSON, HTML or SARIF, whichever the reader is a machine or a person.
- **A score out of 10** across 12 weighted dimensions, with accessibility carrying the most weight.
- **A CI gate**, either an absolute bar with `--fail-under` or a baseline that fails on a new finding or a score drop.
- **14 skills and 16 tools** your agent can call, so "audit this project's design" works in chat.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg">
  <img alt="Scorecard: an overall score, per-dimension scores, and located findings" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg" width="100%">
</picture>

## Works in your editor

| Agent | One-line install |
|:--|:--|
| Claude Code | `claude plugin install ui-ux-suite@10x` |
| Any of 70+ agents | `npx skills add Aboudjem/ui-ux-suite` |
| Codex, Gemini CLI, OpenCode, Pi | `./install.sh <agent>` |
| VS Code and GitHub Copilot | `./install.sh copilot` |
| Everything else | see [docs/editors.md](docs/editors.md) |

Works in Claude Code, Cursor, Codex, Copilot, Gemini CLI, and 70+ other agents through
`npx skills add`. The skills are Markdown, so they run on whatever model your editor points at.

<details>
<summary><b>Add it as an MCP server instead</b></summary>

```bash
claude mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
codex mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
```

Cursor, VS Code, Gemini CLI, Windsurf, Continue, OpenCode and Zed take the same command as a
config entry, in JSON, TOML or YAML depending on the editor. The per-editor snippets, including
the three that key it differently, are in [docs/editors.md](docs/editors.md).
</details>

## Good to know

> [!IMPORTANT]
> It audits, it never edits. It never modifies a source file in the project you point it at, and
> a fix is printed as `before` to `after` for you to apply. The only files it writes are report
> and baseline files, and only where you asked for one.

- **Nothing leaves your machine.** Pure Node built-ins, no API key, no telemetry. The static audit makes no network call, and deep mode only visits the URL you hand it.
- **Static source is the default.** Deep mode is opt-in, needs `playwright-core` plus `@axe-core/playwright`, and degrades to source findings when they are absent.
- **The numbers are gated.** `npm test` runs 356 tests, and the shipped broken fixture must keep producing findings that carry a file, a line and a fix.

## Learn more

- [docs/cli.md](docs/cli.md), every flag, exit code and recipe
- [docs/editors.md](docs/editors.md), install and MCP config per editor
- [docs/scoring.md](docs/scoring.md), the 12 weights and how the score is built
- [docs/science.md](docs/science.md), the WCAG criteria and UX laws behind the findings
- [docs/faq.md](docs/faq.md) and [docs/comparison.md](docs/comparison.md)
- [CHANGELOG.md](CHANGELOG.md), [CONTRIBUTING.md](CONTRIBUTING.md), [LICENSE](LICENSE)

---

<p align="center"><sub>MIT · Built by <a href="https://github.com/Aboudjem">Adam Boudjemaa</a></sub></p>
