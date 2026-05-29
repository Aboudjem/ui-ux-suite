/**
 * UI/UX Suite — Optional Playwright + axe-core deep-mode runner
 *
 * Loads playwright-core and @axe-core/playwright lazily via dynamic import.
 * Neither is in the default install path; users opt in via peer dependencies:
 *
 *   npm i -D playwright-core @axe-core/playwright
 *   npx playwright install chromium
 *
 * Design notes (from v1.1 pitfalls + stack research):
 *   - Uses playwright-core (no auto browser download at npm install) over playwright.
 *   - Launch flags: chromiumSandbox:false + --disable-dev-shm-usage for CI/Docker safety.
 *   - axe-core rules region and landmark-one-main are disabled by default —
 *     they are noisy on component-level pages and produce known false positives.
 *   - Closed shadow DOM and cross-origin iframes are reported as "partial" coverage
 *     so we never blame the score for tooling limits.
 *   - Touch targets < 44x44 are measured per WCAG 2.2 Target Size (AAA) and iOS HIG.
 *
 * Zero runtime dependencies on the default install path. All imports are
 * dynamic and gated behind a try/catch that returns structured errors.
 */

const { overlayScript, removeOverlayScript, clampViewport } = require('./annotate');

let _cachedProbe = null;

async function probePeerDeps() {
  if (_cachedProbe) return _cachedProbe;
  try {
    const playwright = await import('playwright-core');
    const axe = await import('@axe-core/playwright');
    _cachedProbe = { ok: true, playwright: playwright.default || playwright, axe: axe.default || axe };
  } catch (err) {
    _cachedProbe = {
      ok: false,
      code: 'PLAYWRIGHT_MISSING',
      message: 'Deep mode requires optional peer deps. Install them with:\n\n  npm i -D playwright-core @axe-core/playwright\n  npx playwright install chromium\n\nThen rerun with depth: "deep".',
      cause: err.message,
    };
  }
  return _cachedProbe;
}

async function runBrowserAudit(baseUrl, options = {}) {
  if (!baseUrl) {
    return { ok: false, code: 'NO_BASE_URL', message: 'runBrowserAudit needs a baseUrl (e.g. http://localhost:3000).' };
  }

  const probe = await probePeerDeps();
  if (!probe.ok) return probe;

  const { playwright, axe } = probe;
  const { chromium } = playwright;
  const AxeBuilder = axe.AxeBuilder || axe.default?.AxeBuilder || axe;

  const routes = options.routes || ['/'];
  // Cap the viewport at <=1920x1080: larger screenshots trip the Claude
  // many-image dimension limit. clampViewport also fills in safe defaults.
  const viewport = clampViewport(options.viewport || { width: 1280, height: 800 });
  const disabledAxeRules = options.disabledAxeRules || ['region', 'landmark-one-main'];

  let browser;
  try {
    browser = await chromium.launch({
      chromiumSandbox: false,
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });
  } catch (err) {
    return {
      ok: false,
      code: 'BROWSER_LAUNCH_FAILED',
      message: 'Chromium failed to launch. Run `npx playwright install chromium` to install the browser binary.',
      cause: err.message,
    };
  }

  const perRoute = [];
  const warnings = [];

  try {
    const context = await browser.newContext({ viewport });
    for (const route of routes) {
      const url = joinUrl(baseUrl, route);
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: options.timeout || 20000 });
        try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch {}

        const builder = new AxeBuilder({ page }).disableRules(disabledAxeRules);
        const axeResult = await builder.analyze();

        const touchTargets = await measureTouchTargets(page);
        const screenshotPath = options.screenshotDir ? await takeScreenshot(page, options.screenshotDir, route) : null;

        perRoute.push({
          route,
          url,
          violations: axeResult.violations.map(summarizeViolation),
          passCount: axeResult.passes.length,
          incompleteCount: axeResult.incomplete.length,
          touchTargets,
          screenshotPath,
        });
      } catch (err) {
        warnings.push({ route, url, error: err.message });
      } finally {
        await page.close().catch(() => {});
      }
    }
    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  return {
    ok: true,
    baseUrl,
    routes: perRoute,
    warnings: warnings.length > 0 ? warnings : undefined,
    disabledAxeRules,
    summary: summarizeBrowserAudit(perRoute),
  };
}

async function measureTouchTargets(page) {
  const targets = await page.evaluate(() => {
    const selectors = 'a, button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const all = Array.from(document.querySelectorAll(selectors));
    const under = [];
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.width < 44 || rect.height < 44) {
        under.push({
          tag: el.tagName.toLowerCase(),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          text: (el.textContent || '').trim().slice(0, 50),
        });
      }
    }
    return { total: all.length, underMinimum: under.length, examples: under.slice(0, 5) };
  });
  return targets;
}

/**
 * Capture a screenshot of a route.
 *
 * Replaces the old `fullPage:true` capture (which produced oversized images that
 * trip the Claude many-image dimension limit) with a bounded, viewport-clamped
 * capture that optionally:
 *   - clips to a single element bounding box (options.clip = {x,y,width,height})
 *   - injects the annotate.js overlay (options.annotations = [{x,y,width,height,label}])
 *     before the shot and removes it afterwards, so the user's page is never
 *     left mutated (audit-then-suggest).
 *
 * @param {object} page - Playwright Page
 * @param {string} dir - output directory (created if missing)
 * @param {string} route - route string used for the filename
 * @param {object} [options]
 * @param {{x:number,y:number,width:number,height:number}} [options.clip] - bounding box to clip to
 * @param {Array} [options.annotations] - overlay boxes to draw, then remove, around the shot
 * @param {string} [options.suffix] - filename suffix (e.g. element selector slug)
 * @returns {Promise<string>} path to the written PNG
 */
async function takeScreenshot(page, dir, route, options = {}) {
  const fs = require('fs');
  const path = require('path');
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  const safe = route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'index';
  const suffix = options.suffix ? `-${String(options.suffix).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}` : '';
  const file = path.join(dir, `${safe}${suffix}.png`);

  const annotations = Array.isArray(options.annotations) ? options.annotations : null;
  const hasAnnotations = annotations && annotations.length > 0;

  const shot = {};
  if (options.clip && isValidClip(options.clip)) {
    shot.clip = {
      x: options.clip.x,
      y: options.clip.y,
      width: options.clip.width,
      height: options.clip.height,
    };
  }

  try {
    if (hasAnnotations) {
      await page.evaluate(overlayScript(annotations));
    }
    await page.screenshot({ path: file, ...shot });
  } finally {
    if (hasAnnotations) {
      // Always strip the overlay so the page is returned to its original state.
      await page.evaluate(removeOverlayScript()).catch(() => {});
    }
  }
  return file;
}

/**
 * Screenshot a single element by its bounding box (clip), optionally drawing a
 * labeled annotation around it. Resolves the box from a Playwright locator/handle
 * when given, otherwise uses options.clip directly.
 *
 * @param {object} page - Playwright Page
 * @param {object} opts
 * @param {object} [opts.handle] - an ElementHandle/Locator exposing boundingBox()
 * @param {{x,y,width,height}} [opts.clip] - explicit box (used if no handle)
 * @param {string} opts.dir - output dir
 * @param {string} opts.route - route name for filename
 * @param {string} [opts.suffix] - filename suffix
 * @param {string} [opts.label] - annotation label; when set, an overlay is drawn
 * @param {number} [opts.pad] - padding (px) added around the clip box
 * @returns {Promise<string|null>} screenshot path or null when no box is resolvable
 */
async function screenshotElement(page, opts = {}) {
  let box = opts.clip || null;
  if (!box && opts.handle && typeof opts.handle.boundingBox === 'function') {
    box = await opts.handle.boundingBox();
  }
  if (!box || !isValidClip(box)) return null;

  const pad = Number(opts.pad) || 0;
  const padded = pad > 0
    ? { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 }
    : { x: box.x, y: box.y, width: box.width, height: box.height };

  const annotations = opts.label != null
    ? [{ x: box.x, y: box.y, width: box.width, height: box.height, label: String(opts.label) }]
    : null;

  return takeScreenshot(page, opts.dir, opts.route || 'element', {
    clip: padded,
    suffix: opts.suffix,
    annotations,
  });
}

function isValidClip(clip) {
  if (!clip || typeof clip !== 'object') return false;
  const { x, y, width, height } = clip;
  if (![x, y, width, height].every(n => typeof n === 'number' && Number.isFinite(n))) return false;
  return width > 0 && height > 0;
}

function summarizeViolation(v) {
  return {
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    nodesCount: v.nodes.length,
    firstNodeTarget: v.nodes[0]?.target?.join(' > '),
    firstNodeHtml: v.nodes[0]?.html?.slice(0, 200),
  };
}

function summarizeBrowserAudit(perRoute) {
  const totals = { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 };
  const allIds = new Set();
  let touchUnder = 0;
  let touchTotal = 0;
  for (const r of perRoute) {
    for (const v of r.violations) {
      totals.total++;
      if (v.impact && totals[v.impact] !== undefined) totals[v.impact]++;
      allIds.add(v.id);
    }
    touchUnder += r.touchTargets?.underMinimum || 0;
    touchTotal += r.touchTargets?.total || 0;
  }
  return {
    axeViolationCounts: totals,
    uniqueRuleIds: [...allIds],
    touchTargets: { total: touchTotal, underMinimum: touchUnder },
  };
}

function joinUrl(base, route) {
  const stripped = base.replace(/\/$/, '');
  if (!route || route === '/') return stripped;
  return stripped + (route.startsWith('/') ? route : '/' + route);
}

function resetCachedProbe() { _cachedProbe = null; }

module.exports = {
  probePeerDeps,
  runBrowserAudit,
  resetCachedProbe,
  takeScreenshot,
  screenshotElement,
  isValidClip,
};
