/**
 * UI/UX Suite — Tailwind Class Parser
 * Extracts Tailwind utility classes from JSX/TSX/HTML files and maps them back
 * to design tokens (colors, spacing, typography, etc.).
 */

const fs = require('fs');

// --- Class extraction ---

const CLASS_ATTR_REGEX = /(?:className|class)\s*=\s*(?:{([^}]*)}|"([^"]*)"|'([^']*)'|`([^`]*)`)/g;
const CN_CALL_REGEX = /(?:cn|clsx|classnames)\s*\(([^)]*)\)/g;

function extractClassesFromJSX(content) {
  const classes = new Set();
  let match;

  // Direct className attributes
  const re1 = new RegExp(CLASS_ATTR_REGEX.source, 'g');
  while ((match = re1.exec(content)) !== null) {
    const classStr = match[1] || match[2] || match[3] || match[4] || '';
    // Split by whitespace, handle template expressions roughly
    const parts = classStr.split(/\s+/).filter(Boolean);
    for (const p of parts) {
      if (/^[a-z][a-z0-9:\-\/\.\[\]]*$/i.test(p) && p.length < 60) {
        classes.add(p);
      }
    }
  }

  // cn() / clsx() calls
  const re2 = new RegExp(CN_CALL_REGEX.source, 'g');
  while ((match = re2.exec(content)) !== null) {
    const args = match[1];
    const strings = args.match(/["'`]([^"'`]+)["'`]/g) || [];
    for (const s of strings) {
      const stripped = s.slice(1, -1);
      const parts = stripped.split(/\s+/).filter(Boolean);
      for (const p of parts) {
        if (/^[a-z][a-z0-9:\-\/\.\[\]]*$/i.test(p) && p.length < 60) {
          classes.add(p);
        }
      }
    }
  }

  return [...classes];
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
};
