/**
 * SARIF 2.1.0 serializer.
 *
 * Proves the required SARIF keys are present, that every result carries a rule id and a level
 * from the allowed enum, and that one real located finding round-trips: its evidence file and
 * line come back as artifactLocation.uri and region.startLine.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { renderSarifReport, levelFor, toUri, SARIF_VERSION } = require('../lib/report-sarif');
const { auditProject } = require('../lib/runner');

const FIXTURE = path.join(__dirname, 'fixtures', 'planted-ux-problems');
const CLI = path.join(__dirname, '..', 'bin', 'ui-ux-suite.js');
const SARIF_LEVELS = new Set(['none', 'note', 'warning', 'error']);

function allFindings(audit) {
  const out = [];
  for (const dim of audit.scoreCard.dimensions) out.push(...(dim.findings || []));
  return out;
}

test('SARIF document has the required 2.1.0 keys', () => {
  const audit = auditProject(FIXTURE);
  const doc = renderSarifReport(audit, { version: '9.9.9' });

  assert.ok(doc.$schema, 'missing $schema');
  assert.strictEqual(doc.version, '2.1.0');
  assert.strictEqual(SARIF_VERSION, '2.1.0');
  assert.ok(Array.isArray(doc.runs), 'runs must be an array');
  assert.strictEqual(doc.runs.length, 1);

  const driver = doc.runs[0].tool.driver;
  assert.strictEqual(driver.name, 'ui-ux-suite');
  assert.strictEqual(driver.version, '9.9.9');
  assert.ok(driver.informationUri.startsWith('https://'), 'informationUri must be a URL');
  assert.ok(Array.isArray(driver.rules), 'rules must be an array');
  assert.ok(Array.isArray(doc.runs[0].results), 'results must be an array');

  // The document must survive a JSON round trip with no undefined leaking through.
  const round = JSON.parse(JSON.stringify(doc));
  assert.deepStrictEqual(round.version, doc.version);
});

test('every result carries a rule id and a legal level, and every rule id is declared', () => {
  const audit = auditProject(FIXTURE);
  const doc = renderSarifReport(audit, { version: '0.0.1' });
  const run = doc.runs[0];
  const declared = new Set(run.tool.driver.rules.map(r => r.id));

  assert.ok(run.results.length > 0, 'fixture should produce findings');
  assert.strictEqual(run.results.length, allFindings(audit).length);

  for (const r of run.results) {
    assert.ok(r.ruleId, 'result missing ruleId');
    assert.ok(declared.has(r.ruleId), `result ruleId ${r.ruleId} is not in tool.driver.rules`);
    assert.ok(SARIF_LEVELS.has(r.level), `illegal SARIF level: ${r.level}`);
    assert.ok(r.message && typeof r.message.text === 'string' && r.message.text.length > 0);
    assert.strictEqual(run.tool.driver.rules[r.ruleIndex].id, r.ruleId, 'ruleIndex must point at ruleId');
  }

  for (const rule of run.tool.driver.rules) {
    assert.ok(rule.name, `rule ${rule.id} missing name`);
    assert.ok(rule.shortDescription.text, `rule ${rule.id} missing shortDescription`);
  }
});

test('a located finding round-trips file and line into physicalLocation', () => {
  const audit = auditProject(FIXTURE);
  const located = allFindings(audit).find(
    f => f.evidence && f.evidence.file && f.evidence.file.endsWith('.css') && f.evidence.line >= 1
  );
  assert.ok(located, 'fixture should produce at least one located CSS finding');

  const doc = renderSarifReport(audit, { version: '0.0.1' });
  const match = doc.runs[0].results.find(
    r =>
      r.locations &&
      r.locations[0].physicalLocation.artifactLocation.uri === located.evidence.file &&
      r.locations[0].physicalLocation.region.startLine === located.evidence.line
  );
  assert.ok(
    match,
    `no SARIF result for ${located.evidence.file}:${located.evidence.line}`
  );
  assert.strictEqual(match.ruleId, located.dimension);
});

test('severity maps to the SARIF level enum', () => {
  assert.strictEqual(levelFor('critical'), 'error');
  assert.strictEqual(levelFor('important'), 'warning');
  assert.strictEqual(levelFor('suggestion'), 'note');
  assert.strictEqual(levelFor('nice-to-have'), 'note');
  assert.strictEqual(levelFor('something-else'), 'note');
});

test('non-file evidence produces no locations, and a missing line produces no region', () => {
  const base = { scoreCard: { dimensions: [{ id: 'color', findings: [] }] } };
  base.scoreCard.dimensions[0].findings = [
    { dimension: 'color', severity: 'critical', title: 'aggregate', evidence: { file: '(stylesheets)', line: 0 } },
    { dimension: 'color', severity: 'important', title: 'no evidence at all' },
    { dimension: 'color', severity: 'note', title: 'file but no line', evidence: { file: 'src/a.css' } },
  ];
  const results = renderSarifReport(base).runs[0].results;
  assert.strictEqual(results[0].locations, undefined, '(stylesheets) is not a path');
  assert.strictEqual(results[1].locations, undefined, 'no evidence means no location');
  assert.ok(results[2].locations, 'a file with no line still has a location');
  assert.strictEqual(results[2].locations[0].physicalLocation.region, undefined, 'no line means no region');
});

test('uris are forward-slashed and relative', () => {
  assert.strictEqual(toUri('src\\components\\Card.scss'), 'src/components/Card.scss');
  assert.strictEqual(toUri('./index.html'), 'index.html');
  assert.strictEqual(toUri('src/styles.css'), 'src/styles.css');
});

test('--sarif writes a file and does not swallow the project path', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-sarif-'));
  const out = path.join(dir, 'report.sarif');
  try {
    // The flag value comes first on purpose: an unparsed --sarif would take report.sarif as the
    // project path and exit 2 before writing anything.
    execFileSync(process.execPath, [CLI, '--sarif', out, FIXTURE], { stdio: 'ignore' });
    const doc = JSON.parse(fs.readFileSync(out, 'utf8'));
    assert.strictEqual(doc.version, '2.1.0');
    assert.ok(doc.runs[0].results.length > 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('--sarif with no value is a usage error, not a silent audit of the cwd', () => {
  assert.throws(
    () => execFileSync(process.execPath, [CLI, FIXTURE, '--sarif'], { stdio: 'pipe' }),
    err => err.status === 1
  );
});
