# Launch Plan — ui-ux-suite

> Dated June 2026. Supernova Standard Pillar 1.
> Audience: r/ClaudeAI, r/Frontend, design-system / Tailwind X community.
> Primary hook: "ESLint for design — tells you `src/styles.css:14 · 1.03:1` and the exact fix."

---

## The one law

Stars come from **borrowed reach**, not cold author posts. Every breakout in 15 studied repos
rode a third-party submission, an influencer, or an ecosystem event. Engineer the artifact,
get reach to point at it, stack channels in a tight window. Trending and HN are multipliers,
never origins.

---

## Phase 0 — Before launch day (complete now)

- [x] README hero: visceral one-liner ("ESLint for design"), demo GIF, before/after table
- [x] MCP server working (`npx ui-ux-suite --mcp`) — works in Claude Code, Cursor, VS Code,
      Codex, Gemini CLI, Windsurf, Continue
- [x] `examples/` — copy-paste runnable snippets with real output
- [x] `llms.txt` — LLM citeability
- [x] `AGENTS.md` — cross-harness agent context
- [x] 311 tests + regression fixture
- [x] Zero runtime dependencies
- [ ] **Submit to Official MCP Registry** (highest-priority registry):
      ```bash
      npm publish  # already on npm as ui-ux-suite
      npx mcp-publisher init
      npx mcp-publisher login github
      npx mcp-publisher publish
      # namespace: io.github.aboudjem/ui-ux-suite
      ```
      Feeds Cursor `/mcp`, VS Code Extensions, Claude Desktop — passive installs after listing.
- [ ] **Queue awesome-mcp-servers PR** (punkpeye/awesome-mcp-servers or appcypher/awesome-mcp-servers):
      Add to the "Developer Tools" section. Merge on launch day.
- [ ] **Queue hesreallyhim/awesome-claude-code** submission:
      Use the **web-UI issue form only** — PRs auto-close. Fill it out, submit the day before launch.
- [ ] **Smithery listing** (smithery.ai — MCP discovery hub):
      Submit `npx ui-ux-suite --mcp` as the server command. High passive install surface.
- [ ] Prep the origin-story post on dev.to (~600 words, problem-first, with the real 1.03:1 finding)
- [ ] Prep the 2-4 tweet thread (GIF first, finding screenshot second, zero-dep + MCP angle third)
- [ ] Prep the r/ClaudeAI post body (problem-first, not "I built a thing")
- [ ] Prep the r/Frontend and r/webdev post bodies

---

## Phase 1 — Launch day (13:00–16:00 UTC, Tuesday or Wednesday)

Open all channels within ~2 hours. Simultaneity is what crosses the velocity threshold.

### 13:00 UTC — Primary channel (borrowed reach)

**Option A (best):** Ask a design/Claude Code creator with 5k+ followers to tweet the demo GIF.
The nanoGPT fuse: `trekhleb` submitted it, Karpathy didn't cold-tweet it.

**Option B (solo):** Post the tweet thread yourself (GIF first). Tag @AnthropicAI,
@cursor_ai, one Tailwind/shadcn community account.

### 13:15 UTC — r/ClaudeAI

Title: **"I built ESLint for design — tells you the exact file, line, and fix, not 'improve your contrast'"**

Body structure:
1. The problem (2 sentences): design feedback is always generic; no tool tells you `styles.css:14 · 1.03:1`.
2. The real finding (paste the verbatim contrast finding from the fixture).
3. Zero-dep, one command: `npx ui-ux-suite .`
4. Works as an MCP tool in Claude Code, Cursor, VS Code — one-line setup.
5. Link to the repo.

### 13:30 UTC — r/Frontend (or r/webdev)

Same structure, lean harder on the before/after comparison table and the WCAG citation angle.
This audience cares about specificity and standards, less about Claude.

### 13:45 UTC — dev.to origin-story post

Publish the pre-written post. Lower ceiling than Reddit/HN but compounds into Google and newsletter
pickups (Changelog Nightly, TLDR AI). The Understand-Anything breakout started on a personal blog.

### 14:00 UTC — Merge queued awesome-list PRs

Merge the awesome-mcp-servers PR (if approved) and any other awesome-list PRs. This activates
long-tail drip discovery and signals legitimacy to HN voters.

### 14:30 UTC — X/Twitter Tailwind + design-system community

Tag the Tailwind CSS account, shadcn, and one prominent design-system creator. The MCP angle
("works in every editor, one `npx` command") plays well in this community.

---

## Phase 2 — Second wave (2–4 weeks post-launch)

The second wave is where fabric, openclaw, and superpowers all spiked again.

- [ ] Ship v0.6 with 1–2 high-demand features (most-requested from launch-day issues)
- [ ] Publish a follow-up dev.to post: "What we learned from running ui-ux-suite on 50 open-source repos"
- [ ] Court a design/frontend YouTuber (Fireship, Kevin Powell, Theo t3.gg) — send a 3-sentence DM,
      GIF attachment, zero-dep + MCP angle
- [ ] Submit to Changelog Nightly and TLDR AI newsletters (they pick up trending GitHub repos;
      a direct submission note helps)
- [ ] If HN traction appears organically, do NOT submit a cold Show HN — let it ride

---

## MCP registry priority — why it matters

ui-ux-suite ships a first-class MCP server. The highest-leverage discoverability surfaces for
MCP servers are:

1. **Official MCP Registry** (registry.mcpservers.org / mcp-publisher) — feeds Cursor, VS Code,
   Claude Desktop passive install. One `npx mcp-publisher publish` after npm publish.
2. **Smithery** (smithery.ai) — MCP discovery hub with a web UI. Manual submission, high traffic.
3. **awesome-mcp-servers** (punkpeye or appcypher) — long-tail drip, but signals legitimacy.
4. **glama.ai/mcp/servers** — another growing MCP directory.

None of these require a running URL or a separate deploy. The server is `npx ui-ux-suite --mcp`
over stdio — submit that command string everywhere.

---

## What NOT to do

- **No cold Show HN** from the author account. In 15 studied repos, 0 breakouts came from a cold
  author Show HN. Engineer borrowed reach instead.
- **No Product Hunt on day 1.** PH is a secondary amplifier, not a launch origin. Use it in week 2.
- **No star-buying.** Organic = single-to-low-double-digit star:fork ratio. Bought = 50–100:1 with
  near-zero forks. Platforms detect and suppress it.
- **No `hesreallyhim/awesome-claude-code` PR.** PRs auto-close. Use the web-UI issue form only.

---

## Success metrics (30-day)

| Metric | Target |
|:-------|:------:|
| GitHub stars | 200+ |
| npm weekly downloads | 500+ |
| MCP Registry listing | published |
| awesome-claude-code listing | accepted |
| Smithery listing | published |
