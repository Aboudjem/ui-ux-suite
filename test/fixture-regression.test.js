'use strict';

/**
 * THE REGRESSION GATE.
 *
 * The planted fixture (test/fixtures/planted-ux-problems, ground truth in PLANTED.md) has 12
 * deliberately broken UX problems: A, B, C, D, E-alt, E-label, F, G, H, I-colors, I-fonts, J.
 * The RED baseline detected 0/12. This test re-derives the specificity score: for each planted id
 * it asserts that AT LEAST ONE located finding matches it AND that the matching finding is
 * located (evidence.file + non-null evidence.line) + measured (evidence.measured) + fixed
 * (non-empty fix). It then asserts the score is exactly 12/12 and FAILS LOUDLY below 12.
 *
 * It also asserts that an empty directory yields insufficientEvidence:true and overall:null.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { runLocatedAudit } = require('../lib/located-audit');
const { auditProject } = require('../lib/runner');

const FIXTURE = path.join(__dirname, 'fixtures', 'planted-ux-problems');

/**
 * Each matcher returns the first located finding that proves the planted problem was detected
 * specifically + located + measured + fixed. We assert those four qualities centrally below, so
 * here we only encode "which finding is THE one for this planted id".
 */
const PLANTED_MATCHERS = {
  // A — near-white text on near-white bg (.hero-subtitle #fbfbfb on #ffffff = 1.03:1)
  A: (f) =>
    f.dimension === 'accessibility' &&
    /hero-subtitle/.test(f.title) &&
    /1\.03/.test(f.title) &&
    f.evidence && f.evidence.file === 'src/styles.css',

  // B — buried/low-affordance primary CTA. Two signals exist (low contrast on .cta-primary AND
  // the generic "continue" CTA copy). We accept the located low-contrast .cta-primary finding.
  B: (f) =>
    f.dimension === 'accessibility' &&
    /cta-primary/.test(f.title) &&
    /2\.64/.test(f.title) &&
    f.evidence && f.evidence.selector === '.cta-primary',

  // C — low-contrast section with an invisible boundary (.section-muted bg 1.09:1 vs page)
  C: (f) =>
    f.dimension === 'hierarchy' &&
    /Invisible surface boundary/.test(f.title) &&
    /section-muted/.test(f.title),

  // D — tiny touch targets (.icon-btn 28x28 / .nav-link 32px tall)
  D: (f) =>
    f.dimension === 'platform' &&
    /Touch target too small/.test(f.title) &&
    f.evidence && /(icon-btn|nav-link)/.test(f.evidence.selector || ''),

  // E-alt — <img> missing alt
  'E-alt': (f) =>
    f.dimension === 'accessibility' &&
    f.evidence && f.evidence.selector === '<img>' &&
    /missing `alt`/.test(f.title),

  // E-label — form input with no programmatic label
  'E-label': (f) =>
    f.dimension === 'accessibility' &&
    f.evidence && f.evidence.selector === '<input>' &&
    /no associated label/.test(f.title),

  // F — desktop-only fixed-width layout (.layout width:1200px)
  F: (f) =>
    f.dimension === 'responsive' &&
    /Fixed 1200px width/.test(f.title) &&
    f.evidence && f.evidence.selector === '.layout',

  // G — body text too small (.body-copy 11px — must not be filtered at 12)
  G: (f) =>
    f.dimension === 'typography' &&
    /body-copy/.test(f.title) &&
    /11px/.test(f.title) &&
    f.evidence && f.evidence.measured === '11px',

  // H — off-scale spacing on .card (7/13/19px)
  H: (f) =>
    f.dimension === 'layout' &&
    /Off-scale spacing/.test(f.title) &&
    f.evidence && f.evidence.selector === '.card',

  // I-colors — too many near-duplicate colors (swatch block, no token system)
  'I-colors': (f) =>
    f.dimension === 'color' &&
    /Near-duplicate colors/.test(f.title),

  // I-fonts — too many font families (5 declared)
  'I-fonts': (f) =>
    f.dimension === 'typography' &&
    /font families/.test(f.title) &&
    /^5 /.test(f.title),

  // J — no :focus-visible anywhere (the comment false-positive must NOT suppress this)
  J: (f) =>
    f.dimension === 'accessibility' &&
    /No visible keyboard focus indicator/.test(f.title),
};

const PLANTED_IDS = Object.keys(PLANTED_MATCHERS); // 12 ids

function isLocatedMeasuredFixed(f) {
  return (
    f.evidence &&
    typeof f.evidence.file === 'string' && f.evidence.file.length > 0 &&
    f.evidence.line != null &&
    f.evidence.measured != null &&
    typeof f.fix === 'string' && f.fix.trim().length > 0
  );
}

test('there are exactly 12 planted ids encoded', () => {
  assert.equal(PLANTED_IDS.length, 12);
});

test('each planted id is detected as located + measured + fixed', () => {
  const { findings } = runLocatedAudit(FIXTURE);
  for (const id of PLANTED_IDS) {
    const match = findings.find(PLANTED_MATCHERS[id]);
    assert.ok(match, `PLANTED[${id}] was NOT detected — specificity REGRESSION`);
    assert.ok(
      isLocatedMeasuredFixed(match),
      `PLANTED[${id}] matched finding ${match.id} but it is not fully located+measured+fixed`
    );
  }
});

test('SPECIFICITY SCORE GATE: detected === 12/12 (fail loudly below 12)', () => {
  const { findings } = runLocatedAudit(FIXTURE);
  const detected = PLANTED_IDS.filter((id) => {
    const m = findings.find(PLANTED_MATCHERS[id]);
    return m && isLocatedMeasuredFixed(m);
  });
  const missing = PLANTED_IDS.filter((id) => !detected.includes(id));
  assert.equal(
    detected.length,
    12,
    `SPECIFICITY REGRESSION: ${detected.length}/12 planted problems detected. Missing: [${missing.join(', ')}]`
  );
});

test('empty directory => insufficientEvidence:true and overall:null', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-empty-'));
  try {
    const result = auditProject(dir);
    assert.equal(result.insufficientEvidence, true);
    assert.equal(result.scoreCard.overall, null);
    assert.equal(result.scoreCard.grade, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the fixture itself is sufficient evidence with a non-null overall', () => {
  const result = auditProject(FIXTURE);
  assert.equal(result.insufficientEvidence, false);
  assert.ok(result.scoreCard.overall != null, 'fixture must produce a real overall score');
});
