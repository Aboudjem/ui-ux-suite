#!/usr/bin/env node

/**
 * UI/UX Suite CLI
 * Usage:
 *   npx ui-ux-suite [path]            Audit a project directory (static, source-based)
 *   npx ui-ux-suite [path] --json     Machine-readable JSON (banner goes to stderr, so `| jq` works)
 *   npx ui-ux-suite [path] --html out.html   Also write an HTML report with the findings
 *   npx ui-ux-suite [path] --sarif out.sarif Also write SARIF 2.1.0 for GitHub code scanning
 *   npx ui-ux-suite [path] --fail-under 7     Exit non-zero if the overall score is below N (for CI)
 *   npx ui-ux-suite [path] --write-baseline .uiux-baseline.json   Freeze today's findings
 *   npx ui-ux-suite [path] --baseline .uiux-baseline.json --fail-on-regression   Fail on new ones
 *   npx ui-ux-suite [path] --tags wcag2aa --exclude-tags severity:nice-to-have   Narrow the report
 *   npx ui-ux-suite --mcp             Start as MCP server (for AI editors)
 *   npx ui-ux-suite --version | --help
 *
 * Exit codes: 0 ok · 1 audit error / below --fail-under · 2 path not found · 3 insufficient evidence.
 */

const fs = require('fs');
const path = require('path');

const { parseTagList } = require('../lib/tags');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const argv = process.argv.slice(2);

// Flags that consume the next argument. Parsing them in one pass is what keeps a flag value
// (`--sarif out.sarif`) from being mistaken for the project path.
const VALUE_FLAGS = new Set([
  '--html', '--sarif', '--fail-under', '--write-baseline', '--baseline', '--tags', '--exclude-tags',
]);

function parseArgs(list) {
  const opts = { flags: new Set(), values: {}, positional: [], unknownValueFlags: [] };
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (VALUE_FLAGS.has(a)) {
      const v = list[i + 1];
      if (v === undefined || v.startsWith('-')) {
        opts.unknownValueFlags.push(a);
      } else {
        opts.values[a] = v;
        i++;
      }
      continue;
    }
    if (a.startsWith('-')) {
      opts.flags.add(a);
      continue;
    }
    opts.positional.push(a);
  }
  return opts;
}

const opts = parseArgs(argv);
const has = f => opts.flags.has(f);

if (has('--version') || has('-v')) {
  console.log(pkg.version);
  process.exit(0);
}

if (has('--help') || has('-h')) {
  console.log(`
ui-ux-suite v${pkg.version}
Audit a project's UI/UX and get SPECIFIC, located, measured findings with a concrete fix.

Usage:
  npx ui-ux-suite [path]               Audit a project (default: current directory)
  npx ui-ux-suite [path] --json        JSON output (banner -> stderr, so \`| jq\` works)
  npx ui-ux-suite [path] --html FILE   Write an HTML report (dark theme) to FILE
  npx ui-ux-suite [path] --sarif FILE  Write SARIF 2.1.0 to FILE (GitHub code scanning)
  npx ui-ux-suite [path] --fail-under N Exit 1 if overall score < N (CI gate)
  npx ui-ux-suite [path] --write-baseline FILE   Record today's findings, then exit 0
  npx ui-ux-suite [path] --baseline FILE --fail-on-regression
                                       Exit 1 only on a NEW finding or a score drop
  npx ui-ux-suite [path] --tags a,b    Show only findings carrying any of these tags
  npx ui-ux-suite [path] --exclude-tags a,b   Drop findings carrying any of these tags
  npx ui-ux-suite [path] --list-tags   Print every tag this audit produced, then exit
  npx ui-ux-suite --mcp                Start as MCP server (Claude Code, Cursor, VS Code, …)
  npx ui-ux-suite --version | --help

Examples:
  npx ui-ux-suite                      Audit current directory
  npx ui-ux-suite ./src                Audit a folder
  npx ui-ux-suite . --json | jq '.topFindings[0]'
  npx ui-ux-suite . --sarif ui-ux.sarif
  npx ui-ux-suite . --fail-under 7     Fail CI if the design score drops below 7
  npx ui-ux-suite . --write-baseline .uiux-baseline.json
  npx ui-ux-suite . --baseline .uiux-baseline.json --fail-on-regression
  npx ui-ux-suite . --tags wcag2aa,law:fittss-law
  npx ui-ux-suite . --exclude-tags severity:nice-to-have

What you get: per-finding file:line + selector, the measured wrong value, and the exact fix
(before -> after), across 12 dimensions grounded in WCAG 2.2, APCA, and the Laws of UX.
It audits and SUGGESTS. It never edits your files.

Tags are derived from what each finding already cites: dimension:<id>, severity:<level>,
wcag:<criterion>, wcag2a / wcag2aa / wcag2aaa, law:<slug>, nielsen:<n>. Filtering changes
what is reported, never the score, so --fail-under is unaffected.
`);
  process.exit(0);
}

if (has('--mcp')) {
  const { createMcpServer } = require('../lib/mcp-server');
  createMcpServer().start();
} else {
  if (opts.unknownValueFlags.length) {
    console.error(`Error: ${opts.unknownValueFlags[0]} needs a value.`);
    process.exit(1);
  }

  const projectPath = path.resolve(opts.positional[0] || '.');
  const jsonOutput = has('--json');
  const htmlOut = opts.values['--html'] || null;
  const sarifOut = opts.values['--sarif'] || null;
  const failUnderRaw = opts.values['--fail-under'];
  const failUnder = failUnderRaw != null ? parseFloat(failUnderRaw) : null;
  const writeBaselineTo = opts.values['--write-baseline'] || null;
  const baselineFrom = opts.values['--baseline'] || null;
  const failOnRegression = has('--fail-on-regression');
  const tagFilter = {
    include: parseTagList(opts.values['--tags']),
    exclude: parseTagList(opts.values['--exclude-tags']),
  };
  const listTags = has('--list-tags');

  if (failOnRegression && !baselineFrom) {
    console.error('Error: --fail-on-regression needs --baseline FILE.');
    process.exit(1);
  }
  if (baselineFrom && !fs.existsSync(baselineFrom)) {
    console.error(`Error: baseline file not found: ${baselineFrom}`);
    process.exit(1);
  }

  // Banner to stderr so --json stdout stays a clean, pipeable document.
  process.stderr.write(`\nui-ux-suite v${pkg.version}\nScanning: ${projectPath}\n\n`);

  if (!fs.existsSync(projectPath)) {
    console.error(`Error: directory not found: ${projectPath}`);
    process.exit(2);
  }

  const { auditProject, formatReport } = require('../lib/runner');
  const { applyTagFilter, allTags } = require('../lib/tags');

  try {
    const result = auditProject(projectPath);

    if (listTags) {
      process.stdout.write(allTags(result).join('\n') + '\n');
      process.exit(0);
    }

    // Snapshot BEFORE filtering. A baseline is about the whole project, so --tags must not be
    // able to record a partial baseline or hide a regression behind a narrowed report.
    const snapshot = (writeBaselineTo || baselineFrom)
      ? require('../lib/baseline').buildBaseline(result)
      : null;

    // Filtering is a presentation transform applied after scoring, so the score is untouched.
    applyTagFilter(result, tagFilter);

    if (jsonOutput) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else {
      process.stdout.write(formatReport(result) + '\n');
    }

    if (htmlOut) {
      try {
        const { renderHtmlReport } = require('../lib/report-html');
        fs.writeFileSync(htmlOut, renderHtmlReport(result));
        process.stderr.write(`HTML report written to ${htmlOut}\n`);
      } catch (e) {
        process.stderr.write(`(HTML report skipped: ${e.message})\n`);
      }
    }

    if (sarifOut) {
      // Unlike --html, a failed SARIF write is fatal. SARIF is a CI artefact, and a job that
      // asked for one and silently got none is worse than a job that fails loudly.
      try {
        const { renderSarifReport } = require('../lib/report-sarif');
        const sarif = renderSarifReport(result, { version: pkg.version });
        fs.writeFileSync(sarifOut, JSON.stringify(sarif, null, 2) + '\n');
        process.stderr.write(`SARIF report written to ${sarifOut}\n`);
      } catch (e) {
        console.error(`Error: could not write SARIF to ${sarifOut}: ${e.message}`);
        process.exit(1);
      }
    }

    if (writeBaselineTo) {
      fs.writeFileSync(writeBaselineTo, JSON.stringify(snapshot, null, 2) + '\n');
      const n = Object.keys(snapshot.findings).length;
      process.stderr.write(`Baseline written to ${writeBaselineTo} (${n} keys, overall ${snapshot.overall}).\n`);
      process.exit(0);
    }

    if (result.insufficientEvidence) {
      process.stderr.write('Insufficient evidence: no CSS/JSX/HTML found, nothing to audit.\n');
      process.exit(3);
    }
    if (failUnder != null && result.scoreCard.overall != null && result.scoreCard.overall < failUnder) {
      process.stderr.write(`Overall ${result.scoreCard.overall} is below --fail-under ${failUnder}.\n`);
      process.exit(1);
    }

    if (baselineFrom) {
      const { compareBaselines, formatRegression, baselineProblem } = require('../lib/baseline');
      let baseline;
      try {
        baseline = JSON.parse(fs.readFileSync(baselineFrom, 'utf8'));
      } catch (e) {
        console.error(`Error: cannot parse baseline JSON ${baselineFrom}: ${e.message}`);
        process.exit(1);
      }
      const problem = baselineProblem(baseline);
      if (problem) {
        console.error(`Error: ${baselineFrom} is not a usable baseline: ${problem}`);
        process.exit(1);
      }
      // snapshot, not result: the comparison must see the unfiltered audit.
      const comparison = compareBaselines(snapshot, baseline);
      if (comparison.regressed) {
        process.stderr.write(formatRegression(comparison) + '\n');
        if (failOnRegression) process.exit(1);
      } else {
        process.stderr.write(`No regression against ${baselineFrom}.\n`);
      }
    }
  } catch (err) {
    console.error('Audit failed:', err.message);
    process.exit(1);
  }
}
