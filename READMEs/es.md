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

<p align="center"><a href="../README.md">English</a> · <a href="zh-CN.md">简体中文</a> · <a href="ja.md">日本語</a> · <b>Español</b> · <a href="fr.md">Français</a></p>

<p align="center"><b>ESLint para diseño. Encuentra la línea exacta, el valor medido que está mal y el arreglo exacto.</b></p>

<p align="center">
  <a href="#qué-hace">Qué hace</a> · <a href="#instalación">Instalación</a> · <a href="#cómo-usarlo">Cómo usarlo</a> · <a href="#qué-obtienes">Qué obtienes</a> · <a href="#funciona-en-tu-editor">Funciona en tu editor</a> · <a href="#conviene-saber">Conviene saber</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

## Qué hace

Casi toda revisión de diseño te dice que mejores el contraste. Esta te dice que `.hero-subtitle`,
en la línea 14 de `src/styles.css`, es `#fbfbfb` sobre `#ffffff`, que mide 1,03 a 1, y que
`#767676` sí pasaría. La misma forma que un error de linter, aplicada al diseño.

Lee tu CSS, tu JSX, tu HTML y tus clases de Tailwind. Por defecto no ejecuta nada, nada sale de
tu máquina y nunca hace falta una clave. Los hallazgos son de dos tipos. Un hallazgo localizado,
que es la mayor parte de lo que vas a corregir, trae tres cosas:

- **Localizado.** El archivo, la línea y el selector.
- **Medido.** El valor real que está mal, no un adjetivo.
- **Arreglado.** El cambio exacto de `before` a `after`, más el criterio WCAG o la ley de UX con nombre en la que se apoya.

El resto son hallazgos de proyecto, como "5 familias tipográficas, usa 1 o 2". Puntúan y nombran
el problema, pero no hay una línea concreta a la que apuntar.

## Instalación

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

Eso es Claude Code. Para cualquier otro agente que lea el formato Agent Skills, instala las 14
skills directamente desde este repositorio:

```bash
npx skills add Aboudjem/ui-ux-suite
```

La herramienta de línea de comandos no necesita ningún paso de instalación: `npx ui-ux-suite .` ya la ejecuta.

<details>
<summary><b>O añádela como dependencia de desarrollo</b></summary>

```bash
npm install -D ui-ux-suite
```

```json
{ "scripts": { "design-audit": "ui-ux-suite . --fail-under 7" } }
```

Requiere Node 18 o superior. Cero dependencias en tiempo de ejecución, así que esto no arrastra
nada más.
</details>

## Cómo usarlo

**1. Apúntalo a un proyecto.**

```bash
npx ui-ux-suite .
```

Obtienes una lista ordenada de hallazgos y una puntuación ponderada sobre 10 en 12 dimensiones.
Sin archivo de configuración y sin paso de instalación.

**2. Lee un hallazgo.** Esta es salida real del fixture roto que viene en el repositorio, que
saca 3,7 sobre 10 porque se supone que está roto:

```
- **Where:** `src/styles.css:14` · selector `.hero-subtitle`
- **Measured:** 1.03:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#fbfbfb` on `#ffffff` measures 1.03:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Fix:** Change `color` on `.hero-subtitle` from `#fbfbfb` to `#767676` (meets 4.5:1 on `#ffffff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)
```

Compruébalo tú con `npx ui-ux-suite test/fixtures/planted-ux-problems` desde una copia del
repositorio.

**3. Ponlo en CI.** Elige la salida y la barrera que encajen en tu pipeline:

```bash
npx ui-ux-suite . --json | jq              # legible por máquina, el banner va a stderr
npx ui-ux-suite . --html report.html       # informe HTML autónomo
npx ui-ux-suite . --sarif ui-ux.sarif      # SARIF 2.1.0 para GitHub code scanning
npx ui-ux-suite . --fail-under 7           # sale con 1 si la puntuación baja de 7
npx ui-ux-suite . --write-baseline .uiux-baseline.json   # congela la deuda de hoy
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
npx ui-ux-suite . --tags dimension:accessibility --exclude-tags severity:nice-to-have
```

Todas las opciones están en [docs/cli.md](../docs/cli.md).

## Qué obtienes

- **Un informe ordenado** en Markdown, JSON, HTML o SARIF, según lo lea una persona o una máquina.
- **Una puntuación sobre 10** en 12 dimensiones ponderadas, donde accesibilidad pesa más que ninguna.
- **Una barrera de CI**, ya sea un listón absoluto con `--fail-under` o una línea base que falla ante un hallazgo nuevo o una caída de la puntuación.
- **14 skills y 16 herramientas** que tu agente puede llamar, así que "audita el diseño de este proyecto" funciona en el chat.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg">
  <img alt="Tarjeta de puntuación: puntuación global, puntuaciones por dimensión y hallazgos localizados" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg" width="100%">
</picture>

## Funciona en tu editor

| Agente | Instalación en una línea |
|:--|:--|
| Claude Code | `claude plugin install ui-ux-suite@10x` |
| Cualquiera de más de 70 agentes | `npx skills add Aboudjem/ui-ux-suite` |
| Codex, Gemini CLI, OpenCode, Pi | `./install.sh <agent>` |
| VS Code y GitHub Copilot | `./install.sh copilot` |
| Todo lo demás | ver [docs/editors.md](../docs/editors.md) |

Funciona en Claude Code, Cursor, Codex, Copilot, Gemini CLI y más de 70 agentes a través de
`npx skills add`. Las skills son Markdown, así que corren sobre el modelo al que apunte tu editor.

<details>
<summary><b>O añádelo como servidor MCP</b></summary>

```bash
claude mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
codex mcp add ui-ux-suite -- npx -y ui-ux-suite --mcp
```

Cursor, VS Code, Gemini CLI, Windsurf, Continue, OpenCode y Zed toman el mismo comando como una
entrada de configuración, en JSON, TOML o YAML según el editor. Los fragmentos por editor,
incluidos los tres que usan otra clave, están en [docs/editors.md](../docs/editors.md).
</details>

## Conviene saber

> [!IMPORTANT]
> Audita, nunca edita. No modifica ningún archivo fuente del proyecto que le indicas, y el
> arreglo se imprime como `before` a `after` para que lo apliques tú. Los únicos archivos que
> escribe son informes y líneas base, y solo donde tú lo has pedido.

- **Nada sale de tu máquina.** Solo módulos nativos de Node, sin claves de API y sin telemetría. La auditoría estática no hace ninguna llamada de red, y el modo profundo solo visita la URL que tú le das.
- **El análisis estático es lo predeterminado.** El modo profundo es opcional, necesita `playwright-core` y `@axe-core/playwright`, y sin ellos vuelve a los hallazgos de código fuente.
- **Los números tienen barrera.** `npm test` corre 356 pruebas, y el fixture roto que viene en el repositorio debe seguir produciendo hallazgos con archivo, línea y arreglo.

## Más información

- [docs/cli.md](../docs/cli.md), todas las opciones, códigos de salida y recetas
- [docs/editors.md](../docs/editors.md), instalación y configuración MCP por editor
- [docs/scoring.md](../docs/scoring.md), los 12 pesos y cómo se construye la puntuación
- [docs/science.md](../docs/science.md), los criterios WCAG y las leyes de UX detrás de los hallazgos
- [docs/faq.md](../docs/faq.md) y [docs/comparison.md](../docs/comparison.md)
- [CHANGELOG.md](../CHANGELOG.md), [CONTRIBUTING.md](../CONTRIBUTING.md), [LICENSE](../LICENSE)

---

<p align="center"><sub>MIT · Hecho por <a href="https://github.com/Aboudjem">Adam Boudjemaa</a></sub></p>

<sub>Este documento es una traducción asistida por máquina. Si hay discrepancias, la <a href="../README.md">versión en inglés</a> prevalece.</sub>
