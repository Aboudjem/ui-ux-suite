const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  SCALE_RATIOS, generateTypeScale, generateFluidTypeScale,
  detectTypeScale, recommendWeightStrategy, scoreReadability,
} = require('../lib/type-engine');

describe('Type Engine', () => {
  describe('generateTypeScale', () => {
    it('generates scale with correct base', () => {
      const scale = generateTypeScale(16, 1.25);
      const body = scale.find(s => s.role === 'body');
      assert.ok(body);
      assert.equal(body.px, 16);
    });

    it('produces ascending sizes', () => {
      const scale = generateTypeScale(16, 1.25);
      for (let i = 1; i < scale.length; i++) {
        assert.ok(scale[i].px >= scale[i - 1].px, `Size at step ${scale[i].step} should be >= step ${scale[i - 1].step}`);
      }
    });

    it('uses the correct ratio between adjacent steps', () => {
      const ratio = 1.25;
      const scale = generateTypeScale(16, ratio);
      const body = scale.find(s => s.role === 'body');
      const largeBody = scale.find(s => s.role === 'large-body');
      if (body && largeBody) {
        const actualRatio = largeBody.px / body.px;
        assert.ok(Math.abs(actualRatio - ratio) < 0.01, `Expected ratio ${ratio}, got ${actualRatio}`);
      }
    });
  });

  describe('generateFluidTypeScale', () => {
    it('includes clamp values', () => {
      const scale = generateFluidTypeScale(16, 1.25);
      for (const step of scale) {
        assert.ok(step.clamp, `Step ${step.role} should have a clamp value`);
        assert.ok(step.clamp.startsWith('clamp('), `Clamp should start with clamp(, got ${step.clamp}`);
      }
    });
  });

  describe('detectTypeScale', () => {
    it('detects consistent scale', () => {
      // Generate sizes at major-third (1.25)
      const base = 16;
      const ratio = 1.25;
      const sizes = [];
      for (let i = -1; i <= 4; i++) {
        sizes.push(Math.round(base * Math.pow(ratio, i) * 100) / 100);
      }
      const result = detectTypeScale(sizes);
      assert.ok(result);
      assert.ok(result.detected, `Should detect scale, variance: ${result.variance}`);
    });

    it('detects no scale for random sizes', () => {
      const sizes = [11, 14, 19, 27, 50];
      const result = detectTypeScale(sizes);
      assert.ok(result);
      assert.equal(result.detected, false);
    });

    it('returns null for too few sizes', () => {
      assert.equal(detectTypeScale([16, 20]), null);
    });
  });

  describe('recommendWeightStrategy', () => {
    it('recommends adding weights when only one exists', () => {
      const result = recommendWeightStrategy(['400']);
      assert.ok(result.recommendations.length > 0);
    });

    it('warns about too many weights', () => {
      const result = recommendWeightStrategy(['100', '200', '300', '400', '500', '600', '700']);
      assert.ok(result.recommendations.some(r => r.includes('Too many')));
    });
  });

  describe('scoreReadability', () => {
    it('gives high score for good readability', () => {
      const result = scoreReadability({ fontSize: 16, lineHeight: 1.5, fontWeight: 400 });
      assert.ok(result.score >= 9);
    });

    it('penalizes small font size', () => {
      const result = scoreReadability({ fontSize: 12, lineHeight: 1.5 });
      assert.ok(result.score < 8);
    });

    it('penalizes long lines', () => {
      const result = scoreReadability({ fontSize: 16, lineHeight: 1.5, measure: 100 });
      assert.ok(result.issues.some(i => i.includes('long')));
    });
  });

  describe('SCALE_RATIOS', () => {
    it('has standard scale ratios', () => {
      assert.ok(SCALE_RATIOS['minor-third']);
      assert.ok(SCALE_RATIOS['major-third']);
      assert.ok(SCALE_RATIOS['perfect-fourth']);
      assert.ok(SCALE_RATIOS['golden-ratio']);
    });
  });
});
