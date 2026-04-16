# Domain Pitfalls: Open Source Developer Tool Launch

**Domain:** OSS developer tool (Claude Code plugin) launch for mass adoption
**Researched:** 2026-04-16
**Overall confidence:** HIGH (multiple sources, verified against real plugin ecosystem issues)

---

## Critical Pitfalls

Mistakes that kill adoption, cause mass uninstalls, or permanently damage repo perception.

### Pitfall 1: Installation Friction Beyond 5 Minutes

**What goes wrong:** Developer finds the repo, reads the README, tries to install, hits friction (unclear instructions, multi-step setup, missing prerequisites), abandons within 5 minutes and never returns.

**Why it happens:** Maintainers know their own tool intimately and skip "obvious" steps. They test install on machines that already have prerequisites. They assume users will read past the first code block.

**Consequences:** 34.7% of developers abandon tools if setup is difficult (survey of 202 OSS developers). 73% expect hands-on experience within 5 minutes. Early adopters -- the ones who spread word-of-mouth -- are the MOST sensitive to setup friction (40.6% abandonment rate).

**Warning signs:**
- Install instructions have more than 3 steps
- README says "first, make sure you have..." before the install command
- No one outside the team has tested install from scratch

**Prevention:**
- Installation must be ONE command: `claude plugin add github.com/Aboudjem/ui-ux-suite`
- Test installation on a clean machine (no prior state, no assumptions)
- First working output within 60 seconds of install
- Include a "Quick Start" section BEFORE any architecture explanation
- Test with someone who has never seen the project

**Detection:** Ask 3 developers to install from scratch. Time them. If anyone takes >5 minutes or asks a question, the install flow is broken.

**Phase:** Phase 1 (README/Documentation) -- this is the single highest-priority item.

---

### Pitfall 2: Plugin Manifest Validation Failures

**What goes wrong:** Users run `claude plugin add`, get a cryptic validation error, assume the plugin is broken, leave. Silent failures are worse -- the plugin "installs" but skills/agents don't load.

**Why it happens:** Claude Code's plugin validator has strict, underdocumented rules that differ from what examples suggest:
- `agents` field REJECTS directory paths -- must be explicit file paths to each `.md` file
- All component fields (`agents`, `commands`, `skills`) must be arrays, never strings
- `version` field is mandatory even though some examples omit it
- Adding `"hooks"` to plugin.json causes duplicate declaration errors (hooks/hooks.json auto-loads since v2.1+)
- Unrecognized keys (like `category`, `source`, `strict`) cause validation rejection

**Current state:** The plugin.json currently has NO component declarations -- no agents, skills, or commands arrays. This means the plugin installs as an empty shell.

**Warning signs:**
- plugin.json has no `agents`, `skills`, or `commands` arrays
- Any component field uses directory paths instead of explicit file paths
- plugin.json contains non-standard keys
- No CI step validates the manifest

**Prevention:**
- List every agent file explicitly: `"agents": ["./agents/design-auditor.md", "./agents/color-analyst.md", ...]`
- List every skill file explicitly -- no directory shorthand
- Do NOT declare hooks in plugin.json -- let convention loading handle it
- Strip any non-standard keys from plugin.json
- Run `claude plugin validate` (or equivalent) in CI before every release
- Add all 12 agents, 14 skills, and commands to the manifest immediately

**Detection:** CI step that validates manifest. Test `claude plugin add` from the GitHub URL on every PR.

**Phase:** Phase 1 (Package Configuration) -- blocking for all other work.

---

### Pitfall 3: No .gitignore File (Currently Missing)

**What goes wrong:** Internal files, OS artifacts (.DS_Store), editor configs, research notes, deep-research runs, and planning files get committed and published. The repo looks unprofessional. Worse: if npm publish is used, sensitive files or massive data bloats the package.

**Why it happens:** Project started as a personal workspace, not an open-source distribution. The `.deep-research/`, `.omc/`, `.planning/` directories are currently unignored and visible in git status.

**Warning signs:**
- `git status` shows `.deep-research/`, `.omc/`, `.planning/` as untracked
- `npm pack --dry-run` shows files that shouldn't be in the package
- .DS_Store files appear in the repo

**Consequences:**
- npm publish without .npmignore or `files` field publishes EVERYTHING (including `.deep-research/` with potentially 100+ MB of run data)
- .DS_Store and editor files signal "hobby project, not production tool"
- Internal planning documents leak implementation details and strategy

**Prevention:**
- Create .gitignore immediately with: node_modules, .DS_Store, *.log, .env, .deep-research/, .omc/, .planning/, coverage/, dist/
- Use `"files"` field in package.json as a whitelist (safer than .npmignore blacklist)
- Run `npm pack --dry-run` before every publish to verify contents
- NEVER use .npmignore (it replaces .gitignore entirely -- a known npm trap where adding .npmignore causes .gitignore exclusions to stop working for npm publish)

**Detection:** `npm pack --dry-run` output check. If it lists deep-research, omc, planning, or DS_Store, the publish is leaking files.

**Phase:** Phase 1 (Repo Hygiene) -- must be the literal first commit of the OSS prep milestone.

---

### Pitfall 4: README That Explains Instead of Demonstrates

**What goes wrong:** README opens with architecture explanation, agent taxonomy, or feature list. Developer scans for 5 seconds, doesn't see what the tool DOES, leaves. Never stars.

**Why it happens:** Maintainers are proud of the architecture (12 agents! 14 skills! 19 knowledge docs!) and lead with implementation details. This is exactly backwards from what developers want.

**Warning signs:**
- README's first paragraph describes architecture, not user value
- No screenshot or terminal output visible without scrolling
- Feature list appears before install instructions
- README is >300 lines long

**Consequences:** Developers decide within seconds whether to star based on clarity and visual proof. A README without screenshots, demo output, or quick-start commands gets scrolled past. 34.2% cite good documentation as the primary trust signal.

**Prevention:**
- First 50 words must answer: What is it? Why should I care? How do I use it?
- Show a REAL audit output screenshot or formatted terminal output within the first scroll
- "Install in one command" + "Run your first audit" in 3 copy-paste steps BEFORE any feature list
- Feature tables (scannable) instead of feature paragraphs (walls of text)
- Follow the sniff reference pattern: ASCII art banner, badges, one-liner description, install, example, then details
- Architecture/agent details go in a separate ARCHITECTURE.md or docs/ folder, NOT the README

**Detection:** Show README to a developer for 10 seconds, then hide it. Ask: "What does this tool do? How do you install it?" If they can't answer both, the README fails.

**Phase:** Phase 1 (README) -- the single most visible artifact of the project.

---

### Pitfall 5: Appearing Unmaintained on Day One

**What goes wrong:** Repo launches with: no CI badges, no recent commit activity visible, no issue templates, no response SLA signaling. Developers assume the tool will be abandoned.

**Why it happens:** Focus goes entirely to code quality, not repo presentation. GitHub's default repo page shows commit frequency, open issues, and contributor count -- all of which read "dead project" for a brand-new repo with one contributor and no CI.

**Warning signs:**
- No GitHub Actions workflow in `.github/workflows/`
- No badges in README
- No issue templates in `.github/ISSUE_TEMPLATE/`
- No CONTRIBUTING.md
- GitHub Community Profile score below 100%

**Consequences:** 37% of developers cite "appears unmaintained" as a reason to abandon a tool, even if the code is excellent. 26.2% specifically list it as a deal-breaker. No CI badge = "does this even work?"

**Prevention:**
- GitHub Actions CI running on every push (even if it just validates manifest + runs smoke test)
- Green CI badge in README header
- Issue templates: Bug Report, Feature Request, Question
- CONTRIBUTING.md with clear "how to contribute" steps
- At least weekly commits during launch period (even documentation improvements)
- Pin a "Roadmap" issue or Discussion to show active development
- Add GitHub topics: `claude-code`, `design`, `ui-ux`, `accessibility`, `developer-tools`

**Detection:** Visit the repo as a stranger. Does it look alive? Is there a green badge? Can you tell when the last commit was?

**Phase:** Phase 2 (CI/Community Infrastructure) -- must be live before any public promotion.

---

## Moderate Pitfalls

### Pitfall 6: package.json Missing Critical Fields for npm

**What goes wrong:** Package publishes to npm but is undiscoverable, installs incorrectly, or breaks in unexpected environments.

**Current state issues:**
- No `"files"` field (publishes everything including research data)
- No `"engines"` field (no Node.js version requirement communicated)
- No `"repository"` field (npm page won't link to GitHub)
- No `"homepage"` field (no docs link on npm)
- No `"bin"` field if CLI usage is intended
- `"main"` points to `lib/mcp-server.js` but no `"exports"` field for modern resolution

**Warning signs:**
- `npm pack --dry-run` shows unexpected files
- npm page has no GitHub link
- Users report "engines" incompatibility errors

**Prevention:**
- Add `"files": ["lib/", "agents/", "skills/", "commands/", "knowledge/", "templates/", ".claude-plugin/", "manifest.json"]`
- Add `"engines": { "node": ">=18.0.0" }`
- Add `"repository"`, `"homepage"`, `"bugs"` fields
- Add `"exports"` field alongside `"main"` for modern Node.js
- Run `npm pack --dry-run` to verify package contents before every publish

**Phase:** Phase 1 (Package Configuration).

---

### Pitfall 7: Launching Without Example Output

**What goes wrong:** Developer installs the tool, doesn't know what to expect, runs it on their project, gets output they can't interpret, assumes the tool is broken or useless.

**Why it happens:** Maintainers know what good output looks like. New users don't. Without a reference "here's what a great audit looks like," users can't distinguish normal operation from errors.

**Warning signs:**
- No `examples/` directory in the repo
- README has no output screenshot or formatted example
- No demo project for users to test against

**Prevention:**
- Include an `examples/` directory with sample audit output (both terminal and structured)
- README shows a real before/after: "Here's a project scoring 4.2/10, here are the top 3 fixes"
- Consider a demo project in `examples/demo-project/` that users can audit immediately after install
- Annotate the example output: "This section shows X, this number means Y"

**Phase:** Phase 1 (Documentation/Examples) -- required before README is finalized.

---

### Pitfall 8: npm Name Squatting / Conflict

**What goes wrong:** You try to `npm publish` and the name `ui-ux-suite` is taken, or it's too generic and gets lost in search results.

**Warning signs:**
- Haven't run `npm view ui-ux-suite` to check availability
- Name is generic enough to conflict with existing packages
- Name doesn't hint at Claude Code / design intelligence

**Prevention:**
- Check `npm view ui-ux-suite` before committing to the name
- Consider a scoped package: `@aboudjem/ui-ux-suite` or a more distinctive name
- The name should be memorable, searchable, and hint at what it does
- The sniff reference project succeeded partly because of a distinctive, short name

**Phase:** Phase 1 (Package Configuration) -- must verify before any public mention of the package name.

---

### Pitfall 9: Promotion Without Community Pre-work

**What goes wrong:** You post on Hacker News / Reddit / Twitter on launch day with zero prior community engagement. The post gets 3 upvotes and dies. Or worse, it gets flagged as self-promotion on HN.

**Why it happens:** Teams treat launch as a single event instead of a campaign. Hacker News and Reddit communities reward authentic, long-term participation -- not drive-by product drops.

**Warning signs:**
- No Reddit/HN comment history in relevant communities
- Launch post leads with product features instead of technical insight
- No one outside the core team knows the project exists before launch day

**Consequences:** One failed HN launch poisons the well. You can't re-post the same project for months. The critical first-wave adopters never see it. 70% of developers discover tools through social/community channels.

**Prevention:**
- Start engaging in relevant communities 4-6 weeks before launch (r/webdev, r/frontend, HN discussions about design tooling)
- Share genuine insights about design scoring, accessibility, color theory BEFORE promoting the tool
- Launch on HN Tuesday-Thursday, 8-10 AM PT
- Lead with the technical problem ("We built an OKLCH color science engine that catches contrast failures ESLint misses") not the product ("Check out our new tool!")
- Have 5-10 people ready to provide authentic first feedback on launch day

**Phase:** Phase 3 (Launch/Promotion) -- community engagement should START during Phase 2.

---

### Pitfall 10: No Credibility / Trust Signals

**What goes wrong:** Developer sees the tool, thinks "cool concept," but has no reason to believe the audit results are accurate or the scores meaningful. They don't install because there's no credibility signal.

**Why it happens:** The project has deep research backing (30+ quantified findings, WCAG/APCA compliance, real color science) but none of this is surfaced to the prospective user.

**Warning signs:**
- README makes claims without citing standards or methodology
- No mention of WCAG, APCA, or other recognized standards
- Scoring feels arbitrary -- no explanation of how numbers are derived
- No link to methodology documentation

**Prevention:**
- README must cite the evidence base: "Scores based on WCAG 2.1 AA/AAA, APCA contrast, OKLCH color science"
- Link to a METHODOLOGY.md explaining the scoring approach
- Show specific, verifiable numbers: "Detects WCAG 2.1 contrast violations per SC 1.4.3 and 1.4.6"
- Mention standards compliance prominently -- this is the differentiator vs. generic linters
- Evidence-based claims: "19 knowledge documents sourced from W3C specifications and 2024-2026 design research"

**Phase:** Phase 1 (README) -- trust signals must be visible on first page load.

---

## Minor Pitfalls

### Pitfall 11: LICENSE File Not at Repo Root

**What goes wrong:** GitHub doesn't detect the license. The repo page shows "No license" which signals "don't use this in production" to enterprise developers and legally cautious teams.

**Warning signs:** No `LICENSE` file at repo root (currently the case -- MIT is declared in package.json but file may not exist).

**Prevention:** Ensure `LICENSE` (not `LICENSE.md`, not in a subdirectory) exists at repo root with full MIT text. GitHub auto-detects this placement.

**Phase:** Phase 1 (Repo Hygiene).

---

### Pitfall 12: Badges That Link Nowhere

**What goes wrong:** README has npm badge but package isn't published yet. CI badge but Actions aren't set up. Stars badge shows "0" on launch day.

**Warning signs:** Badges added during README writing before the underlying systems are live.

**Prevention:**
- Only add badges for things that are LIVE and working
- npm badge only after first successful publish
- CI badge only after Actions are green
- Don't add a stars badge until organic growth starts (showing "2 stars" is worse than no badge)

**Phase:** Phase 2 (CI/Polish) -- badges are added as capabilities go live, not before.

---

### Pitfall 13: Monolithic README with Internal Documentation

**What goes wrong:** README grows to 500+ lines trying to document every agent, skill, and knowledge base entry. Developers see the scrollbar and bounce.

**Warning signs:** README exceeds 200 lines. Contains agent prompt details. Lists all 19 knowledge documents inline.

**Prevention:**
- README: max 150-200 lines. What, Why, Install, Quick Start, Feature Overview (table), Contributing, License.
- Detailed docs in `docs/` directory: AGENTS.md, SKILLS.md, ARCHITECTURE.md, METHODOLOGY.md
- Link from README to detailed docs, not inline
- The 12 agents and 14 skills are a FEATURE to mention in one line, not 12 sections to expand

**Phase:** Phase 1 (Documentation structure).

---

### Pitfall 14: No Semantic Versioning Strategy

**What goes wrong:** Breaking changes ship in patch versions. Users' setups break. Trust erodes. Or: version stays at 0.1.0 forever, signaling "not ready for use."

**Warning signs:** No CHANGELOG.md. No versioning policy documented. Version hasn't changed since initial commit.

**Prevention:**
- Start at 0.1.0 (current) -- this is correct for pre-1.0
- Document the versioning policy in CONTRIBUTING.md
- Use `npm version patch|minor|major` workflow
- 1.0.0 = "stable API, safe to depend on" -- declare this milestone publicly
- Create CHANGELOG.md from day one (even if short)

**Phase:** Phase 2 (Release Process).

---

### Pitfall 15: Overpromising in README Claims

**What goes wrong:** README says "complete design system audit" but the tool only checks CSS files. Or claims "works with any project" but fails on Vue or Angular. Developer feels deceived, leaves a negative review or issue.

**Warning signs:** Superlatives without qualifiers. Claims not tested against edge cases. "Any project" without specifying which file types are actually scanned.

**Prevention:**
- Every claim must be verifiable: "12 dimensions" (list them), "19 knowledge documents" (countable), "supports React, Vue, Svelte, Angular, vanilla CSS/Tailwind" (tested)
- Be honest about limitations: "Tailwind v4 detection is experimental" is better than silence
- Test every claim in the README against reality before publishing
- "Works with" means someone actually tested it with that framework

**Phase:** Phase 1 (README) -- review all claims before publish.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Repo Hygiene (Phase 1) | Missing .gitignore leaks internal files | Create .gitignore as literal first action |
| Plugin Manifest (Phase 1) | Silent validation failures lose users on install | Explicit file paths, CI validation, test install from GitHub URL |
| Package.json (Phase 1) | npm publish includes 100MB+ of research data | Use `"files"` whitelist, run `npm pack --dry-run` |
| README (Phase 1) | Architecture-first README loses 90% of visitors in 5 seconds | Demo output first, install second, architecture in docs/ |
| Examples (Phase 1) | No reference output makes tool feel opaque | Include annotated example audit in examples/ |
| npm Name (Phase 1) | Name taken or too generic | Verify with `npm view` before any public reference |
| CI/Badges (Phase 2) | No green badge = "does this even work?" | GitHub Actions smoke test before promotion |
| Community Signals (Phase 2) | Empty repo signals = abandoned project | Issue templates, CONTRIBUTING.md, pinned roadmap |
| Release Process (Phase 2) | No versioning strategy causes trust issues | CHANGELOG.md + semver policy from day one |
| Promotion (Phase 3) | Cold launch on HN/Reddit dies immediately | 4-6 weeks of community participation before launch |
| Ongoing (Post-launch) | No response to issues kills trust in first month | Commit to 48-hour first-response SLA for issues |

---

## Sources

- [What 202 Open Source Developers Taught Us About Tool Adoption](https://www.catchyagency.com/post/what-202-open-source-developers-taught-us-about-tool-adoption) -- PRIMARY: quantified adoption/abandonment statistics (HIGH confidence)
- [GitHub README Template: 2026 Guide to Get More Stars](https://dev.to/iris1031/github-readme-template-the-complete-2026-guide-to-get-more-stars-3ck2) -- README anti-patterns (MEDIUM confidence)
- [Claude Code Plugin Schema Notes](https://github.com/affaan-m/everything-claude-code/blob/main/.claude-plugin/PLUGIN_SCHEMA_NOTES.md) -- manifest validation gotchas (HIGH confidence, verified against issues)
- [Silent Skill Loading Failure - Claude Code Issue #20409](https://github.com/anthropics/claude-code/issues/20409) -- silent plugin failures (HIGH confidence)
- [Plugin Manifest Rejects Unrecognized Keys - Issue #31384](https://github.com/anthropics/claude-code/issues/31384) -- validation strictness (HIGH confidence)
- [Official Marketplace Plugins Fail Validation - Issue #26555](https://github.com/anthropics/claude-code/issues/26555) -- even official plugins hit this (HIGH confidence)
- [npm Blog: Publishing What You Mean to Publish](https://blog.npmjs.org/post/165769683050/publishing-what-you-mean-to-publish.html) -- .npmignore trap (HIGH confidence, official npm)
- [Avoid Publishing Secrets to npm Registry](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/avoid_publishing_secrets.md) -- npm security (HIGH confidence)
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) -- official plugin docs (HIGH confidence)
- [Lessons Launching a Developer Tool on HN vs Product Hunt](https://medium.com/@baristaGeek/lessons-launching-a-developer-tool-on-hacker-news-vs-product-hunt-and-other-channels-27be8784338b) -- promotion strategy (MEDIUM confidence)
- [GitHub Stars Guide: Evaluating Open Source in 2026](https://blog.tooljet.com/github-stars-guide/) -- star signals (MEDIUM confidence)
- [Open Source Launch Checklist 2026](https://launchtry.com/resources/launch-checklist/open-source) -- launch process (MEDIUM confidence)
