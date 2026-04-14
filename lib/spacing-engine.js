/**
 * UI/UX Suite — Spacing Engine
 * Spacing consistency, grid detection, density scoring.
 */

// --- Spacing scale generation ---

const SPACING_SCALES = {
  '4px-base': {
    label: '4px base (standard)',
    values: [0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
    use: 'Most apps — fine-grained control',
  },
  '8px-base': {
    label: '8px base (Material)',
    values: [0, 4, 8, 16, 24, 32, 48, 64, 96, 128],
    use: 'Material Design, simpler systems',
  },
  'tailwind': {
    label: 'Tailwind default',
    values: [0, 1, 2, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96],
    use: 'Tailwind CSS projects',
  },
};

function generateSpacingScale(base = 4, steps = 16) {
  const scale = [0];
  // Fibonacci-inspired growth with base unit
  const multipliers = [0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];
  for (let i = 0; i < Math.min(steps, multipliers.length); i++) {
    scale.push(Math.round(base * multipliers[i]));
  }
  return [...new Set(scale)].sort((a, b) => a - b);
}

// --- Spacing analysis ---

function parseSpacingValue(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^([\d.]+)(px|rem|em)?$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const unit = match[2] || 'px';
  // Convert to px
  if (unit === 'rem' || unit === 'em') return num * 16;
  return num;
}

function analyzeSpacingConsistency(spacingValues) {
  const pxValues = spacingValues
    .map(parseSpacingValue)
    .filter(v => v !== null && v > 0)
    .sort((a, b) => a - b);

  if (pxValues.length === 0) return { consistent: false, issues: ['No spacing values detected'] };

  const unique = [...new Set(pxValues)];
  const issues = [];

  // Check if values follow a base unit
  const bases = [4, 8];
  let bestBase = null;
  let bestScore = 0;

  for (const base of bases) {
    const onScale = unique.filter(v => v % base === 0).length;
    const score = onScale / unique.length;
    if (score > bestScore) {
      bestScore = score;
      bestBase = base;
    }
  }

  // Off-scale values
  const offScale = unique.filter(v => v % (bestBase || 4) !== 0);
  if (offScale.length > 0) {
    issues.push(`${offScale.length} values off the ${bestBase}px grid: ${offScale.join(', ')}px`);
  }

  // Too many unique values
  if (unique.length > 20) {
    issues.push(`Too many unique spacing values (${unique.length}) — consider consolidating to a scale`);
  }

  // Check for near-duplicates
  for (let i = 1; i < unique.length; i++) {
    const diff = unique[i] - unique[i - 1];
    if (diff <= 2 && diff > 0) {
      issues.push(`Near-duplicate spacing: ${unique[i - 1]}px and ${unique[i]}px — consolidate`);
    }
  }

  return {
    consistent: issues.length === 0,
    detectedBase: bestBase,
    baseScore: Math.round(bestScore * 100),
    uniqueValues: unique.length,
    values: unique,
    offScaleValues: offScale,
    issues,
  };
}

// --- Density scoring ---

function scoreDensity(metrics) {
  const { avgPadding, avgGap, avgMargin, componentCount, viewportArea } = metrics;
  let score = 7; // default to "decent"
  const issues = [];

  // Average padding
  if (avgPadding < 8) { score -= 2; issues.push('Very tight padding — feels cramped'); }
  else if (avgPadding < 12) { score -= 1; issues.push('Tight padding — consider more breathing room'); }
  else if (avgPadding > 40) { score -= 1; issues.push('Very generous padding — may feel sparse'); }

  // Average gap
  if (avgGap < 4) { score -= 1; issues.push('Elements too close together'); }
  else if (avgGap > 32) { score -= 1; issues.push('Large gaps between elements — may feel disconnected'); }

  return {
    score: Math.max(1, Math.min(10, score)),
    density: avgPadding < 12 ? 'dense' : avgPadding > 24 ? 'spacious' : 'comfortable',
    issues,
  };
}

// --- Grid detection ---

function detectGridSystem(cssContent) {
  const patterns = {
    cssGrid: /display\s*:\s*grid/g,
    flexbox: /display\s*:\s*flex/g,
    columns: /grid-template-columns/g,
    containerQuery: /@container/g,
    mediaQuery: /@media/g,
  };

  const counts = {};
  for (const [name, regex] of Object.entries(patterns)) {
    counts[name] = (cssContent.match(regex) || []).length;
  }

  const gridType = counts.cssGrid > counts.flexbox * 0.5 ? 'css-grid' :
    counts.flexbox > 0 ? 'flexbox' : 'none';

  return {
    primaryLayout: gridType,
    counts,
    hasContainerQueries: counts.containerQuery > 0,
    mediaQueryCount: counts.mediaQuery,
  };
}

// --- Breakpoint analysis ---

function extractBreakpoints(cssContent) {
  const breakpoints = new Set();
  const regex = /@media[^{]*\(\s*(?:min|max)-width\s*:\s*([\d.]+)(px|rem|em)\s*\)/g;
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    let value = parseFloat(match[1]);
    if (match[2] === 'rem' || match[2] === 'em') value *= 16;
    breakpoints.add(Math.round(value));
  }
  return [...breakpoints].sort((a, b) => a - b);
}

const COMMON_BREAKPOINTS = {
  tailwind: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
  bootstrap: { sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 },
  material: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
};

// --- Container width analysis ---

function analyzeContainerWidths(cssContent) {
  const widths = new Set();
  const regex = /max-width\s*:\s*([\d.]+)(px|rem|em)/g;
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    let value = parseFloat(match[1]);
    if (match[2] === 'rem' || match[2] === 'em') value *= 16;
    if (value > 200) widths.add(Math.round(value)); // ignore small max-widths
  }

  const sorted = [...widths].sort((a, b) => a - b);
  const issues = [];

  if (sorted.length === 0) {
    issues.push('No max-width found — content may stretch too wide on large screens');
  }
  if (sorted.some(w => w > 1440)) {
    issues.push('Container wider than 1440px — text measure may be too wide');
  }

  return { widths: sorted, issues };
}

module.exports = {
  SPACING_SCALES,
  COMMON_BREAKPOINTS,
  generateSpacingScale,
  parseSpacingValue,
  analyzeSpacingConsistency,
  scoreDensity,
  detectGridSystem,
  extractBreakpoints,
  analyzeContainerWidths,
};
