<!-- GSD:project-start source:PROJECT.md -->
## Project

**UI/UX Design Intelligence Suite**

A Claude Code plugin that gives any developer instant, evidence-based design auditing across 12 dimensions — color, typography, layout, accessibility, interaction quality, and more. It scans real project files (CSS, JSX, Tailwind configs), produces quantified scores (1-10 per dimension, weighted overall), and generates actionable fix recommendations with before/after code. Think "ESLint for design" — but powered by 19 knowledge base documents, 12 specialized agents, and real color science (WCAG 2.1, APCA, OKLCH, deltaE).

**Core Value:** **Any developer can audit their project's design quality in one command and get a prioritized, evidence-backed action plan — no design background needed.**

### Constraints

- **Platform**: Claude Code plugin (manifest.json format)
- **Runtime**: Node.js (no external dependencies — zero-dep by design)
- **License**: MIT (already declared)
- **Install**: Must work via `claude plugin add` from GitHub URL
- **Compatibility**: Must work with any frontend project (React, Vue, Svelte, Angular, vanilla)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Distribution: Claude Code Plugin (Primary) + npm (Secondary)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Claude Code Plugin System | current | Primary distribution via `claude plugin install` | This IS a Claude Code plugin. The `.claude-plugin/plugin.json` manifest is the native format. Users install from a marketplace or GitHub URL. This is the zero-friction path. | HIGH |
| npm | latest | Secondary distribution via `npx` / standalone use | Gives discoverability on npmjs.com, enables `npx ui-ux-suite` standalone usage, and unlocks npm trusted publishing with OIDC provenance. Dual distribution covers both plugin users and CLI users. | HIGH |
| GitHub | - | Source hosting, CI/CD, issues, releases | Industry standard. GitHub Actions for CI, GitHub Releases for changelogs, GitHub Topics for discoverability. No alternative worth considering. | HIGH |
### CI/CD: GitHub Actions
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| GitHub Actions | v4 actions | CI pipeline (test, lint, validate, publish) | Native to GitHub. Free for open source. OIDC support for npm trusted publishing. No reason to use anything else for a GitHub-hosted OSS project. | HIGH |
| `actions/checkout` | v4 | Repo checkout | Standard. | HIGH |
| `actions/setup-node` | v4 | Node.js setup with npm cache | Handles .npmrc setup for publishing, caches npm dependencies. | HIGH |
| npm trusted publishing (OIDC) | GA (July 2025) | Tokenless npm publishing | Eliminates stored NPM_TOKEN secrets. Uses short-lived OIDC credentials. Automatic provenance attestations. This is the current best practice as of 2025. Requires npm CLI 11.5.1+ and Node 22.14.0+. **Important limitation:** You must publish the first version manually with `npm publish`, then configure OIDC for subsequent releases. | HIGH |
#### ci.yml -- Core CI
#### release.yml -- npm Publish with OIDC
### Testing: Node.js Built-in Test Runner (`node:test`)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `node:test` | Node 20+ (stable) | Unit and integration tests | **Zero dependencies.** This project is explicitly zero-dep by design. The built-in test runner is stable since Node 20, supports `describe`/`it`/`test`, has `assert` built in, and handles this project's needs (pure JS library testing, no browser, no JSX transform). Vitest would add a dependency; Jest would add a dependency. `node:test` is the only choice consistent with the zero-dep philosophy. | HIGH |
| `node:assert` | Node 20+ | Assertions | Ships with Node. Strict mode (`assert.strict`) covers all assertion needs. | HIGH |
| `--experimental-test-coverage` | Node 22+ | Code coverage | Built into Node. Outputs tap/spec/lcov. Coverage thresholds available since Node 22.8.0. Experimental but functional -- acceptable for a project that values zero deps over mature coverage tooling. | MEDIUM |
### Linting: Biome
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Biome | 1.x | Lint + format (single tool) | Replaces ESLint + Prettier with one binary. ~100x faster than ESLint. Zero config needed for JS. Single dev dependency is acceptable (dev deps don't ship to users). The project has no TypeScript, no JSX in its own code -- Biome handles plain JS perfectly. | HIGH |
### Versioning & Changelog: Manual + git tags (v1), consider release-please later
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Manual semver + git tags | - | Version management | For a solo-maintainer v1 launch, automated release tools (semantic-release, changesets, release-please) are overkill. Bump version in `plugin.json` and `package.json`, `git tag v1.0.0`, push. The GitHub Actions release workflow handles the rest. | HIGH |
| `softprops/action-gh-release@v2` | v2 | GitHub Release creation | Auto-generates release notes from commits on tag push. Simple, no config. | HIGH |
### Documentation Tooling
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| README.md | - | Primary documentation | GitHub renders it as the landing page. For a CLI plugin, the README IS the docs site. No need for a separate docs framework (Docusaurus, VitePress) at v1. | HIGH |
| Markdown | - | All documentation files | README, CONTRIBUTING, CHANGELOG, LICENSE, examples. Renders on GitHub and npm. Universal. | HIGH |
- **Docusaurus / VitePress / Starlight** -- Overkill for a plugin. The README and in-repo markdown files are sufficient. Add a docs site when the project has 500+ stars and complex configuration options.
- **TypeDoc / JSDoc site generator** -- The project is a plugin, not a library API. Users interact through Claude Code skills/commands, not by importing functions.
### Badge Services
| Technology | Purpose | Badge URL Pattern | Confidence |
|------------|---------|-------------------|------------|
| Shields.io | All badges | `img.shields.io/...` | HIGH |
| GitHub Actions badge | CI status | `github.com/{owner}/{repo}/actions/workflows/ci.yml/badge.svg` | HIGH |
- `![npm downloads](https://img.shields.io/npm/dm/ui-ux-suite)` -- only after meaningful download numbers
- `![GitHub stars](https://img.shields.io/github/stars/Aboudjem/ui-ux-suite)` -- only after 50+ stars
### Social Proof & Discoverability
| Mechanism | How | Why | Confidence |
|-----------|-----|-----|------------|
| GitHub Topics | Add via repo settings: `claude-code`, `claude-code-plugin`, `design`, `ui-ux`, `accessibility`, `css`, `audit`, `developer-tools` | GitHub Topics drive search discovery. `claude-code-plugin` is the key topic for the Claude Code ecosystem. | HIGH |
| npm keywords | Already in package.json; add `claude-code-plugin`, `design-audit`, `wcag`, `accessibility-audit` | npm search uses keywords field. | HIGH |
| GitHub description | One compelling sentence in repo settings | Shows in search results, link previews, GitHub Explore. | HIGH |
| `.claude-plugin/plugin.json` keywords | Add to manifest | Plugin marketplace discovery. | HIGH |
| Claude Code marketplace listing | Create or join a marketplace, or submit to official directory | The official `plugins.claude.ai` directory is the highest-visibility channel for Claude Code plugins. | MEDIUM |
| GitHub social preview image | 1280x640 PNG with logo + tagline | Shows in link previews on Twitter, Slack, Discord. First visual impression. | HIGH |
## Plugin-Specific Distribution Architecture
| File | Purpose | Authority |
|------|---------|-----------|
| `.claude-plugin/plugin.json` | Claude Code plugin manifest | **Primary.** This is what Claude Code reads. |
| `package.json` | npm package metadata | Secondary. For npm publishing and `npm test`/scripts. |
| `manifest.json` (root) | Legacy/redundant | **Remove or redirect.** Having both `manifest.json` at root AND `.claude-plugin/plugin.json` creates confusion. The root `manifest.json` appears to be an older format. Migrate to `.claude-plugin/plugin.json` exclusively. |
### Plugin Directory Structure (target)
### .npmignore (Critical)
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Testing | `node:test` | Vitest | Adds dependency. Project is zero-dep. |
| Testing | `node:test` | Jest | Adds dependency. Slower. Heavier. |
| Linting | Biome | ESLint + Prettier | Two tools, more config, slower. Fine choice but not better. |
| Linting | Biome | oxlint | Less mature formatter story. Biome does lint+format. |
| Versioning | Manual + tags | semantic-release | Overkill for solo maintainer v1. Auto-publishes on commit -- too aggressive. |
| Versioning | Manual + tags | changesets | Designed for monorepos. Wrong tool for single package. |
| Versioning | Manual + tags | release-please | Good tool, but adds complexity before it's needed. Revisit at v2. |
| Docs | README.md | Docusaurus | Plugin docs don't need a full site. README is the landing page. |
| Docs | README.md | VitePress | Same reasoning. Over-engineered for v1. |
| CI | GitHub Actions | CircleCI | GitHub Actions is free for OSS and native to GitHub. No reason to add another service. |
| npm auth | OIDC trusted publishing | NPM_TOKEN secret | OIDC is more secure (no stored tokens), generates provenance automatically. |
| Badge | Shields.io | Badgen | Shields.io has 1.6B monthly images served. De facto standard. |
## Installation Commands
### For users (plugin install)
# Via Claude Code marketplace (once listed)
# Via GitHub directly
### For users (npm)
### For contributors (dev setup)
## Node.js Version Requirements
| Context | Minimum | Recommended | Why |
|---------|---------|-------------|-----|
| Runtime | Node 20 | Node 22 | Node 20 is current LTS (EOL April 2026). Node 22 is active LTS. `node:test` is stable in both. Coverage thresholds require 22.8+. |
| CI matrix | 20, 22 | Test both | Ensures compatibility with both LTS versions. |
| npm publish | Node 22.14+ | Node 22 | Required for OIDC trusted publishing (npm CLI 11.5.1+). |
## What NOT to Use
- **TypeScript build step** -- The project is vanilla JS, zero-dep. Adding a build step adds friction.
- **Bundler (webpack/esbuild/rollup)** -- No need. Direct Node.js execution.
- **Documentation site (Docusaurus/VitePress)** -- Overkill for v1. README is sufficient.
- **Monorepo tools (turborepo/nx/lerna)** -- Single package.
- **semantic-release** -- Too aggressive for v1. Auto-publishes without review.
- **Husky/lint-staged** -- Pre-commit hooks are nice but add friction for contributors. CI catches lint issues. Consider adding later.
- **Codecov/Coveralls** -- Node's built-in coverage is sufficient for v1. Add external coverage reporting when the project has contributors who need visibility.
## Sources
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) -- Official plugin manifest schema, distribution, caching
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) -- Marketplace creation and hosting
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) -- OIDC setup, GA since July 2025
- [npm Trusted Publishing GA Announcement](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [GitHub Actions: Building and Testing Node.js](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- [GitHub Actions: Publishing Node.js Packages](https://docs.github.com/actions/publishing-packages/publishing-nodejs-packages)
- [Shields.io](https://shields.io/) -- Badge service (1.6B images/month)
- [Node.js Test Runner docs (v22)](https://nodejs.org/docs/latest-v22.x/api/test.html) -- Stable API since Node 20
- [npm Release Automation Comparison](https://oleksiipopov.com/blog/npm-release-automation/) -- semantic-release vs release-please vs changesets
- [softprops/action-gh-release](https://github.com/softprops/action-gh-release) -- GitHub Release action
- [npm Security Best Practices](https://github.com/lirantal/npm-security-best-practices) -- Supply chain security
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
