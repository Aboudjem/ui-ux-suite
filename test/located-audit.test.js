'use strict';

/**
 * Integration tests for lib/located-audit.js — runLocatedAudit over the planted fixture.
 *
 * The contract of a "serious" finding is: specific + located (file:line/selector) + measured +
 * FIXED. These tests assert that EVERY finding carries evidence.file, a non-null evidence.line,
 * and a non-empty fix, and that the specific planted problems are present.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { runLocatedAudit } = require('../lib/located-audit');

const FIXTURE = path.join(__dirname, 'fixtures', 'planted-ux-problems');

let cached;
function audit() {
  if (!cached) cached = runLocatedAudit(FIXTURE);
  return cached;
}

test('runLocatedAudit produces located findings on the fixture', () => {
  const { findings, stats } = audit();
  assert.ok(findings.length > 0, 'expected findings on the planted fixture');
  assert.equal(stats.locatedFindings, findings.length);
  assert.ok(stats.cssFiles >= 3, 'should scan the .css/.scss files');
  assert.ok(stats.jsxFiles >= 1, 'should scan the .jsx file');
  assert.ok(stats.htmlFiles >= 1, 'should scan index.html');
});

test('EVERY finding has evidence.file, a non-null evidence.line, and a non-empty fix', () => {
  const { findings } = audit();
  for (const f of findings) {
    assert.ok(f.evidence, `finding ${f.id} must carry an evidence block`);
    assert.ok(typeof f.evidence.file === 'string' && f.evidence.file.length > 0,
      `finding ${f.id} must name evidence.file (got ${JSON.stringify(f.evidence.file)})`);
    assert.ok(f.evidence.line != null,
      `finding ${f.id} must have a non-null evidence.line`);
    assert.ok(typeof f.fix === 'string' && f.fix.trim().length > 0,
      `finding ${f.id} must carry a non-empty fix`);
    // Every finding must also carry a measured value and a threshold (specific + measured).
    assert.ok(f.evidence.measured != null, `finding ${f.id} must carry evidence.measured`);
    assert.ok(f.evidence.threshold != null, `finding ${f.id} must carry evidence.threshold`);
  }
});

function find(findings, pred) {
  return findings.find(pred);
}

test('planted A — hero-subtitle near-white contrast (1.03:1)', () => {
  const { findings } = audit();
  const f = find(findings, x =>
    x.dimension === 'accessibility' &&
    /hero-subtitle/.test(x.title) &&
    /1\.03/.test(x.title));
  assert.ok(f, 'expected .hero-subtitle 1.03:1 contrast finding');
  assert.equal(f.evidence.file, 'src/styles.css');
  assert.equal(f.evidence.selector, '.hero-subtitle');
});

test('planted G — body-copy 11px (not the old 12px filter)', () => {
  const { findings } = audit();
  const f = find(findings, x =>
    x.dimension === 'typography' &&
    /body-copy/.test(x.title) &&
    /11px/.test(x.title));
  assert.ok(f, 'expected .body-copy 11px finding (11px must be caught, not filtered at 12)');
  assert.equal(f.evidence.file, 'src/styles.css');
  assert.equal(f.evidence.measured, '11px');
});

test('planted E-alt — at least one <img> missing alt', () => {
  const { findings } = audit();
  const f = find(findings, x =>
    x.dimension === 'accessibility' &&
    x.evidence && x.evidence.selector === '<img>' &&
    /missing `alt`/.test(x.title));
  assert.ok(f, 'expected a missing-alt finding');
  assert.ok(f.wcag && f.wcag.includes('1.1.1'));
});

test('planted E-label — at least one form input missing a label', () => {
  const { findings } = audit();
  const f = find(findings, x =>
    x.dimension === 'accessibility' &&
    x.evidence && x.evidence.selector === '<input>' &&
    /no associated label/.test(x.title));
  assert.ok(f, 'expected a missing-label finding');
  assert.ok(f.wcag && f.wcag.includes('3.3.2'));
});

test('planted B — generic CTA "continue"', () => {
  const { findings } = audit();
  const f = find(findings, x =>
    x.dimension === 'flows' &&
    /Generic CTA/.test(x.title) &&
    /continue/i.test(x.title));
  assert.ok(f, 'expected a generic-CTA "continue" finding');
});

test('planted H — off-grid spacing on .card', () => {
  const { findings } = audit();
  const f = find(findings, x =>
    x.dimension === 'layout' &&
    /Off-scale spacing/.test(x.title) &&
    x.evidence && x.evidence.selector === '.card');
  assert.ok(f, 'expected an off-grid spacing finding on .card');
  assert.equal(f.evidence.file, 'src/styles.css');
});

test('planted J — missing focus-visible (the comment false-positive is gone)', () => {
  const { findings } = audit();
  const f = find(findings, x =>
    x.dimension === 'accessibility' &&
    /No visible keyboard focus indicator/.test(x.title));
  assert.ok(f, 'expected a missing-focus-visible finding despite focus-visible appearing in a comment');
  assert.ok(f.wcag && f.wcag.includes('2.4.7'));
});
