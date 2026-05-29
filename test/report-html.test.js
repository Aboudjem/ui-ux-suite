'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { renderHtmlReport } = require('../lib/report-html');
const { auditProject } = require('../lib/runner');

const FIXTURE = path.join(__dirname, 'fixtures', 'planted-ux-problems');

// Audit the planted fixture once and reuse across tests.
const audit = auditProject(FIXTURE);
const html = renderHtmlReport(audit);

test('starts with <!DOCTYPE html> and is a full document', () => {
  assert.ok(html.startsWith('<!DOCTYPE html>'), 'must start with the doctype');
  assert.match(html, /<html[ >]/, 'has an <html> element');
  assert.match(html, /<\/html>\s*$/, 'closes the document');
  assert.match(html, /<style>/, 'inlines a <style> block');
});

test('renders self-contained (no <script>, no external CSS/JS/fonts/CDN)', () => {
  assert.ok(!/<script/i.test(html), 'must not contain any <script>');
  assert.ok(!/<link\b/i.test(html), 'must not link external stylesheets');
  assert.ok(!/https?:\/\/[^"]*\.(css|js)/i.test(html), 'must not reference external CSS/JS');
  // The only allowed external URLs are citation links (lawsofux.com); no font/CDN hosts.
  assert.ok(!/fonts\.googleapis|fonts\.gstatic|cdn\.|cdnjs|unpkg|jsdelivr/i.test(html),
    'must not reference any font host or CDN');
});

test('shows the overall score and grade', () => {
  assert.ok(audit.insufficientEvidence === false, 'fixture should produce a real score');
  assert.ok(typeof audit.scoreCard.overall === 'number', 'fixture has a numeric overall');
  assert.ok(html.includes(audit.scoreCard.overall.toFixed(1)),
    `report must contain the overall score ${audit.scoreCard.overall.toFixed(1)}`);
  assert.ok(html.includes(audit.scoreCard.grade),
    `report must contain the grade "${audit.scoreCard.grade}"`);
});

test('renders the 12-dimension score table', () => {
  assert.match(html, /Scores by dimension/);
  assert.equal(audit.scoreCard.dimensions.length, 12, 'fixture has 12 dimensions');
  // Every dimension label should appear (HTML-escaped, e.g. "Layout & Spacing" -> "Layout &amp; Spacing").
  const escLabel = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  for (const dim of audit.scoreCard.dimensions) {
    assert.ok(html.includes(escLabel(dim.label)), `report must list dimension "${dim.label}"`);
  }
});

test('contains a known located selector (.hero-subtitle)', () => {
  const hit = audit.located.findings.find(
    (f) => f.evidence && f.evidence.selector === '.hero-subtitle'
  );
  assert.ok(hit, 'fixture should produce a .hero-subtitle finding');
  assert.ok(html.includes('.hero-subtitle'), 'report must render the .hero-subtitle selector');
});

test('contains a fix recommendation', () => {
  const withFix = audit.located.findings.find((f) => f.fix);
  assert.ok(withFix, 'fixture should produce at least one fix');
  assert.ok(html.includes('Fix'), 'report must label a Fix row');
  assert.ok(html.includes(withFix.fix.slice(0, 24)),
    'report must render the fix text');
});

test('renders before/after diff and citations for the fixture', () => {
  assert.match(html, /diff-before/, 'has a red before line');
  assert.match(html, /diff-after/, 'has a green after line');
  // Fixture findings cite WCAG SCs and laws.
  assert.match(html, /WCAG 1\.4\.3/, 'cites a WCAG success criterion');
  assert.match(html, /lawsofux\.com/, 'links a Law of UX citation');
});

test('escapes a "<" in an untrusted selector (XSS-safe)', () => {
  const malicious = {
    insufficientEvidence: false,
    duration: 1,
    files: { css: 1, jsx: 0, html: 0 },
    scoreCard: {
      overall: 5,
      grade: 'Below Average',
      generatedAt: '2026-05-29T00:00:00.000Z',
      dimensions: [],
    },
    located: {
      findings: [
        {
          id: 'x-0',
          dimension: 'color',
          severity: 'critical',
          title: 'XSS <img src=x onerror=alert(1)> attempt',
          description: 'desc',
          impact: 'impact',
          fix: 'fix it',
          before: '<script>evil()</script>',
          after: 'safe',
          evidence: {
            file: 'a.css',
            line: 1,
            selector: '.x"><script>alert(1)</script>',
            measured: '<bad>',
            threshold: '<ok>',
          },
        },
      ],
    },
  };
  const out = renderHtmlReport(malicious);

  // No live script anywhere in the output.
  assert.ok(!/<script/i.test(out), 'untrusted "<script>" must never appear unescaped');
  assert.ok(!out.includes('<img src=x onerror'), 'untrusted "<img" must be escaped');
  // The dangerous payload must be present only in escaped form.
  assert.ok(out.includes('&lt;script&gt;'), 'angle brackets must be escaped to entities');
  assert.ok(out.includes('.x&quot;&gt;&lt;script&gt;'),
    'the selector quote+bracket must be fully escaped');
});

test('handles the insufficientEvidence case', () => {
  const out = renderHtmlReport({
    insufficientEvidence: true,
    scoreCard: { overall: null, grade: null, dimensions: [] },
    located: { findings: [] },
  });
  assert.ok(out.startsWith('<!DOCTYPE html>'), 'still a full document');
  assert.ok(!/<script/i.test(out), 'still script-free');
  assert.match(out, /[Ii]nsufficient evidence/, 'shows the insufficient-evidence state');
  assert.ok(!/Scores by dimension/.test(out), 'does not render a score table when unscored');
});

test('does not throw on a minimal/empty audit result', () => {
  assert.doesNotThrow(() => renderHtmlReport({}));
  assert.doesNotThrow(() => renderHtmlReport(undefined));
  const out = renderHtmlReport({});
  assert.ok(out.startsWith('<!DOCTYPE html>'));
});
