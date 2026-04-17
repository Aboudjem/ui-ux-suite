const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  scoreColorSystem, scoreTypography, scoreLayout, scoreAccessibility, formatScoreCard,
} = require('../lib/scoring');
const { createFinding } = require('../lib/schema');

describe('Law citations on findings', () => {
  it('scoreColorSystem attaches aesthetic-usability-effect on contrast failures', () => {
    const result = scoreColorSystem({
      contrastIssues: [{ ratio: 2.5 }, { ratio: 2.8 }],
      uniqueCount: 5,
      nearDuplicates: [],
      semantic: { primary: true, error: true, success: true, warning: true },
    });
    const f = result.findings.find(x => x.msg.toLowerCase().includes('contrast'));
    assert.ok(f, 'expected a contrast finding');
    assert.ok(Array.isArray(f.laws), 'laws[] must be present on contrast finding');
    assert.ok(f.laws.includes('aesthetic-usability-effect'), `expected aesthetic-usability-effect, got ${JSON.stringify(f.laws)}`);
  });

  it('scoreColorSystem cites teslers-law or millers-law on too-many-colors', () => {
    const result = scoreColorSystem({
      uniqueCount: 35,
      contrastIssues: [],
      nearDuplicates: [],
      semantic: { primary: true, error: true, success: true, warning: true },
    });
    const f = result.findings.find(x => x.msg.toLowerCase().includes('unique colors'));
    assert.ok(f, 'expected a too-many-colors finding');
    assert.ok(Array.isArray(f.laws) && f.laws.some(s => s === 'teslers-law' || s === 'millers-law'),
      `expected teslers-law or millers-law, got ${JSON.stringify(f.laws)}`);
  });

  it('scoreAccessibility cites fittss-law or jakobs-law on missing focus indicators', () => {
    const result = scoreAccessibility({
      hasFocusIndicators: false,
      hasReducedMotion: true,
      hasSkipLink: true,
      missingAltText: 0,
      contrastFailures: 0,
    });
    const f = result.findings.find(x => x.msg.toLowerCase().includes('focus'));
    assert.ok(f, 'expected a focus-indicator finding');
    assert.ok(Array.isArray(f.laws) && (f.laws.includes('fittss-law') || f.laws.includes('jakobs-law')),
      `expected fittss-law or jakobs-law, got ${JSON.stringify(f.laws)}`);
  });

  it('scoreLayout cites law-of-proximity on inconsistent spacing', () => {
    const result = scoreLayout({
      spacingConsistent: false,
      hasMaxWidth: true,
      breakpointCount: 2,
      offScaleCount: 0,
    });
    const f = result.findings.find(x => x.msg.toLowerCase().includes('spacing'));
    assert.ok(f, 'expected a spacing finding');
    assert.ok(Array.isArray(f.laws) && f.laws.includes('law-of-proximity'),
      `expected law-of-proximity, got ${JSON.stringify(f.laws)}`);
  });

  it('scoreTypography on clean input yields zero findings (regression)', () => {
    const result = scoreTypography({
      scaleDetected: true,
      fontCount: 1,
      bodySize: 16,
      bodyLineHeight: 1.6,
    });
    assert.equal(result.findings.length, 0);
  });
});

describe('formatScoreCard inline citations + coverage summary', () => {
  function makeCard(findings) {
    return {
      overall: 7,
      grade: 'Good',
      dimensions: [
        { id: 'color', label: 'Color', score: 7, weight: 0.1, findings },
      ],
      topFindings: findings.map(f => ({ ...f, dimension: 'color' })),
    };
  }

  it('renders inline citation when finding carries laws', () => {
    const out = formatScoreCard(makeCard([
      { severity: 'critical', msg: '12-item nav menu', laws: ['hicks-law'] },
    ]));
    assert.ok(out.includes('violates'), 'expected inline "violates" phrase');
    assert.ok(out.includes("Hick's Law"), `expected display name Hick's Law; output was:\n${out}`);
  });

  it('emits Laws of UX Coverage section when any finding has laws', () => {
    const out = formatScoreCard(makeCard([
      { severity: 'critical', msg: 'x', laws: ['hicks-law'] },
      { severity: 'important', msg: 'y', laws: ['fittss-law'] },
    ]));
    assert.ok(out.includes('## Laws of UX Coverage'), 'expected coverage H2');
    assert.ok(out.includes('| Law | Violations | Worst Offender |'), 'expected coverage table header');
  });

  it('omits Laws of UX Coverage section when no finding has laws', () => {
    const out = formatScoreCard(makeCard([
      { severity: 'suggestion', msg: 'plain finding' },
    ]));
    assert.ok(!out.includes('Laws of UX Coverage'), 'coverage section must be omitted when empty');
    assert.ok(!out.includes('violates'), 'inline citation must not appear');
  });

  it('renders findings without laws byte-compatible with existing format', () => {
    const out = formatScoreCard(makeCard([
      { severity: 'critical', msg: 'bare finding' },
    ]));
    assert.ok(out.includes('# Design Score Card'));
    assert.ok(out.includes('bare finding'));
    assert.ok(out.includes('**color**') || out.includes('color'));
  });
});

describe('createFinding passes through laws', () => {
  it('accepts optional laws and preserves it', () => {
    const f = createFinding({
      dimension: 'flows',
      severity: 'important',
      title: 't',
      description: 'd',
      laws: ['hicks-law', 'choice-overload'],
    });
    assert.deepEqual(f.laws, ['hicks-law', 'choice-overload']);
  });

  it('normalizes absent/empty laws to undefined', () => {
    const f1 = createFinding({ dimension: 'x', severity: 's', title: 't', description: 'd' });
    const f2 = createFinding({ dimension: 'x', severity: 's', title: 't', description: 'd', laws: [] });
    assert.equal(f1.laws, undefined);
    assert.equal(f2.laws, undefined);
  });
});
