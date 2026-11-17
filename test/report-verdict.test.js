'use strict';

/**
 * The report is read by a tired person, so its order is fixed: the verdict, then the three
 * things to do, then the detail. These tests fail when that order breaks.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { auditProject, formatReport, pickFirstFixes } = require('../lib/runner');

const FIXTURE = path.join(__dirname, 'fixtures', 'planted-ux-problems');
const CLI = path.join(__dirname, '..', 'bin', 'ui-ux-suite.js');

const audit = auditProject(FIXTURE);
const report = formatReport(audit);
const lines = report.split('\n');
const nonEmpty = lines.filter(l => l.trim());

test('line 1 is the verdict: the overall score and its grade', () => {
  assert.equal(lines[0], `# Design audit: ${audit.scoreCard.overall}/10 (${audit.scoreCard.grade})`);
});

test('the verdict sentence sits in the first three non-empty lines and counts the findings', () => {
  const verdict = nonEmpty.slice(0, 3).find(l => l.startsWith('**Verdict:**'));
  assert.ok(verdict, 'a **Verdict:** line must be in the first three non-empty lines');
  assert.ok(verdict.includes(`${audit.located.findings.length} located findings`));
  const critical = audit.located.findings.filter(f => f.severity === 'critical').length;
  assert.ok(critical > 0, 'the fixture plants critical problems');
  assert.ok(verdict.includes(`${critical} critical`));
});

test('"Fix these first" comes right after the verdict with exactly three numbered actions', () => {
  const at = lines.indexOf('## Fix these first');
  assert.ok(at > 0 && at < 6, `"Fix these first" must be near the top, found at line ${at + 1}`);
  const actions = [];
  for (let i = at + 1; i < lines.length && !lines[i].startsWith('**') && !lines[i].startsWith('#'); i++) {
    if (/^\d+\. /.test(lines[i])) actions.push(lines[i]);
  }
  assert.equal(actions.length, 3);
  for (const a of actions) {
    assert.match(a, / at `[^`]+:\d+`\./, 'each action names a file and a line: ' + a);
    assert.match(a, / Fix: \S/, 'each action carries the fix: ' + a);
  }
});

test('the three actions are three different kinds of problem, most severe first', () => {
  const picked = pickFirstFixes(audit.scoreCard.topFindings);
  assert.equal(picked.length, 3);
  const kinds = picked.map(f => String(f.id).replace(/\d+$/, ''));
  assert.equal(new Set(kinds).size, 3, 'kinds must differ: ' + kinds.join(', '));
  assert.equal(picked[0], audit.scoreCard.topFindings[0], 'the top finding is always action 1');
  assert.ok(picked.every(f => f.severity === 'critical'), 'the fixture has three critical kinds');
});

test('pickFirstFixes fills up from the same kind when fewer than three kinds exist', () => {
  const same = [1, 2, 3, 4].map(n => ({ id: 'accessibility-c' + n, severity: 'critical', title: 't' + n }));
  assert.deepEqual(pickFirstFixes(same).map(f => f.id), ['accessibility-c1', 'accessibility-c2', 'accessibility-c3']);
  assert.deepEqual(pickFirstFixes([]), []);
  assert.equal(pickFirstFixes(same.slice(0, 2)).length, 2);
});

test('the detail follows in a fixed order: scores, located findings, then raw measurements', () => {
  const order = ['## Fix these first', '## Score Card', '## Specific findings', '## Project-level observations', '## Project Profile', '## Color System'];
  const at = order.map(h => lines.findIndex(l => l.startsWith(h)));
  at.forEach((n, i) => assert.ok(n >= 0, `missing section ${order[i]}`));
  assert.deepEqual(at, at.slice().sort((a, b) => a - b), 'sections out of order: ' + at.join(', '));
});

test('the score table is a valid 3-column table (the bar must not add a column)', () => {
  const rows = lines.filter(l => /^\| .* \| \d+% \|$/.test(l));
  assert.equal(rows.length, 12);
  for (const r of rows) assert.equal(r.split('|').length, 5, 'row has extra cells: ' + r);
});

test('the report holds no em dash', () => {
  assert.equal(/[\u2014\u2015]/.test(report), false);
});

test('a project with no finding still opens with a verdict and says so', () => {
  const clean = formatReport({
    ...audit,
    located: { findings: [] },
    scoreCard: { ...audit.scoreCard, overall: 9.6, grade: 'Excellent', topFindings: [] },
  });
  assert.match(clean, /^# Design audit: 9\.6\/10 \(Excellent\)/);
  assert.match(clean, /Nothing to fix first/);
  assert.equal(clean.includes('## Fix these first'), false);
});

test('the CLI repeats the verdict on stderr, so it survives `> report.md`', () => {
  const r = spawnSync(process.execPath, [CLI, FIXTURE], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stderr, new RegExp(`Score ${String(audit.scoreCard.overall).replace('.', '\\.')}/10 \\(`));
  assert.match(r.stdout, /^# Design audit: /);
});
