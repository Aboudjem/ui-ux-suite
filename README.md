<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/logo-light.svg">
  <img alt="UI/UX Suite" src=".github/assets/logo-light.svg" width="100%">
</picture>

<p align="center">
  <a href="https://www.npmjs.com/package/ui-ux-suite"><img src="https://img.shields.io/npm/v/ui-ux-suite?color=0ea5e9&logo=npm&label=npm&style=flat-square" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-0ea5e9?style=flat-square" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%E2%89%A518-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="https://github.com/Aboudjem/ui-ux-suite/stargazers"><img src="https://img.shields.io/github/stars/Aboudjem/ui-ux-suite?style=flat-square&color=0ea5e9" alt="Stars"></a>
</p>

<p align="center">Your project's design quality, measured. Not guessed.</p>

```bash
npx ui-ux-suite
```

Scans your CSS, JSX, and Tailwind config. Scores 12 design dimensions. Cites the UX law each finding violates. Gives you the fix. Zero deps. Zero config. Runs 100% locally.

---

## Install

<details>
<summary><b>From your AI editor (MCP)</b></summary>

```bash
# Claude Code
claude mcp add ui-ux-suite npx ui-ux-suite --mcp

# Codex CLI
codex mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
```

**Cursor** - `~/.cursor/mcp.json`:
```json
{ "mcpServers": { "ui-ux-suite": { "command": "npx", "args": ["ui-ux-suite", "--mcp"] } } }
```

**VS Code + Copilot** - `.vscode/mcp.json`:
```json
{ "servers": { "ui-ux-suite": { "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"] } } }
```

**Windsurf** - `~/.codeium/windsurf/mcp_config.json`:
```json
{ "mcpServers": { "ui-ux-suite": { "command": "npx", "args": ["ui-ux-suite", "--mcp"] } } }
```

**Gemini CLI** - `~/.gemini/mcp_config.json`:
```json
{ "mcpServers": { "ui-ux-suite": { "command": "npx", "args": ["ui-ux-suite", "--mcp"] } } }
```

**Continue.dev** - `.continue/mcpServers/ui-ux-suite.yaml`:
```yaml
mcpServers:
  ui-ux-suite: { command: npx, args: [ui-ux-suite, --mcp], type: stdio }
```

Then ask your AI: *"Audit this project's design."*
</details>

<details>
<summary><b>As a Claude Code plugin</b></summary>

```bash
claude plugin add github:Aboudjem/ui-ux-suite
```

Adds 14 slash commands, 12 specialist agents, 19 knowledge docs.
</details>

<details>
<summary><b>As a dev dependency</b></summary>

```bash
npm install -D ui-ux-suite
```

Add to `package.json`:
```json
{ "scripts": { "design-audit": "ui-ux-suite" } }
```

Requires Node 18+.
</details>

---

## What it scores

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/scorecard-light.svg">
  <img alt="UI/UX Suite scorecard" src=".github/assets/scorecard-light.svg" width="100%">
</picture>

12 weighted dimensions. Accessibility gets the highest weight because it affects the most users.

| Dimension | Weight | Checks |
|:----------|:------:|:-------|
| Accessibility | 12% | Focus, skip links, alt text, reduced motion, ARIA |
| Color System | 10% | WCAG + APCA contrast, duplicates, semantic roles, dark mode |
| Typography | 10% | Scale consistency, font count, body size, line height |
| Layout & Spacing | 10% | Grid, breakpoints, container widths |
| Component Quality | 10% | States: hover, focus, disabled, loading, error |
| Visual Hierarchy | 10% | Type scale, information priority, scannability |
| Interaction | 8% | Animation timing, easing, feedback |
| Responsiveness | 8% | Breakpoints, container queries |
| Visual Polish | 7% | Shadow quality, gradient animation, radius tokens |
| Performance UX | 5% | Loading states, perceived speed |
| Info Architecture | 5% | Command palette, validation, navigation |
| Platform Fit | 5% | Dark mode, component lib, a11y primitives |

Findings are concrete, not vague:

> *"Button text contrast is 2.8:1, needs 4.5:1 for WCAG AA. Change `#94a3b8` to `#64748b` on your white background."*

---

## Grounded in 24 UX laws

Every finding cites the law it violates. Reports end with a Laws of UX coverage table counting violations per law.

**Examples:** Hick's Law (choice cost), Fitts's Law (target size), Miller's Law (7±2), Jakob's Law (conventions), Doherty Threshold (400ms), Peak-End Rule, Gestalt (Proximity, Similarity, Common Region, Prägnanz, Uniform Connectedness), Aesthetic-Usability Effect, Choice Overload, Cognitive Load, Tesler's Law, Postel's Law, Occam's Razor, Pareto, Parkinson, Serial Position, Von Restorff, Zeigarnik, Goal-Gradient.

<details>
<summary><b>Full 24-law coverage table</b></summary>

| Law | Definition | Cited by | Dimensions |
|-----|------------|----------|------------|
| Hick's Law | Decision time grows logarithmically with choices. | psychology, ux-flow, design | flows, hierarchy |
| Fitts's Law | Time to target depends on distance and size. | interaction, a11y, design | a11y, interaction |
| Miller's Law | Working memory holds 7 ± 2 items. | psychology, ux-flow, design | flows, hierarchy, typography |
| Jakob's Law | Users expect your site to work like others. | ux-flow, a11y, design | flows, platform, responsive |
| Doherty Threshold | Productivity surges below 400ms response. | interaction, design | interaction, performance |
| Peak-End Rule | Experience judged by peak + end moments. | psychology, interaction, ux-flow, design | interaction, performance, polish |
| Goal-Gradient Effect | Motivation rises near the finish line. | psychology, interaction, design | interaction |
| Aesthetic-Usability Effect | Pretty feels more usable. | psychology, design | color, polish, typography |
| Serial Position Effect | First and last items remembered best. | psychology, ux-flow, design | flows, hierarchy |
| Von Restorff Effect | Standouts get remembered. | psychology, design | hierarchy, color |
| Zeigarnik Effect | Incomplete tasks hold memory. | psychology, interaction, design | interaction, flows |
| Pareto Principle | 80% of outcomes from 20% of causes. | ux-flow, design | flows |
| Parkinson's Law | Work expands to fill the time given. | ux-flow, design | flows |
| Postel's Law | Conservative output, liberal input. | a11y, design | a11y, components |
| Tesler's Law | Complexity is conserved, not removed. | ux-flow, design | components, flows |
| Occam's Razor | Prefer the simpler solution. | ux-flow, design | flows, platform |
| Law of Proximity | Close elements feel grouped. | layout, design | layout |
| Law of Common Region | Shared region implies grouping. | layout, design | layout |
| Law of Prägnanz | Eye prefers simplicity. | layout, design | layout, typography |
| Law of Similarity | Similar looks mean related. | layout, design | layout, color |
| Law of Uniform Connectedness | Visual connection implies group. | layout, design | layout |
| Chunking | Group items to expand recall. | psychology, ux-flow, design | flows, typography |
| Choice Overload | Too many options paralyzes. | psychology, ux-flow, design | flows |
| Cognitive Load | Working memory is a finite budget. | psychology, design | flows, hierarchy |

Sources in [References](#references) at the end.
</details>

---

## Works with any stack

<table>
<tr>
<td align="center" width="16%"><b>React</b></td>
<td align="center" width="16%"><b>Next.js</b></td>
<td align="center" width="16%"><b>Vue</b></td>
<td align="center" width="16%"><b>Svelte</b></td>
<td align="center" width="16%"><b>Angular</b></td>
<td align="center" width="16%"><b>Vanilla</b></td>
</tr>
</table>

**Styling:** Tailwind · CSS Modules · SCSS · styled-components · Emotion · vanilla-extract · plain CSS.
**Libraries:** shadcn/ui · MUI · Chakra · Radix · Mantine · Headless UI · Ark UI.

Auto-detects your framework. No config.

---

## Commands

```
ui-ux-suite              Audit current directory
ui-ux-suite <path>       Audit a specific project
ui-ux-suite --json       JSON output for scripts
ui-ux-suite --mcp        Start as MCP server
```

<details>
<summary><b>14 slash commands (Claude Code plugin)</b></summary>

| Command | What it does |
|:--------|:-------------|
| `/design-audit` | Full 12-dimension audit with score card |
| `/color-audit` | Color system deep dive |
| `/type-audit` | Typography analysis |
| `/layout-audit` | Spacing and grid check |
| `/a11y-audit` | Accessibility review |
| `/component-audit` | State coverage check |
| `/flow-audit` | Navigation and IA review |
| `/design-score` | Quick overall score |
| `/design-tokens` | Generate token set from brand color |
| `/theme-builder` | Theme from brand color |
| `/style-direction` | Style recommendation |
| `/refactor-plan` | Prioritized action plan |
| `/design-compare` | Before/after comparison |
| `/design-checklist` | Pre-launch checklist |
</details>

<details>
<summary><b>14 MCP tools</b></summary>

| Tool | What it does |
|:-----|:-------------|
| `uiux_scan_project` | Detect framework, styling, component lib |
| `uiux_extract_colors` | Pull all colors from CSS, Tailwind, tokens |
| `uiux_extract_typography` | Extract fonts, sizes, weights, line heights |
| `uiux_extract_spacing` | Extract padding, margin, gap values |
| `uiux_check_contrast` | WCAG 2.1 + APCA contrast |
| `uiux_score_dimension` | Score a single dimension |
| `uiux_score_overall` | Weighted overall score |
| `uiux_generate_palette` | Generate palette from brand color |
| `uiux_generate_type_scale` | Generate type scale |
| `uiux_generate_spacing_scale` | Generate spacing scale |
| `uiux_generate_tokens` | Generate complete token set |
| `uiux_knowledge_query` | Query 19 knowledge documents |
| `uiux_laws_query` | Query 24 Laws of UX |
| `uiux_audit_log` | Append finding to audit log |
| `uiux_audit_report` | Generate formatted audit report |
</details>

---

## How it works

```mermaid
graph LR
    A["Your Project<br/><sub>CSS, JSX, Tailwind</sub>"] --> B["Extractors"]
    B --> C["Engines<br/><sub>Color · Type · Spacing · OKLCH</sub>"]
    C --> D["Scoring<br/><sub>12 weighted dimensions</sub>"]
    D --> E["Report<br/><sub>Score + fixes + citations</sub>"]

    style A fill:#f8fafc,stroke:#0ea5e9,color:#0c4a6e
    style B fill:#f0f9ff,stroke:#0ea5e9,color:#0c4a6e
    style C fill:#e0f2fe,stroke:#0ea5e9,color:#0c4a6e
    style D fill:#bae6fd,stroke:#0ea5e9,color:#0c4a6e
    style E fill:#0ea5e9,stroke:#0284c7,color:#ffffff
```

<details>
<summary><b>Architecture</b></summary>

```
lib/
  mcp-server.js       MCP JSON-RPC server
  runner.js           Audit orchestrator
  color-engine.js     WCAG, APCA, deltaE, palette
  type-engine.js      Scale math, readability
  spacing-engine.js   Grid detection, consistency
  oklch-parser.js     OKLCH color space
  tailwind-parser.js  Class extraction
  extractors.js       CSS, Tailwind, SCSS parsing
  scoring.js          Weighted scoring
  schema.js           Data structures
  knowledge.js        Built-in knowledge base

knowledge/   19 markdown docs (3,081 lines)
agents/      12 specialist agents
skills/      14 slash commands
templates/   5 report templates
```
</details>

<details>
<summary><b>Knowledge base (19 docs, 3,081 lines)</b></summary>

| Document | Lines | Covers |
|:---------|:-----:|:-------|
| accessibility-guide.md | 213 | WCAG, ARIA, focus management |
| color-theory.md | 142 | Harmony, semantics, dark mode |
| typography-theory.md | 131 | Scale ratios, 2026 font picks |
| component-patterns.md | 139 | State checklist, button hierarchy |
| ux-flows.md | 155 | Navigation, onboarding, IA |
| design-engineer-craft-2026.md | 355 | Tips from Vercel, Linear, shadcn |
| insider-secrets-2026.md | 233 | 35 tips from veterans |
| wow-animations-2026.md | 214 | Scroll driven, view transitions |
| wow-libraries-2026.md | 178 | 15 component libraries |
| design-tools-2026.md | 253 | Design tooling landscape |
| evidence-base.md | 78 | 30+ quantified findings |
| dark-patterns.md | 154 | Deceptive design detection |
| advanced-polish.md | 164 | Shadow techniques, micro-interactions |
| platform-conventions.md | 129 | iOS, Android, web patterns |
| anti-patterns.md | 90 | Common mistakes |
| libraries-tools.md | 133 | Component library comparison |
| principles.md | 90 | Core design principles |
| psychology.md | 119 | Cognitive load, Gestalt |
| trends-2026.md | 111 | CSS features, AI patterns |
| laws-of-ux.md | 320 | 24 named UX laws |
</details>

---

## Evidence

Every recommendation traces to research.

| Finding | Number | Source |
|:--------|:------:|:-------|
| Time users take to judge your design | **50ms** | Academic research |
| Users who leave after a bad impression | **88%** | UX survey |
| ADA lawsuits filed in H1 2025 | **5,114** | WebAIM, UsableNet |
| A11y issues automated tools catch | **30-40%** | Deque, W3C |
| Smartphone users with dark mode on | **81.9%** | Mobile analytics |

Full evidence base with HIGH/MEDIUM/LOW confidence ratings lives in [`knowledge/evidence-base.md`](knowledge/evidence-base.md).

<details>
<summary><b>2026 CSS features detected</b></summary>

| Feature | Detection |
|:--------|:----------|
| View Transitions API | `@view-transition`, `::view-transition` |
| Scroll-driven animations | `animation-timeline: view\|scroll` |
| Container queries | `@container` |
| `@property` animations | `@property --*` |
| `@starting-style` | `@starting-style { }` |
| OKLCH colors | `oklch()` notation |
</details>

---

## Privacy

All analysis runs locally. Your code never leaves your machine. No telemetry. No API calls. No network.

---

## Contributing

```bash
git clone https://github.com/Aboudjem/ui-ux-suite
cd ui-ux-suite
npm test   # 148 tests
```

Open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

<p align="center">
  <a href="https://www.linkedin.com/in/adam-boudjemaa/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://x.com/AdamBoudj"><img src="https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white" alt="X"></a>
  <a href="https://adam-boudjemaa.com/"><img src="https://img.shields.io/badge/Website-0ea5e9?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
</p>

<p align="center"><sub>MIT · Built by <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · Star ⭐ to help others find it</sub></p>

---

## References

<sub>Academic and canonical sources for the 24 Laws of UX.</sub>

<details>
<summary><sub>Expand sources</sub></summary>

<sub>

Hick, W. E. (1952). On the rate of gain of information. *Quarterly Journal of Experimental Psychology*, 4(1), 11-26.

Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. *Journal of Experimental Psychology*, 47(6), 381-391.

Miller, G. A. (1956). The magical number seven, plus or minus two. *Psychological Review*, 63(2), 81-97.

Nielsen, J. (2000). End of Web Design. *Nielsen Norman Group Alertbox*.

Doherty, W. J., & Thadhani, A. J. (1982). *The Economic Value of Rapid Response Time*. IBM Report GE20-0752-0.

Kahneman, D., Fredrickson, B. L., Schreiber, C. A., & Redelmeier, D. A. (1993). When more pain is preferred to less. *Psychological Science*, 4(6), 401-405.

Hull, C. L. (1932). The goal-gradient hypothesis and maze learning. *Psychological Review*, 39(1), 25-43.

Kurosu, M., & Kashimura, K. (1995). Apparent usability vs. inherent usability. *CHI '95 Conference Companion*, 292-293.

Ebbinghaus, H. (1913). *Memory: A Contribution to Experimental Psychology*.

von Restorff, H. (1933). *Psychologische Forschung*, 18, 299-342.

Zeigarnik, B. (1927). *Psychologische Forschung*, 9, 1-85.

Pareto, V. (1896). *Cours d'économie politique*. Lausanne.

Parkinson, C. N. (1955). Parkinson's Law. *The Economist*, Nov 19.

Postel, J. (1980). *RFC 761: Transmission Control Protocol*. IETF.

Saffer, D. (2010). *Designing for Interaction* (2nd ed.). New Riders.

William of Ockham, c. 1323. *Summa Logicae*.

Wertheimer, M. (1923). Untersuchungen zur Lehre von der Gestalt II. *Psychologische Forschung*, 4, 301-350.

Palmer, S. E. (1992). Common region: A new principle of perceptual grouping. *Cognitive Psychology*, 24(3), 436-447.

Palmer, S. E., & Rock, I. (1994). Rethinking perceptual organization. *Psychonomic Bulletin & Review*, 1(1), 29-55.

Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating. *Journal of Personality and Social Psychology*, 79(6), 995-1006.

Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science*, 12(2), 257-285.

</sub>

</details>
