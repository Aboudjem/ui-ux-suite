<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-light.svg">
  <img alt="ui-ux-suite" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-light.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml"><img src="https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/ui-ux-suite"><img src="https://img.shields.io/npm/v/ui-ux-suite?color=00D4FF&logo=npm&label=npm&style=flat-square" alt="npm version"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-00D4FF?style=flat-square" alt="License MIT"></a>
  <a href="https://github.com/Aboudjem/ui-ux-suite/stargazers"><img src="https://img.shields.io/github/stars/Aboudjem/ui-ux-suite?style=flat-square&color=00D4FF" alt="Stars"></a>
</p>

<p align="center"><a href="../README.md">English</a> · <b>简体中文</b> · <a href="ja.md">日本語</a> · <a href="es.md">Español</a> · <a href="fr.md">Français</a></p>

<p align="center"><b>设计领域的 ESLint。它给出确切的行号、实测的错误数值，以及确切的修改方案。</b></p>

<p align="center">
  <a href="#它做什么">它做什么</a> · <a href="#安装">安装</a> · <a href="#使用">使用</a> · <a href="#你会得到什么">你会得到什么</a> · <a href="#在你的编辑器里可用">在你的编辑器里可用</a> · <a href="#需要知道的">需要知道的</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

## 它做什么

大多数设计评审只会告诉你「提高对比度」。这个工具会告诉你：`src/styles.css` 第 14 行的
`.hero-subtitle` 是 `#fbfbfb` 配 `#ffffff`，实测对比度为 1.03 比 1，改成 `#767676` 就能通过。
形态和一条 lint 报错一样，只是用在设计上。

它读取你的 CSS、JSX、HTML 和 Tailwind 类名。默认不执行任何东西，没有任何东西离开你的机器，
也永远不需要密钥。结论分两类。你主要会去处理的那类是「已定位」的结论，它带三样东西：

- **定位。** 文件、行号和选择器。
- **实测。** 真实的错误数值，而不是形容词。
- **修复。** 确切的 `before` 到 `after` 改动，以及它依据的 WCAG 标准或具名 UX 定律。

其余的是项目级结论，比如「用了 5 种字体，应该收敛到 1 到 2 种」。它们参与打分，也点明了问题，
但没有某一行可指。

## 安装

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

这是 Claude Code 的装法。任何读取 Agent Skills 格式的智能体，都可以直接从本仓库装这 14 个 skill：

```bash
npx skills add Aboudjem/ui-ux-suite
```

命令行工具则不需要任何安装步骤：`npx ui-ux-suite .` 就能跑。

<details>
<summary><b>也可以作为开发依赖安装</b></summary>

```bash
npm install -D ui-ux-suite
```

```json
{ "scripts": { "design-audit": "ui-ux-suite . --fail-under 7" } }
```

需要 Node 18 或更高版本。运行时零依赖，所以这条命令不会带进任何其他包。
</details>

## 使用

**1. 指向一个项目。**

```bash
npx ui-ux-suite .
```

你会得到一份排好序的问题清单，以及一个横跨 12 个维度的满分 10 分的加权分数。不需要配置文件，
也没有初始化步骤。

**2. 读一条结论。** 下面是本仓库自带的那个「故意做坏」的 fixture 的真实输出，它得 3.7 分，
因为它本来就该是坏的：

```
- **Where:** `src/styles.css:14` · selector `.hero-subtitle`
- **Measured:** 1.03:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#fbfbfb` on `#ffffff` measures 1.03:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Fix:** Change `color` on `.hero-subtitle` from `#fbfbfb` to `#767676` (meets 4.5:1 on `#ffffff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)
```

克隆仓库后用 `npx ui-ux-suite test/fixtures/planted-ux-problems` 自己跑一遍。

**3. 放进 CI。** 挑一个适合你流水线的输出格式和卡口：

```bash
npx ui-ux-suite . --json | jq              # 机器可读，横幅走 stderr
npx ui-ux-suite . --html report.html       # 独立的 HTML 报告
npx ui-ux-suite . --sarif ui-ux.sarif      # 给 GitHub code scanning 的 SARIF 2.1.0
npx ui-ux-suite . --fail-under 7           # 分数低于 7 时退出码为 1
npx ui-ux-suite . --write-baseline .uiux-baseline.json   # 冻结当前的技术债
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
npx ui-ux-suite . --tags dimension:accessibility --exclude-tags severity:nice-to-have
```

所有参数都在 [docs/cli.md](../docs/cli.md)。

## 你会得到什么

- **一份排序过的报告**，格式可选 Markdown、JSON、HTML 或 SARIF，看读它的是人还是机器。
- **一个满分 10 分的分数**，横跨 12 个加权维度，其中无障碍的权重最高。
- **一道 CI 卡口**，可以用 `--fail-under` 设绝对线，也可以用基线，在出现新问题或分数下降时失败。
- **14 个 skill 和 16 个工具**，供你的智能体调用，所以在对话里说「审一下这个项目的设计」就能用。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg">
  <img alt="评分卡：总分、各维度分数，以及定位到具体位置的结论" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg" width="100%">
</picture>

## 在你的编辑器里可用

| 智能体 | 一行安装命令 |
|:--|:--|
| Claude Code | `claude plugin install ui-ux-suite@10x` |
| 70 多个智能体中的任意一个 | `npx skills add Aboudjem/ui-ux-suite` |
| Codex、Gemini CLI、OpenCode、Pi | `./install.sh <agent>` |
| VS Code 和 GitHub Copilot | `./install.sh copilot` |
| 其他所有 | 见 [docs/editors.md](../docs/editors.md) |

通过 `npx skills add`，它能在 Claude Code、Cursor、Codex、Copilot、Gemini CLI 以及另外 70 多个
智能体里使用。这些 skill 是 Markdown，所以你的编辑器指向哪个模型，它就跑在哪个模型上。

<details>
<summary><b>也可以改用 MCP 服务器的方式接入</b></summary>

```bash
claude mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
codex mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
```

Cursor、VS Code、Gemini CLI、Windsurf、Continue、OpenCode 和 Zed 用的是同一条命令，只是按各自
编辑器写成 JSON、TOML 或 YAML 条目。每个编辑器的配置片段，包括那三个用了不同键名的，都在
[docs/editors.md](../docs/editors.md)。
</details>

## 需要知道的

> [!IMPORTANT]
> 它只审查，从不改写。它不会修改你所指定项目里的任何源文件，修复方案只以 `before` 到 `after`
> 的形式打印出来交给你应用。它唯一会写出的文件是报告和基线文件，而且只在你主动要求时才写。

- **没有任何东西离开你的机器。** 纯 Node 内置模块，没有 API 密钥，没有埋点。静态审查不发任何网络请求，深度模式也只访问你亲手交给它的那个 URL。
- **默认只做静态源码分析。** 深度模式需要显式开启，依赖 `playwright-core` 和 `@axe-core/playwright`，缺少时会退回到源码结论。
- **数字是有卡口的。** `npm test` 会跑 356 个测试，而且那个故意做坏的 fixture 必须持续产出带文件、行号和修复方案的结论。

## 了解更多

- [docs/cli.md](../docs/cli.md)，全部参数、退出码和用法示例
- [docs/editors.md](../docs/editors.md)，各编辑器的安装与 MCP 配置
- [docs/scoring.md](../docs/scoring.md)，12 个权重以及分数的算法
- [docs/science.md](../docs/science.md)，结论背后的 WCAG 标准与 UX 定律
- [docs/faq.md](../docs/faq.md) 和 [docs/comparison.md](../docs/comparison.md)
- [CHANGELOG.md](../CHANGELOG.md)、[CONTRIBUTING.md](../CONTRIBUTING.md)、[LICENSE](../LICENSE)

---

<p align="center"><sub>MIT · 由 <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> 开发</sub></p>

<sub>本文档由机器辅助翻译，如与英文原文有出入，以 <a href="../README.md">英文版</a> 为准。</sub>
