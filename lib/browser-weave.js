/**
 * UI/UX Suite — Deep-mode browser result → Finding weave
 *
 * Converts the structured output of lib/browser.js `runBrowserAudit` (axe-core
 * violations + measured touch targets) into the project's canonical Finding
 * shape (lib/schema.js `createFinding`). This is the bridge that lets live,
 * rendered-DOM evidence flow into the same scoring/report pipeline as the static
 * specificity engine — every woven Finding is located (selector), measured, and
 * carries a concrete fix, just like the static ones.
 *
 * Zero runtime dependencies. Pure function: given the same browserResult it
 * always returns the same Findings (ids seeded deterministically).
 */

'use strict';

const { createFinding } = require('./schema');

// axe-core impact → our 4-level severity. axe uses critical/serious/moderate/minor.
const AXE_IMPACT_TO_SEVERITY = {
  critical: 'critical',
  serious: 'critical',
  moderate: 'important',
  minor: 'suggestion',
};

// Map the obvious axe rule ids → their primary WCAG success criterion. Only the
// unambiguous ones are mapped; anything else omits wcag rather than guess.
const AXE_RULE_TO_WCAG = {
  'color-contrast': '1.4.3',
  'color-contrast-enhanced': '1.4.6',
  'image-alt': '1.1.1',
  'input-image-alt': '1.1.1',
  'area-alt': '1.1.1',
  label: '3.3.2',
  'label-title-only': '3.3.2',
  'form-field-multiple-labels': '3.3.2',
  'select-name': '3.3.2',
};

function severityForImpact(impact) {
  return AXE_IMPACT_TO_SEVERITY[impact] || 'suggestion';
}

function wcagForRule(ruleId) {
  const sc = AXE_RULE_TO_WCAG[ruleId];
  return sc ? [sc] : undefined;
}

/**
 * Convert one summarized axe violation into an accessibility Finding.
 * Expected violation shape (from lib/browser.js summarizeViolation):
 *   { id, impact, help, helpUrl, nodesCount, firstNodeTarget, firstNodeHtml }
 */
function weaveAxeViolation(violation, route, seed) {
  const severity = severityForImpact(violation.impact);
  const selector = violation.firstNodeTarget || null;
  const count = violation.nodesCount || 1;
  const help = violation.help || violation.id;
  const where = route && route.route ? ` on ${route.route}` : '';
  const more = count > 1 ? ` (and ${count - 1} more element${count - 1 === 1 ? '' : 's'})` : '';

  const description = `axe-core rule "${violation.id}" (${violation.impact || 'n/a'} impact)${where}: ${help}. ` +
    `Affects ${count} element${count === 1 ? '' : 's'}${more}.`;

  const fix = violation.helpUrl
    ? `Resolve per the axe-core guidance: ${help}. See ${violation.helpUrl}`
    : `Resolve per the axe-core guidance: ${help}.`;

  return createFinding({
    dimension: 'accessibility',
    severity,
    title: `Accessibility: ${help}`,
    description,
    impact: 'Blocks or degrades the experience for users relying on assistive technology, and may fail a WCAG conformance target.',
    fix,
    effort: severity === 'critical' ? 'small' : 'trivial',
    before: violation.firstNodeHtml || null,
    after: null,
    wcag: wcagForRule(violation.id),
    confidence: 'high',
    idSeed: seed,
    evidence: {
      file: '(rendered DOM)',
      line: 0,
      col: null,
      selector,
      measured: help,
      threshold: null,
      screenshot: (route && route.screenshotPath) || null,
    },
  });
}

/**
 * Convert one under-minimum touch target example into a platform Finding.
 * Example shape (from lib/browser.js measureTouchTargets):
 *   { tag, w, h, text }
 * Cites WCAG 2.5.8 (Minimum, 24px AA) and 2.5.5 (Enhanced, 44px AAA).
 */
function weaveTouchTarget(example, route, seed) {
  const w = Number(example.w) || 0;
  const h = Number(example.h) || 0;
  const minSide = Math.min(w, h);
  // Under 24px fails even the AA minimum; 24–43px passes AA but fails AAA.
  const failsAA = minSide < 24;
  const severity = failsAA ? 'important' : 'suggestion';
  const label = (example.text && example.text.trim()) ? `"${example.text.trim()}"` : `<${example.tag || 'element'}>`;
  const where = route && route.route ? ` on ${route.route}` : '';
  const selector = example.tag ? `${example.tag}` : null;

  const description = `Interactive ${example.tag || 'element'} ${label}${where} renders at ${w}×${h}px. ` +
    `The smallest side (${minSide}px) is below the ${failsAA ? '24px WCAG 2.5.8 (AA) minimum' : '44px WCAG 2.5.5 (AAA) / iOS HIG target'}.`;

  const fix = `Enlarge the hit area to at least 44×44px (e.g. set min-width:44px; min-height:44px or add padding). ` +
    `At minimum reach the 24×24px WCAG 2.5.8 (AA) floor; 44×44px satisfies WCAG 2.5.5 (AAA) and iOS HIG.`;

  return createFinding({
    dimension: 'platform',
    severity,
    title: `Touch target too small: ${label} (${w}×${h}px)`,
    description,
    impact: 'Small targets cause mis-taps on touch devices and are hard to hit for users with motor impairments (Fitts’s Law).',
    fix,
    effort: 'trivial',
    before: `${w}×${h}px`,
    after: '44×44px',
    laws: ['fittss-law'],
    wcag: ['2.5.8', '2.5.5'],
    confidence: 'high',
    idSeed: seed,
    evidence: {
      file: '(rendered DOM)',
      line: 0,
      col: null,
      selector,
      measured: `${w}×${h}px`,
      threshold: '24px (AA) / 44px (AAA)',
      screenshot: (route && route.screenshotPath) || null,
    },
  });
}

/**
 * Weave a full browserResult into an array of Findings.
 *
 * @param {object} browserResult - the object returned by runBrowserAudit. Tolerates
 *   { ok:false, ... } error envelopes (returns []) and missing fields.
 * @returns {Array<object>} Findings (located, measured, fixed).
 */
function weaveBrowserFindings(browserResult) {
  if (!browserResult || browserResult.ok === false) return [];
  const routes = Array.isArray(browserResult.routes) ? browserResult.routes : [];
  const findings = [];
  let seq = 0;

  for (const route of routes) {
    const violations = Array.isArray(route.violations) ? route.violations : [];
    for (const v of violations) {
      findings.push(weaveAxeViolation(v, route, seq++));
    }

    const tt = route.touchTargets;
    const examples = tt && Array.isArray(tt.examples) ? tt.examples : [];
    for (const ex of examples) {
      findings.push(weaveTouchTarget(ex, route, seq++));
    }
  }

  return findings;
}

module.exports = {
  weaveBrowserFindings,
  weaveAxeViolation,
  weaveTouchTarget,
  severityForImpact,
  wcagForRule,
  AXE_IMPACT_TO_SEVERITY,
  AXE_RULE_TO_WCAG,
};
