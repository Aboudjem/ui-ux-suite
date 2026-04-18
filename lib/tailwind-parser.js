/**
 * UI/UX Suite — Tailwind Class Parser
 * Extracts Tailwind utility classes from JSX/TSX/HTML files and maps them back
 * to design tokens (colors, spacing, typography, etc.).
 */

const fs = require('fs');

// --- Class extraction ---

const CLASS_ATTR_LOCATE_REGEX = /\b(?:className|class|:class|v-bind:class)\s*=\s*/g;
const CN_CALL_LOCATE_REGEX = /\b(?:cn|clsx|classnames|cva|twMerge|tv)\s*\(/g;
const SVELTE_CLASS_DIRECTIVE_REGEX = /\bclass:([\w-]+)/g;

function isValidClass(p) {
  if (!p || p.length > 80) return false;
  if (p.startsWith('data-[') || p.startsWith('aria-[')) return true;
  return /^-?[a-z][a-z0-9:\-/\.\[\]%@,#]*$/i.test(p);
}

function splitStringLiteralClasses(stripped, out) {
  const parts = stripped.split(/\s+/).filter(Boolean);
  for (const p of parts) if (isValidClass(p)) out.add(p);
}

function extractStringsFromExpression(expr) {
  const strings = [];
  const stack = [];
  let i = 0;
  let buf = '';

  function top() { return stack[stack.length - 1]; }

  while (i < expr.length) {
    const ch = expr[i];
    const state = top();

    if (state === "'" || state === '"') {
      if (ch === '\\') { buf += ch + (expr[++i] || ''); i++; continue; }
      if (ch === state) { strings.push(buf); buf = ''; stack.pop(); i++; continue; }
      buf += ch; i++; continue;
    }
    if (state === '`') {
      if (ch === '\\') { buf += ch + (expr[++i] || ''); i++; continue; }
      if (ch === '$' && expr[i + 1] === '{') {
        strings.push(buf); buf = '';
        stack.push('${');
        i += 2; continue;
      }
      if (ch === '`') { strings.push(buf); buf = ''; stack.pop(); i++; continue; }
      buf += ch; i++; continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') { stack.push(ch); i++; continue; }
    if (state === '${' && ch === '{') { stack.push('{'); i++; continue; }
    if ((state === '${' || state === '{') && ch === '}') { stack.pop(); i++; continue; }
    i++;
  }

  return strings;
}

function captureBalanced(source, startIndex, open, close) {
  let depth = 0;
  let inString = null;
  for (let i = startIndex; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return { endIndex: i, body: source.slice(startIndex + 1, i) };
    }
  }
  return null;
}

function captureStringLiteral(source, startIndex, quote) {
  for (let i = startIndex + 1; i < source.length; i++) {
    const ch = source[i];
    if (ch === '\\') { i++; continue; }
    if (ch === quote) return { endIndex: i, body: source.slice(startIndex + 1, i) };
  }
  return null;
}

function extractClassesFromJSX(content) {
  const classes = new Set();

  const locate = new RegExp(CLASS_ATTR_LOCATE_REGEX.source, 'g');
  let match;
  while ((match = locate.exec(content)) !== null) {
    let i = match.index + match[0].length;
    while (i < content.length && /\s/.test(content[i])) i++;
    const ch = content[i];
    let body = null;
    if (ch === '{') {
      const bal = captureBalanced(content, i, '{', '}');
      if (bal) { body = bal.body; locate.lastIndex = bal.endIndex + 1; }
    } else if (ch === '"' || ch === "'" || ch === '`') {
      const lit = captureStringLiteral(content, i, ch);
      if (lit) { body = lit.body; locate.lastIndex = lit.endIndex + 1; }
    }
    if (body === null) continue;
    splitStringLiteralClasses(body, classes);
    for (const s of extractStringsFromExpression(body)) splitStringLiteralClasses(s, classes);
  }

  const locateCall = new RegExp(CN_CALL_LOCATE_REGEX.source, 'g');
  while ((match = locateCall.exec(content)) !== null) {
    const openIdx = match.index + match[0].length - 1;
    const bal = captureBalanced(content, openIdx, '(', ')');
    if (!bal) continue;
    locateCall.lastIndex = bal.endIndex + 1;
    for (const s of extractStringsFromExpression(bal.body)) splitStringLiteralClasses(s, classes);
  }

  const re3 = new RegExp(SVELTE_CLASS_DIRECTIVE_REGEX.source, 'g');
  while ((match = re3.exec(content)) !== null) {
    if (isValidClass(match[1])) classes.add(match[1]);
  }

  return [...classes];
}

const BREAKPOINT_NAMES = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
const BREAKPOINT_SET = new Set(['sm', 'md', 'lg', 'xl', '2xl']);

function bucketByBreakpoint(classes) {
  const buckets = { base: [], sm: [], md: [], lg: [], xl: [], '2xl': [] };
  for (const cls of classes) {
    const variants = cls.split(':').slice(0, -1);
    let bp = 'base';
    for (const v of variants) {
      if (BREAKPOINT_SET.has(v)) bp = v;
    }
    buckets[bp].push(cls);
  }
  return {
    buckets,
    coverage: Object.fromEntries(BREAKPOINT_NAMES.map(n => [n, buckets[n].length])),
    distinctBreakpoints: BREAKPOINT_NAMES.filter(n => n !== 'base' && buckets[n].length > 0),
  };
}

function flagArbitraryValues(classes, scaleTokens = {}) {
  const flagged = [];
  const scaleSet = {
    text: new Set(scaleTokens.text || ['xs','sm','base','lg','xl','2xl','3xl','4xl','5xl','6xl','7xl','8xl','9xl']),
    spacing: new Set(scaleTokens.spacing || ['0','0.5','1','1.5','2','2.5','3','3.5','4','5','6','7','8','9','10','11','12','14','16','20','24','28','32','36','40','44','48','52','56','60','64','72','80','96','px','auto','full','screen','min','max','fit']),
    rounded: new Set(scaleTokens.rounded || ['none','sm','','md','lg','xl','2xl','3xl','full']),
  };

  for (const cls of classes) {
    const base = cls.split(':').pop();
    const bracketMatch = base.match(/^(-?[a-z][a-z0-9]*(?:-[a-z]+)*)-\[(.+)\]$/i);
    if (!bracketMatch) continue;
    const family = bracketMatch[1];
    const value = bracketMatch[2];
    flagged.push({
      class: cls,
      family,
      value,
      kind: 'arbitrary-value',
      hint: `Arbitrary value "${value}" in ${family}-[${value}] bypasses the design scale.`,
    });
  }

  return flagged;
}

function analyzeResponsiveCoverage(classes) {
  const bp = bucketByBreakpoint(classes);
  const totalResponsive = Object.entries(bp.buckets)
    .filter(([name]) => name !== 'base')
    .reduce((a, [, arr]) => a + arr.length, 0);
  const baseOnly = bp.buckets.base.length;
  return {
    breakpointCoverage: bp.coverage,
    distinctBreakpoints: bp.distinctBreakpoints,
    totalResponsive,
    baseOnly,
    ratioResponsive: classes.length > 0 ? totalResponsive / classes.length : 0,
  };
}

// --- Token mapping ---

const COLOR_PREFIXES = ['bg-', 'text-', 'border-', 'ring-', 'outline-', 'fill-', 'stroke-',
  'from-', 'via-', 'to-', 'placeholder-', 'decoration-', 'shadow-', 'accent-', 'caret-',
  'divide-'];

const SPACING_PROPS = ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
  'w', 'h', 'min-w', 'min-h', 'max-w', 'max-h',
  'inset', 'top', 'right', 'bottom', 'left'];

const TYPOGRAPHY_PROPS = ['text', 'font', 'leading', 'tracking', 'break'];

function categorizeClass(cls) {
  // Remove variants (hover:, md:, dark:)
  const base = cls.split(':').pop();

  // Color classes
  for (const prefix of COLOR_PREFIXES) {
    if (base.startsWith(prefix)) {
      return { category: 'color', prefix, value: base.slice(prefix.length) };
    }
  }

  // Spacing classes: p-4, mx-2, gap-3, w-full
  const spacingMatch = base.match(/^([a-z\-]+)-(.+)$/);
  if (spacingMatch && SPACING_PROPS.includes(spacingMatch[1])) {
    return { category: 'spacing', prefix: spacingMatch[1], value: spacingMatch[2] };
  }

  // Typography
  for (const prop of TYPOGRAPHY_PROPS) {
    if (base.startsWith(prop + '-')) {
      return { category: 'typography', prefix: prop, value: base.slice(prop.length + 1) };
    }
  }

  // Border radius
  if (base.startsWith('rounded')) {
    return { category: 'radius', prefix: 'rounded', value: base.slice(7).replace(/^-/, '') || 'default' };
  }

  // Shadow
  if (base.startsWith('shadow')) {
    return { category: 'shadow', prefix: 'shadow', value: base.slice(6).replace(/^-/, '') || 'default' };
  }

  // Layout (grid, flex, block, etc.)
  if (['grid', 'flex', 'block', 'inline', 'hidden', 'absolute', 'relative', 'fixed', 'sticky'].includes(base)) {
    return { category: 'layout', value: base };
  }

  return { category: 'other', value: base };
}

function analyzeTailwindUsage(classes) {
  const stats = {
    total: classes.length,
    byCategory: {},
    colors: new Set(),
    spacings: new Set(),
    fontSizes: new Set(),
    radii: new Set(),
    shadows: new Set(),
    variants: {
      hover: 0,
      focus: 0,
      active: 0,
      disabled: 0,
      dark: 0,
      responsive: 0,
    },
  };

  for (const cls of classes) {
    const variants = cls.split(':').slice(0, -1);
    for (const v of variants) {
      if (v === 'hover') stats.variants.hover++;
      else if (v === 'focus' || v === 'focus-visible') stats.variants.focus++;
      else if (v === 'active') stats.variants.active++;
      else if (v === 'disabled') stats.variants.disabled++;
      else if (v === 'dark') stats.variants.dark++;
      else if (['sm', 'md', 'lg', 'xl', '2xl'].includes(v)) stats.variants.responsive++;
    }

    const info = categorizeClass(cls);
    stats.byCategory[info.category] = (stats.byCategory[info.category] || 0) + 1;

    if (info.category === 'color') stats.colors.add(info.prefix + info.value);
    if (info.category === 'spacing') stats.spacings.add(info.prefix + '-' + info.value);
    if (info.category === 'typography' && info.prefix === 'text' && /^(xs|sm|base|lg|xl|\d+xl)$/.test(info.value)) {
      stats.fontSizes.add('text-' + info.value);
    }
    if (info.category === 'radius') stats.radii.add('rounded-' + info.value);
    if (info.category === 'shadow') stats.shadows.add('shadow-' + info.value);
  }

  return {
    ...stats,
    colors: [...stats.colors],
    spacings: [...stats.spacings],
    fontSizes: [...stats.fontSizes],
    radii: [...stats.radii],
    shadows: [...stats.shadows],
  };
}

// --- State coverage detection ---

function detectStateCoverage(content) {
  const states = {
    hover: /hover:/g,
    focus: /focus(-visible)?:/g,
    active: /active:/g,
    disabled: /disabled:/g,
    dark: /dark:/g,
    groupHover: /group-hover:/g,
    peerFocus: /peer-focus:/g,
    aria: /aria-\[/g,
    data: /data-\[/g,
  };

  const counts = {};
  for (const [name, re] of Object.entries(states)) {
    counts[name] = (content.match(re) || []).length;
  }
  return counts;
}

module.exports = {
  extractClassesFromJSX,
  categorizeClass,
  analyzeTailwindUsage,
  detectStateCoverage,
  bucketByBreakpoint,
  flagArbitraryValues,
  analyzeResponsiveCoverage,
};
