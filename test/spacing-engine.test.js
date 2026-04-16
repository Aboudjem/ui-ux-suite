const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  generateSpacingScale, parseSpacingValue, analyzeSpacingConsistency,
  detectGridSystem, extractBreakpoints, analyzeContainerWidths,
} = require('../lib/spacing-engine');

describe('Spacing Engine', () => {
  describe('generateSpacingScale', () => {
    it('generates scale from base unit', () => {
      const scale = generateSpacingScale(4, 10);
      assert.ok(scale.length > 0);
      assert.ok(scale.includes(0));
      assert.ok(scale.includes(4));
    });

    it('includes no duplicates', () => {
      const scale = generateSpacingScale(4, 16);
      const unique = [...new Set(scale)];
      assert.equal(scale.length, unique.length);
    });

    it('is sorted ascending', () => {
      const scale = generateSpacingScale(8, 12);
      for (let i = 1; i < scale.length; i++) {
        assert.ok(scale[i] >= scale[i - 1]);
      }
    });
  });

  describe('parseSpacingValue', () => {
    it('parses px values', () => {
      assert.equal(parseSpacingValue('16px'), 16);
      assert.equal(parseSpacingValue('4px'), 4);
    });

    it('converts rem to px', () => {
      assert.equal(parseSpacingValue('1rem'), 16);
      assert.equal(parseSpacingValue('0.5rem'), 8);
    });

    it('converts em to px', () => {
      assert.equal(parseSpacingValue('2em'), 32);
    });

    it('handles bare numbers', () => {
      assert.equal(parseSpacingValue('24'), 24);
    });

    it('returns null for invalid', () => {
      assert.equal(parseSpacingValue('auto'), null);
      assert.equal(parseSpacingValue(null), null);
    });
  });

  describe('analyzeSpacingConsistency', () => {
    it('detects consistent spacing', () => {
      const result = analyzeSpacingConsistency(['4px', '8px', '16px', '24px', '32px']);
      assert.equal(result.detectedBase, 4);
      assert.ok(result.baseScore > 80);
    });

    it('flags off-scale values', () => {
      const result = analyzeSpacingConsistency(['4px', '8px', '15px', '32px']);
      assert.ok(result.offScaleValues.length > 0);
    });

    it('handles empty input', () => {
      const result = analyzeSpacingConsistency([]);
      assert.equal(result.consistent, false);
    });
  });

  describe('detectGridSystem', () => {
    it('detects flexbox', () => {
      const result = detectGridSystem('div { display: flex; } nav { display: flex; }');
      assert.equal(result.primaryLayout, 'flexbox');
    });

    it('detects css-grid', () => {
      const css = 'main { display: grid; } section { display: grid; } aside { display: grid; }';
      const result = detectGridSystem(css);
      assert.equal(result.primaryLayout, 'css-grid');
    });

    it('detects container queries', () => {
      const result = detectGridSystem('@container (min-width: 400px) { .card { grid-template-columns: 1fr 1fr; } }');
      assert.ok(result.hasContainerQueries);
    });
  });

  describe('extractBreakpoints', () => {
    it('extracts media query breakpoints', () => {
      const css = '@media (min-width: 768px) { } @media (min-width: 1024px) { } @media (max-width: 640px) { }';
      const bps = extractBreakpoints(css);
      assert.ok(bps.includes(768));
      assert.ok(bps.includes(1024));
      assert.ok(bps.includes(640));
    });

    it('converts rem breakpoints', () => {
      const css = '@media (min-width: 48rem) { }';
      const bps = extractBreakpoints(css);
      assert.ok(bps.includes(768));
    });
  });

  describe('analyzeContainerWidths', () => {
    it('extracts max-width values', () => {
      const css = '.container { max-width: 1200px; } .narrow { max-width: 680px; }';
      const result = analyzeContainerWidths(css);
      assert.ok(result.widths.includes(1200));
      assert.ok(result.widths.includes(680));
    });

    it('flags missing max-width', () => {
      const result = analyzeContainerWidths('body { margin: 0; }');
      assert.ok(result.issues.length > 0);
    });
  });
});
