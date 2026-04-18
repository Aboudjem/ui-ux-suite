/**
 * UI/UX Suite — Scoring System
 * Multi-axis weighted scoring with grade calculation.
 */

const { DIMENSIONS, createScoreCard, calculateOverall } = require('./schema');
const { KNOWLEDGE } = require('./knowledge');

// --- Dimension scorers ---

function scoreColorSystem(colorData) {
  let score = 10;
  const findings = [];

  // Contrast failures
  if (colorData.contrastIssues && colorData.contrastIssues.length > 0) {
    const critical = colorData.contrastIssues.filter(i => i.ratio < 3);
    const moderate = colorData.contrastIssues.filter(i => i.ratio >= 3 && i.ratio < 4.5);
    if (critical.length > 0) { score -= 3; findings.push({ severity: 'critical', msg: `${critical.length} critical contrast failures (< 3:1)`, laws: ['aesthetic-usability-effect'] }); }
    if (moderate.length > 0) { score -= 1; findings.push({ severity: 'important', msg: `${moderate.length} contrast issues (< 4.5:1)`, laws: ['aesthetic-usability-effect'] }); }
  }

  // Near duplicates
  if (colorData.nearDuplicates && colorData.nearDuplicates.length > 3) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: `${colorData.nearDuplicates.length} near-duplicate colors - consolidate`, laws: ['law-of-similarity'] });
  }

  // Too many unique colors
  if (colorData.uniqueCount > 30) {
    score -= 2;
    findings.push({ severity: 'important', msg: `${colorData.uniqueCount} unique colors - too many, consolidate to a system`, laws: ['teslers-law', 'millers-law'] });
  } else if (colorData.uniqueCount > 20) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: `${colorData.uniqueCount} unique colors - consider consolidating`, laws: ['teslers-law'] });
  }

  // Missing semantic colors
  const semantic = colorData.semantic || {};
  const missing = ['primary', 'error', 'success', 'warning'].filter(role => !semantic[role]);
  if (missing.length > 0) {
    score -= missing.length * 0.5;
    findings.push({ severity: 'important', msg: `Missing semantic colors: ${missing.join(', ')}`, laws: ['jakobs-law'] });
  }

  // Dark mode
  if (colorData.hasDarkMode === false && colorData.shouldHaveDarkMode) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: 'No dark mode detected - consider adding one', laws: ['jakobs-law'] });
  }

  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings };
}

function scoreTypography(typeData) {
  let score = 10;
  const findings = [];

  // No type scale
  if (!typeData.scaleDetected) {
    score -= 2;
    findings.push({ severity: 'important', msg: 'No consistent type scale detected - sizes appear random', laws: ['law-of-pragnanz', 'law-of-similarity'] });
  }

  // Too many fonts
  if (typeData.fontCount > 3) {
    score -= 2;
    findings.push({ severity: 'important', msg: `${typeData.fontCount} different fonts - use 1-2 max`, laws: ['teslers-law', 'millers-law'] });
  } else if (typeData.fontCount > 2) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: '3 fonts detected - consider reducing to 2', laws: ['teslers-law'] });
  }

  // Small body text
  if (typeData.bodySize && typeData.bodySize < 14) {
    score -= 2;
    findings.push({ severity: 'critical', msg: `Body text too small (${typeData.bodySize}px) - minimum 14px, prefer 16px`, laws: ['fittss-law', 'aesthetic-usability-effect'] });
  } else if (typeData.bodySize && typeData.bodySize < 16) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: `Body text ${typeData.bodySize}px - consider 16px for readability`, laws: ['aesthetic-usability-effect'] });
  }

  // Line height
  if (typeData.bodyLineHeight && typeData.bodyLineHeight < 1.4) {
    score -= 1;
    findings.push({ severity: 'important', msg: `Body line height too tight (${typeData.bodyLineHeight}) - use 1.5+`, laws: ['law-of-pragnanz'] });
  }

  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings };
}

function scoreLayout(layoutData) {
  let score = 10;
  const findings = [];

  if (!layoutData.spacingConsistent) {
    score -= 2;
    findings.push({ severity: 'important', msg: 'Inconsistent spacing values - adopt a spacing scale', laws: ['law-of-proximity', 'law-of-pragnanz'] });
  }

  if (layoutData.offScaleCount > 5) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: `${layoutData.offScaleCount} spacing values off the grid - consolidate`, laws: ['law-of-proximity', 'law-of-uniform-connectedness'] });
  }

  if (!layoutData.hasMaxWidth) {
    score -= 1;
    findings.push({ severity: 'important', msg: 'No container max-width - content stretches on wide screens', laws: ['law-of-pragnanz', 'millers-law'] });
  }

  if (layoutData.breakpointCount === 0) {
    score -= 2;
    findings.push({ severity: 'critical', msg: 'No responsive breakpoints detected', laws: ['jakobs-law'] });
  }

  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings };
}

function scoreAccessibility(a11yData) {
  let score = 10;
  const findings = [];

  if (a11yData.contrastFailures > 0) {
    score -= Math.min(3, a11yData.contrastFailures * 0.5);
    findings.push({ severity: 'critical', msg: `${a11yData.contrastFailures} contrast ratio failures`, laws: ['aesthetic-usability-effect'] });
  }

  if (!a11yData.hasFocusIndicators) {
    score -= 2;
    findings.push({ severity: 'critical', msg: 'No visible focus indicators for keyboard navigation', laws: ['fittss-law', 'jakobs-law'] });
  }

  if (!a11yData.hasSkipLink) {
    score -= 0.5;
    findings.push({ severity: 'suggestion', msg: 'No skip-to-content link', laws: ['jakobs-law'] });
  }

  if (a11yData.missingAltText > 0) {
    score -= Math.min(2, a11yData.missingAltText * 0.3);
    findings.push({ severity: 'important', msg: `${a11yData.missingAltText} images missing alt text`, laws: ['postels-law'] });
  }

  if (!a11yData.hasReducedMotion) {
    score -= 1;
    findings.push({ severity: 'important', msg: 'No prefers-reduced-motion support', laws: ['postels-law'] });
  }

  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings };
}

// --- Missing scorers (v1.1) ---

function scoreComponents(d) {
  let score = 10;
  const findings = [];
  const stateCov = d.stateCoverage || {};

  if (!d.hasCnUtil) { score -= 1.5; findings.push({ severity: 'suggestion', msg: 'No cn()/clsx()/twMerge utility detected — class composition likely duplicated across components', laws: ['teslers-law'] }); }
  if (!d.hasCva) { score -= 1; findings.push({ severity: 'suggestion', msg: 'No class-variance-authority (cva) — variants likely inlined per component instead of tokenized', laws: ['aesthetic-usability-effect'] }); }
  if ((d.primitivesCount || 0) === 0) { score -= 2; findings.push({ severity: 'important', msg: 'No reusable UI primitives detected in components/ui/ — add shadcn/ui or equivalent to stop reinventing buttons', laws: ['jakobs-law'] }); }
  else if (d.primitivesCount < 5) { score -= 1; findings.push({ severity: 'suggestion', msg: `Only ${d.primitivesCount} UI primitives — library is thin, common patterns likely duplicated`, laws: ['jakobs-law'] }); }

  const hoverCount = stateCov.hover || 0;
  const focusCount = (stateCov.focusVisible || 0) + (stateCov.focus || 0);
  const disabledCount = stateCov.disabled || 0;
  if (hoverCount < 5) { score -= 1; findings.push({ severity: 'important', msg: `Only ${hoverCount} hover: variants — interactive elements likely lack hover feedback`, laws: ['doherty-threshold', 'aesthetic-usability-effect'] }); }
  if (focusCount < 2) { score -= 2; findings.push({ severity: 'critical', msg: `Insufficient focus-visible: variants (${focusCount}) — keyboard users cannot see focus`, laws: ['fittss-law'] }); }
  if (disabledCount === 0 && (d.primitivesCount || 0) > 0) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No disabled: variants — buttons/inputs lack disabled state styling', laws: ['postels-law'] }); }

  if (!d.hasIconLib) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No icon library detected (lucide-react, heroicons, phosphor-icons) — consistent iconography is a component-quality signal' }); }

  const confidence = (d.primitivesCount === undefined && !d.hasCnUtil && !d.hasCva) ? 'insufficient' : 'high';
  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings, confidence };
}

function scoreHierarchy(d) {
  let score = 10;
  const findings = [];

  if (!d.typeScaleDetected) { score -= 2; findings.push({ severity: 'important', msg: 'No type scale detected — heading sizes appear random rather than systematic', laws: ['law-of-pragnanz', 'law-of-similarity'] }); }

  const weights = Array.isArray(d.fontWeights) ? d.fontWeights : [];
  if (weights.length === 0) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No font-weight declarations found — hierarchy may rely only on size' }); }
  else if (weights.length === 1) { score -= 1; findings.push({ severity: 'suggestion', msg: 'Only one font weight in use — hierarchy needs weight contrast as well as size', laws: ['law-of-similarity'] }); }
  else if (weights.length > 5) { score -= 1; findings.push({ severity: 'suggestion', msg: `${weights.length} weights in use — consider simplifying to 2-3 (regular + bold, maybe medium)`, laws: ['teslers-law', 'millers-law'] }); }

  if ((d.h1Count || 0) === 0) { score -= 1.5; findings.push({ severity: 'important', msg: 'No h1 element detected — every page needs one primary heading', laws: ['law-of-pragnanz'] }); }
  if ((d.h1Count || 0) > (d.pageCount || 1) * 2) { score -= 1; findings.push({ severity: 'important', msg: 'Multiple h1 elements per page likely — use a single h1 for document outline', laws: ['law-of-pragnanz'] }); }
  if ((d.h2Count || 0) === 0 && (d.h3Count || 0) > 0) { score -= 1; findings.push({ severity: 'suggestion', msg: 'h3 used without h2 — heading levels skipped' }); }

  if (!d.has2xlOrLarger) { score -= 1; findings.push({ severity: 'suggestion', msg: 'No display-size type (text-2xl or larger) — hero text likely underscaled for visual anchoring', laws: ['aesthetic-usability-effect', 'von-restorff'] }); }

  const confidence = (d.h1Count === undefined && !d.typeScaleDetected) ? 'insufficient' : 'high';
  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings, confidence };
}

function scoreInteraction(d) {
  let score = 10;
  const findings = [];

  if (!d.hasTransitions) { score -= 2; findings.push({ severity: 'important', msg: 'No transition-* utilities detected — state changes likely snap instantly, feel harsh', laws: ['doherty-threshold'] }); }
  if (!d.hasHoverStates) { score -= 2; findings.push({ severity: 'important', msg: 'No hover: state styling — interactive elements offer no affordance feedback', laws: ['aesthetic-usability-effect'] }); }
  if (!d.hasFocusVisible) { score -= 2; findings.push({ severity: 'critical', msg: 'No focus-visible: styling — keyboard navigation is invisible', laws: ['fittss-law'] }); }
  if (!d.hasActive) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No active: state styling — press feedback missing on tap/click', laws: ['doherty-threshold'] }); }
  if (!d.hasReducedMotion) { score -= 1; findings.push({ severity: 'important', msg: 'No prefers-reduced-motion media query — motion-sensitive users have no escape', laws: ['postels-law'] }); }
  if (!d.hasMotionLib) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No motion library (motion/framer-motion/tailwindcss-animate) — orchestrated animation likely absent' }); }

  const confidence = (d.hasTransitions === undefined && d.hasHoverStates === undefined) ? 'insufficient' : 'high';
  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings, confidence };
}

function scoreResponsive(d) {
  let score = 10;
  const findings = [];

  const distinct = Array.isArray(d.distinctBreakpoints) ? d.distinctBreakpoints : [];
  if (distinct.length === 0) { score -= 3; findings.push({ severity: 'critical', msg: 'No responsive breakpoints (sm/md/lg/xl/2xl) used in className — UI is not adaptive', laws: ['jakobs-law'] }); }
  else if (distinct.length < 2) { score -= 1.5; findings.push({ severity: 'important', msg: `Only ${distinct.length} distinct breakpoint in use — mobile/desktop parity likely broken`, laws: ['jakobs-law'] }); }

  const ratio = typeof d.ratioResponsive === 'number' ? d.ratioResponsive : 0;
  if (ratio > 0 && ratio < 0.1) { score -= 1; findings.push({ severity: 'suggestion', msg: `Only ${Math.round(ratio * 100)}% of classes have responsive variants — layout likely desktop-first`, laws: ['jakobs-law'] }); }

  if (!d.hasFluidType) { score -= 1; findings.push({ severity: 'suggestion', msg: 'No fluid type (clamp) detected — type scales stepwise at breakpoints instead of smoothly', laws: ['aesthetic-usability-effect'] }); }
  if (!d.hasContainerQueries) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No container queries — components cannot self-adapt to their container size (2026 modern signal)' }); }

  const confidence = d.distinctBreakpoints === undefined ? 'insufficient' : 'high';
  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings, confidence };
}

function scorePolish(d) {
  let score = 10;
  const findings = [];

  if ((d.shadowCount || 0) === 0) { score -= 1.5; findings.push({ severity: 'suggestion', msg: 'No box-shadow usage — surfaces feel flat, elevation hierarchy missing', laws: ['law-of-pragnanz'] }); }
  else if (d.shadowCount > 20) { score -= 1; findings.push({ severity: 'suggestion', msg: `${d.shadowCount} distinct shadow values — consolidate to a shadow token scale (sm/md/lg/xl)`, laws: ['teslers-law', 'law-of-similarity'] }); }

  if ((d.radiusCount || 0) === 0) { score -= 1; findings.push({ severity: 'suggestion', msg: 'No border-radius usage — sharp corners throughout, may feel severe' }); }
  else if (d.radiusCount > 6) { score -= 1; findings.push({ severity: 'suggestion', msg: `${d.radiusCount} distinct radius values — consolidate to a radius token scale`, laws: ['law-of-similarity'] }); }

  if (!d.multiLayerShadows) { score -= 1; findings.push({ severity: 'suggestion', msg: 'No multi-layer shadows — soft elevation achieved better with stacked shadows (0 1px 2px, 0 4px 8px)', laws: ['aesthetic-usability-effect'] }); }
  if (!d.tokenizedRadii) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No --radius-* tokens — radii defined ad-hoc rather than via a token system' }); }

  if (typeof d.gradientUsage === 'number' && d.gradientUsage > 30) { score -= 1; findings.push({ severity: 'suggestion', msg: 'Heavy gradient usage — risks looking dated or noisy', laws: ['aesthetic-usability-effect'] }); }

  const confidence = (d.shadowCount === undefined && d.radiusCount === undefined) ? 'insufficient' : 'high';
  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings, confidence };
}

function scorePerformance(d) {
  let score = 10;
  const findings = [];

  if (!d.hasNextFont) { score -= 1.5; findings.push({ severity: 'important', msg: 'No next/font or geist usage — web fonts likely block first paint', laws: ['doherty-threshold'] }); }
  if (!d.hasNextImage && (d.imagesInJsx || 0) > 0) { score -= 2; findings.push({ severity: 'important', msg: `${d.imagesInJsx} raw <img> tags found — use next/image for lazy-loading, responsive sizes, and LCP optimization`, laws: ['doherty-threshold'] }); }
  if (!d.hasSuspense) { score -= 1; findings.push({ severity: 'suggestion', msg: 'No React Suspense boundaries — loading transitions likely blocking rather than streamed', laws: ['doherty-threshold'] }); }
  if (!d.hasSkeleton) { score -= 1; findings.push({ severity: 'suggestion', msg: 'No skeleton components — perceived performance will feel worse than actual', laws: ['doherty-threshold', 'aesthetic-usability-effect'] }); }
  if (d.hasViewTransitions === false) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No View Transitions API usage — route changes likely lack smooth continuity (2026 modern signal)' }); }

  const confidence = (d.hasNextFont === undefined && d.hasNextImage === undefined) ? 'insufficient' : 'high';
  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings, confidence };
}

function scoreFlows(d) {
  let score = 10;
  const findings = [];

  if (!d.hasCommandPalette) { score -= 1; findings.push({ severity: 'suggestion', msg: 'No command palette (cmdk) — power users lack fast navigation affordance' }); }
  if (!d.hasBreadcrumbs && (d.hasNestedRoutes === true)) { score -= 1; findings.push({ severity: 'suggestion', msg: 'Nested routes without breadcrumbs — users may lose navigation context', laws: ['jakobs-law', 'law-of-pragnanz'] }); }
  if (!d.hasEmptyStates) { score -= 2; findings.push({ severity: 'important', msg: 'No empty-state components detected — users see blank pages on first use instead of guidance', laws: ['aesthetic-usability-effect', 'jakobs-law'] }); }
  if (!d.hasFormValidation) { score -= 1; findings.push({ severity: 'important', msg: 'No zod/yup/valibot — form validation likely ad-hoc, error messages inconsistent', laws: ['postels-law'] }); }
  if (!d.hasI18n) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No i18n library (next-intl/react-i18next) — international users excluded by default' }); }
  if (!d.hasOnboarding) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No onboarding flow detected — new users dropped at the deep end', laws: ['peak-end-rule'] }); }

  const confidence = (d.hasEmptyStates === undefined && d.hasFormValidation === undefined) ? 'insufficient' : 'high';
  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings, confidence };
}

function scorePlatform(d) {
  let score = 10;
  const findings = [];

  if (!d.hasDarkMode) { score -= 1.5; findings.push({ severity: 'important', msg: 'No dark mode — users in dark environments strained; expected on web 2026', laws: ['jakobs-law'] }); }
  if (d.hasLangAttr === false) { score -= 1; findings.push({ severity: 'important', msg: 'No <html lang="..."> attribute — screen readers cannot announce content language', laws: ['postels-law'] }); }
  if (!d.hasPrefersReducedMotion) { score -= 1; findings.push({ severity: 'important', msg: 'No prefers-reduced-motion support — motion-sensitive users have no opt-out', laws: ['postels-law'] }); }
  if (!d.hasPrefersColorScheme) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No prefers-color-scheme media query — system dark mode preference ignored' }); }
  if (!d.hasRTL) { score -= 0.5; findings.push({ severity: 'suggestion', msg: 'No logical properties or RTL awareness — right-to-left scripts break layout' }); }
  if (d.hasTouchTargets === false) { score -= 1; findings.push({ severity: 'important', msg: 'Interactive elements smaller than 44x44px detected — violates mobile touch guidelines', laws: ['fittss-law'] }); }

  const confidence = (d.hasDarkMode === undefined && d.hasLangAttr === undefined) ? 'insufficient' : 'high';
  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings, confidence };
}

const ALL_SCORERS = {
  color: scoreColorSystem,
  typography: scoreTypography,
  layout: scoreLayout,
  accessibility: scoreAccessibility,
  components: scoreComponents,
  hierarchy: scoreHierarchy,
  interaction: scoreInteraction,
  responsive: scoreResponsive,
  polish: scorePolish,
  performance: scorePerformance,
  flows: scoreFlows,
  platform: scorePlatform,
};

// --- Full audit scorer ---

function runFullScoring(auditData) {
  const scoreCard = createScoreCard();

  for (const dim of scoreCard.dimensions) {
    if (ALL_SCORERS[dim.id] && auditData[dim.id]) {
      const result = ALL_SCORERS[dim.id](auditData[dim.id]);
      dim.score = result.score;
      dim.findings = result.findings;
      if (result.confidence) dim.confidence = result.confidence;
    }
  }

  calculateOverall(scoreCard);

  // Collect top findings across all dimensions
  scoreCard.topFindings = scoreCard.dimensions
    .flatMap(d => d.findings.map(f => ({ ...f, dimension: d.id })))
    .sort((a, b) => {
      const severityOrder = { critical: 0, important: 1, suggestion: 2, 'nice-to-have': 3 };
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    })
    .slice(0, 20);

  return scoreCard;
}

// --- Report formatting ---

function formatScoreCard(scoreCard) {
  const lines = [];
  lines.push('# Design Score Card\n');
  lines.push(`**Overall: ${scoreCard.overall}/10 - ${scoreCard.grade}**\n`);
  lines.push('| Dimension | Score | Weight |');
  lines.push('|-----------|-------|--------|');

  for (const dim of scoreCard.dimensions) {
    const bar = dim.score !== null ? scoreBar(dim.score) : '-';
    lines.push(`| ${dim.label} | ${dim.score !== null ? dim.score + '/10' : 'N/A'} ${bar} | ${Math.round(dim.weight * 100)}% |`);
  }

  if (scoreCard.topFindings && scoreCard.topFindings.length > 0) {
    lines.push('\n## Top Findings\n');
    for (const f of scoreCard.topFindings) {
      const icon = f.severity === 'critical' ? '[!]' : f.severity === 'important' ? '[*]' : '[-]';
      const dimLabel = f.dimension || 'general';
      let line = `- ${icon} **${dimLabel}**: ${f.msg}`;
      if (f.laws && f.laws.length > 0) {
        const names = f.laws.map(s => (KNOWLEDGE.laws && KNOWLEDGE.laws[s] && KNOWLEDGE.laws[s].name) || s).join(', ');
        line += ` - violates ${names}.`;
      }
      lines.push(line);
    }
  }

  // D-09: Laws of UX Coverage summary
  const coverage = collectLawsCoverage(scoreCard);
  if (Object.keys(coverage).length > 0) {
    lines.push('\n## Laws of UX Coverage\n');
    lines.push('| Law | Violations | Worst Offender |');
    lines.push('|-----|-----------:|----------------|');
    const rank = { critical: 0, important: 1, suggestion: 2, 'nice-to-have': 3 };
    const rows = Object.entries(coverage).sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      if (rank[a[1].worstSeverity] !== rank[b[1].worstSeverity]) {
        return rank[a[1].worstSeverity] - rank[b[1].worstSeverity];
      }
      return a[0].localeCompare(b[0]);
    });
    for (const [slug, info] of rows) {
      const lawName = (KNOWLEDGE.laws && KNOWLEDGE.laws[slug] && KNOWLEDGE.laws[slug].name) || slug;
      lines.push(`| ${lawName} (\`${slug}\`) | ${info.count} | ${info.worstMsg} |`);
    }
  }

  return lines.join('\n');
}

function collectLawsCoverage(scoreCard) {
  const coverage = {};
  const rank = { critical: 0, important: 1, suggestion: 2, 'nice-to-have': 3 };
  for (const dim of scoreCard.dimensions) {
    for (const f of (dim.findings || [])) {
      const laws = f.laws || [];
      for (const slug of laws) {
        if (!coverage[slug]) {
          coverage[slug] = { count: 0, worstMsg: f.msg, worstSeverity: f.severity };
        }
        coverage[slug].count += 1;
        if ((rank[f.severity] ?? 4) < (rank[coverage[slug].worstSeverity] ?? 4)) {
          coverage[slug].worstSeverity = f.severity;
          coverage[slug].worstMsg = f.msg;
        }
      }
    }
  }
  return coverage;
}

function scoreBar(score) {
  const filled = Math.round(score);
  const empty = 10 - filled;
  return '|' + '#'.repeat(filled) + '.'.repeat(empty) + '|';
}

module.exports = {
  scoreColorSystem,
  scoreTypography,
  scoreLayout,
  scoreAccessibility,
  scoreComponents,
  scoreHierarchy,
  scoreInteraction,
  scoreResponsive,
  scorePolish,
  scorePerformance,
  scoreFlows,
  scorePlatform,
  ALL_SCORERS,
  runFullScoring,
  formatScoreCard,
  collectLawsCoverage,
};
