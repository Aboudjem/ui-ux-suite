#!/usr/bin/env node

/**
 * UI/UX Suite CLI
 * Usage:
 *   npx ui-ux-suite [path]            Audit a project directory (static, source-based)
 *   npx ui-ux-suite [path] --json     Machine-readable JSON (banner goes to stderr, so `| jq` works)
 *   npx ui-ux-suite [path] --html out.html   Also write an HTML report with the findings
 *   npx ui-ux-suite [path] --fail-under 7     Exit non-zero if the overall score is below N (for CI)
 *   npx ui-ux-suite --mcp             Start as MCP server (for AI editors)
 *   npx ui-ux-suite --version | --help
 *
 * Exit codes: 0 ok · 1 audit error / below --fail-under · 2 path not found · 3 insufficient evidence.
 */

const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const args = process.argv.slice(2);

function flagValue(name) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('-') ? args[i + 1] : null;
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(pkg.version);
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
ui-ux-suite v${pkg.version}
Audit a project's UI/UX and get SPECIFIC, located, measured findings with a concrete fix.

Usage:
  npx ui-ux-suite [path]               Audit a project (default: current directory)
  npx ui-ux-suite [path] --json        JSON output (banner -> stderr, so \`| jq\` works)
  npx ui-ux-suite [path] --html FILE   Write an HTML report (dark theme) to FILE
  npx ui-ux-suite [path] --fail-under N Exit 1 if overall score < N (CI gate)
  npx ui-ux-suite --mcp                Start as MCP server (Claude Code, Cursor, VS Code, …)
  npx ui-ux-suite --version | --help

Examples:
  npx ui-ux-suite                      Audit current directory
  npx ui-ux-suite ./src                Audit a folder
  npx ui-ux-suite . --json | jq '.topFindings[0]'
  npx ui-ux-suite . --fail-under 7     Fail CI if the design score drops below 7

What you get: per-finding file:line + selector, the measured wrong value, and the exact fix
(before -> after), across 12 dimensions grounded in WCAG 2.2, APCA, and the Laws of UX.
It audits and SUGGESTS — it never edits your files.
`);
  process.exit(0);
}

if (args.includes('--mcp')) {
  const { createMcpServer } = require('../lib/mcp-server');
  createMcpServer().start();
} else {
  const projectPath = path.resolve(args.find(a => !a.startsWith('-') && a !== flagValue('--html') && a !== flagValue('--fail-under')) || '.');
  const jsonOutput = args.includes('--json');
  const htmlOut = flagValue('--html');
  const failUnderRaw = flagValue('--fail-under');
  const failUnder = failUnderRaw != null ? parseFloat(failUnderRaw) : null;

  // Banner to stderr so --json stdout stays a clean, pipeable document.
  process.stderr.write(`\nui-ux-suite v${pkg.version}\nScanning: ${projectPath}\n\n`);

  if (!fs.existsSync(projectPath)) {
    console.error(`Error: directory not found: ${projectPath}`);
    process.exit(2);
  }

  const { auditProject, formatReport } = require('../lib/runner');

  try {
    const result = auditProject(projectPath);

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

    if (result.insufficientEvidence) {
      process.stderr.write('Insufficient evidence: no CSS/JSX/HTML found — nothing to audit.\n');
      process.exit(3);
    }
    if (failUnder != null && result.scoreCard.overall != null && result.scoreCard.overall < failUnder) {
      process.stderr.write(`Overall ${result.scoreCard.overall} is below --fail-under ${failUnder}.\n`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Audit failed:', err.message);
    process.exit(1);
  }
}
