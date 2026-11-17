'use strict';

/**
 * docs/tools.md is generated from the MCP tool definitions. This test fails when a tool is
 * added, renamed or re-described without regenerating it (`npm run docs:tools`).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { TOOLS } = require('../lib/mcp-server');
const { render, OUT } = require('../scripts/gen-tool-reference');

test('docs/tools.md equals a fresh render of the tool definitions', () => {
  assert.equal(fs.readFileSync(OUT, 'utf8'), render(), 'docs/tools.md is out of date. Run: npm run docs:tools');
});

test('every tool has a section and a "use it when" row', () => {
  const doc = fs.readFileSync(OUT, 'utf8');
  for (const t of TOOLS) {
    assert.ok(doc.includes(`### ${t.name}\n`), `no section for ${t.name}`);
    assert.ok(doc.includes(`| [\`${t.name}\`](#${t.name}) | `), `no table row for ${t.name}`);
  }
});

test('the tool count the README states is the real one', () => {
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  const m = readme.match(/(\d+) (?:MCP )?tools/);
  assert.ok(m, 'README should state the tool count');
  assert.equal(Number(m[1]), TOOLS.length);
});

test('server.json, package.json and the plugin manifests carry one version and one package name', () => {
  const root = path.join(__dirname, '..');
  const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
  const pkg = read('package.json');
  const server = read('server.json');
  assert.equal(server.version, pkg.version);
  assert.equal(server.name, pkg.mcpName);
  assert.equal(server.packages.length, 1);
  assert.equal(server.packages[0].registryType, 'npm');
  assert.equal(server.packages[0].identifier, pkg.name);
  assert.equal(server.packages[0].version, pkg.version);
  assert.ok(server.description.length <= 100, 'the registry caps the description at 100 characters');
  for (const f of ['.claude-plugin/plugin.json', '.cursor-plugin/plugin.json', '.copilot-plugin/plugin.json']) {
    assert.equal(read(f).version, pkg.version, f);
  }
});
