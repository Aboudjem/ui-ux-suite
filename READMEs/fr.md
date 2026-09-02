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

<p align="center"><a href="../README.md">English</a> · <a href="zh-CN.md">简体中文</a> · <a href="ja.md">日本語</a> · <a href="es.md">Español</a> · <b>Français</b></p>

<p align="center"><b>ESLint pour le design. Il trouve la ligne exacte, la valeur mesurée qui cloche, et la correction exacte.</b></p>

<p align="center">
  <a href="#ce-quil-fait">Ce qu'il fait</a> · <a href="#installation">Installation</a> · <a href="#utilisation">Utilisation</a> · <a href="#ce-que-vous-obtenez">Ce que vous obtenez</a> · <a href="#fonctionne-dans-votre-éditeur">Fonctionne dans votre éditeur</a> · <a href="#bon-à-savoir">Bon à savoir</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

## Ce qu'il fait

La plupart des revues de design vous disent d'améliorer le contraste. Celle-ci vous dit que
`.hero-subtitle`, ligne 14 de `src/styles.css`, est en `#fbfbfb` sur `#ffffff`, ce qui mesure
1,03 contre 1, et que `#767676` passerait. La même forme qu'une erreur de linter, appliquée au
design.

Il lit votre CSS, votre JSX, votre HTML et vos classes Tailwind. Par défaut rien ne s'exécute,
rien ne quitte votre machine, et aucune clé n'est jamais nécessaire. Les constats sont de deux
sortes. Un constat localisé, c'est-à-dire l'essentiel de ce que vous allez corriger, revient avec
trois choses :

- **Localisé.** Le fichier, la ligne et le sélecteur.
- **Mesuré.** La vraie valeur fautive, pas un adjectif.
- **Corrigé.** Le changement exact de `before` vers `after`, plus le critère WCAG ou la loi UX nommée sur laquelle il s'appuie.

Les autres sont des constats au niveau du projet, du genre « 5 familles de polices, passez à 1 ou
2 ». Ils comptent dans la note et nomment le problème, mais il n'y a aucune ligne précise à
pointer.

## Installation

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

Ça, c'est Claude Code. Pour tout autre agent qui lit le format Agent Skills, installez les 14
skills directement depuis ce dépôt :

```bash
npx skills add Aboudjem/ui-ux-suite
```

L'outil en ligne de commande ne demande aucune étape d'installation : `npx ui-ux-suite .` suffit.

<details>
<summary><b>Ou ajoutez-le en dépendance de développement</b></summary>

```bash
npm install -D ui-ux-suite
```

```json
{ "scripts": { "design-audit": "ui-ux-suite . --fail-under 7" } }
```

Node 18 ou plus récent. Zéro dépendance à l'exécution, donc cette commande n'en tire aucune autre.
</details>

## Utilisation

**1. Pointez-le sur un projet.**

```bash
npx ui-ux-suite .
```

Vous obtenez une liste de constats classés et une note pondérée sur 10 pour 12 dimensions. Pas
de fichier de configuration, pas d'étape d'installation.

**2. Lisez un constat.** Voici une sortie réelle de la fixture volontairement cassée livrée dans
ce dépôt, qui obtient 3,7 sur 10 parce que c'est le but :

```
- **Where:** `src/styles.css:14` · selector `.hero-subtitle`
- **Measured:** 1.03:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#fbfbfb` on `#ffffff` measures 1.03:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Fix:** Change `color` on `.hero-subtitle` from `#fbfbfb` to `#767676` (meets 4.5:1 on `#ffffff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)
```

Vérifiez vous-même avec `npx ui-ux-suite test/fixtures/planted-ux-problems` depuis une copie du
dépôt.

**3. Mettez-le en CI.** Choisissez la sortie et la barrière qui conviennent à votre pipeline :

```bash
npx ui-ux-suite . --json | jq              # lisible par une machine, la bannière part sur stderr
npx ui-ux-suite . --html report.html       # rapport HTML autonome
npx ui-ux-suite . --sarif ui-ux.sarif      # SARIF 2.1.0 pour GitHub code scanning
npx ui-ux-suite . --fail-under 7           # sort en 1 si la note passe sous 7
npx ui-ux-suite . --write-baseline .uiux-baseline.json   # gèle la dette du jour
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
npx ui-ux-suite . --tags dimension:accessibility --exclude-tags severity:nice-to-have
```

Toutes les options sont dans [docs/cli.md](../docs/cli.md).

## Ce que vous obtenez

- **Un rapport classé** en Markdown, JSON, HTML ou SARIF, selon que le lecteur est humain ou machine.
- **Une note sur 10** pour 12 dimensions pondérées, l'accessibilité pesant le plus lourd.
- **Une barrière CI**, soit un seuil absolu avec `--fail-under`, soit une ligne de base qui échoue sur un constat nouveau ou une baisse de la note.
- **14 skills et 16 outils** appelables par votre agent, si bien que « audite le design de ce projet » fonctionne dans le chat.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg">
  <img alt="Carte de score : note globale, notes par dimension et constats localisés" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg" width="100%">
</picture>

## Fonctionne dans votre éditeur

| Agent | Installation en une ligne |
|:--|:--|
| Claude Code | `claude plugin install ui-ux-suite@10x` |
| N'importe lequel de plus de 70 agents | `npx skills add Aboudjem/ui-ux-suite` |
| Codex, Gemini CLI, OpenCode, Pi | `./install.sh <agent>` |
| VS Code et GitHub Copilot | `./install.sh copilot` |
| Tout le reste | voir [docs/editors.md](../docs/editors.md) |

Fonctionne dans Claude Code, Cursor, Codex, Copilot, Gemini CLI et plus de 70 autres agents via
`npx skills add`. Les skills sont du Markdown, donc elles tournent sur le modèle que votre
éditeur utilise.

<details>
<summary><b>Ou ajoutez-le comme serveur MCP</b></summary>

```bash
claude mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
codex mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
```

Cursor, VS Code, Gemini CLI, Windsurf, Continue, OpenCode et Zed prennent la même commande sous
forme d'entrée de configuration, en JSON, TOML ou YAML selon l'éditeur. Les extraits par éditeur,
y compris les trois qui utilisent une autre clé, sont dans [docs/editors.md](../docs/editors.md).
</details>

## Bon à savoir

> [!IMPORTANT]
> Il audite, il n'édite jamais. Il ne modifie aucun fichier source du projet que vous lui
> indiquez, et la correction s'affiche sous forme de `before` vers `after` pour que vous
> l'appliquiez. Les seuls fichiers qu'il écrit sont des rapports et des lignes de base, et
> uniquement là où vous en avez demandé un.

- **Rien ne quitte votre machine.** Uniquement des modules natifs de Node, aucune clé d'API, aucune télémétrie. L'audit statique ne fait aucun appel réseau, et le mode profond ne visite que l'URL que vous lui donnez.
- **L'analyse statique est le mode par défaut.** Le mode profond est optionnel, demande `playwright-core` et `@axe-core/playwright`, et retombe sur les constats issus des sources en leur absence.
- **Les chiffres sont sous barrière.** `npm test` exécute 356 tests, et la fixture volontairement cassée doit continuer à produire des constats portant un fichier, une ligne et une correction.

## En savoir plus

- [docs/cli.md](../docs/cli.md), toutes les options, les codes de sortie et des recettes
- [docs/editors.md](../docs/editors.md), installation et configuration MCP par éditeur
- [docs/scoring.md](../docs/scoring.md), les 12 poids et la construction de la note
- [docs/science.md](../docs/science.md), les critères WCAG et les lois UX derrière les constats
- [docs/faq.md](../docs/faq.md) et [docs/comparison.md](../docs/comparison.md)
- [CHANGELOG.md](../CHANGELOG.md), [CONTRIBUTING.md](../CONTRIBUTING.md), [LICENSE](../LICENSE)

---

<p align="center"><sub>MIT · Réalisé par <a href="https://github.com/Aboudjem">Adam Boudjemaa</a></sub></p>

<sub>Ce document est une traduction assistée par machine. En cas de divergence, la <a href="../README.md">version anglaise</a> fait foi.</sub>
