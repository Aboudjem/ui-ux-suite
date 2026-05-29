'use strict';

/**
 * Unit tests for lib/static-contrast.js — the marquee feature that was hardcoded OFF in v0.3.
 *
 * Covers:
 *  - analyzeTextContrast flags #fbfbfb on #ffffff as a critical finding with ratio ~1.03, and the
 *    `suggestion` it returns actually passes 4.5:1 (verified independently with the color engine's
 *    contrastRatio so the suggestion isn't merely asserted).
 *  - suggestAccessibleColor returns a hex that meets the requested target on the given background.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  analyzeTextContrast,
  suggestAccessibleColor,
  firstHex,
  fontPx,
  isLargeText,
  resolvePageBackground,
} = require('../lib/static-contrast');
const { hexToRgb, contrastRatio } = require('../lib/color-engine');

test('analyzeTextContrast flags #fbfbfb on #ffffff as critical (~1.03:1)', () => {
  const decls = [
    { file: 'a.css', selector: '.hero-subtitle', prop: 'color', value: '#fbfbfb', line: 13, col: 3 },
    { file: 'a.css', selector: '.hero-subtitle', prop: 'background-color', value: '#ffffff', line: 14, col: 3 },
  ];
  const findings = analyzeTextContrast(decls);
  assert.equal(findings.length, 1);
  const f = findings[0];
  assert.equal(f.kind, 'text-contrast');
  assert.equal(f.severity, 'critical'); // ratio < 3 => critical
  assert.equal(f.fg, '#fbfbfb');
  assert.equal(f.bg, '#ffffff');
  assert.equal(f.threshold, 4.5);
  // ratio is ~1.03 (rounded to 2 dp in the module).
  assert.ok(Math.abs(f.ratio - 1.03) < 0.01, `expected ~1.03, got ${f.ratio}`);
  // It is located at the color declaration.
  assert.equal(f.line, 13);
  assert.equal(f.selector, '.hero-subtitle');
});

test('the contrast suggestion actually passes 4.5:1 on white (verified via color-engine)', () => {
  const decls = [
    { file: 'a.css', selector: '.hero-subtitle', prop: 'color', value: '#fbfbfb', line: 13, col: 3 },
    { file: 'a.css', selector: '.hero-subtitle', prop: 'background-color', value: '#ffffff', line: 14, col: 3 },
  ];
  const f = analyzeTextContrast(decls)[0];
  assert.ok(f.suggestion, 'a darker suggestion must be returned');
  const ratio = contrastRatio(hexToRgb(f.suggestion), hexToRgb('#ffffff'));
  assert.ok(ratio >= 4.5, `suggestion ${f.suggestion} must pass 4.5:1, got ${ratio.toFixed(3)}`);
  // And the suggestion must be darker than the original failing color.
  assert.notEqual(f.suggestion.toLowerCase(), '#fbfbfb');
});

test('suggestAccessibleColor returns a hex meeting the target on the background', () => {
  const target = 4.5;
  const out = suggestAccessibleColor('#fbfbfb', '#ffffff', target);
  assert.match(out, /^#[0-9a-f]{6}$/);
  const ratio = contrastRatio(hexToRgb(out), hexToRgb('#ffffff'));
  assert.ok(ratio >= target, `expected >= ${target}:1, got ${ratio.toFixed(3)}`);
});

test('suggestAccessibleColor lightens toward white on a dark background', () => {
  const target = 4.5;
  // Dark grey foreground on a near-black background: needs to move lighter to pass.
  const out = suggestAccessibleColor('#222222', '#111111', target);
  assert.match(out, /^#[0-9a-f]{6}$/);
  const ratio = contrastRatio(hexToRgb(out), hexToRgb('#111111'));
  assert.ok(ratio >= target, `expected >= ${target}:1 on dark bg, got ${ratio.toFixed(3)}`);
});

test('analyzeTextContrast falls back to the page background when a rule has no bg', () => {
  // Uses a genuine mid-gray (ratio ~2.85, well above the near-invisible artifact floor) so this
  // validates the page-fallback path. A near-white #fbfbfb here would be a backgroundless near-1:1
  // artifact (white text meant for a dark ancestor) and is intentionally skipped — see
  // precision-regression.test.js "white text in a dark section on a light page".
  const decls = [
    { file: 'a.css', selector: 'body', prop: 'background', value: '#ffffff', line: 1, col: 1 },
    { file: 'a.css', selector: '.muted', prop: 'color', value: '#999999', line: 5, col: 3 },
  ];
  const findings = analyzeTextContrast(decls);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].bg, '#ffffff');
  assert.equal(findings[0].bgFromPage, true);
});

test('analyzeTextContrast does NOT flag a passing pair', () => {
  const decls = [
    { file: 'a.css', selector: '.ok', prop: 'color', value: '#000000', line: 1, col: 1 },
    { file: 'a.css', selector: '.ok', prop: 'background-color', value: '#ffffff', line: 2, col: 1 },
  ];
  assert.equal(analyzeTextContrast(decls).length, 0);
});

test('firstHex / fontPx / isLargeText / resolvePageBackground helpers', () => {
  assert.equal(firstHex('1px solid #ABC'), '#aabbcc'); // normalized + expanded
  assert.equal(firstHex('var(--x)'), null);
  assert.equal(fontPx('11px'), 11);
  assert.equal(fontPx('1rem'), 16);
  assert.equal(isLargeText(24, 400), true); // 24px normal = large
  assert.equal(isLargeText(20, 700), true); // 18.66+ bold = large
  assert.equal(isLargeText(13, 400), false);
  assert.equal(resolvePageBackground([]), '#ffffff'); // default white
});
