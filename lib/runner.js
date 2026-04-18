/**
 * UI/UX Suite — End-to-End Audit Runner
 * Orchestrates a full project audit: scan, extract, analyze, score, report.
 */

const fs = require('fs');
const path = require('path');
const { createProjectProfile, createScoreCard, calculateOverall, DIMENSIONS } = require('./schema');
const { extractColorsFromCSS, extractTypographyFromCSS, extractSpacingFromCSS,
  extractBorderRadiusFromCSS, extractShadowsFromCSS, detectFramework, detectStyling,
  detectComponentLib, detectAnimationLib, detectIconLib, detectThemeSystemDetails } = require('./extractors');
const { extractThemeTokens, detectTailwindV4Theme } = require('./theme-parser');
const { hexToRgb, contrastRatio, wcagLevel, apcaContrast, findNearDuplicates } = require('./color-engine');
const { oklchToHex, oklchToRgb, extractOklchColors } = require('./oklch-parser');
const { detectTypeScale, recommendWeightStrategy } = require('./type-engine');
const { analyzeSpacingConsistency, detectGridSystem, extractBreakpoints, analyzeContainerWidths } = require('./spacing-engine');
const { extractClassesFromJSX, analyzeTailwindUsage, detectStateCoverage, analyzeResponsiveCoverage } = require('./tailwind-parser');
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

function detectProjectProfile(projectPath, cssContent = '') {
  const profile = createProjectProfile();

  const pkgPaths = [
    path.join(projectPath, 'package.json'),
    path.join(projectPath, 'apps/web/package.json'),
    path.join(projectPath, 'packages/web/package.json'),
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
  profile.animationLib = detectAnimationLib(pkg);
  profile.iconLib = detectIconLib(pkg);

  const shadcnPaths = [
    path.join(projectPath, 'components.json'),
    path.join(projectPath, 'apps/web/components.json'),
    path.join(projectPath, 'packages/web/components.json'),
  ];
  for (const p of shadcnPaths) {
    try {
      fs.accessSync(p);
      profile.componentLib = 'shadcn/ui';
      break;
    } catch {}
  }

  profile.styling = detectStyling(pkg, []);
  const themeDetails = detectThemeSystemDetails(pkg, cssContent);
  profile.themeSystem = themeDetails.system;
  profile.themeSignals = themeDetails.signals;

  const themeBlocks = extractThemeTokens(cssContent);
  if (themeBlocks.blocks > 0) {
    profile.hasDesignTokens = true;
    profile.tailwindV4Theme = {
      blocks: themeBlocks.blocks,
      hasInline: themeBlocks.hasInline,
      hasDefault: themeBlocks.hasDefault,
      totalTokens: themeBlocks.total,
      counts: themeBlocks.counts,
    };
  }

  profile.isTailwindV4 = detectTailwindV4Theme(cssContent);
  profile.hasDarkMode = /dark:|\.dark\s|\bprefers-color-scheme:\s*dark/.test(cssContent);
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

  // 2. Walk files (needed before profile so v4-@theme detection can read CSS)
  const cssFiles = walkFiles(projectPath, ['.css', '.scss', '.sass']);
  const jsxFiles = walkFiles(projectPath, ['.tsx', '.jsx', '.vue', '.svelte']);

  const earlyCssContent = cssFiles
    .slice(0, 200)
    .map(f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } })
    .join('\n');

  // 1. Detect profile with CSS context available
  const profile = detectProjectProfile(projectPath, earlyCssContent);

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

  // 9. Detect 2026 modern features + Tailwind/framework-aware signals
  const isTailwindV4 = /@import\s+["']tailwindcss["']|@theme\s/.test(cssContent);
  const hasResponsiveTailwind = /sm:|md:|lg:|xl:|2xl:/.test(cssContent) ||
    twAnalysis.variants.responsive > 5;

  // Read package.json for dep-based detection
  let pkgData = null;
  try { pkgData = JSON.parse(fs.readFileSync(profile.pkgPath, 'utf8')); } catch {}
  const deps = (pkgData && pkgData.dependencies) || {};

  const modern2026 = {
    viewTransitionsAPI: /@view-transition\b|::view-transition/.test(cssContent),
    propertyAnimatedGradients: /@property\s+--/.test(cssContent),
    scrollDrivenCSS: /animation-timeline:\s*(view|scroll)/.test(cssContent),
    startingStyleDialogs: /@starting-style/.test(cssContent),
    containerQueries: /@container\b|@container\s/.test(cssContent),
    multiLayerShadows: (() => {
      const matches = cssContent.match(/box-shadow:\s*[^;]+/g) || [];
      return matches.some(m => (m.match(/\),/g) || []).length >= 1);
    })(),
    focusHalo: /:focus-visible[^{]*\{[^}]*box-shadow/.test(cssContent),
    oklchAdoption: colors.oklch.length > 50,
    designTokens: Object.keys(colors.cssVariables).length > 100,
    shadowColorVar: /--shadow-color/.test(cssContent),
    tokenizedRadii: /--radius-(xs|sm|md|lg|xl|full)/.test(cssContent),
    reducedMotionGuards: (cssContent.match(/prefers-reduced-motion/g) || []).length,
    hasGroups: stateSignals.groupHover > 0,
    tailwindV4: isTailwindV4,
    responsiveTailwind: hasResponsiveTailwind,
    hasCommandPalette: !!deps.cmdk,
    hasDarkModeToggle: !!deps['next-themes'],
    hasFramerMotion: !!(deps['framer-motion'] || deps.motion),
    hasShadcn: profile.componentLib === 'shadcn/ui' || profile.componentLib === 'shadcn',
    hasIcons: !!(deps['lucide-react'] || deps['phosphor-react'] || deps['@radix-ui/react-icons']),
    hasI18n: !!(deps['next-intl'] || deps['react-i18next']),
    hasFontPackage: !!(deps.geist || deps['@next/font']),
    hasFormValidation: !!(deps.zod || deps.yup),
    hasA11yPrimitives: !!(deps['@radix-ui/react-dialog'] || deps['@base-ui/react'] || deps['@react-aria/dialog']),
  };

  const modern2026Score =
    (modern2026.viewTransitionsAPI ? 1 : 0) +
    (modern2026.propertyAnimatedGradients ? 1 : 0) +
    (modern2026.scrollDrivenCSS ? 1 : 0) +
    (modern2026.startingStyleDialogs ? 1 : 0) +
    (modern2026.containerQueries ? 1 : 0) +
    (modern2026.multiLayerShadows ? 1 : 0) +
    (modern2026.focusHalo ? 1 : 0) +
    (modern2026.oklchAdoption ? 1 : 0) +
    (modern2026.designTokens ? 1 : 0) +
    (modern2026.shadowColorVar ? 1 : 0) +
    (modern2026.tokenizedRadii ? 1 : 0) +
    (modern2026.reducedMotionGuards >= 1 ? 1 : 0);

  // 9b. Compute responsive coverage from extracted Tailwind classes
  const responsiveCoverage = analyzeResponsiveCoverage([...allTwClasses]);

  // 9c. Count UI primitives and detect perf/flows/hierarchy signals from JSX sample
  let uiPrimitivesCount = 0;
  const compDirs = ['components/ui', 'src/components/ui', 'apps/web/components/ui', 'app/components/ui'];
  for (const rel of compDirs) {
    try {
      const files = fs.readdirSync(path.join(projectPath, rel)).filter(f => /\.(tsx|jsx|vue|svelte)$/.test(f));
      uiPrimitivesCount = Math.max(uiPrimitivesCount, files.length);
    } catch {}
  }

  const jsxSample = jsxFiles.slice(0, jsxSampleSize).map(f => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } }).join('\n');
  const hasCnUtil = /(?:^|[^\w])(?:cn|clsx|twMerge)\s*\(/.test(jsxSample) || !!(deps.clsx || deps.classnames || deps['tailwind-merge']);
  const hasCva = /(?:^|[^\w])cva\s*\(/.test(jsxSample) || !!deps['class-variance-authority'];

  const fontWeightNums = [...typeData.weights].map(w => parseInt(w, 10)).filter(n => !isNaN(n));
  const h1Count = (jsxSample.match(/<h1\b/g) || []).length;
  const h2Count = (jsxSample.match(/<h2\b/g) || []).length;
  const h3Count = (jsxSample.match(/<h3\b/g) || []).length;
  const pageCount = jsxFiles.filter(f => /(?:\/|^)(page|index|route)\.(tsx|jsx|vue|svelte)$/.test(f)).length || 1;
  const has2xlOrLarger = /(?:^|\s|:)text-(?:2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/.test(jsxSample);

  const hasFluidType = /clamp\s*\(/.test(cssContent);
  const hasNextFont = !!(deps['next/font'] || deps.geist || deps['@next/font']);
  const hasNextImage = /\bfrom\s+['"]next\/image['"]/.test(jsxSample);
  const hasSuspense = /<Suspense\b/.test(jsxSample) || /React\.Suspense\b/.test(jsxSample);
  const hasSkeleton = /<Skeleton\b/.test(jsxSample) || /\bskeleton\b/i.test(jsxSample);
  const imagesInJsx = (jsxSample.match(/<img\b/g) || []).length;

  const hasEmptyStates = /<EmptyState\b|\bempty[-_]state\b/i.test(jsxSample);
  const hasBreadcrumbs = /<Breadcrumb\b|\bbreadcrumb\b/i.test(jsxSample);
  const hasFormValidation = !!(deps.zod || deps.yup || deps.valibot || deps['@hookform/resolvers']);
  const hasI18n = !!(deps['next-intl'] || deps['react-i18next'] || deps['@lingui/core']);
  const hasOnboarding = /<Onboarding\b|\bonboarding\b/i.test(jsxSample);
  const hasNestedRoutes = jsxFiles.some(f => /app\/.*\/.*\/page\.(tsx|jsx)/.test(f));

  const hasLangAttr = /<html[^>]*\blang=/.test(jsxSample);
  const hasRTL = /\bdir=["']rtl["']|\brtl:[a-z]/.test(jsxSample) || /logical-property/.test(cssContent);
  const hasPrefersReducedMotion = /prefers-reduced-motion/.test(cssContent);
  const hasPrefersColorScheme = /prefers-color-scheme/.test(cssContent);

  const shadowMatches = (cssContent.match(/box-shadow\s*:/g) || []).length;
  const radiusMatches = new Set((cssContent.match(/border-radius\s*:\s*([^;]+)/g) || []).map(s => s.replace(/border-radius\s*:\s*/, '').trim()));
  const gradientUsage = (cssContent.match(/linear-gradient|radial-gradient|conic-gradient/g) || []).length;

  // 10. Build scoreInput for ALL 12 dimensions
  const scoreInput = {
    color: {
      uniqueCount: allColorRgb.length,
      contrastIssues: [],
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
    components: {
      primitivesCount: uiPrimitivesCount,
      hasCnUtil,
      hasCva,
      hasIconLib: !!(profile.iconLib && profile.iconLib.length > 0),
      stateCoverage: {
        hover: stateSignals.hover,
        focus: stateSignals.focus,
        focusVisible: a11ySignals.hasFocusVisible ? Math.max(1, stateSignals.focus) : 0,
        active: stateSignals.active,
        disabled: stateSignals.disabled,
        dark: stateSignals.dark,
        groupHover: stateSignals.groupHover,
      },
    },
    hierarchy: {
      typeScaleDetected: scale?.detected || false,
      fontWeights: fontWeightNums,
      h1Count,
      h2Count,
      h3Count,
      pageCount,
      has2xlOrLarger,
    },
    interaction: {
      hasTransitions: /transition-[a-z]|transition:/.test(jsxSample) || /transition\s*:/.test(cssContent),
      hasHoverStates: stateSignals.hover > 0,
      hasFocusVisible: a11ySignals.hasFocusVisible,
      hasActive: stateSignals.active > 0,
      hasReducedMotion: a11ySignals.hasReducedMotion,
      hasMotionLib: !!(profile.animationLib && profile.animationLib.length > 0),
    },
    responsive: {
      distinctBreakpoints: responsiveCoverage.distinctBreakpoints,
      totalResponsive: responsiveCoverage.totalResponsive,
      ratioResponsive: responsiveCoverage.ratioResponsive,
      hasFluidType,
      hasContainerQueries: modern2026.containerQueries,
    },
    polish: {
      shadowCount: shadowMatches,
      radiusCount: radiusMatches.size,
      multiLayerShadows: modern2026.multiLayerShadows,
      tokenizedRadii: modern2026.tokenizedRadii,
      gradientUsage,
    },
    performance: {
      hasNextFont,
      hasNextImage,
      hasSuspense,
      hasSkeleton,
      imagesInJsx,
      hasViewTransitions: modern2026.viewTransitionsAPI,
    },
    flows: {
      hasCommandPalette: modern2026.hasCommandPalette,
      hasI18n,
      hasFormValidation,
      hasEmptyStates,
      hasBreadcrumbs,
      hasOnboarding,
      hasNestedRoutes,
    },
    platform: {
      hasDarkMode: modern2026.hasDarkModeToggle || (/dark:|\.dark |prefers-color-scheme:\s*dark/.test(cssContent)),
      hasLangAttr,
      hasPrefersReducedMotion,
      hasPrefersColorScheme,
      hasRTL,
    },
  };

  const scoreCard = runFullScoring(scoreInput);

  // 11. Apply 2026 modern features bonus to relevant dimensions
  // Each of 12 detected features adds graduated boost capped at +2 per dimension
  const colorBonus = (modern2026.oklchAdoption ? 1 : 0) + (modern2026.designTokens ? 0.5 : 0) + (modern2026.shadowColorVar ? 0.5 : 0);
  const polishBonus = (modern2026.multiLayerShadows ? 0.7 : 0) + (modern2026.propertyAnimatedGradients ? 0.7 : 0) + (modern2026.tokenizedRadii ? 0.6 : 0);
  const interactionBonus = (modern2026.scrollDrivenCSS ? 0.7 : 0) + (modern2026.viewTransitionsAPI ? 0.8 : 0) + (modern2026.startingStyleDialogs ? 0.5 : 0);
  const responsiveBonus = (modern2026.containerQueries ? 1.5 : 0) +
    (breakpoints.length > 0 ? 0.5 : 0) +
    (modern2026.responsiveTailwind ? 2.5 : 0) +
    (modern2026.tailwindV4 ? 0.5 : 0);
  const flowsBonus = (modern2026.hasCommandPalette ? 1.5 : 0) +
    (modern2026.hasI18n ? 0.5 : 0) +
    (modern2026.hasFormValidation ? 0.5 : 0);
  const platformBonus = (modern2026.hasDarkModeToggle ? 1 : 0) +
    (modern2026.hasShadcn ? 1 : 0) +
    (modern2026.hasA11yPrimitives ? 1 : 0);
  const componentBonus = (modern2026.hasShadcn ? 1 : 0) +
    (modern2026.hasA11yPrimitives ? 0.5 : 0) +
    (modern2026.hasIcons ? 0.5 : 0);
  const typographyBonus = (modern2026.hasFontPackage ? 1 : 0);
  const layoutBonus = (modern2026.tailwindV4 ? 1 : 0) +
    (modern2026.responsiveTailwind ? 1 : 0);
  const interactionBonus2 = (modern2026.hasFramerMotion ? 0.5 : 0) +
    (modern2026.hasGroups ? 0.3 : 0);
  const a11yBonus = (modern2026.focusHalo ? 0.5 : 0) + (modern2026.reducedMotionGuards > 0 ? 0.5 : 0);
  const performanceBonus = (modern2026.scrollDrivenCSS ? 1 : 0) + (modern2026.viewTransitionsAPI ? 0.7 : 0);

  // Last-resort floor: if a scorer couldn't produce a score despite data, give a neutral 6.
  // With v1.1 all 12 scorers are present so this path is unreachable under normal circumstances.
  for (const dim of scoreCard.dimensions) {
    if (dim.score === null) dim.score = 6;
  }

  // THEN apply 2026 modern feature bonuses (so heuristic defaults don't overwrite them)
  for (const dim of scoreCard.dimensions) {
    if (dim.score === null) continue;
    if (dim.id === 'color') dim.score = Math.min(10, dim.score + colorBonus);
    if (dim.id === 'typography') dim.score = Math.min(10, dim.score + typographyBonus);
    if (dim.id === 'layout') dim.score = Math.min(10, dim.score + layoutBonus);
    if (dim.id === 'components') dim.score = Math.min(10, dim.score + componentBonus);
    if (dim.id === 'polish') dim.score = Math.min(10, dim.score + polishBonus);
    if (dim.id === 'interaction') dim.score = Math.min(10, dim.score + interactionBonus + interactionBonus2);
    if (dim.id === 'responsive') dim.score = Math.min(10, dim.score + responsiveBonus);
    if (dim.id === 'accessibility') dim.score = Math.min(10, dim.score + a11yBonus);
    if (dim.id === 'performance') dim.score = Math.min(10, dim.score + performanceBonus);
    if (dim.id === 'flows') dim.score = Math.min(10, dim.score + flowsBonus);
    if (dim.id === 'platform') dim.score = Math.min(10, dim.score + platformBonus);
    if (dim.id === 'hierarchy') {
      dim.score = Math.min(10, dim.score + (modern2026.multiLayerShadows && modern2026.tokenizedRadii ? 1.5 : 0));
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
  lines.push(`**Files scanned:** ${audit.files.css} CSS, ${audit.files.jsx} JSX/TSX/Vue/Svelte\n`);

  lines.push('## Project Profile\n');
  lines.push(`- **Framework:** ${labelOrDiag(audit.profile.framework, 'no framework detected')}`);
  lines.push(`- **Styling:** ${labelOrDiag(audit.profile.styling, 'no styling approach detected')}`);
  lines.push(`- **Component Library:** ${labelOrDiag(audit.profile.componentLib, 'none detected')}`);
  lines.push(`- **Theme System:** ${labelOrDiag(audit.profile.themeSystem, 'none detected')}`);
  if (audit.profile.isTailwindV4) lines.push(`- **Tailwind:** v4 (detected \`@theme\` / \`@import "tailwindcss"\`)`);
  if (audit.profile.tailwindV4Theme) {
    const tw = audit.profile.tailwindV4Theme;
    lines.push(`  - @theme blocks: ${tw.blocks} (${tw.hasInline ? 'inline' : 'default'}), ${tw.totalTokens} tokens`);
  }
  if (audit.profile.animationLib) lines.push(`- **Animation:** ${audit.profile.animationLib.join(', ')}`);
  if (audit.profile.iconLib) lines.push(`- **Icons:** ${audit.profile.iconLib.join(', ')}`);
  if (audit.profile.themeSignals && audit.profile.themeSignals.length) lines.push(`- **Theme signals:** ${audit.profile.themeSignals.join(', ')}`);
  lines.push(`- **Dark Mode:** ${audit.profile.hasDarkMode ? 'detected' : 'not detected'}\n`);

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
    lines.push('## Top 10 Findings\n');
    for (const f of audit.scoreCard.topFindings.slice(0, 10)) {
      const icon = f.severity === 'critical' ? '[!]' : f.severity === 'important' ? '[*]' : '[-]';
      lines.push(`- ${icon} **${f.dimension}**: ${f.msg}`);
    }
    lines.push('');

    const actionPlan = buildActionPlan(audit.scoreCard.topFindings);
    if (actionPlan.length > 0) {
      lines.push('## Action Plan\n');
      for (const bucket of actionPlan) {
        lines.push(`### ${bucket.label}\n`);
        for (const item of bucket.items) lines.push(`- [ ] **${item.dimension}** — ${item.msg}`);
        lines.push('');
      }
    }
  }

  const lowConf = audit.scoreCard.dimensions.filter(d => d.confidence === 'insufficient');
  if (lowConf.length > 0) {
    lines.push('## Low-Confidence Scores\n');
    lines.push('These dimensions had sparse data; treat their scores as directional, not final:');
    for (const d of lowConf) lines.push(`- **${d.label}** (score ${d.score}) — insufficient signal`);
    lines.push('');
  }

  return lines.join('\n');
}

function labelOrDiag(value, diagnosis) {
  if (value === null || value === undefined || value === '') return `*${diagnosis}*`;
  return String(value);
}

function buildActionPlan(findings) {
  const quick = findings.filter(f => f.severity === 'critical' && /focus|alt|contrast/i.test(f.msg)).slice(0, 5);
  const medium = findings.filter(f => f.severity === 'important' && !quick.includes(f)).slice(0, 5);
  const major = findings.filter(f => f.severity === 'critical' && !quick.includes(f)).slice(0, 3);
  const buckets = [];
  if (quick.length) buckets.push({ label: 'Quick wins (< 1 hour)', items: quick });
  if (medium.length) buckets.push({ label: 'Medium effort (1-4 hours)', items: medium });
  if (major.length) buckets.push({ label: 'Major improvements (4+ hours)', items: major });
  return buckets;
}

module.exports = {
  auditProject,
  formatReport,
  walkFiles,
  detectProjectProfile,
  extractAllColors,
};
