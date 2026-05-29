'use strict';

/**
 * Unit tests for lib/locator.js — the located-token model.
 *
 * Covers:
 *  - indexToLineCol: a known character offset maps to the right 1-based {line, col}.
 *  - scanCss: a small CSS string yields declarations with correct {selector, prop, value, line}.
 *  - codeMask: a /* comment *\/ region is marked 0 (not code) while real code is 1 — this is the
 *    regression guard for the v0.3 "focus-visible inside a comment read as a real focus rule" bug.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { indexToLineCol, scanCss, codeMask, isMasked, findMatches } = require('../lib/locator');

test('indexToLineCol maps a known offset to 1-based line/col', () => {
  const content = 'abc\ndef\nghi';
  // index 0 = 'a' -> line 1, col 1
  assert.deepEqual(indexToLineCol(content, 0), { line: 1, col: 1 });
  // index 5 = 'e' on the second line -> line 2, col 2
  assert.deepEqual(indexToLineCol(content, 5), { line: 2, col: 2 });
  // index 4 = 'd', first char after the first newline -> line 2, col 1
  assert.deepEqual(indexToLineCol(content, 4), { line: 2, col: 1 });
  // index 8 = 'g' on the third line -> line 3, col 1
  assert.deepEqual(indexToLineCol(content, 8), { line: 3, col: 1 });
});

test('indexToLineCol clamps out-of-range indices', () => {
  const content = 'abc';
  assert.deepEqual(indexToLineCol(content, -10), { line: 1, col: 1 });
  // Past the end clamps to content.length (3) -> line 1, col 4.
  assert.equal(indexToLineCol(content, 999).line, 1);
});

test('scanCss returns declarations with correct selector/prop/value/line', () => {
  const css = '.a {\n  color: #fff;\n  font-size: 11px;\n}';
  const { declarations } = scanCss(css, 't.css');
  assert.equal(declarations.length, 2);

  const color = declarations[0];
  assert.equal(color.selector, '.a');
  assert.equal(color.prop, 'color');
  assert.equal(color.value, '#fff');
  assert.equal(color.line, 2); // color: is on the 2nd line
  assert.equal(color.file, 't.css');

  const fontSize = declarations[1];
  assert.equal(fontSize.selector, '.a');
  assert.equal(fontSize.prop, 'font-size');
  assert.equal(fontSize.value, '11px');
  assert.equal(fontSize.line, 3); // font-size: is on the 3rd line
});

test('scanCss lowercases the prop and resolves a nested SCSS selector chain', () => {
  const scss = '.card {\n  .price {\n    Font-Size: 11px;\n  }\n}';
  const { declarations } = scanCss(scss, 'Card.scss');
  assert.equal(declarations.length, 1);
  assert.equal(declarations[0].prop, 'font-size'); // lowercased
  assert.equal(declarations[0].selector, '.card .price'); // chained
  assert.equal(declarations[0].value, '11px');
});

test('codeMask marks a /* comment */ region as 0 and surrounding code as 1', () => {
  const content = 'a/* x */b';
  const mask = codeMask(content);
  assert.equal(mask.length, content.length);
  // 'a' (index 0) is code
  assert.equal(mask[0], 1);
  // every char of '/* x */' (indices 1..7) is masked as 0
  for (let i = 1; i <= 7; i++) assert.equal(mask[i], 0, `index ${i} should be masked`);
  // 'b' (index 8) is code again
  assert.equal(mask[8], 1);
  // sanity: the full mask string
  assert.equal(Array.from(mask).join(''), '100000001');
});

test('codeMask masks the focus-visible-in-a-comment false positive', () => {
  // The exact shape of the v0.3 bug: a literal `focus-visible` living inside a CSS/JSX comment.
  const content = 'button { color: red; } /* PLANTED[J]: no :focus-visible anywhere */';
  const mask = codeMask(content);
  const idx = content.indexOf('focus-visible');
  assert.ok(idx > -1);
  // The token is INSIDE the comment, so isMasked must report it as not-code (0).
  assert.equal(isMasked(mask, idx), true);
  // Whereas `color` (real code) is not masked.
  const colorIdx = content.indexOf('color');
  assert.equal(isMasked(mask, colorIdx), false);
});

test('codeMask masks string literals so values are not mistaken for code', () => {
  const content = "const x = 'focus-visible';";
  const mask = codeMask(content);
  const idx = content.indexOf('focus-visible');
  assert.equal(isMasked(mask, idx), true);
});

test('findMatches returns located matches with line/col and capture groups', () => {
  const content = 'top\n.cls { color: #abc; }';
  const matches = findMatches(content, /#([0-9a-f]{3})/gi, { file: 'x.css' });
  assert.equal(matches.length, 1);
  assert.equal(matches[0].value, '#abc');
  assert.equal(matches[0].groups[0], 'abc');
  assert.equal(matches[0].line, 2);
  assert.equal(matches[0].file, 'x.css');
});
