'use strict';

/**
 * CLI behaviour tests for bin/ui-ux-suite.js (spawned as a child process).
 *
 * Exit-code contract (from the CLI header):
 *   0 ok · 1 audit error / below --fail-under · 2 path not found · 3 insufficient evidence.
 *
 * Also asserts that with --json, stdout ALONE is valid JSON (the human banner must go to stderr,
 * so `... --json | jq` works), and that --fail-under above the fixture's score exits 1.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'bin', 'ui-ux-suite.js');
const FIXTURE = path.join(__dirname, 'fixtures', 'planted-ux-problems');

function run(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
}

test('missing directory exits 2', () => {
  const missing = path.join(os.tmpdir(), 'uiux-does-not-exist-' + Date.now());
  const r = run([missing]);
  assert.equal(r.status, 2, `expected exit 2, got ${r.status}. stderr: ${r.stderr}`);
  assert.match(r.stderr, /not found/i);
});

test('empty directory exits 3 (insufficient evidence)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-cli-empty-'));
  try {
    const r = run([dir]);
    assert.equal(r.status, 3, `expected exit 3, got ${r.status}. stderr: ${r.stderr}`);
    assert.match(r.stderr, /insufficient evidence/i);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('--json on the fixture: stdout ALONE is valid JSON (banner is on stderr)', () => {
  const r = run([FIXTURE, '--json']);
  assert.equal(r.status, 0, `expected exit 0, got ${r.status}. stderr: ${r.stderr}`);
  // stdout must parse as JSON with NOTHING else mixed in.
  let parsed;
  assert.doesNotThrow(() => { parsed = JSON.parse(r.stdout); }, 'stdout must be valid JSON');
  assert.ok(parsed && parsed.scoreCard, 'parsed JSON should contain a scoreCard');
  assert.equal(parsed.insufficientEvidence, false);
  // The human-readable banner must NOT contaminate stdout.
  assert.doesNotMatch(r.stdout, /ui-ux-suite v/);
  assert.match(r.stderr, /ui-ux-suite v/);
  assert.match(r.stderr, /Scanning:/);
});

test('--fail-under 9 on the fixture exits 1 (score is below 9)', () => {
  const r = run([FIXTURE, '--fail-under', '9']);
  assert.equal(r.status, 1, `expected exit 1, got ${r.status}. stderr: ${r.stderr}`);
  assert.match(r.stderr, /below --fail-under 9/i);
});

test('--version exits 0 and prints a version string', () => {
  const r = run(['--version']);
  assert.equal(r.status, 0);
  assert.match(r.stdout.trim(), /^\d+\.\d+\.\d+/);
});
