# Stack Research — Open Source Plugin Distribution

## Packaging & Distribution

| Tool | Version | Why | Confidence |
|------|---------|-----|------------|
| **npm** | Registry | Standard distribution for Node.js tools. `npx` support for zero-install trial | HIGH |
| **GitHub Releases** | Latest | `claude plugin add` works from GitHub URLs. Primary install path for Claude Code users | HIGH |
| **Zero dependencies** | N/A | No supply chain risk, fastest install, smallest footprint. The codebase is already zero-dep | HIGH |

## CI/CD

| Tool | Why | Confidence |
|------|-----|------------|
| **GitHub Actions** | Industry standard for OSS. Free for public repos. Matrix testing | HIGH |
| **Node.js 18+** | Minimum for Claude Code plugin compatibility | HIGH |
| **npm test** | Already exists — validates all module imports | MEDIUM |

## Documentation

| Tool | Why | Confidence |
|------|-----|------------|
| **README.md** | Primary discovery surface. Must be compelling with badges, examples, KPIs | HIGH |
| **CONTRIBUTING.md** | Required for community trust. Fork → install → test → PR workflow | HIGH |
| **CODE_OF_CONDUCT.md** | Contributor Covenant. Standard for credible OSS | HIGH |
| **SECURITY.md** | Responsible disclosure policy | HIGH |
| **LICENSE** | MIT already declared. Need actual LICENSE file | HIGH |

## Badge Services

| Badge | Source | Why |
|-------|--------|-----|
| npm version | shields.io | Shows package is published and maintained |
| License | shields.io | MIT = maximum adoption |
| Node version | shields.io | Compatibility signal |
| CI status | GitHub Actions | Quality signal |
| GitHub stars | shields.io | Social proof |

## What NOT to Use

- **TypeScript build step** — The project is vanilla JS, zero-dep. Adding a build step adds friction. Keep it simple.
- **Bundler** — No need for webpack/esbuild/rollup. Direct Node.js execution.
- **Documentation site** — Overkill for v1. README + in-code knowledge base is sufficient.
- **Monorepo tools** — Single package, no need for turborepo/nx.
