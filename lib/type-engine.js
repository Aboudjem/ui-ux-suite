/**
 * UI/UX Suite — Typography Engine
 * Type scale math, readability scoring, font analysis.
 */

// --- Type scale generation ---

const SCALE_RATIOS = {
  'minor-second':  { ratio: 1.067, label: 'Minor Second', use: 'Dense UI, compact dashboards' },
  'major-second':  { ratio: 1.125, label: 'Major Second', use: 'Compact apps, data-heavy UI' },
  'minor-third':   { ratio: 1.200, label: 'Minor Third', use: 'Balanced — most common for apps' },
  'major-third':   { ratio: 1.250, label: 'Major Third', use: 'Spacious — marketing, editorial' },
  'perfect-fourth': { ratio: 1.333, label: 'Perfect Fourth', use: 'Bold — landing pages, magazines' },
  'augmented-fourth': { ratio: 1.414, label: 'Augmented Fourth', use: 'Dramatic — hero sections' },
  'perfect-fifth': { ratio: 1.500, label: 'Perfect Fifth', use: 'Very dramatic — display type' },
  'golden-ratio':  { ratio: 1.618, label: 'Golden Ratio', use: 'Extreme contrast — limited use' },
};

function generateTypeScale(baseSize = 16, ratio = 1.250, steps = { down: 2, up: 6 }) {
  const scale = [];

  // Generate smaller sizes
  for (let i = steps.down; i > 0; i--) {
    const size = baseSize / Math.pow(ratio, i);
    scale.push({
      step: -i,
      px: Math.round(size * 100) / 100,
      rem: Math.round((size / 16) * 1000) / 1000,
      role: i === 2 ? 'caption' : 'small',
    });
  }

  // Base size
  scale.push({ step: 0, px: baseSize, rem: baseSize / 16, role: 'body' });

  // Generate larger sizes
  const roles = ['large-body', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1', 'display'];
  for (let i = 1; i <= steps.up; i++) {
    const size = baseSize * Math.pow(ratio, i);
    scale.push({
      step: i,
      px: Math.round(size * 100) / 100,
      rem: Math.round((size / 16) * 1000) / 1000,
      role: roles[i - 1] || `step-${i}`,
    });
  }

  return scale;
}

function generateFluidTypeScale(baseSize = 16, ratio = 1.250, minVw = 320, maxVw = 1440) {
  const scale = generateTypeScale(baseSize, ratio);
  return scale.map(step => {
    const minSize = step.px * 0.85;
    const maxSize = step.px;
    const slope = (maxSize - minSize) / (maxVw - minVw);
    const yIntersect = minSize - slope * minVw;
    return {
      ...step,
      clamp: `clamp(${(minSize / 16).toFixed(3)}rem, ${(yIntersect / 16).toFixed(4)}rem + ${(slope * 100).toFixed(3)}vw, ${(maxSize / 16).toFixed(3)}rem)`,
    };
  });
}

// --- Line height recommendations ---

function recommendLineHeight(fontSize) {
  if (fontSize <= 12) return 1.6;
  if (fontSize <= 16) return 1.5;
  if (fontSize <= 20) return 1.45;
  if (fontSize <= 28) return 1.35;
  if (fontSize <= 40) return 1.25;
  if (fontSize <= 60) return 1.15;
  return 1.1;
}

function lineHeightSystem() {
  return {
    tight: 1.1,     // Display/hero headings
    snug: 1.25,     // Headings
    normal: 1.5,    // Body text
    relaxed: 1.625, // Body text (generous)
    loose: 1.75,    // Small text, captions
  };
}

// --- Font categorization ---

const FONT_CATEGORIES = {
  'geometric-sans': {
    description: 'Modern, clean, technical',
    bestFor: ['SaaS', 'tech', 'productivity', 'developer tools'],
    examples: ['Inter', 'Geist', 'DM Sans', 'Outfit', 'Poppins'],
    personality: 'Precise, efficient, contemporary',
  },
  'humanist-sans': {
    description: 'Friendly, approachable, warm',
    bestFor: ['consumer apps', 'health', 'education', 'community'],
    examples: ['Plus Jakarta Sans', 'Nunito', 'Source Sans 3', 'Open Sans'],
    personality: 'Welcoming, trustworthy, human',
  },
  'grotesque-sans': {
    description: 'Neutral, professional, versatile',
    bestFor: ['enterprise', 'finance', 'news', 'any'],
    examples: ['Instrument Sans', 'General Sans', 'Satoshi', 'Helvetica Neue'],
    personality: 'Authoritative, dependable, universal',
  },
  'serif': {
    description: 'Authoritative, editorial, sophisticated',
    bestFor: ['media', 'editorial', 'luxury', 'legal'],
    examples: ['Merriweather', 'Lora', 'Playfair Display', 'Fraunces'],
    personality: 'Established, refined, credible',
  },
  'mono': {
    description: 'Technical, code-like, precise',
    bestFor: ['developer tools', 'terminal', 'data', 'code'],
    examples: ['JetBrains Mono', 'Fira Code', 'Geist Mono', 'IBM Plex Mono'],
    personality: 'Technical, exact, systematic',
  },
};

// --- Readability scoring ---

function scoreReadability({ fontSize, lineHeight, measure, fontWeight }) {
  let score = 10;
  const issues = [];

  // Font size
  if (fontSize < 14) { score -= 3; issues.push('Body text too small (< 14px)'); }
  else if (fontSize < 16) { score -= 1; issues.push('Body text slightly small (< 16px)'); }

  // Line height
  if (lineHeight < 1.3) { score -= 2; issues.push('Line height too tight (< 1.3)'); }
  else if (lineHeight < 1.4) { score -= 1; issues.push('Line height slightly tight (< 1.4)'); }
  else if (lineHeight > 2.0) { score -= 1; issues.push('Line height too loose (> 2.0)'); }

  // Measure (chars per line)
  if (measure && measure > 80) { score -= 2; issues.push(`Line too long (${measure} chars, max 75)`); }
  else if (measure && measure > 75) { score -= 1; issues.push(`Line slightly long (${measure} chars)`); }
  else if (measure && measure < 30) { score -= 1; issues.push(`Line too short (${measure} chars)`); }

  // Font weight
  if (fontWeight && fontWeight < 300) { score -= 1; issues.push('Font weight too light for body text'); }

  return { score: Math.max(0, score), issues };
}

// --- Scale detection ---

function detectTypeScale(sizes) {
  if (sizes.length < 3) return null;

  const sorted = [...sizes].sort((a, b) => a - b);
  const ratios = [];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] > 0) {
      ratios.push(sorted[i] / sorted[i - 1]);
    }
  }

  // Check if ratios are consistent
  const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const variance = ratios.reduce((sum, r) => sum + Math.pow(r - avgRatio, 2), 0) / ratios.length;

  if (variance < 0.01) {
    // Find closest named scale
    let closest = null;
    let closestDiff = Infinity;
    for (const [name, config] of Object.entries(SCALE_RATIOS)) {
      const diff = Math.abs(config.ratio - avgRatio);
      if (diff < closestDiff) {
        closestDiff = diff;
        closest = name;
      }
    }
    return {
      detected: true,
      ratio: Math.round(avgRatio * 1000) / 1000,
      closestNamed: closestDiff < 0.05 ? closest : null,
      variance: Math.round(variance * 10000) / 10000,
    };
  }

  return { detected: false, ratio: avgRatio, variance: Math.round(variance * 10000) / 10000 };
}

// --- Font weight strategy ---

function recommendWeightStrategy(currentWeights) {
  const ideal = {
    regular: 400,   // Body text
    medium: 500,    // Emphasis, labels
    semibold: 600,  // Headings, buttons
    bold: 700,      // Strong emphasis
  };

  const recommendations = [];
  const weights = currentWeights.map(Number).filter(n => !isNaN(n));

  if (weights.length === 1) {
    recommendations.push('Only one weight detected — add at least medium (500) and semibold (600) for hierarchy');
  }
  if (weights.length > 4) {
    recommendations.push('Too many weights loaded — consider reducing to 3-4 for performance');
  }
  if (!weights.includes(400) && !weights.includes(300)) {
    recommendations.push('No regular weight (400) detected — needed for body text');
  }
  if (weights.filter(w => w >= 600).length === 0) {
    recommendations.push('No bold weights — headings and emphasis need 600-700');
  }

  return { ideal, current: weights, recommendations };
}

// --- System font stacks ---

const SYSTEM_FONT_STACKS = {
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
};

module.exports = {
  SCALE_RATIOS,
  FONT_CATEGORIES,
  SYSTEM_FONT_STACKS,
  generateTypeScale,
  generateFluidTypeScale,
  recommendLineHeight,
  lineHeightSystem,
  scoreReadability,
  detectTypeScale,
  recommendWeightStrategy,
};
