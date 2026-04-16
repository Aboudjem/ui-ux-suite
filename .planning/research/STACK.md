# Technology Stack: Open Source Packaging & Distribution

**Project:** UI/UX Design Intelligence Suite
**Researched:** 2026-04-16
**Overall Confidence:** HIGH

---

## Recommended Stack

### Distribution: Claude Code Plugin (Primary) + npm (Secondary)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Claude Code Plugin System | current | Primary distribution via `claude plugin install` | This IS a Claude Code plugin. The `.claude-plugin/plugin.json` manifest is the native format. Users install from a marketplace or GitHub URL. This is the zero-friction path. | HIGH |
| npm | latest | Secondary distribution via `npx` / standalone use | Gives discoverability on npmjs.com, enables `npx ui-ux-suite` standalone usage, and unlocks npm trusted publishing with OIDC provenance. Dual distribution covers both plugin users and CLI users. | HIGH |
| GitHub | - | Source hosting, CI/CD, issues, releases | Industry standard. GitHub Actions for CI, GitHub Releases for changelogs, GitHub Topics for discoverability. No alternative worth considering. | HIGH |

**Key decision: The plugin is distributed via TWO channels.**

1. **Claude Code marketplace/GitHub** -- `claude plugin install ui-ux-suite@marketplace-name` or `/plugin marketplace add Aboudjem/ui-ux-suite`. This is the primary path. Users of Claude Code discover and install plugins this way.
2. **npm** -- `npm install -g ui-ux-suite` or future `npx` invocation. This is the secondary path for discoverability and standalone tooling.

The existing `package.json` and `manifest.json` (root) should be kept for backward compatibility, but the authoritative plugin manifest is `.claude-plugin/plugin.json`.

### CI/CD: GitHub Actions

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| GitHub Actions | v4 actions | CI pipeline (test, lint, validate, publish) | Native to GitHub. Free for open source. OIDC support for npm trusted publishing. No reason to use anything else for a GitHub-hosted OSS project. | HIGH |
| `actions/checkout` | v4 | Repo checkout | Standard. | HIGH |
| `actions/setup-node` | v4 | Node.js setup with npm cache | Handles .npmrc setup for publishing, caches npm dependencies. | HIGH |
| npm trusted publishing (OIDC) | GA (July 2025) | Tokenless npm publishing | Eliminates stored NPM_TOKEN secrets. Uses short-lived OIDC credentials. Automatic provenance attestations. This is the current best practice as of 2025. Requires npm CLI 11.5.1+ and Node 22.14.0+. **Important limitation:** You must publish the first version manually with `npm publish`, then configure OIDC for subsequent releases. | HIGH |

**CI Workflow Structure (3 workflows):**

```
.github/workflows/
  ci.yml          # On push/PR: test, lint, validate plugin manifest
  release.yml     # On tag push (v*): npm publish with OIDC, GitHub Release
  validate.yml    # On PR: plugin structure validation
```

#### ci.yml -- Core CI

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run validate
```

#### release.yml -- npm Publish with OIDC

```yaml
name: Release
on:
  push:
    tags: ['v*']
permissions:
  id-token: write    # OIDC
  contents: write    # GitHub Release
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish --ignore-scripts
      - uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

### Testing: Node.js Built-in Test Runner (`node:test`)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| `node:test` | Node 20+ (stable) | Unit and integration tests | **Zero dependencies.** This project is explicitly zero-dep by design. The built-in test runner is stable since Node 20, supports `describe`/`it`/`test`, has `assert` built in, and handles this project's needs (pure JS library testing, no browser, no JSX transform). Vitest would add a dependency; Jest would add a dependency. `node:test` is the only choice consistent with the zero-dep philosophy. | HIGH |
| `node:assert` | Node 20+ | Assertions | Ships with Node. Strict mode (`assert.strict`) covers all assertion needs. | HIGH |
| `--experimental-test-coverage` | Node 22+ | Code coverage | Built into Node. Outputs tap/spec/lcov. Coverage thresholds available since Node 22.8.0. Experimental but functional -- acceptable for a project that values zero deps over mature coverage tooling. | MEDIUM |

**Why NOT Vitest/Jest:** The project constraint is zero dependencies. Both Vitest and Jest require `npm install`. For a pure Node.js library with 11 modules and no build step, `node:test` is the correct choice. If the project ever needs snapshot testing, mocking complexity, or watch mode polish, reconsider -- but not for v1.

**Test command:**

```json
{
  "scripts": {
    "test": "node --test lib/**/*.test.js",
    "test:coverage": "node --experimental-test-coverage --test lib/**/*.test.js"
  }
}
```

### Linting: Biome

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Biome | 1.x | Lint + format (single tool) | Replaces ESLint + Prettier with one binary. ~100x faster than ESLint. Zero config needed for JS. Single dev dependency is acceptable (dev deps don't ship to users). The project has no TypeScript, no JSX in its own code -- Biome handles plain JS perfectly. | HIGH |

**Why NOT ESLint + Prettier:** Two tools, more config, slower. ESLint's flat config migration is done but Biome is simpler for a new project. ESLint is fine too -- this is a preference call, not a critical decision.

**Why NOT zero linting:** Open source projects need consistent style. Contributors will submit inconsistent code without automated formatting.

**Config:**

```json
{
  "scripts": {
    "lint": "npx @biomejs/biome check .",
    "lint:fix": "npx @biomejs/biome check --write ."
  }
}
```

Note: Using `npx` means contributors don't need a global install. The `@biomejs/biome` package is a dev dependency only.

### Versioning & Changelog: Manual + git tags (v1), consider release-please later

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Manual semver + git tags | - | Version management | For a solo-maintainer v1 launch, automated release tools (semantic-release, changesets, release-please) are overkill. Bump version in `plugin.json` and `package.json`, `git tag v1.0.0`, push. The GitHub Actions release workflow handles the rest. | HIGH |
| `softprops/action-gh-release@v2` | v2 | GitHub Release creation | Auto-generates release notes from commits on tag push. Simple, no config. | HIGH |

**When to add release-please:** When the project has multiple contributors and needs automated changelog generation. release-please (Google) is preferred over semantic-release because it creates a PR you can review before release, rather than auto-publishing on every commit. Changesets is for monorepos -- not applicable here.

### Documentation Tooling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| README.md | - | Primary documentation | GitHub renders it as the landing page. For a CLI plugin, the README IS the docs site. No need for a separate docs framework (Docusaurus, VitePress) at v1. | HIGH |
| Markdown | - | All documentation files | README, CONTRIBUTING, CHANGELOG, LICENSE, examples. Renders on GitHub and npm. Universal. | HIGH |

**What NOT to use at v1:**
- **Docusaurus / VitePress / Starlight** -- Overkill for a plugin. The README and in-repo markdown files are sufficient. Add a docs site when the project has 500+ stars and complex configuration options.
- **TypeDoc / JSDoc site generator** -- The project is a plugin, not a library API. Users interact through Claude Code skills/commands, not by importing functions.

### Badge Services

| Technology | Purpose | Badge URL Pattern | Confidence |
|------------|---------|-------------------|------------|
| Shields.io | All badges | `img.shields.io/...` | HIGH |
| GitHub Actions badge | CI status | `github.com/{owner}/{repo}/actions/workflows/ci.yml/badge.svg` | HIGH |

**Recommended badges (in order for README):**

```markdown
[![CI](https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml/badge.svg)](...)
[![npm version](https://img.shields.io/npm/v/ui-ux-suite)](https://www.npmjs.com/package/ui-ux-suite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org)
```

Add after traction:
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

---

## Plugin-Specific Distribution Architecture

This is the most important section. The project has TWO manifest files that must stay in sync:

| File | Purpose | Authority |
|------|---------|-----------|
| `.claude-plugin/plugin.json` | Claude Code plugin manifest | **Primary.** This is what Claude Code reads. |
| `package.json` | npm package metadata | Secondary. For npm publishing and `npm test`/scripts. |
| `manifest.json` (root) | Legacy/redundant | **Remove or redirect.** Having both `manifest.json` at root AND `.claude-plugin/plugin.json` creates confusion. The root `manifest.json` appears to be an older format. Migrate to `.claude-plugin/plugin.json` exclusively. |

### Plugin Directory Structure (target)

```
ui-ux-suite/
  .claude-plugin/
    plugin.json              # Authoritative plugin manifest
  .github/
    workflows/
      ci.yml                 # Test + lint + validate
      release.yml            # npm publish + GitHub Release
  agents/                    # 12 agent definitions
  skills/                    # 14 skill definitions
  commands/                  # Flat command files
  knowledge/                 # 19 knowledge docs
  lib/                       # 11 JS engine modules
  templates/                 # Output templates
  bin/                       # Plugin executables (if needed)
  LICENSE                    # MIT
  README.md                  # Primary docs (compelling, badge-rich)
  CONTRIBUTING.md            # Contribution guide
  CHANGELOG.md               # Version history
  package.json               # npm metadata + scripts
  .npmignore                 # Exclude .planning, .deep-research, .omc, .git
  .gitignore                 # Standard Node.js ignores
  biome.json                 # Linter config (or use defaults)
```

### .npmignore (Critical)

```
.planning/
.deep-research/
.omc/
.claude/
.claude-plugin/
.github/
.git/
*.test.js
biome.json
```

Without `.npmignore`, the npm package will include research files, planning docs, and CI configs that bloat the package and leak internal process.

---

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

---

## Installation Commands

### For users (plugin install)

```bash
# Via Claude Code marketplace (once listed)
claude plugin install ui-ux-suite@marketplace-name

# Via GitHub directly
/plugin marketplace add Aboudjem/ui-ux-suite
```

### For users (npm)

```bash
npm install -g ui-ux-suite
```

### For contributors (dev setup)

```bash
git clone https://github.com/Aboudjem/ui-ux-suite.git
cd ui-ux-suite
npm install              # Dev dependencies only (biome)
npm test                 # Runs node:test
npm run lint             # Runs biome
```

---

## Node.js Version Requirements

| Context | Minimum | Recommended | Why |
|---------|---------|-------------|-----|
| Runtime | Node 20 | Node 22 | Node 20 is current LTS (EOL April 2026). Node 22 is active LTS. `node:test` is stable in both. Coverage thresholds require 22.8+. |
| CI matrix | 20, 22 | Test both | Ensures compatibility with both LTS versions. |
| npm publish | Node 22.14+ | Node 22 | Required for OIDC trusted publishing (npm CLI 11.5.1+). |

**engines field for package.json:**

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## What NOT to Use

- **TypeScript build step** -- The project is vanilla JS, zero-dep. Adding a build step adds friction.
- **Bundler (webpack/esbuild/rollup)** -- No need. Direct Node.js execution.
- **Documentation site (Docusaurus/VitePress)** -- Overkill for v1. README is sufficient.
- **Monorepo tools (turborepo/nx/lerna)** -- Single package.
- **semantic-release** -- Too aggressive for v1. Auto-publishes without review.
- **Husky/lint-staged** -- Pre-commit hooks are nice but add friction for contributors. CI catches lint issues. Consider adding later.
- **Codecov/Coveralls** -- Node's built-in coverage is sufficient for v1. Add external coverage reporting when the project has contributors who need visibility.

---

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
