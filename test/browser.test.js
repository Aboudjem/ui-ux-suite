const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { probePeerDeps, runBrowserAudit, resetCachedProbe } = require('../lib/browser');

describe('browser — optional peer-deps contract', () => {
  before(() => { resetCachedProbe(); });

  it('probePeerDeps returns PLAYWRIGHT_MISSING when peer deps are not installed', async () => {
    resetCachedProbe();
    const r = await probePeerDeps();
    if (r.ok) {
      // Running in a dev environment where peer deps ARE installed — acceptable, skip.
      return;
    }
    assert.equal(r.ok, false);
    assert.equal(r.code, 'PLAYWRIGHT_MISSING');
    assert.ok(r.message.includes('playwright-core'));
    assert.ok(r.message.includes('@axe-core/playwright'));
    assert.ok(r.message.includes('npx playwright install chromium'));
  });

  it('runBrowserAudit returns NO_BASE_URL when baseUrl is missing', async () => {
    const r = await runBrowserAudit();
    assert.equal(r.ok, false);
    assert.equal(r.code, 'NO_BASE_URL');
  });

  it('runBrowserAudit returns PLAYWRIGHT_MISSING when peer deps absent', async () => {
    resetCachedProbe();
    const r = await runBrowserAudit('http://localhost:65534');
    if (r.ok) return; // peer deps present; skip
    assert.equal(r.ok, false);
    assert.ok(['PLAYWRIGHT_MISSING', 'BROWSER_LAUNCH_FAILED'].includes(r.code));
    if (r.code === 'PLAYWRIGHT_MISSING') {
      assert.ok(r.message.includes('npm i -D'));
    }
  });
});

describe('uiux_audit_run with depth=deep but missing peer deps', () => {
  const { TOOLS } = require('../lib/mcp-server');
  const AUDIT = TOOLS.find(t => t.name === 'uiux_audit_run');

  it('falls back to quick analysis and surfaces PLAYWRIGHT_MISSING warning', async () => {
    resetCachedProbe();
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'uiux-deep-'));
    try {
      fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ name: 'x', dependencies: { react: '19.0.0' } }));
      fs.writeFileSync(path.join(fixture, 'globals.css'), ':root { --color-primary: red; }');

      const r = await AUDIT.handler({ projectPath: fixture, depth: 'deep', baseUrl: 'http://localhost:65534' });
      assert.equal(r.success, true, 'static audit should still succeed even if browser mode fails');
      assert.ok(Array.isArray(r.warnings));

      const probe = await probePeerDeps();
      if (!probe.ok) {
        const hasMissing = r.warnings.some(w => w.includes('PLAYWRIGHT_MISSING') || w.includes('Install hint'));
        assert.ok(hasMissing, 'should warn about missing peer deps when they are not installed');
      }
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });
});
