#!/usr/bin/env node

/**
 * UI/UX Suite CLI
 * Usage:
 *   npx ui-ux-suite [path]        Audit a project directory
 *   npx ui-ux-suite --mcp         Start as MCP server (for AI editors)
 *   npx ui-ux-suite --version     Show version
 *   npx ui-ux-suite --help        Show help
 */

const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const args = process.argv.slice(2);

// --version
if (args.includes('--version') || args.includes('-v')) {
  console.log(pkg.version);
  process.exit(0);
}

// --help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
ui-ux-suite v${pkg.version}
Design audit tool. Scores projects across 12 dimensions.

Usage:
  npx ui-ux-suite [path]        Audit a project (default: current directory)
  npx ui-ux-suite --mcp         Start as MCP server (for AI editors)
  npx ui-ux-suite --json        Output audit results as JSON
  npx ui-ux-suite --version     Show version
  npx ui-ux-suite --help        Show this help

Examples:
  npx ui-ux-suite                      Audit current directory
  npx ui-ux-suite ~/projects/my-app    Audit a specific project
  npx ui-ux-suite --json               JSON output for scripts

12 Dimensions scored:
  Color System, Typography, Layout & Spacing, Component Quality,
  Accessibility, Visual Hierarchy, Interaction Quality, Responsiveness,
  Visual Polish, Performance UX, Information Architecture, Platform Fit
`);
  process.exit(0);
}

// --mcp
if (args.includes('--mcp')) {
  const { createMcpServer } = require('../lib/mcp-server');
  const server = createMcpServer();
  server.start();
} else {
  // CLI audit mode
  const projectPath = path.resolve(args.find(a => !a.startsWith('-')) || '.');
  const jsonOutput = args.includes('--json');

  if (!fs.existsSync(projectPath)) {
    console.error(`Error: directory not found: ${projectPath}`);
    process.exit(1);
  }

  const { auditProject, formatReport } = require('../lib/runner');

  console.log(`\nui-ux-suite v${pkg.version}`);
  console.log(`Scanning: ${projectPath}\n`);

  try {
    const result = auditProject(projectPath);

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatReport(result));
    }
  } catch (err) {
    console.error('Audit failed:', err.message);
    process.exit(1);
  }
}
