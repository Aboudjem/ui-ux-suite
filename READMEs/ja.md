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

<p align="center"><a href="../README.md">English</a> · <a href="zh-CN.md">简体中文</a> · <b>日本語</b> · <a href="es.md">Español</a> · <a href="fr.md">Français</a></p>

<p align="center"><b>デザインのための ESLint。問題の行、実測した誤った値、そして具体的な直し方を返します。</b></p>

<p align="center">
  <a href="#何をするツールか">何をするツールか</a> · <a href="#インストール">インストール</a> · <a href="#使い方">使い方</a> · <a href="#得られるもの">得られるもの</a> · <a href="#エディタで使う">エディタで使う</a> · <a href="#知っておくこと">知っておくこと</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

## 何をするツールか

たいていのデザインレビューは「コントラストを上げましょう」で終わります。このツールはこう言い
ます。`src/styles.css` の 14 行目の `.hero-subtitle` は `#fbfbfb` が `#ffffff` の上にあり、実測
コントラストは 1.03 対 1、`#767676` にすれば通ります。lint のエラーとまったく同じ形を、デザイン
に対して出します。

読むのは CSS、JSX、HTML、Tailwind のクラスです。既定では何も実行せず、何もマシンの外に出さず、
キーも一切要りません。指摘には二種類あります。実際に手を入れることになる「位置の特定された指摘」
には、三つが付きます。

- **位置。** ファイル、行番号、セレクタ。
- **実測値。** 形容詞ではなく、実際に誤っている値。
- **修正。** `before` から `after` への具体的な変更と、その根拠になる WCAG 達成基準または名前の
  ある UX 法則。

残りはプロジェクト単位の指摘です。たとえば「フォントファミリが 5 つある、1 つか 2 つに絞る」と
いったもので、採点にも入り問題も名指ししますが、指し示すべき一行がありません。

## インストール

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

これは Claude Code の場合です。Agent Skills 形式を読むエージェントであれば、このリポジトリから
14 個の skill を直接入れられます。

```bash
npx skills add Aboudjem/ui-ux-suite
```

コマンドラインツールはインストール手順が不要です。`npx ui-ux-suite .` で動きます。

<details>
<summary><b>開発依存として入れる場合</b></summary>

```bash
npm install -D ui-ux-suite
```

```json
{ "scripts": { "design-audit": "ui-ux-suite . --fail-under 7" } }
```

Node 18 以降が必要です。ランタイム依存はゼロなので、これで他のパッケージが入ることはありません。
</details>

## 使い方

**1. プロジェクトを指定する。**

```bash
npx ui-ux-suite .
```

優先度順に並んだ指摘と、12 の観点にまたがる 10 点満点の加重スコアが返ります。設定ファイルも
セットアップ手順もありません。

**2. 指摘を読む。** 以下はこのリポジトリに同梱された「わざと壊した」フィクスチャの実際の出力
です。壊れているのが仕様なので 3.7 点です。

```
- **Where:** `src/styles.css:14` · selector `.hero-subtitle`
- **Measured:** 1.03:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#fbfbfb` on `#ffffff` measures 1.03:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Fix:** Change `color` on `.hero-subtitle` from `#fbfbfb` to `#767676` (meets 4.5:1 on `#ffffff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)
```

チェックアウトしたうえで `npx ui-ux-suite test/fixtures/planted-ux-problems` を実行すれば、自分
の手で同じ出力を確認できます。

**3. CI に組み込む。** パイプラインに合う出力形式とゲートを選んでください。

```bash
npx ui-ux-suite . --json | jq              # 機械可読、バナーは stderr へ
npx ui-ux-suite . --html report.html       # 単体で開ける HTML レポート
npx ui-ux-suite . --sarif ui-ux.sarif      # GitHub code scanning 向けの SARIF 2.1.0
npx ui-ux-suite . --fail-under 7           # スコアが 7 を下回ったら終了コード 1
npx ui-ux-suite . --write-baseline .uiux-baseline.json   # 今ある負債を凍結する
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
npx ui-ux-suite . --tags dimension:accessibility --exclude-tags severity:nice-to-have
```

すべてのフラグは [docs/cli.md](../docs/cli.md) にあります。

## 得られるもの

- **並べ替え済みのレポート。** Markdown、JSON、HTML、SARIF から、読み手が人か機械かで選べます。
- **10 点満点のスコア。** 12 の加重観点にまたがり、アクセシビリティの重みが最大です。
- **CI ゲート。** `--fail-under` で絶対的な基準を引くか、ベースラインで新しい指摘とスコア低下を落とすか。
- **14 個の skill と 16 個のツール。** エージェントから呼べるので、チャットで「このプロジェクトのデザインを監査して」が通ります。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg">
  <img alt="スコアカード: 総合スコア、観点別スコア、位置の特定された指摘" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg" width="100%">
</picture>

## エディタで使う

| エージェント | 一行のインストールコマンド |
|:--|:--|
| Claude Code | `claude plugin install ui-ux-suite@10x` |
| 70 以上のエージェントのいずれか | `npx skills add Aboudjem/ui-ux-suite` |
| Codex、Gemini CLI、OpenCode、Pi | `./install.sh <agent>` |
| VS Code と GitHub Copilot | `./install.sh copilot` |
| それ以外すべて | [docs/editors.md](../docs/editors.md) を参照 |

`npx skills add` を通じて、Claude Code、Cursor、Codex、Copilot、Gemini CLI、そしてほかの 70 以上
のエージェントで動きます。skill は Markdown なので、エディタが向いているモデルの上でそのまま
動きます。

<details>
<summary><b>MCP サーバーとして追加する場合</b></summary>

```bash
claude mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
codex mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
```

Cursor、VS Code、Gemini CLI、Windsurf、Continue、OpenCode、Zed も同じコマンドを、エディタに応じて
JSON、TOML、YAML のいずれかのエントリとして書くだけです。キー名が異なる三つを含め、エディタごとの
記述は [docs/editors.md](../docs/editors.md) にあります。
</details>

## 知っておくこと

> [!IMPORTANT]
> 監査はしますが、書き換えはしません。指定したプロジェクトのソースファイルを変更することはなく、
> 修正案は `before` から `after` の形で表示されるだけです。書き出すのはレポートとベースラインの
> ファイルだけで、しかもあなたが求めた場合に限られます。

- **何もマシンの外に出ません。** Node の組み込みモジュールのみ。API キーもテレメトリもありません。静的な監査はネットワーク通信を一切行わず、ディープモードもあなたが渡した URL だけを開きます。
- **既定は静的なソース解析です。** ディープモードは任意で、`playwright-core` と `@axe-core/playwright` が必要です。無い場合はソースベースの指摘に縮退します。
- **数字にはゲートがあります。** `npm test` は 356 個のテストを実行し、わざと壊したフィクスチャはファイル、行番号、修正案を伴う指摘を出し続けなければなりません。

## さらに詳しく

- [docs/cli.md](../docs/cli.md)、全フラグ、終了コード、使用例
- [docs/editors.md](../docs/editors.md)、エディタ別のインストールと MCP 設定
- [docs/scoring.md](../docs/scoring.md)、12 の重みとスコアの組み立て方
- [docs/science.md](../docs/science.md)、指摘の根拠になる WCAG 達成基準と UX 法則
- [docs/faq.md](../docs/faq.md) と [docs/comparison.md](../docs/comparison.md)
- [CHANGELOG.md](../CHANGELOG.md)、[CONTRIBUTING.md](../CONTRIBUTING.md)、[LICENSE](../LICENSE)

---

<p align="center"><sub>MIT · 開発者 <a href="https://github.com/Aboudjem">Adam Boudjemaa</a></sub></p>

<sub>この文書は機械翻訳を用いて作成されています。内容に食い違いがある場合は <a href="../README.md">英語版</a> が正本です。</sub>
