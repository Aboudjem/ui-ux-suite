<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-light.svg">
  <img alt="ui-ux-suite: fallos de diseño por número de línea. La línea 118 de styles.css tiene un color de texto con contraste 1.75:1, y el valor corregido pasa con 4.51:1." src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/hero-light.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml"><img src="https://github.com/Aboudjem/ui-ux-suite/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/ui-ux-suite"><img src="https://img.shields.io/npm/v/ui-ux-suite?color=00D4FF&logo=npm&label=npm&style=flat-square" alt="npm version"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-00D4FF?style=flat-square" alt="License MIT"></a>
</p>

<p align="center"><a href="../README.md">English</a> · <a href="zh-CN.md">简体中文</a> · <a href="ja.md">日本語</a> · <b>Español</b> · <a href="fr.md">Français</a></p>

<p align="center"><b>Fallos de diseño por número de línea, cada uno con la corrección exacta.</b></p>

Lee tu código fuente e imprime qué cambiar, línea por línea.

| Línea exacta que corregir | Regla WCAG citada | Valor de corrección dado |
|:--|:--|:--|
| 46 hallazgos localizados en la app de prueba, cada uno con un archivo y una línea. | El contraste se mide con WCAG 2.2; cada hallazgo cita una regla WCAG o una ley UX. | Cada uno muestra el valor medido y el cambio, por ejemplo de `#fbfbfb` a `#767676`. |

**Funciona con:** cualquier cliente MCP y cualquier agente que lea skills. Probado: Claude Code, Cursor, Codex, Gemini CLI, OpenCode.

Úsalo en cualquier proyecto web, antes de publicar o en cada push. Es código simple, así que no necesita ningún modelo de IA.

Obtienes una nota sobre 10 y los tres arreglos que hacer primero. Después, cada hallazgo con su arreglo, y su archivo y línea cuando los tiene.

```bash
npx ui-ux-suite .
```

## Informe de ejemplo

El informe empieza con la nota, luego los tres arreglos por los que empezar y después el detalle.

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

Es una ejecución real en nuestra app de prueba, versión 0.7.1. El comando está en Pruebas.
La app de prueba está rota a propósito, así que saca una nota baja.

Lee el código fuente, no los píxeles, y una nota alta no prueba la conformidad con WCAG.

## Instalación

**Recomendado: un comando para todos tus agentes y proyectos.**

```bash
npx skills add Aboudjem/ui-ux-suite -g
```

<a href="https://skills.sh/aboudjem/ui-ux-suite"><img src="https://img.shields.io/badge/skills.sh-000000?logo=vercel&logoColor=white&style=for-the-badge" alt="skills.sh" height="24"></a>

Funciona en 79 agentes: elige el tuyo en el menú ([la lista](https://github.com/vercel-labs/skills#supported-agents)).
`npx skills` es el instalador abierto de Vercel para skills. Su página: [skills.sh/aboudjem/ui-ux-suite](https://skills.sh/aboudjem/ui-ux-suite).

Instala solo las 14 skills. El servidor MCP, que las skills llaman, es una línea más, abajo. Solo este proyecto: quita `-g`.

**O instala directamente en un agente.** Haz clic para ir a su comando. Nada que configurar, y sin clave de API.

<p>
<a href="#install-claude-code"><img src="https://img.shields.io/badge/Claude_Code-D97757?logo=claude&logoColor=white&style=for-the-badge" alt="Claude Code" height="24"></a>
<a href="#install-codex"><img src="https://img.shields.io/badge/Codex-000000?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyBmaWxsPSJ3aGl0ZSIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPHRpdGxlPk9wZW5BSTwvdGl0bGU%2BPHBhdGggZD0iTTIyLjI4MTkgOS44MjExYTUuOTg0NyA1Ljk4NDcgMCAwIDAtLjUxNTctNC45MTA4IDYuMDQ2MiA2LjA0NjIgMCAwIDAtNi41MDk4LTIuOUE2LjA2NTEgNi4wNjUxIDAgMCAwIDQuOTgwNyA0LjE4MThhNS45ODQ3IDUuOTg0NyAwIDAgMC0zLjk5NzcgMi45IDYuMDQ2MiA2LjA0NjIgMCAwIDAgLjc0MjcgNy4wOTY2IDUuOTggNS45OCAwIDAgMCAuNTExIDQuOTEwNyA2LjA1MSA2LjA1MSAwIDAgMCA2LjUxNDYgMi45MDAxQTUuOTg0NyA1Ljk4NDcgMCAwIDAgMTMuMjU5OSAyNGE2LjA1NTcgNi4wNTU3IDAgMCAwIDUuNzcxOC00LjIwNTggNS45ODk0IDUuOTg5NCAwIDAgMCAzLjk5NzctMi45MDAxIDYuMDU1NyA2LjA1NTcgMCAwIDAtLjc0NzUtNy4wNzI5em0tOS4wMjIgMTIuNjA4MWE0LjQ3NTUgNC40NzU1IDAgMCAxLTIuODc2NC0xLjA0MDhsLjE0MTktLjA4MDQgNC43NzgzLTIuNzU4MmEuNzk0OC43OTQ4IDAgMCAwIC4zOTI3LS42ODEzdi02LjczNjlsMi4wMiAxLjE2ODZhLjA3MS4wNzEgMCAwIDEgLjAzOC4wNTJ2NS41ODI2YTQuNTA0IDQuNTA0IDAgMCAxLTQuNDk0NSA0LjQ5NDR6bS05LjY2MDctNC4xMjU0YTQuNDcwOCA0LjQ3MDggMCAwIDEtLjUzNDYtMy4wMTM3bC4xNDIuMDg1MiA0Ljc4MyAyLjc1ODJhLjc3MTIuNzcxMiAwIDAgMCAuNzgwNiAwbDUuODQyOC0zLjM2ODV2Mi4zMzI0YS4wODA0LjA4MDQgMCAwIDEtLjAzMzIuMDYxNUw5Ljc0IDE5Ljk1MDJhNC40OTkyIDQuNDk5MiAwIDAgMS02LjE0MDgtMS42NDY0ek0yLjM0MDggNy44OTU2YTQuNDg1IDQuNDg1IDAgMCAxIDIuMzY1NS0xLjk3MjhWMTEuNmEuNzY2NC43NjY0IDAgMCAwIC4zODc5LjY3NjVsNS44MTQ0IDMuMzU0My0yLjAyMDEgMS4xNjg1YS4wNzU3LjA3NTcgMCAwIDEtLjA3MSAwbC00LjgzMDMtMi43ODY1QTQuNTA0IDQuNTA0IDAgMCAxIDIuMzQwOCA3Ljg3MnptMTYuNTk2MyAzLjg1NThMMTMuMTAzOCA4LjM2NCAxNS4xMTkyIDcuMmEuMDc1Ny4wNzU3IDAgMCAxIC4wNzEgMGw0LjgzMDMgMi43OTEzYTQuNDk0NCA0LjQ5NDQgMCAwIDEtLjY3NjUgOC4xMDQydi01LjY3NzJhLjc5Ljc5IDAgMCAwLS40MDctLjY2N3ptMi4wMTA3LTMuMDIzMWwtLjE0Mi0uMDg1Mi00Ljc3MzUtMi43ODE4YS43NzU5Ljc3NTkgMCAwIDAtLjc4NTQgMEw5LjQwOSA5LjIyOTdWNi44OTc0YS4wNjYyLjA2NjIgMCAwIDEgLjAyODQtLjA2MTVsNC44MzAzLTIuNzg2NmE0LjQ5OTIgNC40OTkyIDAgMCAxIDYuNjgwMiA0LjY2ek04LjMwNjUgMTIuODYzbC0yLjAyLTEuMTYzOGEuMDgwNC4wODA0IDAgMCAxLS4wMzgtLjA1NjdWNi4wNzQyYTQuNDk5MiA0LjQ5OTIgMCAwIDEgNy4zNzU3LTMuNDUzN2wtLjE0Mi4wODA1TDguNzA0IDUuNDU5YS43OTQ4Ljc5NDggMCAwIDAtLjM5MjcuNjgxM3ptMS4wOTc2LTIuMzY1NGwyLjYwMi0xLjQ5OTggMi42MDY5IDEuNDk5OHYyLjk5OTRsLTIuNTk3NCAxLjQ5OTctMi42MDY3LTEuNDk5N1oiLz48L3N2Zz4%3D" alt="Codex" height="24"></a>
<a href="#install-cursor"><img src="https://img.shields.io/badge/Cursor-000000?logo=cursor&logoColor=white&style=for-the-badge" alt="Cursor" height="24"></a>
<a href="#install-gemini-cli"><img src="https://img.shields.io/badge/Gemini_CLI-1A73E8?logo=googlegemini&logoColor=white&style=for-the-badge" alt="Gemini CLI" height="24"></a>
<a href="#install-github-copilot"><img src="https://img.shields.io/badge/GitHub_Copilot-24292E?logo=githubcopilot&logoColor=white&style=for-the-badge" alt="GitHub Copilot" height="24"></a>
<a href="#install-opencode"><img src="https://img.shields.io/badge/OpenCode-111111?logo=opencode&logoColor=white&style=for-the-badge" alt="OpenCode" height="24"></a>
</p>

<a id="install-claude-code"></a>**Claude Code** (instalación de skills probada)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a claude-code
```

<a id="install-codex"></a>**Codex** (MCP probado, instalación de skills probada)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a codex
```

<a id="install-cursor"></a>**Cursor** (MCP probado, instalación de skills probada)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a cursor
```

<a id="install-gemini-cli"></a>**Gemini CLI** (MCP probado, instalación de skills probada)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a gemini-cli
```

<a id="install-github-copilot"></a>**GitHub Copilot** (instalación probada)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a github-copilot
```

<a id="install-opencode"></a>**OpenCode** (MCP probado, instalación de skills probada)

```bash
npx skills add Aboudjem/ui-ux-suite -g -a opencode
```

**Plugin de Claude Code.** Añade 5 comandos slash, 12 agentes y el servidor MCP a las 14 skills. Probado.

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install ui-ux-suite@10x
```

**Después añade el servidor MCP.** El plugin lo trae. En otros casos, las skills lo llaman, así que añádelo una vez. MCP es un estándar abierto que permite a un agente llamar a herramientas.
Esta línea lo añade para todos tus proyectos en Claude Code. La configuración de cada otro agente está en [docs/editors.md](../docs/editors.md).

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

**Sin ningún agente.** La línea de comandos no tiene paso de instalación: `npx ui-ux-suite .` la ejecuta.

### Funciona con

Cada fila es una instalación real seguida de una comprobación, hecha en la fecha indicada en macOS con Node 22.

| Agente                      | Cómo se instaló                                                 | Probado    | Qué mostró la prueba                                                      |
| :-------------------------- | :-------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------ |
| Claude Code                 | Plugin cargado con `claude --plugin-dir .`                      | 2026-11-17 | `claude plugin validate . --strict` pasa, y el servidor MCP se conecta    |
| Cursor                      | `.cursor/mcp.json`, luego `cursor-agent mcp enable ui-ux-suite` | 2026-11-17 | `cursor-agent mcp list-tools ui-ux-suite` lista las 16 herramientas       |
| Codex                       | `codex mcp add ui-ux-suite`                                     | 2026-11-17 | `codex mcp list` muestra el servidor activado                             |
| Gemini CLI                  | `gemini mcp add ui-ux-suite`, luego confiar en la carpeta       | 2026-11-17 | `gemini mcp list` muestra el servidor conectado                           |
| OpenCode                    | `opencode.json`                                                 | 2026-11-17 | `opencode mcp list` muestra el servidor conectado                         |
| Skills CLI 1.9.0 | `npx skills add Aboudjem/ui-ux-suite -g -a <agent>`, para cada uno de los 6 agentes de arriba, en una carpeta personal nueva | 2026-11-17 | Las 14 skills llegan a `~/.agents/skills`, o `~/.claude/skills` para Claude Code |
| MCP de Claude Code | `claude mcp add -s user ui-ux-suite -- npx -y ui-ux-suite --mcp`, en una carpeta personal nueva | 2026-11-17 | `claude mcp list` en otra carpeta muestra el servidor conectado |
| Cualquier cliente MCP | `npx -y ui-ux-suite --mcp`                                      | 2026-11-17 | Una sesión MCP en bruto lista 16 herramientas y puntúa la app de prueba con 3.7 |

Documentados, no ejecutados en esa fecha: la configuración MCP de VS Code y GitHub Copilot, Windsurf, Continue, Zed, Pi e `install.sh`.
Sus fragmentos de configuración están en [docs/editors.md](../docs/editors.md).

Dos agentes necesitan un paso más antes de cargar el servidor:

- **Cursor** no inicia un servidor nuevo hasta que lo apruebas: `cursor-agent mcp enable ui-ux-suite`.
- **Gemini CLI** desactiva todo servidor MCP en una carpeta en la que no confía. Ejecuta `gemini` una vez allí y elige "Trust folder".

## Uso

**1. Apúntalo a un proyecto.**

```bash
npx ui-ux-suite .
```

**2. Arregla las tres líneas de arriba.** Cada una nombra un archivo, una línea y el cambio que hacer.

**3. Ponlo en CI.** CI son las comprobaciones que se ejecutan en cada push. Elige el formato de salida y la regla que hace fallar el build.

```bash
npx ui-ux-suite . --fail-under 7           # exit 1 when the score drops below 7
npx ui-ux-suite . --json | jq              # machine-readable, banner goes to stderr
npx ui-ux-suite . --html report.html       # standalone HTML report
npx ui-ux-suite . --sarif ui-ux.sarif      # SARIF 2.1.0 for GitHub code scanning
npx ui-ux-suite . --write-baseline .uiux-baseline.json   # save today's findings
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
npx ui-ux-suite . --tags dimension:accessibility --exclude-tags severity:nice-to-have
```

En un agente, pídelo con palabras sencillas: "audita el diseño de este proyecto". En Claude Code, escribe `/ui-ux-suite:audit`.

**4. Opcional: usa el modo deep.** Revisa la app en marcha en un navegador real. La CLI no tiene opción deep: el modo deep funciona a través de la herramienta MCP `uiux_audit_run`.

Primero, instala los dos paquetes extra y un navegador en tu proyecto:

```bash
npm i -D playwright-core @axe-core/playwright
npx playwright install chromium
```

Luego arranca tu app y pide a tu agente: "Run `uiux_audit_run` with `depth: "deep"` and `baseUrl: "http://localhost:3000"`."
El modo deep añade contraste medido en vivo, comprobaciones de axe-core y objetivos táctiles de menos de 44 por 44 píxeles. Los parámetros están en [docs/tools.md](../docs/tools.md).

Cada opción y cada código de salida están en [docs/cli.md](../docs/cli.md). Cada herramienta MCP está en [docs/tools.md](../docs/tools.md).

## Cómo funciona

Lee tu código fuente, mide cada valor e imprime el arreglo. No ejecuta tu app ni necesita navegador.

| Paso         | Qué pasa                                                                                                 |
| :----------- | :------------------------------------------------------------------------------------------------------- |
| 1. Leer      | Recorre la carpeta y lee CSS, SCSS, JSX, TSX, Vue, Svelte, HTML y clases de Tailwind.                    |
| 2. Medir     | Calcula valores reales: contraste en WCAG 2.2 y APCA, tamaños de fuente, espaciado, tamaños de objetivo. |
| 3. Localizar | Vincula cada problema a un archivo, una línea y un selector.                                             |
| 4. Puntuar   | Puntúa 12 dimensiones ponderadas sobre 10. La accesibilidad pesa más, con un 12 %.                       |
| 5. Informar | Imprime la nota, tres arreglos y luego cada hallazgo con su `before`, su `after` y la regla WCAG o la ley UX que lo respalda. |

Piensa en él como un ESLint para el diseño. ESLint es una herramienta que revisa el estilo del código.
Encuentra poco contraste, un anillo de foco que falta y un ancho fijo que se rompe en el móvil.

Algunos hallazgos tratan del proyecto entero, como "5 familias de fuentes, usa 1 o 2". Cuentan en la nota y no tienen una línea concreta.

Aquí tienes un hallazgo completo, de la misma ejecución sobre la app de prueba:

```text
### [!] Low text contrast on `.hero-subtitle`: 1.03:1
- **Where:** `src/styles.css:14` · selector `.hero-subtitle`
- **Measured:** 1.03:1 (APCA Lc 0) (needs 4.5:1)
- **Why:** Text `#fbfbfb` on `#ffffff` measures 1.03:1 (APCA Lc 0). WCAG 2.2 §1.4.3 requires ≥ 4.5:1 for normal text.
- **Impact:** Users with low vision (and most users in bright light) cannot read this text.
- **Fix:** Change `color` on `.hero-subtitle` from `#fbfbfb` to `#767676` (meets 4.5:1 on `#ffffff`), or darken further.
- **Cites:** WCAG 1.4.3 Contrast (Minimum) (AA)
```

**¿Qué es APCA Lc?** Es una segunda medida de contraste, pensada para seguir cómo vemos de verdad el texto.
Va de 0, sin contraste visible, a unos 106. La herramienta considera Lc 90 bueno para texto normal, y 60 el mínimo para texto grande.
El ratio WCAG sigue decidiendo si pasa o falla. Consulta [docs/science.md](../docs/science.md).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg">
  <img alt="Scorecard: an overall score, per-dimension scores, and located findings" src="https://raw.githubusercontent.com/Aboudjem/ui-ux-suite/main/.github/assets/scorecard-light.svg" width="100%">
</picture>

Los pesos y las reglas de puntuación están en [docs/scoring.md](../docs/scoring.md). Las normas detrás de los hallazgos están en [docs/science.md](../docs/science.md).

## Pruebas

Cada número de esta página sale de un comando. Ejecútalo y compara.

| Afirmación                                                      | Comando que la imprime                              |
| :-------------------------------------------------------------- | :-------------------------------------------------- |
| 397 pruebas pasan, 0 fallan                                     | `npm test`                                          |
| La app de prueba rota saca 3.7 sobre 10, con 46 hallazgos localizados | `npx ui-ux-suite test/fixtures/planted-ux-problems` |
| El servidor MCP expone 16 herramientas                          | `node scripts/gen-tool-reference.js --check`        |
| El repositorio tiene 14 skills                                  | `npx skills add Aboudjem/ui-ux-suite --list`        |
| El paquete no tiene dependencias de ejecución                   | `npm view ui-ux-suite dependencies` no imprime nada |
| El manifiesto del plugin es válido                              | `claude plugin validate . --strict`                 |

La app de prueba sirve para detectar regresiones. Tiene problemas conocidos a propósito, listados en [PLANTED.md](../test/fixtures/planted-ux-problems/PLANTED.md).
Las pruebas fallan si uno de ellos deja de encontrarse con un archivo, una línea y un arreglo.

La CI ejecuta el mismo `npm test` en cada push y pull request, en Node 18 y Node 22.

## Preguntas frecuentes

**¿Es seguro ejecutarlo en mi proyecto?**
Sí. Nunca crea, edita ni borra un archivo fuente. Solo escribe el informe o la baseline cuyo nombre le das.

**¿Mi código sale de mi máquina?**
No. La auditoría no hace llamadas de red, no pide clave de API y no envía telemetría. El modo deep solo abre la URL que le das.

**¿Necesito una app en marcha?**
No. La auditoría por defecto lee archivos fuente. El modo deep es opcional y añade comprobaciones en vivo con Playwright y axe-core.

**¿Arregla mi código por mí?**
No. Imprime cada arreglo como un `before` y un `after`. Tú, o tu agente, lo aplicáis.

**Mi proyecto ya saca mala nota. ¿Puedo usarlo en CI igualmente?**
Sí. Guarda una baseline una vez: un archivo con los hallazgos de hoy. Después el build falla solo ante un hallazgo nuevo o una nota más baja. Los dos comandos están en el paso 3 de arriba.

**¿Qué stacks lee?**
React, Next.js, Vue, Svelte, Angular y HTML simple. Tailwind v3 y v4, CSS Modules, SCSS, styled-components, Emotion y CSS simple.

**¿En qué se diferencia de Lighthouse o axe?**
Esos dos necesitan una página en marcha. Este lee el código fuente, así que puede nombrar el archivo y la línea. Consulta [docs/comparison.md](../docs/comparison.md).

Hay más respuestas en [docs/faq.md](../docs/faq.md).

## Límites

- **Lee código fuente, no píxeles.** Un estilo puesto en tiempo de ejecución por JavaScript no se ve sin el modo deep.
- **Se salta un par de contraste que no puede resolver.** Cuando el fondo es desconocido, no informa nada en vez de adivinar.
- **La nota es una guía, no un certificado.** Una nota alta no prueba la conformidad con WCAG. Una revisión manual sí.
- **Audita, nunca edita.** Aplicar un arreglo es tu paso.
- **Las skills llaman a las herramientas MCP.** Fuera de Claude Code, añade el servidor MCP junto a las skills.
- **El modo deep necesita dos paquetes extra.** Son `playwright-core` y `@axe-core/playwright`. Sin ellos solo obtienes los hallazgos del código fuente.
- **Mira hasta seis carpetas de profundidad.** En un repositorio muy profundo, apúntalo más cerca del código fuente.
- **Necesita Node 18 o más reciente.**

## Saber más

- [docs/cli.md](../docs/cli.md), cada opción, código de salida y receta
- [docs/tools.md](../docs/tools.md), las 16 herramientas MCP y cuándo usar cada una
- [docs/editors.md](../docs/editors.md), instalación y configuración MCP por editor
- [docs/scoring.md](../docs/scoring.md), los 12 pesos y cómo se construye la nota
- [docs/science.md](../docs/science.md), los criterios WCAG y las leyes UX detrás de los hallazgos
- [CHANGELOG.md](../CHANGELOG.md), [CONTRIBUTING.md](../CONTRIBUTING.md), [SECURITY.md](../SECURITY.md), [LICENSE](../LICENSE)

---

<p align="center"><sub>MIT · Creado por <a href="https://github.com/Aboudjem">Adam Boudjemaa</a></sub></p>

<sub>Este documento es una traducción asistida por máquina. Si hay discrepancias, la <a href="../README.md">versión en inglés</a> prevalece.</sub>
