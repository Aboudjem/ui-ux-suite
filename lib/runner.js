/**
 * UI/UX Suite — End-to-End Audit Runner
 * Orchestrates a full project audit: scan, extract, analyze, score, report.
 */

const fs = require('fs');
const path = require('path');
const { createProjectProfile, createScoreCard, calculateOverall, DIMENSIONS } = require('./schema');
const { extractColorsFromCSS, extractTypographyFromCSS, extractSpacingFromCSS,
  extractBorderRadiusFromCSS, extractShadowsFromCSS, detectFramework, detectStyling,
  detectComponentLib } = require('./extractors');
const { hexToRgb, contrastRatio, wcagLevel, apcaContrast, findNearDuplicates } = require('./color-engine');
const { oklchToHex, oklchToRgb, extractOklchColors } = require('./oklch-parser');
const { detectTypeScale, recommendWeightStrategy } = require('./type-engine');
const { analyzeSpacingConsistency, detectGridSystem, extractBreakpoints, analyzeContainerWidths } = require('./spacing-engine');
const { extractClassesFromJSX, analyzeTailwindUsage, detectStateCoverage } = require('./tailwind-parser');
const { scoreColorSystem, scoreTypography, scoreLayout, scoreAccessibility, runFullScoring, formatScoreCard } = require('./scoring');

const IGNORED_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.cache', 'coverage',
  '.turbo', 'out', '.vercel', 'storybook-static', '.svelte-kit', '.nuxt'];

function walkFiles(dir, extensions, maxDepth = 6) {
  const results = [];
  function walk(current, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch { return; }
    for (const entry of entries) {
      if (IGNORED_DIRS.includes(entry.name) || entry.name.startsWith('.')) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) walk(fullPath, depth + 1);
      else if (extensions.some(ext => entry.name.endsWith(ext))) results.push(fullPath);
    }
  }
  walk(dir, 0);
  return results;
}

function detectProjectProfile(projectPath) {
  const profile = createProjectProfile();

  // Read package.json (look in root and in apps/web, packages/*)
  const pkgPaths = [
    path.join(projectPath, 'package.json'),
    path.join(projectPath, 'apps/web/package.json'),
  ];
  let pkg = null;
  let pkgPath = null;
  for (const p of pkgPaths) {
    try {
      pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
      pkgPath = p;
      break;
    } catch {}
  }

  profile.framework = detectFramework(pkg);
  profile.componentLib = detectComponentLib(pkg);

  // Detect shadcn via components.json
  const shadcnPaths = [
    path.join(projectPath, 'components.json'),
    path.join(projectPath, 'apps/web/components.json'),
  ];
  for (const p of shadcnPaths) {
    try {
      fs.accessSync(p);
      profile.componentLib = 'shadcn/ui';
      break;
    } catch {}
  }

  profile.styling = detectStyling(pkg, []);
  profile.hasDesignTokens = false;
  profile.hasDarkMode = false;
  profile.pkgPath = pkgPath;

  return profile;
}

function extractAllColors(cssFiles, jsxFiles = []) {
  const hexColors = new Set();
  const oklchColors = new Set();
  const cssVars = {};

  for (const f of cssFiles) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const { colors, varDefs } = extractColorsFromCSS(content);
      colors.filter(c => c.type === 'hex').forEach(c => hexColors.add(c.value.toLowerCase()));
      const oklchs = extractOklchColors(content);
      oklchs.forEach(o => oklchColors.add(o));
      Object.assign(cssVars, varDefs);
    } catch {}
  }

  return {
    hex: [...hexColors],
    oklch: [...oklchColors],
    cssVariables: cssVars,
  };
}

function auditProject(projectPath, options = {}) {
  const startTime = Date.now();

  // 1. Detect profile
  const profile = detectProjectProfile(projectPath);

  // 2. Walk files
  const cssFiles = walkFiles(projectPath, ['.css', '.scss', '.sass']);
  const jsxFiles = walkFiles(projectPath, ['.tsx', '.jsx', '.vue', '.svelte']);

  // 3. Extract colors
  const colors = extractAllColors(cssFiles, jsxFiles);

  // Convert OKLCH to RGB for analysis
  const allColorRgb = [];
  for (const hex of colors.hex) {
    try {
      allColorRgb.push({ source: hex, rgb: hexToRgb(hex), type: 'hex' });
    } catch {}
  }
  for (const oklch of colors.oklch) {
    const rgb = oklchToRgb(oklch);
    if (rgb) allColorRgb.push({ source: oklch, rgb, type: 'oklch', hex: oklchToHex(oklch) });
  }

  const nearDuplicates = findNearDuplicates(allColorRgb.map(c => ({ hex: c.hex || c.source, rgb: c.rgb })));

  // 4. Typography
  const typeData = { fonts: new Set(), sizes: new Set(), weights: new Set(), lineHeights: new Set() };
  for (const f of cssFiles) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const t = extractTypographyFromCSS(content);
      t.fonts.forEach(x => typeData.fonts.add(x));
      t.sizes.forEach(x => typeData.sizes.add(x));
      t.weights.forEach(x => typeData.weights.add(x));
      t.lineHeights.forEach(x => typeData.lineHeights.add(x));
    } catch {}
  }
  const sizeNums = [...typeData.sizes].map(s => parseFloat(s)).filter(n => !isNaN(n));
  const scale = detectTypeScale(sizeNums);

  // 5. Spacing
  const allSpacing = [];
  for (const f of cssFiles) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      allSpacing.push(...extractSpacingFromCSS(content));
    } catch {}
  }
  const spacingAnalysis = analyzeSpacingConsistency(allSpacing);

  // 6. Tailwind classes from JSX
  const allTwClasses = new Set();
  const stateSignals = { hover: 0, focus: 0, active: 0, disabled: 0, dark: 0, groupHover: 0, aria: 0 };
  const jsxSampleSize = Math.min(jsxFiles.length, 100);
  for (let i = 0; i < jsxSampleSize; i++) {
    try {
      const content = fs.readFileSync(jsxFiles[i], 'utf8');
      const classes = extractClassesFromJSX(content);
      classes.forEach(c => allTwClasses.add(c));
      const states = detectStateCoverage(content);
      for (const [k, v] of Object.entries(states)) stateSignals[k] = (stateSignals[k] || 0) + v;
    } catch {}
  }
  const twAnalysis = analyzeTailwindUsage([...allTwClasses]);

  // 7. Accessibility signals from JSX
  const a11ySignals = {
    hasFocusVisible: false,
    hasAriaLabels: 0,
    hasSkipLink: false,
    imgWithoutAlt: 0,
    hasReducedMotion: false,
  };
  for (let i = 0; i < jsxSampleSize; i++) {
    try {
      const content = fs.readFileSync(jsxFiles[i], 'utf8');
      if (/:focus-visible|focus-visible:/.test(content)) a11ySignals.hasFocusVisible = true;
      a11ySignals.hasAriaLabels += (content.match(/aria-label/g) || []).length;
      if (/skip.*content|skip.*main|#main-content/.test(content.toLowerCase())) a11ySignals.hasSkipLink = true;
      if (/prefers-reduced-motion/.test(content)) a11ySignals.hasReducedMotion = true;
      a11ySignals.imgWithoutAlt += (content.match(/<img(?![^>]*\balt=)/g) || []).length;
    } catch {}
  }

  for (const f of cssFiles) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      if (/:focus-visible/.test(content)) a11ySignals.hasFocusVisible = true;
      if (/prefers-reduced-motion/.test(content)) a11ySignals.hasReducedMotion = true;
    } catch {}
  }

  // 8. Layout / breakpoints / container
  const cssContent = cssFiles.map(f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } }).join('\n');
  const gridSystem = detectGridSystem(cssContent);
  const breakpoints = extractBreakpoints(cssContent);
  const containerWidths = analyzeContainerWidths(cssContent);

  // 9. Score
  const scoreInput = {
    color: {
      uniqueCount: allColorRgb.length,
      contrastIssues: [], // would need pair-wise check
      nearDuplicates,
      semantic: {
        primary: cssContent.includes('--primary') || cssContent.includes('--color-primary'),
        error: cssContent.includes('--destructive') || cssContent.includes('--error'),
        success: cssContent.includes('--success'),
        warning: cssContent.includes('--warning'),
      },
      hasDarkMode: /dark:|\.dark |prefers-color-scheme:\s*dark/.test(cssContent) ||
                   stateSignals.dark > 0,
    },
    typography: {
      scaleDetected: scale?.detected || false,
      fontCount: typeData.fonts.size,
      bodySize: sizeNums.length > 0 ? Math.min(...sizeNums.filter(n => n >= 12 && n <= 20)) : null,
      bodyLineHeight: null,
    },
    layout: {
      spacingConsistent: spacingAnalysis.consistent,
      offScaleCount: spacingAnalysis.offScaleValues?.length || 0,
      hasMaxWidth: containerWidths.widths.length > 0,
      breakpointCount: breakpoints.length,
    },
    accessibility: {
      contrastFailures: 0,
      hasFocusIndicators: a11ySignals.hasFocusVisible,
      hasSkipLink: a11ySignals.hasSkipLink,
      missingAltText: a11ySignals.imgWithoutAlt,
      hasReducedMotion: a11ySignals.hasReducedMotion,
    },
  };

  const scoreCard = runFullScoring(scoreInput);

  // Fill in unscored dimensions with heuristics
  for (const dim of scoreCard.dimensions) {
    if (dim.score === null) {
      if (dim.id === 'components') dim.score = stateSignals.hover > 20 && stateSignals.focus > 5 ? 7 : 5;
      else if (dim.id === 'hierarchy') dim.score = scoreInput.typography.scaleDetected ? 7 : 5;
      else if (dim.id === 'interaction') dim.score = stateSignals.hover > 10 ? 7 : 5;
      else if (dim.id === 'responsive') dim.score = breakpoints.length > 2 ? 7 : 5;
      else if (dim.id === 'polish') dim.score = 6;
      else if (dim.id === 'performance') dim.score = 6;
      else if (dim.id === 'flows') dim.score = 6;
      else if (dim.id === 'platform') dim.score = 6;
    }
  }
  calculateOverall(scoreCard);

  return {
    duration: Date.now() - startTime,
    profile,
    files: {
      css: cssFiles.length,
      jsx: jsxFiles.length,
    },
    colors: {
      hex: colors.hex.length,
      oklch: colors.oklch.length,
      total: allColorRgb.length,
      cssVariables: Object.keys(colors.cssVariables).length,
      nearDuplicates: nearDuplicates.length,
    },
    typography: {
      fonts: [...typeData.fonts],
      sizeCount: typeData.sizes.size,
      weightCount: typeData.weights.size,
      scaleDetected: scale?.detected || false,
      scaleRatio: scale?.ratio,
    },
    spacing: spacingAnalysis,
    tailwind: twAnalysis,
    stateSignals,
    a11ySignals,
    layout: {
      gridSystem,
      breakpoints,
      containerWidths,
    },
    scoreCard,
  };
}

function formatReport(audit) {
  const lines = [];
  lines.push('# Design Audit Report\n');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Duration:** ${(audit.duration / 1000).toFixed(2)}s`);
  lines.push(`**Files scanned:** ${audit.files.css} CSS, ${audit.files.jsx} JSX/TSX\n`);

  lines.push('## Project Profile\n');
  lines.push(`- **Framework:** ${audit.profile.framework || 'unknown'}`);
  lines.push(`- **Styling:** ${audit.profile.styling || 'unknown'}`);
  lines.push(`- **Component Library:** ${audit.profile.componentLib || 'none'}`);
  lines.push(`- **Dark Mode:** ${audit.scoreCard.dimensions.find(d => d.id === 'color')?.findings?.some(f => f.msg?.includes('dark')) ? 'no' : 'detected'}\n`);

  lines.push('## Score Card\n');
  lines.push(formatScoreCard(audit.scoreCard));

  lines.push('\n## Color System\n');
  lines.push(`- Unique colors: **${audit.colors.total}** (${audit.colors.hex} hex, ${audit.colors.oklch} OKLCH)`);
  lines.push(`- CSS variables: **${audit.colors.cssVariables}**`);
  lines.push(`- Near-duplicate pairs: **${audit.colors.nearDuplicates}**\n`);

  lines.push('## Typography\n');
  lines.push(`- Fonts: **${audit.typography.fonts.length}** (${audit.typography.fonts.slice(0, 3).join(', ') || 'none detected'})`);
  lines.push(`- Sizes: **${audit.typography.sizeCount}**`);
  lines.push(`- Weights: **${audit.typography.weightCount}**`);
  lines.push(`- Scale detected: **${audit.typography.scaleDetected ? `yes (ratio ${audit.typography.scaleRatio?.toFixed(3)})` : 'no'}**\n`);

  lines.push('## Spacing\n');
  lines.push(`- Consistency: **${audit.spacing.consistent ? 'yes' : 'no'}**`);
  lines.push(`- Detected base: **${audit.spacing.detectedBase || 'n/a'}px**`);
  lines.push(`- Unique values: **${audit.spacing.uniqueValues || 0}**`);
  if (audit.spacing.issues?.length) {
    lines.push(`- Issues:`);
    audit.spacing.issues.forEach(i => lines.push(`  - ${i}`));
  }
  lines.push('');

  lines.push('## Tailwind Usage\n');
  lines.push(`- Total classes extracted: **${audit.tailwind.total}**`);
  lines.push(`- Unique colors: **${audit.tailwind.colors.length}**`);
  lines.push(`- Unique spacings: **${audit.tailwind.spacings.length}**`);
  lines.push(`- Font sizes: **${audit.tailwind.fontSizes.length}**`);
  lines.push(`- Radii used: **${audit.tailwind.radii.length}**`);
  lines.push(`- Shadows: **${audit.tailwind.shadows.length}**\n`);

  lines.push('### State coverage (from className variants)\n');
  lines.push(`- \`hover:\` — ${audit.stateSignals.hover}`);
  lines.push(`- \`focus:\` — ${audit.stateSignals.focus}`);
  lines.push(`- \`active:\` — ${audit.stateSignals.active}`);
  lines.push(`- \`disabled:\` — ${audit.stateSignals.disabled}`);
  lines.push(`- \`dark:\` — ${audit.stateSignals.dark}`);
  lines.push(`- \`group-hover:\` — ${audit.stateSignals.groupHover}`);
  lines.push(`- \`aria-[...]:\` — ${audit.stateSignals.aria}\n`);

  lines.push('## Accessibility Signals\n');
  lines.push(`- \`:focus-visible\` styling: **${audit.a11ySignals.hasFocusVisible ? 'yes' : 'NO — add this'}**`);
  lines.push(`- \`aria-label\` usage: **${audit.a11ySignals.hasAriaLabels}** occurrences`);
  lines.push(`- Skip-to-content link: **${audit.a11ySignals.hasSkipLink ? 'yes' : 'NO — add one'}**`);
  lines.push(`- Images without \`alt\`: **${audit.a11ySignals.imgWithoutAlt}**`);
  lines.push(`- \`prefers-reduced-motion\` support: **${audit.a11ySignals.hasReducedMotion ? 'yes' : 'NO — add it'}**\n`);

  lines.push('## Layout\n');
  lines.push(`- Grid system: **${audit.layout.gridSystem.primaryLayout}**`);
  lines.push(`- Container queries: **${audit.layout.gridSystem.hasContainerQueries ? 'yes' : 'no'}**`);
  lines.push(`- Media queries: **${audit.layout.gridSystem.mediaQueryCount}** total`);
  lines.push(`- Breakpoints: ${audit.layout.breakpoints.join(', ')}px`);
  lines.push(`- Container max-widths: ${audit.layout.containerWidths.widths.join(', ') || 'none'}px\n`);

  if (audit.scoreCard.topFindings.length > 0) {
    lines.push('## Top Findings\n');
    for (const f of audit.scoreCard.topFindings) {
      const icon = f.severity === 'critical' ? '[!]' : f.severity === 'important' ? '[*]' : '[-]';
      lines.push(`- ${icon} **${f.dimension}**: ${f.msg}`);
    }
  }

  return lines.join('\n');
}

module.exports = {
  auditProject,
  formatReport,
  walkFiles,
  detectProjectProfile,
  extractAllColors,
};
