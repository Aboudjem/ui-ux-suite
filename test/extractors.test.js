const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  extractColorsFromCSS, extractColorsFromTailwindConfig,
  extractTypographyFromCSS, extractSpacingFromCSS,
  extractBorderRadiusFromCSS, extractShadowsFromCSS,
  detectFramework, detectStyling, detectComponentLib,
} = require('../lib/extractors');

describe('Extractors', () => {
  describe('extractColorsFromCSS', () => {
    it('extracts hex colors', () => {
      const css = 'body { color: #333333; background: #ffffff; }';
      const { colors } = extractColorsFromCSS(css);
      const hexColors = colors.filter(c => c.type === 'hex');
      assert.ok(hexColors.length >= 2);
    });

    it('extracts CSS variable definitions', () => {
      const css = ':root { --primary: #3b82f6; --secondary: #64748b; }';
      const { varDefs } = extractColorsFromCSS(css);
      assert.equal(varDefs['--primary'], '#3b82f6');
      assert.equal(varDefs['--secondary'], '#64748b');
    });

    it('extracts rgb colors', () => {
      const css = 'div { color: rgb(255, 0, 0); background: rgba(0, 0, 0, 0.5); }';
      const { colors } = extractColorsFromCSS(css);
      const rgbColors = colors.filter(c => c.type === 'rgb');
      assert.ok(rgbColors.length >= 2);
    });

    it('extracts oklch colors', () => {
      const css = 'div { color: oklch(0.62 0.19 185); }';
      const { colors } = extractColorsFromCSS(css);
      const oklchColors = colors.filter(c => c.type === 'oklch');
      assert.ok(oklchColors.length >= 1);
    });
  });

  describe('extractColorsFromTailwindConfig', () => {
    it('extracts color definitions from tailwind config', () => {
      const config = `module.exports = {
        theme: {
          colors: {
            'primary': '#3b82f6',
            'secondary': '#64748b',
          }
        }
      }`;
      const colors = extractColorsFromTailwindConfig(config);
      assert.ok(colors.length >= 2);
      assert.equal(colors[0].source, 'tailwind-config');
    });
  });

  describe('extractTypographyFromCSS', () => {
    it('extracts font families, sizes, weights', () => {
      const css = `
        body { font-family: Inter, sans-serif; font-size: 16px; font-weight: 400; line-height: 1.5; }
        h1 { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; letter-spacing: -0.02em; }
      `;
      const result = extractTypographyFromCSS(css);
      assert.ok(result.fonts.length >= 2);
      assert.ok(result.sizes.length >= 2);
      assert.ok(result.weights.length >= 2);
      assert.ok(result.lineHeights.length >= 1);
      assert.ok(result.letterSpacings.length >= 1);
    });
  });

  describe('extractSpacingFromCSS', () => {
    it('extracts spacing values', () => {
      const css = 'div { padding: 16px; margin: 8px 12px; gap: 24px; }';
      const spacings = extractSpacingFromCSS(css);
      assert.ok(spacings.length >= 3);
    });
  });

  describe('extractBorderRadiusFromCSS', () => {
    it('extracts border-radius values', () => {
      const css = '.btn { border-radius: 8px; } .card { border-radius: 12px; }';
      const radii = extractBorderRadiusFromCSS(css);
      assert.ok(radii.length >= 2);
    });
  });

  describe('extractShadowsFromCSS', () => {
    it('extracts box-shadow values', () => {
      const css = '.card { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }';
      const shadows = extractShadowsFromCSS(css);
      assert.ok(shadows.length >= 1);
    });
  });

  describe('detectFramework', () => {
    it('detects Next.js', () => {
      assert.equal(detectFramework({ dependencies: { next: '14.0.0', react: '18.0.0' } }), 'next');
    });

    it('detects React', () => {
      assert.equal(detectFramework({ dependencies: { react: '18.0.0' } }), 'react');
    });

    it('detects Vue', () => {
      assert.equal(detectFramework({ dependencies: { vue: '3.0.0' } }), 'vue');
    });

    it('detects Angular', () => {
      assert.equal(detectFramework({ dependencies: { '@angular/core': '17.0.0' } }), 'angular');
    });

    it('detects Svelte', () => {
      assert.equal(detectFramework({ dependencies: { svelte: '4.0.0' } }), 'svelte');
    });

    it('returns vanilla for unknown', () => {
      assert.equal(detectFramework({ dependencies: {} }), 'vanilla');
    });

    it('returns null for no package.json', () => {
      assert.equal(detectFramework(null), null);
    });
  });

  describe('detectComponentLib', () => {
    it('detects MUI', () => {
      assert.equal(detectComponentLib({ dependencies: { '@mui/material': '5.0.0' } }), 'mui');
    });

    it('detects Chakra', () => {
      assert.equal(detectComponentLib({ dependencies: { '@chakra-ui/react': '2.0.0' } }), 'chakra');
    });

    it('detects Radix', () => {
      assert.equal(detectComponentLib({ dependencies: { '@radix-ui/react-dialog': '1.0.0' } }), 'radix');
    });

    it('returns null for none', () => {
      assert.equal(detectComponentLib({ dependencies: {} }), null);
    });
  });
});
