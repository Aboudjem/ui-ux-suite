# Pitfalls Research — Open Source Launch Mistakes

## P1: Weak README = Dead Project

**Warning signs:** Generic description, no examples, no badges, wall of text
**Prevention:** Lead with visual output example. Show what you get in 3 seconds. Use ASCII art for brand identity. Include quantified claims with citations.
**Phase:** README must be Phase 1 deliverable

## P2: No Proof It Works

**Warning signs:** "Install and run" with no output shown. Developer has to install to find out what it does.
**Prevention:** Include real audit output in README. Show score card, findings, framework detection. Make it tangible before install.
**Phase:** Phase 1 — embed example output in README

## P3: Broken Install Experience

**Warning signs:** Missing dependencies, unclear Node version, build errors, missing files in npm package
**Prevention:** Test `claude plugin add` from clean environment. Test `npx` from clean environment. CI validates both paths.
**Phase:** Phase 2 — CI must validate install paths

## P4: No Community Signals

**Warning signs:** No CONTRIBUTING.md, no issue templates, no CODE_OF_CONDUCT
**Prevention:** Include all standard community files. GitHub "Community Profile" should show 100%.
**Phase:** Phase 3 — community files

## P5: Overpromising in README

**Warning signs:** Claims without evidence. "Best design tool" without proof.
**Prevention:** Every claim backed by specific numbers. "12 dimensions" (verifiable). "19 knowledge documents" (countable). "30+ research findings with confidence levels" (link to evidence-base.md).
**Phase:** Phase 1 — README must be evidence-based

## P6: .gitignore Missing Internal Files

**Warning signs:** Committing .deep-research/, .omc/, .claude-plugin/, .planning/ to OSS repo
**Prevention:** Comprehensive .gitignore BEFORE first public push. These are development artifacts, not part of the plugin.
**Phase:** Phase 1 — .gitignore is first file to write

## P7: No Discoverability Optimization

**Warning signs:** Generic GitHub description, no topics, missing npm keywords
**Prevention:** GitHub topics: claude-code, claude-code-plugin, design-audit, ui-ux, accessibility, design-system, tailwind, css. npm keywords match. Description is compelling.
**Phase:** Phase 4 — repo configuration

## P8: Claiming "Zero Config" But Requiring Setup

**Warning signs:** "Zero config" in README but users need to configure before first use
**Prevention:** The plugin genuinely works with zero config — it auto-detects everything. Verify this claim by testing on a fresh project.
**Phase:** Phase 2 — validation testing
