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

// --- Full audit scorer ---

function runFullScoring(auditData) {
  const scoreCard = createScoreCard();

  const scorers = {
    color: scoreColorSystem,
    typography: scoreTypography,
    layout: scoreLayout,
    accessibility: scoreAccessibility,
  };

  for (const dim of scoreCard.dimensions) {
    if (scorers[dim.id] && auditData[dim.id]) {
      const result = scorers[dim.id](auditData[dim.id]);
      dim.score = result.score;
      dim.findings = result.findings;
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
      let line = `- ${icon} **${f.dimension}**: ${f.msg}`;
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
  runFullScoring,
  formatScoreCard,
  collectLawsCoverage,
};
