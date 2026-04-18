const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { extractThemeBlocks, extractThemeTokens, detectTailwindV4Theme } = require('../lib/theme-parser');

describe('theme-parser', () => {
  describe('extractThemeBlocks', () => {
    it('returns empty for null/empty input', () => {
      assert.deepEqual(extractThemeBlocks(''), []);
      assert.deepEqual(extractThemeBlocks(null), []);
      assert.deepEqual(extractThemeBlocks(undefined), []);
    });

    it('parses a single default @theme block', () => {
      const css = `
        @theme {
          --color-primary: oklch(0.6 0.2 250);
          --color-destructive: #dc2626;
          --radius-md: 0.5rem;
        }
      `;
      const blocks = extractThemeBlocks(css);
      assert.equal(blocks.length, 1);
      assert.equal(blocks[0].variant, 'default');
      assert.equal(blocks[0].declarations['--color-primary'], 'oklch(0.6 0.2 250)');
      assert.equal(blocks[0].declarations['--color-destructive'], '#dc2626');
      assert.equal(blocks[0].declarations['--radius-md'], '0.5rem');
    });

    it('distinguishes @theme inline from @theme default', () => {
      const css = `
        @theme {
          --color-primary: oklch(0.6 0.2 250);
        }
        @theme inline {
          --font-sans: Geist, system-ui, sans-serif;
        }
      `;
      const blocks = extractThemeBlocks(css);
      assert.equal(blocks.length, 2);
      const variants = blocks.map(b => b.variant).sort();
      assert.deepEqual(variants, ['default', 'inline']);
    });

    it('ignores @theme tokens inside strings and comments', () => {
      const css = `
        /* @theme { --x: 1 } */
        .foo::before { content: '@theme { --y: 2 }'; }
        @theme {
          --real: true;
        }
      `;
      const blocks = extractThemeBlocks(css);
      assert.equal(blocks.length, 1);
      assert.equal(blocks[0].declarations['--real'], 'true');
      assert.ok(!('--x' in blocks[0].declarations));
      assert.ok(!('--y' in blocks[0].declarations));
    });

    it('handles nested function calls with braces-like syntax', () => {
      const css = `
        @theme {
          --font-size-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
          --shadow-md: 0 4px 6px rgb(0 0 0 / 0.1), 0 2px 4px rgb(0 0 0 / 0.06);
        }
      `;
      const blocks = extractThemeBlocks(css);
      assert.equal(blocks.length, 1);
      assert.ok(blocks[0].declarations['--font-size-lg'].includes('clamp'));
      assert.ok(blocks[0].declarations['--shadow-md'].includes('rgb(0 0 0 / 0.1)'));
    });

    it('skips declarations that are not CSS custom properties', () => {
      const css = `
        @theme {
          --color: red;
          color: blue;
          --another: 1;
        }
      `;
      const blocks = extractThemeBlocks(css);
      assert.equal(Object.keys(blocks[0].declarations).length, 2);
      assert.ok('--color' in blocks[0].declarations);
      assert.ok(!('color' in blocks[0].declarations));
    });
  });

  describe('extractThemeTokens', () => {
    it('categorizes tokens by Tailwind v4 naming convention', () => {
      const css = `
        @theme {
          --color-primary: oklch(0.6 0.2 250);
          --color-muted: #e5e5e5;
          --font-sans: Inter;
          --font-size-xs: 0.75rem;
          --font-weight-bold: 700;
          --radius-md: 0.5rem;
          --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
          --spacing-4: 1rem;
          --breakpoint-md: 48rem;
          --custom-thing: hello;
        }
      `;
      const t = extractThemeTokens(css);
      assert.equal(t.blocks, 1);
      assert.equal(t.hasDefault, true);
      assert.equal(t.hasInline, false);
      assert.equal(t.counts.colors, 2);
      assert.equal(t.counts.fonts, 1);
      assert.equal(t.counts.fontSizes, 1);
      assert.equal(t.counts.fontWeights, 1);
      assert.equal(t.counts.radii, 1);
      assert.equal(t.counts.shadows, 1);
      assert.equal(t.counts.spacing, 1);
      assert.equal(t.counts.breakpoints, 1);
      assert.equal(t.counts.other, 1);
      assert.equal(t.total, 10);
    });

    it('returns zero counts for CSS without @theme', () => {
      const css = ':root { --color-primary: red; }';
      const t = extractThemeTokens(css);
      assert.equal(t.blocks, 0);
      assert.equal(t.total, 0);
    });
  });

  describe('detectTailwindV4Theme', () => {
    it('detects @import tailwindcss (v4 flag)', () => {
      assert.equal(detectTailwindV4Theme('@import "tailwindcss";'), true);
      assert.equal(detectTailwindV4Theme("@import 'tailwindcss';"), true);
    });

    it('detects @theme block (v4 flag)', () => {
      assert.equal(detectTailwindV4Theme('@theme { --x: 1 }'), true);
    });

    it('returns false for v3 directives', () => {
      assert.equal(detectTailwindV4Theme('@tailwind base; @tailwind components; @tailwind utilities;'), false);
    });

    it('returns false for empty/null', () => {
      assert.equal(detectTailwindV4Theme(''), false);
      assert.equal(detectTailwindV4Theme(null), false);
    });
  });
});
