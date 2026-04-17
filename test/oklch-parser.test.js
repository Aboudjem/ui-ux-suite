const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  parseOklch, oklchToRgb, oklchToHex, extractOklchColors,
} = require('../lib/oklch-parser');

describe('OKLCH Parser', () => {
  describe('parseOklch', () => {
    it('parses standard notation', () => {
      const result = parseOklch('oklch(0.62 0.19 185)');
      assert.ok(result);
      assert.equal(result.l, 0.62);
      assert.equal(result.c, 0.19);
      assert.equal(result.h, 185);
      assert.equal(result.alpha, 1);
    });

    it('parses percentage lightness', () => {
      const result = parseOklch('oklch(62% 0.19 185)');
      assert.ok(result);
      assert.equal(result.l, 0.62);
    });

    it('parses alpha', () => {
      const result = parseOklch('oklch(0.62 0.19 185 / 0.5)');
      assert.ok(result);
      assert.equal(result.alpha, 0.5);
    });

    it('returns null for invalid', () => {
      assert.equal(parseOklch('not-oklch'), null);
      assert.equal(parseOklch('rgb(255,0,0)'), null);
    });
  });

  describe('oklchToRgb', () => {
    it('converts to rgb', () => {
      const rgb = oklchToRgb('oklch(0.62 0.19 185)');
      assert.ok(rgb);
      assert.ok(rgb.r >= 0 && rgb.r <= 255);
      assert.ok(rgb.g >= 0 && rgb.g <= 255);
      assert.ok(rgb.b >= 0 && rgb.b <= 255);
    });

    it('white is close to 255,255,255', () => {
      const rgb = oklchToRgb('oklch(1 0 0)');
      assert.ok(rgb);
      assert.ok(rgb.r >= 254);
      assert.ok(rgb.g >= 254);
      assert.ok(rgb.b >= 254);
    });

    it('returns null for invalid', () => {
      assert.equal(oklchToRgb('invalid'), null);
    });
  });

  describe('oklchToHex', () => {
    it('converts to hex string', () => {
      const hex = oklchToHex('oklch(0.62 0.19 185)');
      assert.ok(hex);
      assert.ok(hex.startsWith('#'));
      assert.equal(hex.length, 7);
    });
  });

  describe('extractOklchColors', () => {
    it('extracts oklch values from CSS', () => {
      const css = `
        :root {
          --primary: oklch(0.62 0.19 185);
          --accent: oklch(0.75 0.15 280);
          color: #333;
        }
      `;
      const results = extractOklchColors(css);
      assert.equal(results.length, 2);
    });

    it('returns empty for no oklch', () => {
      assert.deepEqual(extractOklchColors('body { color: #333; }'), []);
    });
  });
});
