/**
 * Rule tags and --tags / --exclude-tags.
 *
 * Tags are derived from fields findings already carry, so the tests assert the derivation, the
 * filter semantics, and the two things that make filtering honest: the score never moves, and a
 * match that sat below the top-findings cap becomes visible.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  tagsForFinding,
  parseTagList,
  matchesFilter,
  filterFindings,
  applyTagFilter,
  allTags,
  levelTagForCriterion,
  TOP_FINDINGS_CAP,
} = require('../lib/tags');
const { auditProject } = require('../lib/runner');

const FIXTURE = path.join(__dirname, 'fixtures', 'planted-ux-problems');
const CLI = path.join(__dirname, '..', 'bin', 'ui-ux-suite.js');

function runCli(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
}

test('a WCAG criterion yields both its own tag and a conformance level', () => {
  const tags = tagsForFinding({ dimension: 'accessibility', severity: 'critical', wcag: ['1.4.3'] });
  assert.ok(tags.includes('wcag:1.4.3'));
  assert.ok(tags.includes('wcag2aa'));
  assert.ok(tags.includes('dimension:accessibility'));
  assert.ok(tags.includes('severity:critical'));

  assert.strictEqual(levelTagForCriterion('1.1.1'), 'wcag2a');
  assert.strictEqual(levelTagForCriterion('1.4.3'), 'wcag2aa');
  assert.strictEqual(levelTagForCriterion('2.5.5'), 'wcag2aaa');
});

test('a criterion outside the WCAG_SC table still gets its own tag, with no level', () => {
  assert.strictEqual(levelTagForCriterion('1.4.6'), null);
  const tags = tagsForFinding({ dimension: 'accessibility', severity: 'important', wcag: ['1.4.6'] });
  assert.ok(tags.includes('wcag:1.4.6'));
  assert.ok(!tags.some(t => t.startsWith('wcag2')), 'no level tag for an unknown criterion');
});

test('law slugs are validated, and nielsen numbers become tags', () => {
  const tags = tagsForFinding({
    dimension: 'interaction',
    severity: 'important',
    laws: ['fittss-law', 'not-a-real-law'],
    nielsen: [2, 7],
  });
  assert.ok(tags.includes('law:fittss-law'));
  assert.ok(!tags.includes('law:not-a-real-law'), 'unknown slugs must be dropped');
  assert.ok(tags.includes('nielsen:2'));
  assert.ok(tags.includes('nielsen:7'));
});

test('an aggregate finding takes its dimension from the bucket it sits in', () => {
  const tags = tagsForFinding({ severity: 'suggestion', msg: 'aggregate', laws: ['millers-law'] }, 'polish');
  assert.ok(tags.includes('dimension:polish'));
  assert.ok(tags.includes('law:millers-law'));
});

test('tags are unique and no finding is left untagged', () => {
  const tags = tagsForFinding({ dimension: 'color', severity: 'critical', wcag: ['1.4.3', '1.4.3'] });
  assert.strictEqual(new Set(tags).size, tags.length);
  // 10 of the fixture's findings cite no law, criterion or heuristic. They still get two tags.
  const bare = tagsForFinding({ severity: 'suggestion' }, 'layout');
  assert.deepStrictEqual(bare, ['dimension:layout', 'severity:suggestion']);
  assert.deepStrictEqual(tagsForFinding(null), []);
});

test('parseTagList trims, lowercases and drops empties', () => {
  assert.deepStrictEqual(parseTagList(' WCAG2AA , law:fittss-law ,,'), ['wcag2aa', 'law:fittss-law']);
  assert.deepStrictEqual(parseTagList(''), []);
  assert.deepStrictEqual(parseTagList(undefined), []);
});

test('include matches any tag, and exclude beats include', () => {
  const tags = ['dimension:color', 'severity:critical', 'wcag2aa'];
  assert.strictEqual(matchesFilter(tags, { include: ['wcag2aa'] }), true);
  assert.strictEqual(matchesFilter(tags, { include: ['wcag2aaa'] }), false);
  assert.strictEqual(matchesFilter(tags, { include: ['wcag2aaa', 'wcag2aa'] }), true, 'include is any-of');
  assert.strictEqual(matchesFilter(tags, { exclude: ['severity:critical'] }), false);
  assert.strictEqual(
    matchesFilter(tags, { include: ['wcag2aa'], exclude: ['severity:critical'] }),
    false,
    'exclude must win over include'
  );
  assert.strictEqual(matchesFilter(tags, {}), true, 'no filter keeps everything');
});

test('filterFindings narrows a list without mutating it', () => {
  const findings = [
    { dimension: 'color', severity: 'critical', wcag: ['1.4.3'] },
    { dimension: 'color', severity: 'nice-to-have' },
  ];
  const kept = filterFindings(findings, { include: ['wcag2aa'] });
  assert.strictEqual(kept.length, 1);
  assert.strictEqual(findings.length, 2, 'the source list must be left alone');
});

test('filtering never changes the score or the grade', () => {
  const before = auditProject(FIXTURE);
  const overall = before.scoreCard.overall;
  const grade = before.scoreCard.grade;
  const dimScores = before.scoreCard.dimensions.map(d => d.score);

  const after = applyTagFilter(auditProject(FIXTURE), { include: ['wcag2aa'], exclude: [] });
  assert.strictEqual(after.scoreCard.overall, overall);
  assert.strictEqual(after.scoreCard.grade, grade);
  assert.deepStrictEqual(after.scoreCard.dimensions.map(d => d.score), dimScores);
});

test('filtering covers dimension findings, topFindings and located.findings together', () => {
  const audit = applyTagFilter(auditProject(FIXTURE), { include: ['dimension:accessibility'], exclude: [] });

  for (const dim of audit.scoreCard.dimensions) {
    if (dim.id !== 'accessibility') {
      assert.strictEqual(dim.findings.length, 0, `${dim.id} should have been filtered out`);
    }
  }
  assert.ok(audit.scoreCard.topFindings.length > 0);
  for (const f of audit.scoreCard.topFindings) {
    assert.strictEqual(f.dimension, 'accessibility');
  }
  // located.findings is a separate collection that report-html renders directly.
  for (const f of audit.located.findings) {
    assert.strictEqual(f.dimension, 'accessibility');
  }
});

test('a match below the topFindings cap is promoted, not hidden', () => {
  const unfiltered = auditProject(FIXTURE);
  assert.strictEqual(unfiltered.scoreCard.topFindings.length, TOP_FINDINGS_CAP);
  const visibleBefore = unfiltered.scoreCard.topFindings.filter(f =>
    tagsForFinding(f, f.dimension).includes('nielsen:2')
  );
  assert.strictEqual(visibleBefore.length, 0, 'the nielsen findings start below the cap');

  const filtered = applyTagFilter(auditProject(FIXTURE), { include: ['nielsen:2'], exclude: [] });
  assert.ok(
    filtered.scoreCard.topFindings.length > 0,
    'rebuilding topFindings is what makes a below-cap match visible'
  );
  for (const f of filtered.scoreCard.topFindings) {
    assert.ok(tagsForFinding(f, f.dimension).includes('nielsen:2'));
  }
});

test('an empty filter is a no-op', () => {
  const plain = auditProject(FIXTURE);
  const same = applyTagFilter(auditProject(FIXTURE), { include: [], exclude: [] });
  assert.strictEqual(same.scoreCard.topFindings.length, plain.scoreCard.topFindings.length);
  assert.strictEqual(same.located.findings.length, plain.located.findings.length);
});

test('allTags reports the derived vocabulary of an audit', () => {
  const tags = allTags(auditProject(FIXTURE));
  assert.deepStrictEqual(tags, [...tags].sort(), 'tags must come back sorted');
  assert.ok(tags.includes('dimension:accessibility'));
  assert.ok(tags.includes('severity:critical'));
  assert.ok(tags.includes('wcag2aa'));
  assert.ok(tags.some(t => t.startsWith('law:')));
  assert.ok(tags.includes('nielsen:2'));
});

test('CLI: --tags filters and --exclude-tags wins, with the project path still resolved', () => {
  const all = runCli([FIXTURE, '--json']);
  assert.strictEqual(all.status, 0, all.stderr);
  const allDoc = JSON.parse(all.stdout);

  const only = runCli([FIXTURE, '--tags', 'dimension:accessibility', '--json']);
  assert.strictEqual(only.status, 0, only.stderr);
  const onlyDoc = JSON.parse(only.stdout);
  assert.ok(onlyDoc.scoreCard.topFindings.length < allDoc.scoreCard.topFindings.length);
  assert.strictEqual(onlyDoc.scoreCard.overall, allDoc.scoreCard.overall, 'score must not move');

  const minus = runCli([FIXTURE, '--tags', 'dimension:accessibility', '--exclude-tags', 'severity:critical', '--json']);
  assert.strictEqual(minus.status, 0, minus.stderr);
  const minusDoc = JSON.parse(minus.stdout);
  for (const f of minusDoc.scoreCard.topFindings) {
    assert.notStrictEqual(f.severity, 'critical');
  }
});

test('CLI: a tag value is never mistaken for the project path', () => {
  // With --tags first and no explicit path, an unparsed flag value would become the audit target.
  const run = runCli(['--tags', 'dimension:color', FIXTURE, '--json']);
  assert.strictEqual(run.status, 0, run.stderr);
  assert.match(run.stderr, /planted-ux-problems/, 'the fixture must be the scanned path');
});

test('CLI: --list-tags prints the vocabulary and exits 0', () => {
  const run = runCli([FIXTURE, '--list-tags']);
  assert.strictEqual(run.status, 0, run.stderr);
  const lines = run.stdout.trim().split('\n');
  assert.ok(lines.includes('wcag2aa'));
  assert.ok(lines.includes('nielsen:2'));
});

test('CLI: --fail-under is unaffected by a filter', () => {
  // The fixture scores below 7. Filtering down to one dimension must not rescue it.
  const gated = runCli([FIXTURE, '--tags', 'dimension:color', '--fail-under', '7']);
  assert.strictEqual(gated.status, 1, 'the unfiltered score still gates');
  assert.match(gated.stderr, /is below --fail-under 7/);
});
