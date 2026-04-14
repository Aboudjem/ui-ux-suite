/**
 * UI/UX Suite — Scoring System
 * Multi-axis weighted scoring with grade calculation.
 */

const { DIMENSIONS, createScoreCard, calculateOverall } = require('./schema');

// --- Dimension scorers ---

function scoreColorSystem(colorData) {
  let score = 10;
  const findings = [];

  // Contrast failures
  if (colorData.contrastIssues && colorData.contrastIssues.length > 0) {
    const critical = colorData.contrastIssues.filter(i => i.ratio < 3);
    const moderate = colorData.contrastIssues.filter(i => i.ratio >= 3 && i.ratio < 4.5);
    if (critical.length > 0) { score -= 3; findings.push({ severity: 'critical', msg: `${critical.length} critical contrast failures (< 3:1)` }); }
    if (moderate.length > 0) { score -= 1; findings.push({ severity: 'important', msg: `${moderate.length} contrast issues (< 4.5:1)` }); }
  }

  // Near duplicates
  if (colorData.nearDuplicates && colorData.nearDuplicates.length > 3) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: `${colorData.nearDuplicates.length} near-duplicate colors — consolidate` });
  }

  // Too many unique colors
  if (colorData.uniqueCount > 30) {
    score -= 2;
    findings.push({ severity: 'important', msg: `${colorData.uniqueCount} unique colors — too many, consolidate to a system` });
  } else if (colorData.uniqueCount > 20) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: `${colorData.uniqueCount} unique colors — consider consolidating` });
  }

  // Missing semantic colors
  const semantic = colorData.semantic || {};
  const missing = ['primary', 'error', 'success', 'warning'].filter(role => !semantic[role]);
  if (missing.length > 0) {
    score -= missing.length * 0.5;
    findings.push({ severity: 'important', msg: `Missing semantic colors: ${missing.join(', ')}` });
  }

  // Dark mode
  if (colorData.hasDarkMode === false && colorData.shouldHaveDarkMode) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: 'No dark mode detected — consider adding one' });
  }

  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings };
}

function scoreTypography(typeData) {
  let score = 10;
  const findings = [];

  // No type scale
  if (!typeData.scaleDetected) {
    score -= 2;
    findings.push({ severity: 'important', msg: 'No consistent type scale detected — sizes appear random' });
  }

  // Too many fonts
  if (typeData.fontCount > 3) {
    score -= 2;
    findings.push({ severity: 'important', msg: `${typeData.fontCount} different fonts — use 1-2 max` });
  } else if (typeData.fontCount > 2) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: '3 fonts detected — consider reducing to 2' });
  }

  // Small body text
  if (typeData.bodySize && typeData.bodySize < 14) {
    score -= 2;
    findings.push({ severity: 'critical', msg: `Body text too small (${typeData.bodySize}px) — minimum 14px, prefer 16px` });
  } else if (typeData.bodySize && typeData.bodySize < 16) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: `Body text ${typeData.bodySize}px — consider 16px for readability` });
  }

  // Line height
  if (typeData.bodyLineHeight && typeData.bodyLineHeight < 1.4) {
    score -= 1;
    findings.push({ severity: 'important', msg: `Body line height too tight (${typeData.bodyLineHeight}) — use 1.5+` });
  }

  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings };
}

function scoreLayout(layoutData) {
  let score = 10;
  const findings = [];

  if (!layoutData.spacingConsistent) {
    score -= 2;
    findings.push({ severity: 'important', msg: 'Inconsistent spacing values — adopt a spacing scale' });
  }

  if (layoutData.offScaleCount > 5) {
    score -= 1;
    findings.push({ severity: 'suggestion', msg: `${layoutData.offScaleCount} spacing values off the grid — consolidate` });
  }

  if (!layoutData.hasMaxWidth) {
    score -= 1;
    findings.push({ severity: 'important', msg: 'No container max-width — content stretches on wide screens' });
  }

  if (layoutData.breakpointCount === 0) {
    score -= 2;
    findings.push({ severity: 'critical', msg: 'No responsive breakpoints detected' });
  }

  return { score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)), findings };
}

function scoreAccessibility(a11yData) {
  let score = 10;
  const findings = [];

  if (a11yData.contrastFailures > 0) {
    score -= Math.min(3, a11yData.contrastFailures * 0.5);
    findings.push({ severity: 'critical', msg: `${a11yData.contrastFailures} contrast ratio failures` });
  }

  if (!a11yData.hasFocusIndicators) {
    score -= 2;
    findings.push({ severity: 'critical', msg: 'No visible focus indicators for keyboard navigation' });
  }

  if (!a11yData.hasSkipLink) {
    score -= 0.5;
    findings.push({ severity: 'suggestion', msg: 'No skip-to-content link' });
  }

  if (a11yData.missingAltText > 0) {
    score -= Math.min(2, a11yData.missingAltText * 0.3);
    findings.push({ severity: 'important', msg: `${a11yData.missingAltText} images missing alt text` });
  }

  if (!a11yData.hasReducedMotion) {
    score -= 1;
    findings.push({ severity: 'important', msg: 'No prefers-reduced-motion support' });
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
  lines.push(`**Overall: ${scoreCard.overall}/10 — ${scoreCard.grade}**\n`);
  lines.push('| Dimension | Score | Weight |');
  lines.push('|-----------|-------|--------|');

  for (const dim of scoreCard.dimensions) {
    const bar = dim.score !== null ? scoreBar(dim.score) : '—';
    lines.push(`| ${dim.label} | ${dim.score !== null ? dim.score + '/10' : 'N/A'} ${bar} | ${Math.round(dim.weight * 100)}% |`);
  }

  if (scoreCard.topFindings.length > 0) {
    lines.push('\n## Top Findings\n');
    for (const f of scoreCard.topFindings) {
      const icon = f.severity === 'critical' ? '[!]' : f.severity === 'important' ? '[*]' : '[-]';
      lines.push(`- ${icon} **${f.dimension}**: ${f.msg}`);
    }
  }

  return lines.join('\n');
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
};
