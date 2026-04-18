const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  scoreComponents, scoreHierarchy, scoreInteraction, scoreResponsive,
  scorePolish, scorePerformance, scoreFlows, scorePlatform, ALL_SCORERS,
} = require('../lib/scoring');
const { TOOLS } = require('../lib/mcp-server');

const SCORE_DIM = TOOLS.find(t => t.name === 'uiux_score_dimension');

describe('ALL_SCORERS exports 12 dimensions', () => {
  it('exposes exactly the 12 expected dimension ids', () => {
    const ids = Object.keys(ALL_SCORERS).sort();
    const expected = ['accessibility','color','components','flows','hierarchy','interaction','layout','performance','platform','polish','responsive','typography'];
    assert.deepEqual(ids, expected);
  });
});

describe('uiux_score_dimension MCP tool no longer silently fails on the 8 new dimensions', () => {
  for (const dim of ['components','hierarchy','interaction','responsive','polish','performance','flows','platform']) {
    it(`returns success=true for dimension=${dim}`, async () => {
      const r = await SCORE_DIM.handler({ dimension: dim, data: {} });
      assert.equal(r.success, true, `expected ${dim} to score without "No scorer" error`);
      assert.equal(r.dimension, dim);
      assert.ok(typeof r.score === 'number' && r.score >= 1 && r.score <= 10);
      assert.ok(Array.isArray(r.findings));
      assert.ok(['high','medium','insufficient'].includes(r.confidence), `confidence flag present for ${dim}`);
    });
  }

  it('returns a helpful error message for an unknown dimension', async () => {
    const r = await SCORE_DIM.handler({ dimension: 'purple', data: {} });
    assert.equal(r.success, false);
    assert.ok(r.error.includes('purple'));
    assert.ok(Array.isArray(r.available));
    assert.ok(r.hint);
  });

  it('returns a helpful error when data is omitted', async () => {
    const r = await SCORE_DIM.handler({ dimension: 'components' });
    assert.equal(r.success, false);
    assert.ok(r.error.toLowerCase().includes('data'));
  });
});

describe('scoreComponents', () => {
  it('high score with strong signals', () => {
    const r = scoreComponents({
      primitivesCount: 12, hasCnUtil: true, hasCva: true, hasIconLib: true,
      stateCoverage: { hover: 40, focusVisible: 10, active: 5, disabled: 3, dark: 8, groupHover: 2 },
    });
    assert.ok(r.score >= 8, `expected >=8, got ${r.score}`);
    assert.equal(r.confidence, 'high');
  });

  it('low score with no primitives and no utilities', () => {
    const r = scoreComponents({
      primitivesCount: 0, hasCnUtil: false, hasCva: false, hasIconLib: false,
      stateCoverage: { hover: 0, focusVisible: 0, focus: 0, active: 0, disabled: 0 },
    });
    assert.ok(r.score <= 4, `expected <=4, got ${r.score}`);
    assert.ok(r.findings.length >= 4);
  });

  it('reports insufficient confidence when data is empty', () => {
    const r = scoreComponents({});
    assert.equal(r.confidence, 'insufficient');
  });
});

describe('scoreHierarchy', () => {
  it('penalizes missing h1', () => {
    const r = scoreHierarchy({ typeScaleDetected: true, fontWeights: [400, 700], h1Count: 0, h2Count: 1, h3Count: 2, has2xlOrLarger: true });
    assert.ok(r.findings.some(f => f.msg.toLowerCase().includes('h1')));
  });

  it('penalizes too many font weights', () => {
    const r = scoreHierarchy({ typeScaleDetected: true, fontWeights: [100,200,300,400,500,600,700,800], h1Count: 1, h2Count: 2, h3Count: 3, has2xlOrLarger: true });
    assert.ok(r.findings.some(f => f.msg.toLowerCase().includes('weights')));
  });
});

describe('scoreInteraction', () => {
  it('penalizes missing focus-visible as critical', () => {
    const r = scoreInteraction({ hasTransitions: true, hasHoverStates: true, hasFocusVisible: false, hasActive: true, hasReducedMotion: true, hasMotionLib: true });
    assert.ok(r.findings.some(f => f.severity === 'critical' && f.msg.toLowerCase().includes('focus-visible')));
  });

  it('gives high score when all signals present', () => {
    const r = scoreInteraction({ hasTransitions: true, hasHoverStates: true, hasFocusVisible: true, hasActive: true, hasReducedMotion: true, hasMotionLib: true });
    assert.ok(r.score >= 9);
  });
});

describe('scoreResponsive', () => {
  it('flags no breakpoints as critical', () => {
    const r = scoreResponsive({ distinctBreakpoints: [], totalResponsive: 0, ratioResponsive: 0 });
    assert.ok(r.findings.some(f => f.severity === 'critical'));
    assert.ok(r.score <= 7);
  });

  it('rewards multiple breakpoints + fluid type + container queries', () => {
    const r = scoreResponsive({
      distinctBreakpoints: ['sm','md','lg','xl'],
      totalResponsive: 120, ratioResponsive: 0.35,
      hasFluidType: true, hasContainerQueries: true,
    });
    assert.ok(r.score >= 9);
  });
});

describe('scorePolish', () => {
  it('flags no shadows, no radii', () => {
    const r = scorePolish({ shadowCount: 0, radiusCount: 0, multiLayerShadows: false, tokenizedRadii: false });
    assert.ok(r.findings.length >= 3);
    assert.ok(r.score <= 7);
  });

  it('rewards multi-layer shadows + tokenized radii', () => {
    const r = scorePolish({ shadowCount: 6, radiusCount: 4, multiLayerShadows: true, tokenizedRadii: true });
    assert.ok(r.score >= 9);
  });
});

describe('scorePerformance', () => {
  it('penalizes raw <img> tags without next/image', () => {
    const r = scorePerformance({ hasNextFont: true, hasNextImage: false, imagesInJsx: 5, hasSuspense: true, hasSkeleton: true });
    assert.ok(r.findings.some(f => f.msg.toLowerCase().includes('img') || f.msg.toLowerCase().includes('image')));
  });
});

describe('scoreFlows', () => {
  it('flags missing empty states as important', () => {
    const r = scoreFlows({ hasCommandPalette: false, hasEmptyStates: false, hasFormValidation: false });
    assert.ok(r.findings.some(f => f.severity === 'important' && f.msg.toLowerCase().includes('empty')));
  });
});

describe('scorePlatform', () => {
  it('penalizes missing dark mode + prefers-reduced-motion + lang', () => {
    const r = scorePlatform({ hasDarkMode: false, hasLangAttr: false, hasPrefersReducedMotion: false });
    assert.ok(r.score <= 7);
    assert.ok(r.findings.length >= 3);
  });

  it('flags touch targets < 44 as important when reported', () => {
    const r = scorePlatform({ hasDarkMode: true, hasLangAttr: true, hasPrefersReducedMotion: true, hasTouchTargets: false });
    assert.ok(r.findings.some(f => f.msg.toLowerCase().includes('44')));
  });
});
