const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { weaveBrowserFindings, severityForImpact, wcagForRule } = require('../lib/browser-weave');
const { overlayScript, removeOverlayScript, clampViewport, ANNOT_PREFIX } = require('../lib/annotate');
const { resetFindingSeq } = require('../lib/schema');

// A MOCK browserResult shaped exactly like lib/browser.js runBrowserAudit output:
// one color-contrast axe violation + one 28x28 under-minimum touch target.
function mockBrowserResult() {
  return {
    ok: true,
    baseUrl: 'http://localhost:3000',
    routes: [
      {
        route: '/signup',
        url: 'http://localhost:3000/signup',
        screenshotPath: '/tmp/uiux/signup.png',
        violations: [
          {
            id: 'color-contrast',
            impact: 'serious',
            help: 'Elements must meet minimum color contrast ratio thresholds',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.9/color-contrast',
            nodesCount: 3,
            firstNodeTarget: '.hero-subtitle',
            firstNodeHtml: '<p class="hero-subtitle">Welcome</p>',
          },
        ],
        passCount: 40,
        incompleteCount: 1,
        touchTargets: {
          total: 12,
          underMinimum: 1,
          examples: [
            { tag: 'button', w: 28, h: 28, text: '×' },
          ],
        },
      },
    ],
  };
}

describe('browser-weave — weaveBrowserFindings', () => {
  beforeEach(() => { resetFindingSeq(); });

  it('returns located Findings for the axe violation and touch target', () => {
    const findings = weaveBrowserFindings(mockBrowserResult());
    assert.equal(findings.length, 2, 'one axe violation + one touch target = 2 findings');
  });

  it('axe color-contrast becomes a located accessibility Finding with wcag 1.4.3 and a fix', () => {
    const findings = weaveBrowserFindings(mockBrowserResult());
    const a11y = findings.find(f => f.dimension === 'accessibility');
    assert.ok(a11y, 'an accessibility finding exists');

    // located
    assert.ok(a11y.evidence, 'has evidence block');
    assert.equal(a11y.evidence.selector, '.hero-subtitle', 'selector from firstNodeTarget');
    assert.equal(a11y.evidence.file, '(rendered DOM)');
    assert.equal(a11y.evidence.line, 0);
    assert.equal(a11y.evidence.measured, 'Elements must meet minimum color contrast ratio thresholds', 'measured is the axe help');
    assert.equal(a11y.evidence.screenshot, '/tmp/uiux/signup.png', 'route screenshotPath attached');

    // severity: axe serious → critical
    assert.equal(a11y.severity, 'critical');

    // wcag
    assert.deepEqual(a11y.wcag, ['1.4.3'], 'color-contrast maps to WCAG 1.4.3');

    // fix
    assert.ok(typeof a11y.fix === 'string' && a11y.fix.length > 0, 'has a concrete fix');
    assert.ok(a11y.fix.includes('dequeuniversity.com'), 'fix references the axe helpUrl');
  });

  it('under-minimum touch target becomes a platform Finding citing WCAG 2.5.8/2.5.5 with measured size + fix', () => {
    const findings = weaveBrowserFindings(mockBrowserResult());
    const platform = findings.find(f => f.dimension === 'platform');
    assert.ok(platform, 'a platform finding exists');

    // located + measured
    assert.ok(platform.evidence, 'has evidence block');
    assert.equal(platform.evidence.measured, '28×28px', 'measured size present');
    assert.equal(platform.evidence.screenshot, '/tmp/uiux/signup.png', 'route screenshotPath attached');
    assert.ok(platform.evidence.selector, 'has a selector');

    // wcag citations
    assert.ok(Array.isArray(platform.wcag));
    assert.ok(platform.wcag.includes('2.5.8'), 'cites WCAG 2.5.8 (24px AA)');
    assert.ok(platform.wcag.includes('2.5.5'), 'cites WCAG 2.5.5 (44px AAA)');

    // 28px > 24px → passes AA, fails AAA → suggestion severity
    assert.equal(platform.severity, 'suggestion');

    // fix mentions a concrete target size
    assert.ok(platform.fix.includes('44'), 'fix names the 44px target');
  });

  it('tolerates error envelopes and empty input', () => {
    assert.deepEqual(weaveBrowserFindings(null), []);
    assert.deepEqual(weaveBrowserFindings({ ok: false, code: 'PLAYWRIGHT_MISSING' }), []);
    assert.deepEqual(weaveBrowserFindings({ ok: true, routes: [] }), []);
  });

  it('severity mapping: critical/serious→critical, moderate→important, minor→suggestion', () => {
    assert.equal(severityForImpact('critical'), 'critical');
    assert.equal(severityForImpact('serious'), 'critical');
    assert.equal(severityForImpact('moderate'), 'important');
    assert.equal(severityForImpact('minor'), 'suggestion');
    assert.equal(severityForImpact('unknown'), 'suggestion');
  });

  it('wcag mapping is set where obvious and omitted otherwise', () => {
    assert.deepEqual(wcagForRule('color-contrast'), ['1.4.3']);
    assert.deepEqual(wcagForRule('image-alt'), ['1.1.1']);
    assert.deepEqual(wcagForRule('label'), ['3.3.2']);
    assert.equal(wcagForRule('some-other-rule'), undefined);
  });

  it('a sub-24px target is escalated to important severity', () => {
    const result = mockBrowserResult();
    result.routes[0].touchTargets.examples = [{ tag: 'a', w: 20, h: 20, text: 'x' }];
    const findings = weaveBrowserFindings(result);
    const platform = findings.find(f => f.dimension === 'platform');
    assert.equal(platform.severity, 'important', '20px fails even the 24px AA floor');
  });
});

describe('annotate — overlayScript / removeOverlayScript', () => {
  it('overlayScript returns a self-contained JS string embedding the boxes', () => {
    const boxes = [{ x: 10, y: 20, width: 28, height: 28, label: 'tiny target' }];
    const src = overlayScript(boxes);
    assert.equal(typeof src, 'string');
    assert.ok(src.includes(ANNOT_PREFIX), 'uses the id prefix for removal');
    assert.ok(src.includes('createElement'), 'builds DOM nodes');
    assert.ok(src.includes('tiny target'), 'label is embedded');
    assert.ok(src.includes('28'), 'box geometry embedded');
    // No DOM access happens at build time — must be a string only.
    assert.ok(!src.startsWith('function'), 'returns an IIFE-style evaluatable expression');
  });

  it('overlayScript filters out invalid/zero-size boxes', () => {
    const src = overlayScript([
      { x: 1, y: 2, width: 0, height: 10, label: 'bad' },
      { x: 'nope', y: 2, width: 10, height: 10 },
      null,
    ]);
    assert.ok(!src.includes('"bad"'), 'zero-width box dropped');
    assert.ok(src.includes('[]'), 'all boxes filtered → empty array embedded');
  });

  it('overlayScript handles non-array input safely', () => {
    const src = overlayScript(undefined);
    assert.equal(typeof src, 'string');
    assert.ok(src.includes('[]'));
  });

  it('removeOverlayScript returns a cleanup JS string referencing the prefix', () => {
    const src = removeOverlayScript();
    assert.equal(typeof src, 'string');
    assert.ok(src.includes(ANNOT_PREFIX));
    assert.ok(src.includes('removeChild'), 'removes injected nodes');
    assert.ok(src.includes('data-uiux-annotation'), 'cleans orphaned annotation nodes');
  });
});

describe('annotate — clampViewport', () => {
  it('clamps oversize viewport 4000x3000 → 1920x1080', () => {
    assert.deepEqual(clampViewport({ width: 4000, height: 3000 }), { width: 1920, height: 1080 });
  });

  it('passes through a within-bounds viewport unchanged', () => {
    assert.deepEqual(clampViewport({ width: 1280, height: 800 }), { width: 1280, height: 800 });
  });

  it('clamps only the offending dimension', () => {
    assert.deepEqual(clampViewport({ width: 4000, height: 800 }), { width: 1920, height: 800 });
    assert.deepEqual(clampViewport({ width: 1280, height: 3000 }), { width: 1280, height: 1080 });
  });

  it('falls back to the maximum for falsy/invalid dimensions', () => {
    assert.deepEqual(clampViewport({}), { width: 1920, height: 1080 });
    assert.deepEqual(clampViewport(null), { width: 1920, height: 1080 });
    assert.deepEqual(clampViewport({ width: -5, height: 0 }), { width: 1920, height: 1080 });
    assert.deepEqual(clampViewport({ width: NaN, height: 'x' }), { width: 1920, height: 1080 });
  });

  it('rounds fractional dimensions', () => {
    assert.deepEqual(clampViewport({ width: 1280.7, height: 799.2 }), { width: 1281, height: 799 });
  });
});

describe('browser — screenshot helpers exist and gate cleanly', () => {
  const browser = require('../lib/browser');

  it('still exports the original peer-dep contract plus new screenshot helpers', () => {
    assert.equal(typeof browser.probePeerDeps, 'function');
    assert.equal(typeof browser.runBrowserAudit, 'function');
    assert.equal(typeof browser.resetCachedProbe, 'function');
    assert.equal(typeof browser.takeScreenshot, 'function');
    assert.equal(typeof browser.screenshotElement, 'function');
    assert.equal(typeof browser.isValidClip, 'function');
  });

  it('isValidClip validates bounding boxes', () => {
    assert.equal(browser.isValidClip({ x: 0, y: 0, width: 10, height: 10 }), true);
    assert.equal(browser.isValidClip({ x: 0, y: 0, width: 0, height: 10 }), false);
    assert.equal(browser.isValidClip({ x: 0, y: 0, width: 10 }), false);
    assert.equal(browser.isValidClip(null), false);
  });

  it('screenshotElement returns null when no box is resolvable (no live browser needed)', async () => {
    const r = await browser.screenshotElement({}, { dir: '/tmp/uiux', route: '/x' });
    assert.equal(r, null);
  });
});
