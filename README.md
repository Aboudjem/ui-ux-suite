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

---

## Get started

### Use from the terminal

```bash
cd ~/projects/my-app
npx ui-ux-suite
```

Scans your CSS, JSX, and Tailwind configs. Outputs a score card across 12 design dimensions with actionable fixes. Auto-detects your framework, styling approach, and component library. No config needed.

```bash
npx ui-ux-suite ~/projects/my-app    # scan a specific directory
npx ui-ux-suite --json                # JSON output for scripts
```

> **No API keys. No config files. Zero dependencies.** Everything works out of the box.

### Use from your AI editor

UI/UX Suite ships as an MCP server. Add it to your editor, then ask your AI to audit.

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add ui-ux-suite npx ui-ux-suite --mcp
```
</details>

<details>
<summary><b>Cursor</b></summary>

Add to `~/.cursor/mcp.json`:
```json
{ "mcpServers": { "ui-ux-suite": { "type": "stdio", "command": "npx", "args": ["ui-ux-suite", "--mcp"] } } }
```
</details>

<details>
<summary><b>VS Code + Copilot</b></summary>

Add to `.vscode/mcp.json`:
```json
{ "servers": { "ui-ux-suite": { "type": "stdio", "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"] } } }
```
</details>

<details>
<summary><b>Codex CLI</b></summary>

```bash
codex mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
```
</details>

<details>
<summary><b>Windsurf</b></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{ "mcpServers": { "ui-ux-suite": { "command": "npx", "args": ["ui-ux-suite", "--mcp"] } } }
```
</details>

<details>
<summary><b>Gemini CLI</b></summary>

Add to `~/.gemini/mcp_config.json`:
```json
{ "mcpServers": { "ui-ux-suite": { "command": "npx", "args": ["ui-ux-suite", "--mcp"] } } }
```
</details>

<details>
<summary><b>Continue.dev</b></summary>

Add to `.continue/mcpServers/ui-ux-suite.yaml`:
```yaml
mcpServers:
  ui-ux-suite: { command: npx, args: [ui-ux-suite, --mcp], type: stdio }
```
</details>

<details>
<summary><b>OpenClaw</b></summary>

```bash
clawhub install ui-ux-suite
```
</details>

Then ask: *"Audit this project's design"* or *"Check my color contrast"*

**MCP tools:** `uiux_scan_project` (detect stack) · `uiux_extract_colors` (pull colors) · `uiux_check_contrast` (WCAG + APCA) · `uiux_score_overall` (full score card) · [11 more](#mcp-tools)

### Install as a Claude Code plugin

```bash
claude plugin add github:Aboudjem/ui-ux-suite
```

This gives you 14 slash commands, 12 specialized agents, and 19 knowledge documents inside Claude Code.

### Install as a dev dependency

```bash
npm install -D ui-ux-suite
```

```json
{
  "scripts": {
    "design-audit": "ui-ux-suite"
  }
}
```

Requires Node.js 18+.

---

## What it scores

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/scorecard-light.svg">
  <img alt="UI/UX Suite scorecard" src=".github/assets/scorecard-light.svg" width="100%">
</picture>

Every project is scored across 12 dimensions, each weighted by impact on user experience:

| Dimension | Weight | What it checks |
|:----------|:------:|:---------------|
| **Color System** | 10% | Contrast ratios (WCAG + APCA), near duplicates, semantic roles, dark mode |
| **Typography** | 10% | Scale consistency, font count, body size, line height, fluid type |
| **Layout & Spacing** | 10% | Spacing grid, breakpoints, container widths, consistency |
| **Component Quality** | 10% | State coverage (hover, focus, disabled, loading, error) |
| **Accessibility** | 12% | Focus indicators, skip links, alt text, reduced motion, ARIA |
| **Visual Hierarchy** | 10% | Type scale, information priority, scannability |
| **Interaction Quality** | 8% | Animation timing, easing, feedback, motion principles |
| **Responsiveness** | 8% | Breakpoints, container queries, Tailwind responsive variants |
| **Visual Polish** | 7% | Shadow quality, gradient animation, border radius tokens |
| **Performance UX** | 5% | Loading states, scroll driven animations, perceived speed |
| **Info Architecture** | 5% | Command palette, i18n, form validation, navigation |
| **Platform Fit** | 5% | Dark mode toggle, component lib detection, a11y primitives |

Accessibility gets the highest weight (12%) because it affects the most users.

Every score comes with specific findings and concrete fixes. Not vague advice like "improve your colors." You get things like:

> *"Button text contrast is 2.8:1, needs 4.5:1 for WCAG AA. Change `#94a3b8` to `#64748b` on your white background."*

---

## Laws of UX coverage

The suite grounds its findings in 24 named UX laws, each drawn from a primary academic paper, IETF RFC, or canonical book. Audits attach `laws: [...]` slugs to findings and end with a Laws of UX Coverage table that counts violations per law.

| Law | Definition | Cited by agents | Dimensions | Source |
|-----|------------|-----------------|------------|--------|
| Hick's Law | Decision time grows logarithmically with the number of equally probable choices. | psychology-analyst, ux-flow-analyst, design-auditor | flows, hierarchy | Hick 1952 [^hick1952] |
| Fitts's Law | Time to acquire a target depends on the distance to and size of the target. | interaction-analyst, accessibility-auditor, design-auditor | accessibility, interaction | Fitts 1954 [^fitts1954] |
| Miller's Law | Short-term working memory holds about 7 items plus or minus 2. | psychology-analyst, ux-flow-analyst, design-auditor | flows, hierarchy, typography | Miller 1956 [^miller1956] |
| Jakob's Law | Users spend most time on other sites and expect your site to work the same way. | ux-flow-analyst, accessibility-auditor, design-auditor | flows, platform, responsive | Nielsen 2000 [^nielsen2000] |
| Doherty Threshold | Productivity soars when system response time is below 400 ms. | interaction-analyst, design-auditor | interaction, performance | Doherty 1982 [^doherty1982] |
| Peak-End Rule | People judge an experience by its peak moment and its end, not the average. | psychology-analyst, interaction-analyst, ux-flow-analyst, design-auditor | interaction, performance, polish | Kahneman 1993 [^kahneman1993] |
| Goal-Gradient Effect | Motivation to reach a goal increases as perceived progress grows. | psychology-analyst, interaction-analyst, design-auditor | interaction | Hull 1932 [^hull1932] |
| Aesthetic-Usability Effect | Users perceive aesthetically pleasing designs as more usable. | psychology-analyst, design-auditor | color, polish, typography | Kurosu 1995 [^kurosu1995] |
| Serial Position Effect | Items at the start and end of a sequence are remembered best. | psychology-analyst, ux-flow-analyst, design-auditor | flows, hierarchy | Ebbinghaus 1913 [^ebbinghaus1913] |
| Von Restorff Effect | An item that stands out is more likely to be remembered. | psychology-analyst, design-auditor | hierarchy, color | von Restorff 1933 [^vonrestorff1933] |
| Zeigarnik Effect | Incomplete tasks occupy memory more than completed ones. | psychology-analyst, interaction-analyst, design-auditor | interaction, flows | Zeigarnik 1927 [^zeigarnik1927] |
| Pareto Principle | Roughly 80 percent of outcomes come from 20 percent of causes. | ux-flow-analyst, design-auditor | flows | Pareto 1896 [^pareto1896] |
| Parkinson's Law | Work expands to fill the time available. | ux-flow-analyst, design-auditor | flows | Parkinson 1955 [^parkinson1955] |
| Postel's Law | Be conservative in what you do, be liberal in what you accept. | accessibility-auditor, design-auditor | accessibility, components | Postel 1980 [^postel1980] |
| Tesler's Law | Every application has an inherent amount of complexity that cannot be removed. | ux-flow-analyst, design-auditor | components, flows | Saffer 2010 [^saffer2010] |
| Occam's Razor | Among equal solutions prefer the one with fewest assumptions. | ux-flow-analyst, design-auditor | flows, platform | Ockham c.1323 [^ockham1323] |
| Law of Proximity | Elements placed close together are perceived as grouped. | layout-analyst, design-auditor | layout | Wertheimer 1923 [^wertheimer1923] |
| Law of Common Region | Elements in a shared region are perceived as grouped. | layout-analyst, design-auditor | layout | Palmer 1992 [^palmer1992] |
| Law of Pragnanz | People perceive ambiguous images in the simplest possible form. | layout-analyst, design-auditor | layout, typography | Wertheimer 1923 [^wertheimer1923] |
| Law of Similarity | Elements that look alike are perceived as related. | layout-analyst, design-auditor | layout, color | Wertheimer 1923 [^wertheimer1923] |
| Law of Uniform Connectedness | Visually connected elements are perceived as more related than disconnected ones. | layout-analyst, design-auditor | layout | Palmer 1994 [^palmer1994] |
| Chunking | Grouping items into meaningful chunks improves recall. | psychology-analyst, ux-flow-analyst, design-auditor | flows, typography | Miller 1956 [^miller1956] |
| Choice Overload | Too many options cause decision paralysis and regret. | psychology-analyst, ux-flow-analyst, design-auditor | flows | Iyengar 2000 [^iyengar2000] |
| Cognitive Load | Working memory capacity is limited; excess cognitive demand degrades performance. | psychology-analyst, design-auditor | flows, hierarchy | Sweller 1988 [^sweller1988] |

[^hick1952]: Hick, W. E. (1952). On the rate of gain of information. Quarterly Journal of Experimental Psychology, 4(1), 11-26.
[^fitts1954]: Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. Journal of Experimental Psychology, 47(6), 381-391.
[^miller1956]: Miller, G. A. (1956). The magical number seven, plus or minus two. Psychological Review, 63(2), 81-97.
[^nielsen2000]: Nielsen, J. (2000). End of Web Design. Nielsen Norman Group Alertbox.
[^doherty1982]: Doherty, W. J., & Thadhani, A. J. (1982). The Economic Value of Rapid Response Time. IBM Report GE20-0752-0.
[^kahneman1993]: Kahneman, D., Fredrickson, B. L., Schreiber, C. A., & Redelmeier, D. A. (1993). When more pain is preferred to less. Psychological Science, 4(6), 401-405.
[^hull1932]: Hull, C. L. (1932). The goal-gradient hypothesis and maze learning. Psychological Review, 39(1), 25-43.
[^kurosu1995]: Kurosu, M., & Kashimura, K. (1995). Apparent usability vs. inherent usability. CHI 95 Conference Companion, 292-293.
[^ebbinghaus1913]: Ebbinghaus, H. (1913). Memory: A Contribution to Experimental Psychology.
[^vonrestorff1933]: von Restorff, H. (1933). Psychologische Forschung, 18, 299-342.
[^zeigarnik1927]: Zeigarnik, B. (1927). Psychologische Forschung, 9, 1-85.
[^pareto1896]: Pareto, V. (1896). Cours d economie politique. Lausanne.
[^parkinson1955]: Parkinson, C. N. (1955). Parkinson s Law. The Economist, November 19.
[^postel1980]: Postel, J. (1980). RFC 761: Transmission Control Protocol. IETF.
[^saffer2010]: Saffer, D. (2010). Designing for Interaction (2nd ed.). New Riders.
[^ockham1323]: William of Ockham, c. 1323. Summa Logicae.
[^wertheimer1923]: Wertheimer, M. (1923). Untersuchungen zur Lehre von der Gestalt II. Psychologische Forschung, 4, 301-350.
[^palmer1992]: Palmer, S. E. (1992). Common region: A new principle of perceptual grouping. Cognitive Psychology, 24(3), 436-447.
[^palmer1994]: Palmer, S. E., & Rock, I. (1994). Rethinking perceptual organization. Psychonomic Bulletin & Review, 1(1), 29-55.
[^iyengar2000]: Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating. Journal of Personality and Social Psychology, 79(6), 995-1006.
[^sweller1988]: Sweller, J. (1988). Cognitive load during problem solving. Cognitive Science, 12(2), 257-285.

---

## Commands

### Slash commands (Claude Code plugin)

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

### CLI

```
ui-ux-suite                     Audit current directory
ui-ux-suite <path>              Audit a specific project
ui-ux-suite --json              JSON output for scripts
ui-ux-suite --mcp               Start as MCP server
ui-ux-suite --version           Show version
ui-ux-suite --help              Show all options
```

---

## MCP tools

14 tools available when running as an MCP server:

| Tool | What it does |
|:-----|:-------------|
| `uiux_scan_project` | Detect framework, styling, component library, tokens |
| `uiux_extract_colors` | Pull all colors from CSS, Tailwind, tokens |
| `uiux_extract_typography` | Extract fonts, sizes, weights, line heights |
| `uiux_extract_spacing` | Extract padding, margin, gap values |
| `uiux_check_contrast` | WCAG 2.1 + APCA contrast for color pairs |
| `uiux_score_dimension` | Score a single dimension (1-10) |
| `uiux_score_overall` | Weighted overall score from all dimensions |
| `uiux_generate_palette` | Generate palette from brand color |
| `uiux_generate_type_scale` | Generate type scale from base size + ratio |
| `uiux_generate_spacing_scale` | Generate spacing scale from base unit |
| `uiux_generate_tokens` | Generate complete token set (CSS vars, Tailwind, JSON) |
| `uiux_knowledge_query` | Query 19 knowledge documents (3,081 lines) |
| `uiux_audit_log` | Append finding to audit log |
| `uiux_audit_report` | Generate formatted audit report |

---

## Works with any stack

Auto-detects your framework. No config needed.

<table>
<tr>
<td align="center" width="14%"><b>React</b><br/><sub>JSX / TSX</sub></td>
<td align="center" width="14%"><b>Next.js</b><br/><sub>App + Pages</sub></td>
<td align="center" width="14%"><b>Vue</b><br/><sub>SFC</sub></td>
<td align="center" width="14%"><b>Svelte</b><br/><sub>Components</sub></td>
<td align="center" width="14%"><b>Angular</b><br/><sub>Templates</sub></td>
<td align="center" width="14%"><b>Vanilla</b><br/><sub>HTML / CSS</sub></td>
</tr>
</table>

Styling detection: **Tailwind**, **CSS Modules**, **SCSS**, **styled-components**, **Emotion**, **vanilla-extract**, **vanilla CSS**.

Component libraries: **shadcn/ui**, **MUI**, **Chakra**, **Radix**, **Mantine**, **Headless UI**, **Ark UI**.

---

## How it works

```mermaid
graph LR
    A["Your Project<br/><sub>CSS, JSX, Tailwind, Config</sub>"] --> B["Extractors<br/><sub>Colors, Type, Spacing, Classes</sub>"]
    B --> C["Engines<br/><sub>Color, Typography, Spacing, OKLCH</sub>"]
    C --> D["Scoring<br/><sub>12 weighted dimensions</sub>"]
    D --> E["Report<br/><sub>Score card + Action plan</sub>"]

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
  mcp-server.js       MCP JSON-RPC server (14 tools)
  runner.js           End-to-end audit orchestrator
  color-engine.js     WCAG, APCA, deltaE, palette generation
  type-engine.js      Scale math, readability scoring, font analysis
  spacing-engine.js   Grid detection, consistency analysis
  oklch-parser.js     OKLCH color space conversion
  tailwind-parser.js  Class extraction and token mapping
  extractors.js       CSS, Tailwind, SCSS parsing
  scoring.js          Multi-axis weighted scoring
  schema.js           Data structures for scores and findings
  knowledge.js        Built-in design knowledge base

knowledge/            19 markdown docs (3,081 lines)
agents/               12 specialized agent definitions
skills/               14 slash command definitions
templates/            5 report templates
```

</details>

---

## The science

Every recommendation links back to real research:

| What we found | Number | Source |
|:--------------|:------:|:-------|
| Time for users to judge your design | **50ms** | Academic research |
| Users who leave after bad design | **88%** | UX survey |
| ADA lawsuits filed (H1 2025) | **5,114** | WebAIM, UsableNet |
| Issues automated a11y tools catch | **30-40%** | Deque, W3C |
| Smartphone users with dark mode on | **81.9%** | Mobile analytics |

<details>
<summary><b>All 30+ findings with confidence levels</b></summary>

The full evidence base lives in [`knowledge/evidence-base.md`](knowledge/evidence-base.md). Every finding is rated HIGH, MEDIUM, or LOW confidence based on source quality and recency.

</details>

---

## Modern CSS detection

The suite knows about 2026 CSS features that most tools don't:

| Feature | Detection | Why it matters |
|:--------|:----------|:---------------|
| View Transitions API | `@view-transition`, `::view-transition` | Native page transitions, no JS needed |
| Scroll driven animations | `animation-timeline: view\|scroll` | 60fps on compositor thread |
| Container queries | `@container` | Component-level responsiveness |
| `@property` animations | `@property --*` | Animatable custom properties |
| `@starting-style` | `@starting-style { }` | Animate from display:none |
| OKLCH colors | `oklch()` notation | Perceptually uniform color space |

---

## Knowledge base

19 curated documents, 3,081 lines of design intelligence:

<details>
<summary><b>All knowledge documents</b></summary>

| Document | Lines | What it covers |
|:---------|:-----:|:---------------|
| accessibility-guide.md | 213 | WCAG, ARIA, focus management |
| color-theory.md | 142 | Harmony, semantics, dark mode |
| typography-theory.md | 131 | Scale ratios, 2026 font picks |
| component-patterns.md | 139 | State checklist, button hierarchy |
| ux-flows.md | 155 | Navigation, onboarding, IA |
| design-engineer-craft-2026.md | 355 | Tips from Vercel, Linear, shadcn |
| insider-secrets-2026.md | 233 | 35 tips from 10+ year veterans |
| wow-animations-2026.md | 214 | Scroll driven, view transitions |
| wow-libraries-2026.md | 178 | 15 component libraries deep dive |
| design-tools-2026.md | 253 | Design tooling landscape |
| evidence-base.md | 78 | 30+ quantified findings |
| dark-patterns.md | 154 | Deceptive design detection |
| advanced-polish.md | 164 | Shadow techniques, micro-interactions |
| platform-conventions.md | 129 | iOS, Android, web patterns |
| anti-patterns.md | 90 | Common mistakes |
| libraries-tools.md | 133 | Component library comparison |
| principles.md | 90 | Core design principles |
| psychology.md | 119 | Cognitive load, Gestalt principles |
| trends-2026.md | 111 | CSS features, AI patterns |

</details>

---

## Trust

No telemetry. No data collection. No API calls. No cloud anything.

All analysis runs locally. Your code never leaves your machine. The entire suite is vanilla Node.js with zero dependencies.

---

## Contributing

Found a bug? Have a scoring idea? PRs welcome.

1. Fork the repo
2. Run `npm test` (118 tests across 7 modules)
3. Make your changes
4. Open a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

<p align="center">
  If this tool helped you ship a better UI, consider giving it a star.<br/>
  It helps others find it.
</p>

---

<p align="center">
  <a href="https://www.linkedin.com/in/adam-boudjemaa/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://x.com/AdamBoudj"><img src="https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white" alt="X"></a>
  <a href="https://adam-boudjemaa.com/"><img src="https://img.shields.io/badge/Website-0ea5e9?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
</p>

<p align="center">
  <sub>Built by <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · MIT License · No telemetry · No data collection</sub>
</p>
