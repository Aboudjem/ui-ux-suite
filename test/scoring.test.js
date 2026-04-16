const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  scoreColorSystem, scoreTypography, scoreLayout, scoreAccessibility,
  runFullScoring, formatScoreCard,
} = require('../lib/scoring');
const { createScoreCard, calculateOverall, DIMENSIONS } = require('../lib/schema');

describe('Scoring', () => {
  describe('scoreColorSystem', () => {
    it('gives high score for clean color system', () => {
      const result = scoreColorSystem({
        uniqueCount: 10,
        contrastIssues: [],
        nearDuplicates: [],
        semantic: { primary: true, error: true, success: true, warning: true },
        hasDarkMode: true,
      });
      assert.ok(result.score >= 9, `Expected >= 9, got ${result.score}`);
      assert.ok(Array.isArray(result.findings));
    });

    it('penalizes too many colors', () => {
      const result = scoreColorSystem({
        uniqueCount: 50,
        contrastIssues: [],
        nearDuplicates: [],
        semantic: { primary: true, error: true, success: true, warning: true },
      });
      assert.ok(result.score < 9, `Expected < 9, got ${result.score}`);
    });

    it('penalizes contrast failures', () => {
      const result = scoreColorSystem({
        uniqueCount: 10,
        contrastIssues: [{ ratio: 2 }, { ratio: 2.5 }],
        nearDuplicates: [],
        semantic: { primary: true, error: true, success: true, warning: true },
      });
      assert.ok(result.score < 8);
      assert.ok(result.findings.some(f => f.severity === 'critical'));
    });

    it('penalizes missing semantic colors', () => {
      const result = scoreColorSystem({
        uniqueCount: 10,
        contrastIssues: [],
        nearDuplicates: [],
        semantic: { primary: true },
      });
      assert.ok(result.findings.some(f => f.msg.includes('Missing semantic')));
    });
  });

  describe('scoreTypography', () => {
    it('gives high score for good typography', () => {
      const result = scoreTypography({
        scaleDetected: true,
        fontCount: 2,
        bodySize: 16,
        bodyLineHeight: 1.5,
      });
      assert.ok(result.score >= 9);
    });

    it('penalizes no type scale', () => {
      const result = scoreTypography({
        scaleDetected: false,
        fontCount: 1,
        bodySize: 16,
      });
      assert.ok(result.score <= 8);
    });

    it('penalizes small body text', () => {
      const result = scoreTypography({
        scaleDetected: true,
        fontCount: 1,
        bodySize: 12,
      });
      assert.ok(result.findings.some(f => f.severity === 'critical'));
    });

    it('penalizes too many fonts', () => {
      const result = scoreTypography({
        scaleDetected: true,
        fontCount: 5,
        bodySize: 16,
      });
      assert.ok(result.score <= 8);
    });
  });

  describe('scoreLayout', () => {
    it('gives high score for consistent layout', () => {
      const result = scoreLayout({
        spacingConsistent: true,
        offScaleCount: 0,
        hasMaxWidth: true,
        breakpointCount: 3,
      });
      assert.ok(result.score >= 9);
    });

    it('penalizes no breakpoints', () => {
      const result = scoreLayout({
        spacingConsistent: true,
        offScaleCount: 0,
        hasMaxWidth: true,
        breakpointCount: 0,
      });
      assert.ok(result.findings.some(f => f.severity === 'critical'));
    });
  });

  describe('scoreAccessibility', () => {
    it('gives high score for accessible project', () => {
      const result = scoreAccessibility({
        contrastFailures: 0,
        hasFocusIndicators: true,
        hasSkipLink: true,
        missingAltText: 0,
        hasReducedMotion: true,
      });
      assert.ok(result.score >= 9);
    });

    it('penalizes missing focus indicators', () => {
      const result = scoreAccessibility({
        contrastFailures: 0,
        hasFocusIndicators: false,
        hasSkipLink: false,
        missingAltText: 5,
        hasReducedMotion: false,
      });
      assert.ok(result.score <= 6);
    });
  });

  describe('runFullScoring', () => {
    it('produces a complete scorecard', () => {
      const scoreCard = runFullScoring({
        color: {
          uniqueCount: 10,
          contrastIssues: [],
          nearDuplicates: [],
          semantic: { primary: true, error: true, success: true, warning: true },
        },
        typography: { scaleDetected: true, fontCount: 2, bodySize: 16 },
        layout: { spacingConsistent: true, offScaleCount: 0, hasMaxWidth: true, breakpointCount: 3 },
        accessibility: { contrastFailures: 0, hasFocusIndicators: true, hasSkipLink: true, missingAltText: 0, hasReducedMotion: true },
      });

      assert.ok(scoreCard.overall !== null);
      assert.ok(scoreCard.grade !== null);
      assert.ok(scoreCard.dimensions.length === DIMENSIONS.length);
    });
  });

  describe('formatScoreCard', () => {
    it('returns a formatted string', () => {
      const scoreCard = createScoreCard();
      scoreCard.dimensions[0].score = 8;
      scoreCard.dimensions[1].score = 7;
      calculateOverall(scoreCard);
      scoreCard.topFindings = [];
      const formatted = formatScoreCard(scoreCard);
      assert.ok(formatted.includes('Design Score Card'));
      assert.ok(formatted.includes('Overall'));
    });
  });

  describe('schema', () => {
    it('DIMENSIONS has 12 entries', () => {
      assert.equal(DIMENSIONS.length, 12);
    });

    it('weights sum to 1.0', () => {
      const total = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
      assert.ok(Math.abs(total - 1.0) < 0.001, `Weights sum to ${total}, expected 1.0`);
    });

    it('calculateOverall produces weighted average', () => {
      const sc = createScoreCard();
      sc.dimensions.forEach(d => { d.score = 8; });
      calculateOverall(sc);
      assert.equal(sc.overall, 8);
      assert.equal(sc.grade, 'Strong');
    });
  });
});
