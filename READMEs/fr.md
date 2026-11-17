<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-light.svg">
  <img alt="ui-ux-suite : les bugs de design par numéro de ligne. La ligne 118 de styles.css a une couleur de texte à 1.75:1, et la valeur corrigée passe à 4.51:1." src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-light.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml"><img src="https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/ui-ux-suite"><img src="https://img.shields.io/npm/v/ui-ux-suite?color=00D4FF&logo=npm&label=npm&style=flat-square" alt="npm version"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-00D4FF?style=flat-square" alt="License MIT"></a>
</p>

<p align="center"><a href="../README.md">English</a> · <a href="zh-CN.md">简体中文</a> · <a href="ja.md">日本語</a> · <a href="es.md">Español</a> · <b>Français</b></p>

<p align="center"><b>Les bugs de design par numéro de ligne, chacun avec la correction exacte.</b></p>

Il lit votre code source et affiche quoi changer, ligne par ligne.

| Ligne exacte à corriger | Règle WCAG citée | Valeur de correction donnée |
|:--|:--|:--|
| 46 problèmes localisés sur l'app de test, chacun avec un fichier et une ligne. | Le contraste est mesuré selon WCAG 2.2 ; chaque problème cite une règle WCAG ou une loi UX. | Chacun montre la valeur mesurée et le changement, par exemple `#fbfbfb` vers `#767676`. |

**Fonctionne avec :** tout client MCP et tout agent qui lit les skills. Testé : Claude Code, Cursor, Codex, Gemini CLI, OpenCode.

Utilisez-le sur tout projet web, avant une mise en ligne ou à chaque push. C'est du code simple, il n'a besoin d'aucun modèle d'IA.

Vous obtenez une note sur 10 et les trois corrections à faire d'abord. Ensuite, chaque problème avec sa correction, et son fichier et sa ligne quand il en a.

```bash
npx ui-ux-suite .
```

## Exemple de rapport

Le rapport s'ouvre sur la note, puis les trois corrections par lesquelles commencer, puis le détail.

```text
# Design audit: 3.7/10 (Needs Work)

**Verdict:** score 3.7/10, Needs Work. 46 located findings, 8 critical.

## Fix these first

1. 9 `.swatch*` color variants fail WCAG AA contrast (worst 1.75:1) at `src/styles.css:118`. Fix: Rebuild this color set against the surface it sits on so each meets ≥ 4.5:1 (e.g. the worst, `#b5c6d7`, should be `#6d7882` or darker), or reserve ...
2. No visible keyboard focus indicator anywhere at `src/styles.css:22`. Fix: Add a focus ring to all interactive elements: `:focus-visible { outline: 2px solid var(--ring, #2563eb); outline-offset: 2px; }`.
3. Fixed 1200px width on `.layout` with 0 media queries at `src/styles.css:57`. Fix: Use `max-width: 1200px; width: 100%` and add responsive breakpoints (sm/md/lg).

**Weakest areas:** Typography System 1.5/10, Accessibility 1.6/10, Component Quality 2/10.

_Scanned 3 CSS, 1 JSX/TSX/Vue/Svelte and 1 HTML files in 0.03s on 2026-11-17T18:22:05.018Z. The detail follows._
```

C'est une vraie exécution sur notre app de test, version 0.7.1. La commande est dans Preuves.
L'app de test est cassée exprès, donc elle obtient une note basse.

Il lit le source, pas les pixels, et une bonne note ne prouve pas la conformité WCAG.

## Installation

**Choisissez votre agent.** Cliquez dessus pour aller à sa commande. Rien à configurer, et pas de clé API.

<p>
<a href="#install-claude-code"><img src="https://img.shields.io/badge/Claude_Code-D97757?logo=claude&logoColor=white&style=for-the-badge" alt="Claude Code" height="24"></a>
<a href="#install-codex"><img src="https://img.shields.io/badge/Codex-000000?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyBmaWxsPSJ3aGl0ZSIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPHRpdGxlPk9wZW5BSTwvdGl0bGU%2BPHBhdGggZD0iTTIyLjI4MTkgOS44MjExYTUuOTg0NyA1Ljk4NDcgMCAwIDAtLjUxNTctNC45MTA4IDYuMDQ2MiA2LjA0NjIgMCAwIDAtNi41MDk4LTIuOUE2LjA2NTEgNi4wNjUxIDAgMCAwIDQuOTgwNyA0LjE4MThhNS45ODQ3IDUuOTg0NyAwIDAgMC0zLjk5NzcgMi45IDYuMDQ2MiA2LjA0NjIgMCAwIDAgLjc0MjcgNy4wOTY2IDUuOTggNS45OCAwIDAgMCAuNTExIDQuOTEwNyA2LjA1MSA2LjA1MSAwIDAgMCA2LjUxNDYgMi45MDAxQTUuOTg0NyA1Ljk4NDcgMCAwIDAgMTMuMjU5OSAyNGE2LjA1NTcgNi4wNTU3IDAgMCAwIDUuNzcxOC00LjIwNTggNS45ODk0IDUuOTg5NCAwIDAgMCAzLjk5NzctMi45MDAxIDYuMDU1NyA2LjA1NTcgMCAwIDAtLjc0NzUtNy4wNzI5em0tOS4wMjIgMTIuNjA4MWE0LjQ3NTUgNC40NzU1IDAgMCAxLTIuODc2NC0xLjA0MDhsLjE0MTktLjA4MDQgNC43NzgzLTIuNzU4MmEuNzk0OC43OTQ4IDAgMCAwIC4zOTI3LS42ODEzdi02LjczNjlsMi4wMiAxLjE2ODZhLjA3MS4wNzEgMCAwIDEgLjAzOC4wNTJ2NS41ODI2YTQuNTA0IDQuNTA0IDAgMCAxLTQuNDk0NSA0LjQ5NDR6bS05LjY2MDctNC4xMjU0YTQuNDcwOCA0LjQ3MDggMCAwIDEtLjUzNDYtMy4wMTM3bC4xNDIuMDg1MiA0Ljc4MyAyLjc1ODJhLjc3MTIuNzcxMiAwIDAgMCAuNzgwNiAwbDUuODQyOC0zLjM2ODV2Mi4zMzI0YS4wODA0LjA4MDQgMCAwIDEtLjAzMzIuMDYxNUw5Ljc0IDE5Ljk1MDJhNC40OTkyIDQuNDk5MiAwIDAgMS02LjE0MDgtMS42NDY0ek0yLjM0MDggNy44OTU2YTQuNDg1IDQuNDg1IDAgMCAxIDIuMzY1NS0xLjk3MjhWMTEuNmEuNzY2NC43NjY0IDAgMCAwIC4zODc5LjY3NjVsNS44MTQ0IDMuMzU0My0yLjAyMDEgMS4xNjg1YS4wNzU3LjA3NTcgMCAwIDEtLjA3MSAwbC00LjgzMDMtMi43ODY1QTQuNTA0IDQuNTA0IDAgMCAxIDIuMzQwOCA3Ljg3MnptMTYuNTk2MyAzLjg1NThMMTMuMTAzOCA4LjM2NCAxNS4xMTkyIDcuMmEuMDc1Ny4wNzU3IDAgMCAxIC4wNzEgMGw0LjgzMDMgMi43OTEzYTQuNDk0NCA0LjQ5NDQgMCAwIDEtLjY3NjUgOC4xMDQydi01LjY3NzJhLjc5Ljc5IDAgMCAwLS40MDctLjY2N3ptMi4wMTA3LTMuMDIzMWwtLjE0Mi0uMDg1Mi00Ljc3MzUtMi43ODE4YS43NzU5Ljc3NTkgMCAwIDAtLjc4NTQgMEw5LjQwOSA5LjIyOTdWNi44OTc0YS4wNjYyLjA2NjIgMCAwIDEgLjAyODQtLjA2MTVsNC44MzAzLTIuNzg2NmE0LjQ5OTIgNC40OTkyIDAgMCAxIDYuNjgwMiA0LjY2ek04LjMwNjUgMTIuODYzbC0yLjAyLTEuMTYzOGEuMDgwNC4wODA0IDAgMCAxLS4wMzgtLjA1NjdWNi4wNzQyYTQuNDk5MiA0LjQ5OTIgMCAwIDEgNy4zNzU3LTMuNDUzN2wtLjE0Mi4wODA1TDguNzA0IDUuNDU5YS43OTQ4Ljc5NDggMCAwIDAtLjM5MjcuNjgxM3ptMS4wOTc2LTIuMzY1NGwyLjYwMi0xLjQ5OTggMi42MDY5IDEuNDk5OHYyLjk5OTRsLTIuNTk3NCAxLjQ5OTctMi42MDY3LTEuNDk5N1oiLz48L3N2Zz4%3D" alt="Codex" height="24"></a>
<a href="#install-cursor"><img src="https://img.shields.io/badge/Cursor-000000?logo=cursor&logoColor=white&style=for-the-badge" alt="Cursor" height="24"></a>
<a href="#install-gemini-cli"><img src="https://img.shields.io/badge/Gemini_CLI-1A73E8?logo=googlegemini&logoColor=white&style=for-the-badge" alt="Gemini CLI" height="24"></a>
<a href="#install-opencode"><img src="https://img.shields.io/badge/OpenCode-111111?logo=opencode&logoColor=white&style=for-the-badge" alt="OpenCode" height="24"></a>
<a href="#install-github-copilot"><img src="https://img.shields.io/badge/GitHub_Copilot-24292E?logo=githubcopilot&logoColor=white&style=for-the-badge" alt="GitHub Copilot" height="24"></a>
<a href="https://skills.sh/aboudjem/ui-ux-suite"><img src="https://img.shields.io/badge/skills.sh-000000?logo=vercel&logoColor=white&style=for-the-badge" alt="skills.sh" height="24"></a>
</p>

**Tout autre agent** (CLI skills de Vercel) : `npx skills add Aboudjem/ui-ux-suite -g`, puis choisissez votre agent dans son menu.
`npx skills` est l'installeur ouvert de Vercel pour les skills. Sa page : [skills.sh/aboudjem/ui-ux-suite](https://skills.sh/aboudjem/ui-ux-suite).

Chaque commande installe pour tous vos projets. Seulement ce projet : retirez `-g`.

<a id="install-claude-code"></a>**Claude Code** (testé). Le plugin apporte les 14 skills, 5 commandes, 12 agents et le serveur MCP.

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

<a id="install-codex"></a>**Codex** (MCP testé, installation des skills testée)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a codex
```

<a id="install-cursor"></a>**Cursor** (MCP testé, installation des skills testée)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a cursor
```

<a id="install-gemini-cli"></a>**Gemini CLI** (MCP testé, installation des skills testée)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a gemini-cli
```

<a id="install-opencode"></a>**OpenCode** (MCP testé, installation des skills testée)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a opencode
```

<a id="install-github-copilot"></a>**GitHub Copilot** (installation testée)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a github-copilot
```

**Ajoutez ensuite le serveur MCP.** Hors de Claude Code, les skills l'appellent. MCP est un standard ouvert qui permet à un agent d'appeler des outils.
Cette ligne l'ajoute pour tous vos projets dans Claude Code. La config de chaque autre agent est dans [docs/editors.md](../docs/editors.md).

```bash
claude mcp add -s user ui-ux-suite -- npx -y ui-ux-suite --mcp
```

```json
{
  "mcpServers": {
    "ui-ux-suite": { "command": "npx", "args": ["-y", "ui-ux-suite", "--mcp"] }
  }
}
```

**Sans agent du tout.** La ligne de commande n'a pas d'étape d'installation : `npx ui-ux-suite .` la lance.

### Compatible avec

Chaque ligne est une vraie installation suivie d'une vérification, faite à la date indiquée sur macOS avec Node 22.

| Agent                 | Comment il a été installé                                      | Testé      | Ce que le test a montré                                                  |
| :-------------------- | :------------------------------------------------------------- | :--------- | :----------------------------------------------------------------------- |
| Claude Code           | Plugin chargé avec `claude --plugin-dir .`                     | 2026-11-17 | `claude plugin validate . --strict` passe, et le serveur MCP se connecte |
| Cursor                | `.cursor/mcp.json`, puis `cursor-agent mcp enable ui-ux-suite` | 2026-11-17 | `cursor-agent mcp list-tools ui-ux-suite` liste les 16 outils            |
| Codex                 | `codex mcp add ui-ux-suite`                                    | 2026-11-17 | `codex mcp list` montre le serveur activé                                |
| Gemini CLI            | `gemini mcp add ui-ux-suite`, puis faire confiance au dossier  | 2026-11-17 | `gemini mcp list` montre le serveur connecté                             |
| OpenCode              | `opencode.json`                                                | 2026-11-17 | `opencode mcp list` montre le serveur connecté                           |
| Skills CLI 1.9.0 | `npx skills add Aboudjem/ui-ux-suite -g -a <agent>`, pour chacun des 6 agents ci-dessus, dans un dossier personnel vierge | 2026-11-17 | Les 14 skills arrivent dans `~/.agents/skills`, ou `~/.claude/skills` pour Claude Code |
| MCP Claude Code | `claude mcp add -s user ui-ux-suite -- npx -y ui-ux-suite --mcp`, dans un dossier personnel vierge | 2026-11-17 | `claude mcp list` dans un autre dossier montre le serveur connecté |
| Tout client MCP | `npx -y ui-ux-suite --mcp`                                     | 2026-11-17 | Une session MCP brute liste 16 outils et note l'app de test à 3.7           |

Documentés, non lancés à cette date : la config MCP de VS Code et GitHub Copilot, Windsurf, Continue, Zed, Pi et `install.sh`.
Leurs extraits de config sont dans [docs/editors.md](../docs/editors.md).

Deux agents demandent une étape de plus avant de charger le serveur :

- **Cursor** ne démarre pas un nouveau serveur tant que vous ne l'approuvez pas : `cursor-agent mcp enable ui-ux-suite`.
- **Gemini CLI** désactive tout serveur MCP dans un dossier auquel il ne fait pas confiance. Lancez `gemini` une fois dans ce dossier et choisissez "Trust folder".

## Utilisation

**1. Pointez-le sur un projet.**

```bash
npx ui-ux-suite .
```

**2. Corrigez les trois lignes du haut.** Chacune donne un fichier, une ligne et le changement à faire.

**3. Mettez-le en CI.** La CI, ce sont les vérifications lancées à chaque push. Choisissez le format de sortie et la règle qui fait échouer le build.

```bash
npx ui-ux-suite . --fail-under 7           # exit 1 when the score drops below 7
npx ui-ux-suite . --json | jq              # machine-readable, banner goes to stderr
npx ui-ux-suite . --html report.html       # standalone HTML report
npx ui-ux-suite . --sarif ui-ux.sarif      # SARIF 2.1.0 for GitHub code scanning
npx ui-ux-suite . --write-baseline .uiux-baseline.json   # save today's findings
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
npx ui-ux-suite . --tags dimension:accessibility --exclude-tags severity:nice-to-have
```

Dans un agent, demandez-le avec des mots simples : "audite le design de ce projet". Dans Claude Code, tapez `/ui-ux-suite:audit`.

**4. En option : utilisez le mode deep.** Il vérifie l'app en marche dans un vrai navigateur. La CLI n'a pas d'option deep : le mode deep passe par l'outil MCP `uiux_audit_run`.

D'abord, installez les deux paquets en plus et un navigateur dans votre projet :

```bash
npm i -D playwright-core @axe-core/playwright
npx playwright install chromium
```

Puis lancez votre app et demandez à votre agent : "Run `uiux_audit_run` with `depth: "deep"` and `baseUrl: "http://localhost:3000"`."
Le mode deep ajoute le contraste mesuré en direct, les contrôles axe-core et les cibles tactiles sous 44 sur 44 pixels. Les paramètres sont dans [docs/tools.md](../docs/tools.md).

Chaque option et chaque code de sortie sont dans [docs/cli.md](../docs/cli.md). Chaque outil MCP est dans [docs/tools.md](../docs/tools.md).

## Fonctionnement

Il lit votre source, mesure chaque valeur et affiche la correction. Il ne lance pas votre app et n'a pas besoin de navigateur.

| Étape        | Ce qui se passe                                                                                                   |
| :----------- | :---------------------------------------------------------------------------------------------------------------- |
| 1. Lire      | Il parcourt le dossier et lit le CSS, SCSS, JSX, TSX, Vue, Svelte, HTML et les classes Tailwind.                  |
| 2. Mesurer   | Il calcule des valeurs réelles : contraste en WCAG 2.2 et APCA, tailles de police, espacements, tailles de cible. |
| 3. Localiser | Il relie chaque problème à un fichier, une ligne et un sélecteur.                                                 |
| 4. Noter     | Il note 12 dimensions pondérées sur 10. L'accessibilité pèse le plus, à 12 %.                                     |
| 5. Rapporter | Il affiche la note, trois corrections, puis chaque problème avec son `before`, son `after` et la règle WCAG ou la loi UX qui le justifie. |

Voyez-le comme un ESLint pour le design. ESLint est un outil qui vérifie le style du code.
Il trouve un contraste trop faible, un anneau de focus absent et une largeur fixe qui casse sur mobile.

Certains problèmes concernent tout le projet, comme "5 familles de polices, utilisez-en 1 ou 2". Ils comptent dans la note et n'ont pas de ligne unique.

Voici un problème en entier, tiré de la même exécution sur l'app de test :

```text
### [!] Low text contrast on `.hero-subtitle`: 1.03:1
- **Where:** `src/styles.css:14` · selector `.hero-subtitle`
- **Measured:** 1.03:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#fbfbfb` on `#ffffff` measures 1.03:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Impact:** Users with low vision (and most users in bright light) cannot read this text.
- **Fix:** Change `color` on `.hero-subtitle` from `#fbfbfb` to `#767676` (meets 4.5:1 on `#ffffff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)
```

**Qu'est-ce que l'APCA Lc ?** C'est une seconde mesure du contraste, conçue pour suivre la façon dont on voit vraiment le texte.
Elle va de 0, aucun contraste visible, à environ 106. L'outil juge Lc 90 correct pour le texte courant, et 60 comme plancher pour le grand texte.
Le ratio WCAG décide toujours de la réussite ou de l'échec. Voir [docs/science.md](../docs/science.md).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg">
  <img alt="Scorecard: an overall score, per-dimension scores, and located findings" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg" width="100%">
</picture>

Les poids et les règles de notation sont dans [docs/scoring.md](../docs/scoring.md). Les normes derrière les problèmes sont dans [docs/science.md](../docs/science.md).

## Preuves

Chaque nombre de cette page vient d'une commande. Lancez-la et comparez.

| Affirmation                                                       | Commande qui l'affiche                              |
| :---------------------------------------------------------------- | :-------------------------------------------------- |
| 397 tests passent, 0 échoue                                       | `npm test`                                          |
| L'app de test cassée obtient 3.7 sur 10, avec 46 problèmes localisés | `npx ui-ux-suite test/fixtures/planted-ux-problems` |
| Le serveur MCP expose 16 outils                                   | `node scripts/gen-tool-reference.js --check`        |
| Le dépôt contient 14 skills                                       | `npx skills add Aboudjem/ui-ux-suite --list`        |
| Le paquet n'a aucune dépendance d'exécution                       | `npm view ui-ux-suite dependencies` n'affiche rien  |
| Le manifeste du plugin est valide                                 | `claude plugin validate . --strict`                 |

L'app de test sert à détecter les régressions. Elle contient des problèmes connus, exprès, listés dans [PLANTED.md](../test/fixtures/planted-ux-problems/PLANTED.md).
Les tests échouent si l'un d'eux n'est plus trouvé avec un fichier, une ligne et une correction.

La CI lance le même `npm test` à chaque push et pull request, sur Node 18 et Node 22.

## FAQ

**Est-ce sûr de le lancer sur mon projet ?**
Oui. Il ne crée, ne modifie et ne supprime jamais un fichier source. Il écrit seulement le rapport ou la baseline dont vous donnez le nom.

**Mon code quitte-t-il ma machine ?**
Non. L'audit ne fait aucun appel réseau, ne demande aucune clé d'API et n'envoie aucune télémétrie. Le mode deep n'ouvre que l'URL que vous lui donnez.

**Faut-il une app en marche ?**
Non. L'audit par défaut lit les fichiers source. Le mode deep est optionnel et ajoute des contrôles en direct via Playwright et axe-core.

**Corrige-t-il mon code à ma place ?**
Non. Il affiche chaque correction sous forme de `before` et `after`. Vous, ou votre agent, l'appliquez.

**Mon projet a déjà une mauvaise note. Puis-je quand même l'utiliser en CI ?**
Oui. Enregistrez une baseline une fois : un fichier avec les problèmes du jour. Ensuite, le build échoue seulement sur un nouveau problème ou une note plus basse. Les deux commandes sont à l'étape 3 plus haut.

**Quelles stacks lit-il ?**
React, Next.js, Vue, Svelte, Angular et le HTML simple. Tailwind v3 et v4, CSS Modules, SCSS, styled-components, Emotion et le CSS simple.

**En quoi diffère-t-il de Lighthouse ou axe ?**
Ces deux-là ont besoin d'une page en marche. Celui-ci lit le source, donc il peut nommer le fichier et la ligne. Voir [docs/comparison.md](../docs/comparison.md).

D'autres questions ont leur réponse dans [docs/faq.md](../docs/faq.md).

## Limites

- **Il lit le source, pas les pixels.** Un style posé à l'exécution par JavaScript n'est pas vu sans le mode deep.
- **Il saute une paire de contraste qu'il ne sait pas résoudre.** Quand le fond est inconnu, il ne signale rien au lieu de deviner.
- **La note est un guide, pas un certificat.** Une bonne note ne prouve pas la conformité WCAG. Une revue manuelle le fait toujours.
- **Il audite, il ne modifie jamais.** Appliquer une correction, c'est votre étape.
- **Les skills appellent les outils MCP.** Hors de Claude Code, ajoutez le serveur MCP à côté des skills.
- **Le mode deep demande deux paquets en plus.** Ce sont `playwright-core` et `@axe-core/playwright`. Sans eux, vous n'avez que les problèmes trouvés dans le source.
- **Il descend six dossiers en profondeur.** Dans un dépôt très profond, pointez-le plus près du source.
- **Il demande Node 18 ou plus récent.**

## En savoir plus

- [docs/cli.md](../docs/cli.md), chaque option, code de sortie et recette
- [docs/tools.md](../docs/tools.md), les 16 outils MCP et quand utiliser chacun
- [docs/editors.md](../docs/editors.md), installation et config MCP par éditeur
- [docs/scoring.md](../docs/scoring.md), les 12 poids et la façon dont la note est construite
- [docs/science.md](../docs/science.md), les critères WCAG et les lois UX derrière les problèmes
- [CHANGELOG.md](../CHANGELOG.md), [CONTRIBUTING.md](../CONTRIBUTING.md), [SECURITY.md](../SECURITY.md), [LICENSE](../LICENSE)

---

<p align="center"><sub>MIT · Réalisé par <a href="https://github.com/Aboudjem">Adam Boudjemaa</a></sub></p>

<sub>Ce document est une traduction assistée par machine. En cas de divergence, la <a href="../README.md">version anglaise</a> fait foi.</sub>
