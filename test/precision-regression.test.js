'use strict';
/**
 * Regression tests for the contrast-precision must-fixes raised by the Phase-11 Skeptical Reviewer
 * (docs/audit/VERIFICATION.md). These are the real-world false positives the v0.3→v0.4 rebuild had
 * to eliminate WITHOUT losing true positives. Do not delete; they guard the marquee feature.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { analyzeTextContrast } = require('../lib/static-contrast');
const { runLocatedAudit } = require('../lib/located-audit');

const d = (selector, prop, value, line = 1, atRule = null) => ({ selector, prop, value, file: 't.css', line, col: 1, atRule });

describe('Contrast precision regressions (skeptic must-fix #1, #2)', () => {
  it('does NOT flag a faint rgba() tint over a dark page (alpha must be composited, not stripped)', () => {
    // rgba(0,224,255,0.08) is an 8% cyan tint over a dark page — light-cyan text on it is readable.
    const r = analyzeTextContrast([
      d('body', 'background', '#150830'),
      d('.pill', 'color', '#00e0ff', 2),
      d('.pill', 'background', 'rgba(0,224,255,0.08)', 3),
    ]);
    assert.equal(r.length, 0, `expected no finding, got ${JSON.stringify(r.map(x => x.fg + '/' + x.bg))}`);
  });

  it('never emits a fg===bg "1:1" finding (var collision / alias)', () => {
    const r = analyzeTextContrast([
      d(':root', '--foreground', '#000000'),
      d(':root', '--background', '#000000'),
      d('body', 'color', 'var(--foreground)', 3),
      d('body', 'background', 'var(--background)', 4),
    ]);
    assert.equal(r.length, 0, 'fg===bg must be skipped');
  });

  it('prefers the :root var value over an @media-dark redeclaration (no light/dark collapse)', () => {
    // base --background #ffffff; @media dark overrides to #0a0a0a. Base must win for the page surface.
    const r = analyzeTextContrast([
      d(':root', '--background', '#ffffff', 1, null),
      d(':root', '--background', '#0a0a0a', 2, '@media (prefers-color-scheme: dark)'),
      d('.muted', 'color', '#9ca3af', 3),
    ]);
    // #9ca3af on #ffffff = 2.5:1 → a real finding (would be ~no-finding on #0a0a0a).
    assert.equal(r.length, 1, 'base :root background should be used');
    assert.ok(r[0].bg.toLowerCase() === '#ffffff');
  });

  it('does NOT flag rules when light AND dark page surfaces are pooled (multi-site/monorepo)', () => {
    // Skeptic VERIFICATION-2 NO-GO: a light site (#fff) + a dark site (#0a0e1a) in one repo must not
    // make the light surface apply to dark-site text (43 false "light-on-near-white" criticals).
    const r = analyzeTextContrast([
      d('body', 'background', '#ffffff', 1),                 // light site
      d('.kpi', 'color', '#111111', 2),
      d('body', 'background', '#0a0e1a', 1),                 // dark site (different file)
      d('.hero-text', 'color', '#e8ecff', 2),               // light text, no own bg
    ]);
    assert.ok(!r.some(x => x.bg === '#ffffff' && x.fg === '#e8ecff'), 'dark-site text must not be judged on the light surface');
    assert.equal(r.filter(x => x.ratio <= 1.5).length, 0, 'no impossible near-1:1 from surface misresolution');
  });

  it('still resolves a coherent single-site DARK theme (text on dark measured correctly)', () => {
    const r = analyzeTextContrast([
      d(':root', '--bg', '#0a0e1a', 1),
      d('body', 'background', 'var(--bg)', 2),
      d('.dim', 'color', '#2a2e3a', 3),
    ]);
    assert.equal(r.length, 1, 'dim text on a coherent dark surface should flag');
    assert.equal(r[0].bg, '#0a0e1a');
  });

  it('STILL flags a genuine low-contrast pair (no false negatives from the hardening)', () => {
    const r = analyzeTextContrast([
      d('body', 'background', '#f8f9fb'),
      d('.kpi-sub', 'color', '#9ca3af', 2),
    ]);
    assert.equal(r.length, 1);
    assert.ok(r[0].ratio > 2 && r[0].ratio < 3, `expected ~2.41:1, got ${r[0].ratio}`);
    // suggested fix must actually pass on the real surface
    const { contrastRatio, hexToRgb } = require('../lib/color-engine');
    assert.ok(contrastRatio(hexToRgb(r[0].suggestion), hexToRgb(r[0].bg)) >= 4.5, 'suggested after must reach 4.5:1');
  });

  it('resolves SCSS $variables for the surface (skeptic must-fix #5)', () => {
    const r = analyzeTextContrast([
      d('$muted-bg', '$muted-bg', '#f4f5f6'), // SCSS var declaration (prop === name)
      d('.product-card', 'color', '#cfd2d6', 2),
      d('.product-card', 'background', '$muted-bg', 3),
    ]);
    assert.equal(r.length, 1);
    assert.equal(r[0].bg.toLowerCase(), '#f4f5f6', 'should measure against the resolved SCSS surface, not the page');
  });
});

describe('Markup detectors ignore commented-out elements (skeptic must-fix #3)', () => {
  it('does not flag <img>/<input> that appear inside comments', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-mask-'));
    fs.mkdirSync(path.join(dir, 'src'));
    fs.writeFileSync(path.join(dir, 'src', 'C.jsx'), [
      '/** Example usage:',
      ' *   <img src="logo.png">  // documented, not rendered',
      ' *   <input type="email">',
      ' */',
      'export const C = () => <div><img src="real.png" /><input type="text" /></div>;',
    ].join('\n'));
    fs.writeFileSync(path.join(dir, 'styles.css'), '.x{color:#000}'); // ensure not insufficient-evidence
    const r = runLocatedAudit(dir);
    const imgs = r.findings.filter(f => f.id.includes('img'));
    const inputs = r.findings.filter(f => f.id.includes('inp'));
    // Only the real (line 5) <img>/<input> count — the commented ones (lines 2-3) must be ignored.
    assert.ok(imgs.every(f => f.evidence.line === 5), `commented <img> leaked: ${JSON.stringify(imgs.map(f => f.evidence.line))}`);
    assert.ok(inputs.every(f => f.evidence.line === 5), `commented <input> leaked: ${JSON.stringify(inputs.map(f => f.evidence.line))}`);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
