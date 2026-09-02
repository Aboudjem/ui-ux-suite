# FAQ

**Is it safe to run on my project?**
Yes. The tool never creates, edits, or deletes a source file in the project you point it at. It
reads and it reports. The only files it writes are the ones you name yourself: the report from
`--html` or `--sarif`, and the baseline from `--write-baseline`. Deep-mode screenshots happen in
a throwaway browser page, never against your source.

**Does my code leave my machine?**
No. All analysis runs locally on Node built-ins. No API keys, no telemetry. The static audit,
which is the default, makes no network call at all. Deep mode drives a local browser to the one
URL you hand it, and nothing else.

**Which frameworks does it support?**
React, Next.js, Vue, Svelte, Angular, and vanilla. For styling: Tailwind v3 and v4 `@theme`,
CSS Modules, SCSS, styled-components, Emotion, vanilla-extract, and plain CSS. It detects the
stack itself, so there is no config file.

**Is it really zero-dependency?**
Yes. The runtime uses only Node built-ins. `playwright-core` and `@axe-core/playwright` are
optional peer dependencies for deep mode only, and the default install pulls neither.

**Do I need a running app?**
No. Source-based findings are the default and the primary deliverable. A running URL plus deep
mode adds live contrast, touch-target measurement and route screenshots on top.

**Does it fix my code automatically?**
No. It audits and it suggests, as a `before` to `after` pair you can read. Applying a fix is a
separate step that you take.

**Can I use it in CI?**
Yes. `npx ui-ux-suite . --fail-under 7` exits 1 when the score drops below your threshold.
`--sarif` writes SARIF 2.1.0 for GitHub code scanning, and `--json` feeds any other pipeline.

**My project already scores badly. Do I have to fix everything before I can gate?**
No. Write a baseline, then gate on regressions only:

```bash
npx ui-ux-suite . --write-baseline .uiux-baseline.json
npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
```

The run fails on a new finding or a score drop, and passes while the existing debt is unchanged.
A finding you resolve is reported and never fails the build.

**Can I run only the accessibility rules?**
Yes, filter by tag. `--tags dimension:accessibility` narrows the report, and
`--exclude-tags severity:nice-to-have` drops the noise. `--list-tags` prints the vocabulary a
given audit produced. Filtering never changes the score.

**Why does the shipped fixture score 3.7?**
Because it is deliberately broken. `test/fixtures/planted-ux-problems` plants known UX problems
with their ground truth in `PLANTED.md`, and the suite asserts that each one is still found with
a file, a line and a fix. It is the regression gate, not a demo of a good project.

**What is the difference between the skills and the MCP server?**
The 14 skills are Markdown instructions your agent reads, so they work in any agent that
supports the Agent Skills format. The MCP server exposes the same engine as 16 callable tools
over stdio, so it works in any MCP client. Installing both is fine, and the plugin does that in
one step for Claude Code.

**Does it work with an editor that is not on your list?**
Probably. The skills install through `npx skills add`, which supports 70+ agents, and the MCP
server speaks plain stdio MCP. See [editors.md](editors.md) for the current table.
