const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  detectStyling,
  detectAnimationLib,
  detectIconLib,
  detectThemeSystemDetails,
  detectFramework,
  detectComponentLib,
} = require('../lib/extractors');
const { TOOLS } = require('../lib/mcp-server');

const SCAN_TOOL = TOOLS.find(t => t.name === 'uiux_scan_project');

describe('detectStyling (v3 vs v4)', () => {
  it('returns tailwind-v4 when tailwindcss dep is ^4.x', () => {
    assert.equal(detectStyling({ dependencies: { tailwindcss: '^4.0.0' } }), 'tailwind-v4');
    assert.equal(detectStyling({ devDependencies: { tailwindcss: '4.1.2' } }), 'tailwind-v4');
  });

  it('returns tailwind-v3 when tailwindcss dep is ^3.x', () => {
    assert.equal(detectStyling({ dependencies: { tailwindcss: '^3.4.0' } }), 'tailwind-v3');
    assert.equal(detectStyling({ devDependencies: { tailwindcss: '3.3.5' } }), 'tailwind-v3');
  });

  it('detects panda-css, vanilla-extract, styled-components, emotion, stitches', () => {
    assert.equal(detectStyling({ dependencies: { '@pandacss/dev': '1.0.0' } }), 'panda-css');
    assert.equal(detectStyling({ dependencies: { '@vanilla-extract/css': '1.0.0' } }), 'vanilla-extract');
    assert.equal(detectStyling({ dependencies: { 'styled-components': '6.0.0' } }), 'styled-components');
    assert.equal(detectStyling({ dependencies: { '@emotion/react': '11.0.0' } }), 'emotion');
    assert.equal(detectStyling({ dependencies: { '@stitches/react': '1.0.0' } }), 'stitches');
  });

  it('returns null for empty packageJson', () => {
    assert.equal(detectStyling(null), null);
  });
});

describe('detectAnimationLib', () => {
  it('detects motion and legacy framer-motion', () => {
    assert.deepEqual(detectAnimationLib({ dependencies: { motion: '11.0.0' } }), ['motion']);
    assert.deepEqual(detectAnimationLib({ dependencies: { 'framer-motion': '10.0.0' } }), ['motion']);
  });

  it('detects multiple libs at once', () => {
    const result = detectAnimationLib({
      dependencies: { motion: '11.0.0', 'tailwindcss-animate': '1.0.0', '@formkit/auto-animate': '1.0.0' },
    });
    assert.ok(result.includes('motion'));
    assert.ok(result.includes('tailwindcss-animate'));
    assert.ok(result.includes('auto-animate'));
  });

  it('returns null when no animation lib is present', () => {
    assert.equal(detectAnimationLib({ dependencies: { react: '18.0.0' } }), null);
    assert.equal(detectAnimationLib(null), null);
  });
});

describe('detectIconLib', () => {
  it('detects lucide-react, heroicons, phosphor, react-icons, radix-icons, tabler', () => {
    assert.deepEqual(detectIconLib({ dependencies: { 'lucide-react': '0.400.0' } }), ['lucide-react']);
    assert.deepEqual(detectIconLib({ dependencies: { '@heroicons/react': '2.0.0' } }), ['heroicons']);
    assert.deepEqual(detectIconLib({ dependencies: { '@phosphor-icons/react': '2.0.0' } }), ['phosphor-icons']);
    assert.deepEqual(detectIconLib({ dependencies: { 'react-icons': '5.0.0' } }), ['react-icons']);
    assert.deepEqual(detectIconLib({ dependencies: { '@radix-ui/react-icons': '1.0.0' } }), ['radix-icons']);
    assert.deepEqual(detectIconLib({ dependencies: { '@tabler/icons-react': '3.0.0' } }), ['tabler-icons']);
  });

  it('returns null when no icon lib is present', () => {
    assert.equal(detectIconLib({ dependencies: { react: '18.0.0' } }), null);
  });
});

describe('detectThemeSystemDetails', () => {
  it('returns tailwind-v4-theme when CSS contains @theme', () => {
    const r = detectThemeSystemDetails({ dependencies: {} }, '@theme { --x: 1 }');
    assert.equal(r.system, 'tailwind-v4-theme');
  });

  it('returns css-vars when CSS has :root { --x: 1 } but no @theme', () => {
    const r = detectThemeSystemDetails({ dependencies: {} }, ':root { --color-primary: red; }');
    assert.equal(r.system, 'css-vars');
  });

  it('returns next-themes when package.json has next-themes and CSS is empty', () => {
    const r = detectThemeSystemDetails({ dependencies: { 'next-themes': '0.4.0' } }, '');
    assert.equal(r.system, 'next-themes');
  });

  it('collects multiple theme signals', () => {
    const r = detectThemeSystemDetails({
      dependencies: {
        'next-themes': '0.4.0',
        'class-variance-authority': '0.7.0',
        'tailwind-merge': '2.0.0',
        clsx: '2.0.0',
        cmdk: '1.0.0',
      },
    }, '');
    assert.ok(r.signals.includes('next-themes'));
    assert.ok(r.signals.includes('class-variance-authority'));
    assert.ok(r.signals.includes('tailwind-merge'));
    assert.ok(r.signals.includes('class-util'));
    assert.ok(r.signals.includes('cmdk'));
  });
});

describe('uiux_scan_project diagnostics', () => {
  let fixture;
  before(() => {
    fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-scan-'));
  });
  after(() => { fs.rmSync(fixture, { recursive: true, force: true }); });

  it('fails loudly when projectPath does not exist', async () => {
    const r = await SCAN_TOOL.handler({ projectPath: '/nope/nope/nope-xyz' });
    assert.equal(r.success, false);
    assert.ok(r.error.includes('not found'));
    assert.ok(r.hint);
  });

  it('fails loudly when projectPath is omitted', async () => {
    const r = await SCAN_TOOL.handler({});
    assert.equal(r.success, false);
    assert.ok(r.error);
  });

  it('emits no-package-json diagnostic on a dir without package.json', async () => {
    const r = await SCAN_TOOL.handler({ projectPath: fixture });
    assert.equal(r.success, true);
    assert.ok(Array.isArray(r.diagnostics));
    assert.ok(r.diagnostics.some(d => d.code === 'no-package-json'));
  });

  it('detects shadcn/ui via components.json and flags tailwind-v4 via @theme', async () => {
    const project = fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-scan-shadcn-'));
    try {
      fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({
        name: 'x',
        dependencies: {
          next: '16.0.0',
          'next-themes': '0.4.0',
          'class-variance-authority': '0.7.0',
          'lucide-react': '0.400.0',
          motion: '11.0.0',
        },
        devDependencies: { tailwindcss: '^4.0.0' },
      }));
      fs.writeFileSync(path.join(project, 'components.json'), JSON.stringify({ style: 'default' }));
      fs.writeFileSync(path.join(project, 'globals.css'),
        '@import "tailwindcss";\n@theme inline { --font-sans: Inter; --color-primary: oklch(0.6 0.2 250); }');

      const r = await SCAN_TOOL.handler({ projectPath: project });
      assert.equal(r.success, true);
      assert.equal(r.profile.framework, 'next');
      assert.equal(r.profile.styling, 'tailwind-v4');
      assert.equal(r.profile.componentLib, 'shadcn/ui');
      assert.equal(r.profile.isTailwindV4, true);
      assert.equal(r.profile.themeSystem, 'tailwind-v4-theme');
      assert.deepEqual(r.profile.iconLib, ['lucide-react']);
      assert.deepEqual(r.profile.animationLib, ['motion']);
      assert.ok(r.profile.themeSignals.includes('next-themes'));
      assert.ok(r.profile.themeSignals.includes('class-variance-authority'));
      assert.equal(r.profile.hasDesignTokens, true);
      assert.equal(r.profile.tailwindV4Theme.blocks, 1);
      assert.equal(r.profile.tailwindV4Theme.hasInline, true);
      assert.ok(r.profile.tailwindV4Theme.totalTokens >= 2);
      assert.equal(r.filesScanned.css, 1);
    } finally {
      fs.rmSync(project, { recursive: true, force: true });
    }
  });
});
