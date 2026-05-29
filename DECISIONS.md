# DECISIONS — ui-ux-suite 10x rebuild

Every major decision with the evidence block (Evidence · Confidence · Risk · Impact · Test plan ·
Rollback). Authored 2026-05-29 by Adam Boudjemaa (`Aboudjem`) on branch `rebuild/uiux-10x`.
Audit artifacts that back these decisions live in [`docs/audit/`](docs/audit/).

---

## D1 — TUNE the engine, REWRITE the finding layer (do NOT full-rewrite)

**Decision.** Keep the parts that compute correct numbers; rewrite only the layer that throws those
numbers away. **Keep:** the extractor regex engines, `color-engine.js` (WCAG/APCA/OKLCH/ΔE math),
`type-engine.js`, `spacing-engine.js`, `knowledge.js` (KB + Laws of UX), the 12-dimension weights,
and the zero-dep MCP/CLI hybrid shell. **Rewrite:** (a) the extractor *output contract* to carry
`{value, file, line, col, selector}` instead of bare values, and (b) the finding-emission layer so
every scorer produces a `createFinding(...)` with a mandatory
`evidence: {file, line, selector, measured, threshold}` plus a concrete `fix`/`before`/`after`.
**Promote** `browser.js` from a siloed sibling to the deep-mode spine (merge axe selectors + touch
sizes into findings; clip + annotate screenshots).

- **Evidence.** `lib/scoring.js` calls `createFinding` **0** times and pushes **73** bare
  `{severity,msg,laws}` objects (`scoring.js:6` import excludes the constructor). `lib/schema.js:63`
  defines the rich `createFinding`, used only by the manual `uiux_audit_log` tool
  (`mcp-server.js:804`). Extractors drop `match.index` (`extractors.js:23-43`); `runner.js:225`
  concatenates all CSS into one blob so file identity dies before scoring. Contrast is hardcoded off
  (`runner.js:335` `contrastIssues:[]`, `:359` `contrastFailures:0`). `runner.js` never imports
  `browser.js`. **Measured RED specificity = 0/12 = 0.0%** on the planted fixture
  (`docs/audit/03-qa-red-baseline.md`).
- **Confidence.** `confirmed` (re-derived from primary source by the Final Integrator,
  `docs/audit/09-SYNTHESIS.md §0`).
- **Risk.** Medium — the extractor contract change ripples through runner → scoring → mcp-server. A
  full rewrite would risk the existing moat (verified laws, color science, 12-dim scope, zero-dep
  reach) to re-solve solved problems; that risk is avoided by tuning.
- **Impact.** This is the structural root cause of the 0% specificity. Fixing it is what moves the
  number — every other improvement depends on it.
- **Test plan.** The planted fixture (`test/fixtures/planted-ux-problems/`) is the regression gate: a
  test asserts every emitted finding carries `evidence.file`, `evidence.line`, and a `fix`, and that
  the specificity score (`detected ∧ located ∧ measured ∧ fixed`) rises from 0/12 toward 12/12.
- **Rollback.** Scorers are pure functions and the new located extractor is added alongside the old
  one — revert per-scorer or restore the legacy extractor export.

## D2 — Architecture stays a HYBRID: plugin engine + thin skill

**Decision.** Keep the hybrid. The **plugin** (zero-dep stdio MCP server + `npx` CLI) is the engine;
a **thin `/design-audit` skill** is the Claude-Code-only orchestration/judgment layer. Agents +
slash commands stay bundled in the same plugin.

**The rule applied (apply the rule, don't memorize the answer):**
> **Compute = plugin. Judgment = skill. Reach = plugin (MCP + npx CLI).**
> Deterministic computation/extraction (contrast math, OKLCH, token extraction, scoring, located
> finding assembly) lives in `lib/` behind an MCP tool / CLI subcommand — it must be byte-identical
> across editors and never model-dependent. Orchestration/judgment (which agents to run, how to rank,
> how to phrase before/after) lives in the skill/agent prompt. Any cross-editor requirement
> (Cursor / VS Code / Codex / Gemini / Windsurf / Continue) **must** be served by the MCP server over
> stdio + the `npx` CLI, because those editors do not load Claude Code skills/agents/commands. A skill
> must never re-implement compute a tool already does.

- **Evidence.** Skill-only is disqualified (skills are Claude-Code-only → cannot reach the 6 other
  editors). Plugin-only is disqualified (non-CC editors can't run in-repo agents/commands; a bare
  tool list gives no opinionated audit-then-suggest workflow). The tool is already a hybrid (1 plugin
  bundling 14 skills + 12 agents + 5 commands + a 16-tool zero-dep MCP server + npx CLI);
  `npm view ui-ux-suite version` → `0.3.0` (npx path live); stdio MCP handshake smoke-tested
  (`docs/audit/00-plugin-skill-evidence.md`).
- **Confidence.** `confirmed`.
- **Risk.** Low — this is the status quo architecture, validated against the spec.
- **Impact.** Preserves first-class reach across all 7 editors with one engine.
- **Test plan.** Multi-editor smoke: MCP `initialize`/`tools/list`/`tools/call` over stdio + `npx
  ui-ux-suite` CLI run, verified for Claude Code + Cursor + one more.
- **Rollback.** N/A (no architecture change).

## D3 — Fix the `claude plugin validate` hard blocker + manifest hygiene

**Decision.** Change `.claude-plugin/marketplace.json` `"source": "."` → `"./"`; migrate
`skills/design-audit/SKILL.md` `trigger:` → the official `when_to_use:` key; delete the legacy root
`manifest.json` (non-standard singular `mcpServer` key).

- **Evidence.** `claude plugin validate .` FAILS today on the `"."` source; a one-char fix made
  validation green in a temp copy (`docs/audit/00-plugin-skill-evidence.md` E1/E2). Reused research
  `aws-cost-audit-skill/docs/research/02-plugin-spec.md`: a single-plugin repo's marketplace entry
  cannot use `"source":"."`.
- **Confidence.** `confirmed`. **Risk.** Low. **Impact.** Unblocks install/validation (SC-SHIP).
- **Test plan.** CI runs `claude plugin validate .` (must exit 0). **Rollback.** Revert the 3 edits.

## D4 — UX-law citation integrity (audit-then-suggest, primary-verified)

**Decision.** (1) Fix the broken slug `von-restorff` → `von-restorff-effect`. (2) Add a canonical
`LAWS_SLUGS` allow-list + a unit test that fails if any emitted `laws:[...]` value is not in it.
(3) Stop tagging accessibility findings with UX laws — cite the **WCAG SC number** (1.4.3, 1.4.11,
2.5.8, 2.4.7, 1.1.1, 3.1.1) instead. (4) Reserve `aesthetic-usability-effect` for one holistic polish
finding, not a per-defect tag. (5) Keep the internal slug key `law-of-pragnanz` but store the
**canonical deep-link URL** `https://lawsofux.com/law-of-pr%C3%A4gnanz/` and display name
"Law of Prägnanz". (6) `fittss-law` (double-s) is **correct** — `lawsofux.com/fittss-law/` is the
real slug — but it is misapplied at the body-text-too-small finding (Fitts's Law is about target
size, not legibility); re-tag that finding.

- **Evidence.** `KNOWLEDGE.laws['von-restorff']` resolves to `undefined` (KB has only
  `von-restorff-effect`). Live fetch 2026-05-29 confirms `lawsofux.com/law-of-pr%C3%A4gnanz/` is the
  canonical page (umlaut, `%C3%A4`-encoded) and `lawsofux.com/fittss-law/` is real
  (`docs/audit/08-ux-law-verification.md`, `06-online-research.md §2`, re-fetched by orchestrator).
- **Confidence.** `confirmed` for the broken slug, the allow-list, and the Prägnanz URL; the
  per-finding re-tagging is `likely` (judgment-based, applied conservatively to the clearest cases).
- **Risk.** Low — slug + URL are one-string changes; the validator prevents regressions.
- **Impact.** SC-LAW: a wrong citation is worse than none (DO-NOT). **Rollback.** One string each;
  allow-list test pins it.

## D5 — Audit-then-suggest is the contract; never mutate during an audit

**Decision.** The audit path is strictly read-only and outputs *suggestions* (`fix`/`before`/`after`).
Applying a fix is a separate, explicit, opt-in operation, gated and reversible (not built in this
pass beyond the read-only contract + a documented boundary). Deep-mode screenshots are taken in a
throwaway browser page, never against the user's source.

- **Evidence.** The mission ("audit first, apply only after, only if asked") + GOAL DO-NOTs.
- **Confidence.** `confirmed`. **Risk.** Low. **Impact.** SC-SAFE.
- **Test plan.** A test asserts an audit run creates/modifies no files under the audited path.
  **Rollback.** N/A (the audit never wrote files; this formalizes it).

## D6 — Source-based findings are the primary, gated deliverable; screenshots are a deep-mode bonus

**Decision.** Because the optional peer deps (`playwright-core`, `@axe-core/playwright`) are not
guaranteed installed and a running URL is often absent, the **static, source-based located+measured+
fixed findings** are the primary deliverable and the regression gate. Real screenshot capture +
annotation is implemented as the deep-mode spine and used when a URL + deps are available; the tool
degrades gracefully to source-based findings otherwise.

- **Evidence.** GOAL: "Capturing the running UI … is strongly preferred where possible; fall back to
  source-based findings when no running URL is given." QA confirmed playwright is absent in this env
  (`docs/audit/03-qa-red-baseline.md` "Deep mode availability").
- **Confidence.** `confirmed`. **Risk.** Low. **Impact.** SC-LOC/MEAS/FIX verifiable without a
  browser; SC-REACH preserved. **Rollback.** N/A.

## D7 — Static contrast is conservative by design: never assume a surface

**Decision.** Flat CSS has no DOM, so a backgroundless element's true surface is sometimes unknowable.
The engine resolves the surface in this order and **skips rather than guesses** when uncertain:
(1) the rule's own opaque background; (2) an inferred ancestor SECTION surface (descendant-combinator
or BEM block root, restricted to container-suffix selectors so decorative children don't lend their
accent color to siblings); (3) the page surface — but only when unambiguous (a project mixing light
and dark page surfaces, e.g. a monorepo, yields "indeterminate"); and for page-fallback findings, only
an **unambiguous** failure is emitted (skip `<1.5:1` near-invisible — implies a missing dark ancestor —
and skip marginal fails within 0.5 of threshold — the true surface may be lighter). A finding with its
own background is always exact and bypasses these guards.

- **Evidence.** Five independent adversarial review rounds (`docs/audit/VERIFICATION*.md`) each found a
  contrast surface-misresolution false-positive class on real third-party repos; each was fixed and
  regression-tested. Measured false-positive counts fell **43→0** (hermes monorepo), **16→0**
  (lissaglow dark sections), **3→0** (lissaglow decorative children) while genuine findings were
  retained (nitya keeps 7; lissaglow keeps ~39 real borderline pairs) and the planted fixture stayed
  12/12.
- **Confidence.** `confirmed` (re-derived from primaries on the exact failing repos).
- **Risk.** The conservative guards skip some genuine borderline page-level findings (rare, low-stakes,
  by definition near-threshold). **Mitigation/Impact:** deep mode (a running URL) measures the real
  rendered surface and removes the ambiguity entirely — the preferred path when available (D6).
- **Test plan.** `test/precision-regression.test.js` pins every found class (alpha, `fg===bg`,
  multi-site pooling, component-scoped vars, dark-section descendants, decorative-child poisoning,
  marginal page-fallback) plus genuine-pair retention. **Rollback.** Each guard is independent.
