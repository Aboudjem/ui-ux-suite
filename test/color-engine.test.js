const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  relativeLuminance, contrastRatio, wcagLevel,
  apcaContrast, apcaLevel,
  deltaE, findNearDuplicates,
  generateNeutralScale, generateSemanticColor,
  generateDarkSurfaces, generateLightSurfaces,
} = require('../lib/color-engine');

describe('Color Engine', () => {
  describe('hexToRgb', () => {
    it('parses 6-digit hex', () => {
      assert.deepEqual(hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 });
      assert.deepEqual(hexToRgb('#000000'), { r: 0, g: 0, b: 0 });
      assert.deepEqual(hexToRgb('#ffffff'), { r: 255, g: 255, b: 255 });
    });

    it('parses 3-digit hex', () => {
      assert.deepEqual(hexToRgb('#f00'), { r: 255, g: 0, b: 0 });
      assert.deepEqual(hexToRgb('#fff'), { r: 255, g: 255, b: 255 });
    });

    it('handles without hash', () => {
      assert.deepEqual(hexToRgb('ff0000'), { r: 255, g: 0, b: 0 });
    });
  });

  describe('rgbToHex', () => {
    it('converts rgb to hex', () => {
      assert.equal(rgbToHex(255, 0, 0), '#ff0000');
      assert.equal(rgbToHex(0, 0, 0), '#000000');
      assert.equal(rgbToHex(255, 255, 255), '#ffffff');
    });
  });

  describe('rgbToHsl / hslToRgb roundtrip', () => {
    it('pure red', () => {
      const hsl = rgbToHsl(255, 0, 0);
      assert.equal(hsl.h, 0);
      assert.equal(hsl.s, 100);
      assert.equal(hsl.l, 50);
    });

    it('roundtrips through hsl', () => {
      const colors = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 128, b: 0 },
        { r: 0, g: 0, b: 255 },
      ];
      for (const c of colors) {
        const hsl = rgbToHsl(c.r, c.g, c.b);
        const back = hslToRgb(hsl.h, hsl.s, hsl.l);
        assert.ok(Math.abs(back.r - c.r) <= 1, `Red: expected ${c.r}, got ${back.r}`);
        assert.ok(Math.abs(back.g - c.g) <= 1, `Green: expected ${c.g}, got ${back.g}`);
        assert.ok(Math.abs(back.b - c.b) <= 1, `Blue: expected ${c.b}, got ${back.b}`);
      }
    });
  });

  describe('contrastRatio', () => {
    it('black on white is 21:1', () => {
      const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      assert.ok(ratio >= 20.9 && ratio <= 21.1, `Expected ~21, got ${ratio}`);
    });

    it('white on white is 1:1', () => {
      const ratio = contrastRatio({ r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 255 });
      assert.equal(ratio, 1);
    });
  });

  describe('wcagLevel', () => {
    it('grades contrast ratios correctly', () => {
      assert.equal(wcagLevel(21, false), 'AAA');
      assert.equal(wcagLevel(4.5, false), 'AA');
      assert.equal(wcagLevel(3, false), 'FAIL');
      assert.equal(wcagLevel(3, true), 'AA');   // large text
      assert.equal(wcagLevel(4.5, true), 'AAA'); // large text
    });
  });

  describe('apcaContrast', () => {
    it('returns high contrast for black on white', () => {
      const lc = apcaContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      assert.ok(Math.abs(lc) > 100, `Expected high APCA Lc, got ${lc}`);
    });

    it('returns 0 for same color', () => {
      const lc = apcaContrast({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      assert.equal(lc, 0);
    });
  });

  describe('apcaLevel', () => {
    it('categorizes APCA levels', () => {
      assert.ok(apcaLevel(95).includes('body'));
      assert.ok(apcaLevel(60).includes('Large'));
      assert.ok(apcaLevel(10).includes('Invisible'));
    });
  });

  describe('deltaE', () => {
    it('returns 0 for identical colors', () => {
      assert.equal(deltaE({ r: 100, g: 100, b: 100 }, { r: 100, g: 100, b: 100 }), 0);
    });

    it('returns positive for different colors', () => {
      const d = deltaE({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 });
      assert.ok(d > 0);
    });
  });

  describe('findNearDuplicates', () => {
    it('finds similar colors', () => {
      const colors = [
        { hex: '#ff0000', rgb: { r: 255, g: 0, b: 0 } },
        { hex: '#fe0102', rgb: { r: 254, g: 1, b: 2 } },
        { hex: '#0000ff', rgb: { r: 0, g: 0, b: 255 } },
      ];
      const dupes = findNearDuplicates(colors);
      assert.ok(dupes.length >= 1, 'Should find red/near-red as duplicates');
      assert.equal(dupes[0].color1.hex, '#ff0000');
    });

    it('returns empty for distinct colors', () => {
      const colors = [
        { hex: '#ff0000', rgb: { r: 255, g: 0, b: 0 } },
        { hex: '#0000ff', rgb: { r: 0, g: 0, b: 255 } },
      ];
      assert.equal(findNearDuplicates(colors).length, 0);
    });
  });

  describe('palette generation', () => {
    it('generates neutral scale with correct step count', () => {
      const scale = generateNeutralScale(220, 5);
      assert.equal(scale.length, 11);
      assert.ok(scale[0].hex.startsWith('#'));
    });

    it('generates semantic colors', () => {
      const success = generateSemanticColor(145, 'success');
      assert.ok(success.base.startsWith('#'));
      assert.ok(success.light.startsWith('#'));
      assert.ok(success.dark.startsWith('#'));
    });

    it('generates dark surfaces', () => {
      const surfaces = generateDarkSurfaces(220);
      assert.ok(surfaces.background);
      assert.ok(surfaces.surface);
      assert.ok(surfaces.elevated);
      assert.ok(surfaces.overlay);
    });

    it('generates light surfaces', () => {
      const surfaces = generateLightSurfaces();
      assert.equal(surfaces.background, '#ffffff');
    });
  });
});
