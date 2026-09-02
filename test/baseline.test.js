/**
 * Baseline comparison and --fail-on-regression.
 *
 * Proves an unchanged re-audit is clean, a new finding is caught, a dropped score is caught,
 * a resolved finding is never a failure, and the CLI exits 0/1 accordingly.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const {
  buildBaseline,
  compareToBaseline,
  findingKey,
  countByKey,
  formatRegression,
  BASELINE_VERSION,
} = require('../lib/baseline');
const { auditProject } = require('../lib/runner');

const FIXTURE = path.join(__dirname, 'fixtures', 'planted-ux-problems');
const CLI = path.join(__dirname, '..', 'bin', 'ui-ux-suite.js');

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-baseline-'));
}

test('a baseline snapshots the score and a count per finding key', () => {
  const audit = auditProject(FIXTURE);
  const baseline = buildBaseline(audit);

  assert.strictEqual(baseline.version, BASELINE_VERSION);
  assert.strictEqual(baseline.tool, 'ui-ux-suite');
  assert.strictEqual(baseline.overall, audit.scoreCard.overall);

  const keys = Object.keys(baseline.findings);
  assert.ok(keys.length > 0, 'fixture should produce findings');
  assert.deepStrictEqual(keys, [...keys].sort(), 'keys must be written in sorted order');

  const total = keys.reduce((n, k) => n + baseline.findings[k], 0);
  const auditTotal = audit.scoreCard.dimensions.reduce((n, d) => n + (d.findings || []).length, 0);
  assert.strictEqual(total, auditTotal, 'counts must add up to every finding');
});

test('an unchanged re-audit reports no new findings and no score drop', () => {
  const baseline = buildBaseline(auditProject(FIXTURE));
  const comparison = compareToBaseline(auditProject(FIXTURE), baseline);

  assert.deepStrictEqual(comparison.newFindings, []);
  assert.strictEqual(comparison.scoreDropped, false);
  assert.strictEqual(comparison.regressed, false);
  assert.strictEqual(formatRegression(comparison), '');
});

test('one extra finding is reported as exactly one new key', () => {
  const audit = auditProject(FIXTURE);
  const baseline = buildBaseline(audit);

  const worse = auditProject(FIXTURE);
  worse.scoreCard.dimensions[0].findings.push({
    dimension: 'color',
    severity: 'critical',
    title: 'planted regression',
    evidence: { file: 'src/brand-new.css', line: 42 },
  });

  const comparison = compareToBaseline(worse, baseline);
  assert.strictEqual(comparison.newFindings.length, 1);
  assert.strictEqual(comparison.newFindings[0].key, 'color|src/brand-new.css|42');
  assert.strictEqual(comparison.newFindings[0].was, 0);
  assert.strictEqual(comparison.newFindings[0].now, 1);
  assert.strictEqual(comparison.regressed, true);
  assert.match(formatRegression(comparison), /src\/brand-new\.css:42/);
});

test('a second finding on a key that already exists still counts as a regression', () => {
  const audit = auditProject(FIXTURE);
  const baseline = buildBaseline(audit);
  const existingKey = Object.keys(baseline.findings)[0];
  const [dimension, file, line] = existingKey.split('|');

  const worse = auditProject(FIXTURE);
  const bucket = worse.scoreCard.dimensions.find(d => d.id === dimension);
  bucket.findings.push({
    dimension,
    severity: 'important',
    title: 'duplicate on an existing key',
    evidence: file ? { file, line: line ? Number(line) : undefined } : undefined,
  });

  const comparison = compareToBaseline(worse, baseline);
  const hit = comparison.newFindings.find(f => f.key === existingKey);
  assert.ok(hit, `expected ${existingKey} to be reported`);
  assert.strictEqual(hit.now, hit.was + 1);
});

test('a lowered overall score sets scoreDropped, and a raised one does not', () => {
  const baseline = buildBaseline(auditProject(FIXTURE));

  const worse = auditProject(FIXTURE);
  worse.scoreCard.overall = baseline.overall - 0.5;
  const down = compareToBaseline(worse, baseline);
  assert.strictEqual(down.scoreDropped, true);
  assert.strictEqual(down.regressed, true);
  assert.strictEqual(down.before, baseline.overall);
  assert.strictEqual(down.after, baseline.overall - 0.5);

  const better = auditProject(FIXTURE);
  better.scoreCard.overall = baseline.overall + 0.5;
  const up = compareToBaseline(better, baseline);
  assert.strictEqual(up.scoreDropped, false);
  assert.strictEqual(up.regressed, false);
});

test('a resolved finding is reported but is never a failure', () => {
  const audit = auditProject(FIXTURE);
  const baseline = buildBaseline(audit);

  const better = auditProject(FIXTURE);
  better.scoreCard.dimensions[0].findings.pop();

  const comparison = compareToBaseline(better, baseline);
  assert.ok(comparison.resolvedFindings.length > 0, 'removing a finding should show up as resolved');
  assert.deepStrictEqual(comparison.newFindings, []);
  assert.strictEqual(comparison.regressed, false);
});

test('findingKey falls back to the bucket dimension and tolerates missing evidence', () => {
  assert.strictEqual(findingKey({ severity: 'important' }, 'layout'), 'layout||');
  assert.strictEqual(findingKey({ dimension: 'color' }, 'layout'), 'color||');
  assert.strictEqual(
    findingKey({ dimension: 'color', evidence: { file: 'a.css', line: 3 } }, 'layout'),
    'color|a.css|3'
  );
  assert.strictEqual(findingKey({ dimension: 'color', evidence: { file: 'a.css' } }, null), 'color|a.css|');
});

test('countByKey uses the bucket dimension for aggregate findings that carry none', () => {
  const audit = {
    scoreCard: {
      dimensions: [{ id: 'polish', findings: [{ severity: 'suggestion', msg: 'aggregate' }] }],
    },
  };
  // countByKey returns a null-prototype map on purpose, so spread it before comparing.
  assert.deepStrictEqual({ ...countByKey(audit) }, { 'polish||': 1 });
});

test('CLI: --write-baseline writes a file and exits 0 without gating', () => {
  const dir = tmpdir();
  const out = path.join(dir, 'base.json');
  try {
    // --fail-under 10 would normally fail this fixture; writing a baseline is terminal.
    execFileSync(process.execPath, [CLI, FIXTURE, '--write-baseline', out, '--fail-under', '10'], {
      stdio: 'ignore',
    });
    const doc = JSON.parse(fs.readFileSync(out, 'utf8'));
    assert.strictEqual(doc.tool, 'ui-ux-suite');
    assert.ok(Object.keys(doc.findings).length > 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: an unchanged run against its own baseline exits 0 with --fail-on-regression', () => {
  const dir = tmpdir();
  const base = path.join(dir, 'base.json');
  try {
    execFileSync(process.execPath, [CLI, FIXTURE, '--write-baseline', base], { stdio: 'ignore' });
    const run = spawnSync(process.execPath, [CLI, FIXTURE, '--baseline', base, '--fail-on-regression'], {
      encoding: 'utf8',
    });
    assert.strictEqual(run.status, 0, run.stderr);
    assert.match(run.stderr, /No regression against/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: a baseline with a finding removed makes the next run exit 1', () => {
  const dir = tmpdir();
  const base = path.join(dir, 'base.json');
  try {
    const baseline = buildBaseline(auditProject(FIXTURE));
    // Drop one key from the baseline so the real audit looks like it grew a finding.
    const dropped = Object.keys(baseline.findings)[0];
    delete baseline.findings[dropped];
    fs.writeFileSync(base, JSON.stringify(baseline, null, 2));

    const run = spawnSync(process.execPath, [CLI, FIXTURE, '--baseline', base, '--fail-on-regression'], {
      encoding: 'utf8',
    });
    assert.strictEqual(run.status, 1);
    assert.match(run.stderr, /New \w+ finding at/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: without --fail-on-regression a regression is reported but exits 0', () => {
  const dir = tmpdir();
  const base = path.join(dir, 'base.json');
  try {
    const baseline = buildBaseline(auditProject(FIXTURE));
    delete baseline.findings[Object.keys(baseline.findings)[0]];
    fs.writeFileSync(base, JSON.stringify(baseline, null, 2));

    const run = spawnSync(process.execPath, [CLI, FIXTURE, '--baseline', base], { encoding: 'utf8' });
    assert.strictEqual(run.status, 0, run.stderr);
    assert.match(run.stderr, /New \w+ finding at/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: usage errors for a missing baseline file and a bare --fail-on-regression', () => {
  const missing = spawnSync(process.execPath, [CLI, FIXTURE, '--baseline', '/nope/none.json'], {
    encoding: 'utf8',
  });
  assert.strictEqual(missing.status, 1);
  assert.match(missing.stderr, /baseline file not found/);

  const bare = spawnSync(process.execPath, [CLI, FIXTURE, '--fail-on-regression'], { encoding: 'utf8' });
  assert.strictEqual(bare.status, 1);
  assert.match(bare.stderr, /needs --baseline/);
});
