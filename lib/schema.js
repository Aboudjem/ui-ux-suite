/**
 * UI/UX Suite — Shared Schemas
 * Defines structures for scores, tokens, palettes, reports, and findings.
 */

// --- Score schemas ---

const DIMENSIONS = [
  { id: 'color', label: 'Color System', weight: 0.10 },
  { id: 'typography', label: 'Typography System', weight: 0.10 },
  { id: 'layout', label: 'Layout & Spacing', weight: 0.10 },
  { id: 'components', label: 'Component Quality', weight: 0.10 },
  { id: 'accessibility', label: 'Accessibility', weight: 0.12 },
  { id: 'hierarchy', label: 'Visual Hierarchy', weight: 0.10 },
  { id: 'interaction', label: 'Interaction Quality', weight: 0.08 },
  { id: 'responsive', label: 'Responsiveness', weight: 0.08 },
  { id: 'polish', label: 'Visual Polish', weight: 0.07 },
  { id: 'performance', label: 'Performance UX', weight: 0.05 },
  { id: 'flows', label: 'Information Architecture', weight: 0.05 },
  { id: 'platform', label: 'Platform Appropriateness', weight: 0.05 },
];

const SEVERITY_LEVELS = ['critical', 'important', 'suggestion', 'nice-to-have'];

const EFFORT_LEVELS = ['trivial', 'small', 'medium', 'large', 'major'];

function createScoreCard() {
  return {
    dimensions: DIMENSIONS.map(d => ({ ...d, score: null, findings: [] })),
    overall: null,
    grade: null,
    topFindings: [],
    generatedAt: new Date().toISOString(),
  };
}

function calculateOverall(scoreCard) {
  let total = 0;
  let weightSum = 0;
  for (const dim of scoreCard.dimensions) {
    if (dim.score !== null) {
      total += dim.score * dim.weight;
      weightSum += dim.weight;
    }
  }
  scoreCard.overall = weightSum > 0 ? Math.round((total / weightSum) * 10) / 10 : null;
  scoreCard.grade = getGrade(scoreCard.overall);
  return scoreCard;
}

function getGrade(score) {
  if (score === null) return null;
  if (score >= 9.0) return 'Exceptional';
  if (score >= 8.0) return 'Strong';
  if (score >= 7.0) return 'Good';
  if (score >= 6.0) return 'Adequate';
  if (score >= 5.0) return 'Below Average';
  return 'Needs Work';
}

// --- Finding schema ---

function createFinding({ dimension, severity, title, description, impact, fix, effort, before, after, laws }) {
  return {
    id: `${dimension}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dimension,
    severity,
    title,
    description,
    impact,
    fix,
    effort,
    before: before || null,
    after: after || null,
    laws: Array.isArray(laws) && laws.length > 0 ? laws : undefined,
  };
}

// --- Design token schemas ---

function createColorToken(name, value, role, description) {
  return { name, value, role, description };
}

function createTypeToken(name, size, lineHeight, weight, letterSpacing) {
  return { name, size, lineHeight, weight, letterSpacing };
}

function createSpacingToken(name, value) {
  return { name, value };
}

// --- Project profile schema ---

function createProjectProfile() {
  return {
    framework: null,       // react, vue, svelte, next, nuxt, angular, vanilla
    styling: null,         // tailwind-v3, tailwind-v4, css-modules, styled-components, scss, panda-css, vanilla-extract, emotion, stitches, vanilla-css
    componentLib: null,    // shadcn/ui, mui, chakra, ant-design, radix, mantine, headless-ui, ark-ui, custom, none
    themeSystem: null,     // tailwind-v4-theme, css-vars, next-themes, tailwind-config, token-files, theme-provider, none
    themeSignals: [],      // e.g. ['next-themes', 'class-variance-authority', 'tailwind-merge']
    animationLib: null,    // ['motion', 'tailwindcss-animate', ...] or null
    iconLib: null,         // ['lucide-react', 'heroicons', ...] or null
    hasDesignTokens: false,
    hasDarkMode: false,
    isTailwindV4: false,
    tailwindV4Theme: null, // { blocks, hasInline, hasDefault, totalTokens, counts } or null
    platform: null,        // web, mobile, cross-platform
    maturity: null,        // early, developing, mature
    files: {
      styles: [],
      components: [],
      config: [],
      tokens: [],
      theme: [],
    },
  };
}

// --- Color system schema ---

function createColorSystem() {
  return {
    primitives: [],       // raw color values found
    semantic: {           // mapped roles
      primary: null,
      secondary: null,
      accent: null,
      neutral: [],
      success: null,
      error: null,
      warning: null,
      info: null,
    },
    surfaces: {           // background layers
      background: null,
      surface: null,
      elevated: null,
      overlay: null,
    },
    text: {
      primary: null,
      secondary: null,
      muted: null,
      inverse: null,
    },
    border: {
      default: null,
      strong: null,
      muted: null,
    },
    contrastIssues: [],   // pairs that fail WCAG
    nearDuplicates: [],   // colors within deltaE < 3
    darkMode: null,       // separate color system for dark mode
  };
}

// --- Typography system schema ---

function createTypeSystem() {
  return {
    fonts: [],            // { family, category, weights, source }
    scale: [],            // ordered sizes found
    scaleRatio: null,     // detected ratio (if any)
    lineHeights: [],
    weights: [],
    headings: {},         // h1-h6 styles
    body: null,
    caption: null,
    label: null,
    issues: [],
  };
}

// --- Spacing system schema ---

function createSpacingSystem() {
  return {
    baseUnit: null,       // detected base (usually 4 or 8)
    scale: [],            // spacing values in use
    isConsistent: false,  // follows a scale
    gaps: [],             // common gap values
    paddings: [],
    margins: [],
    issues: [],
  };
}

module.exports = {
  DIMENSIONS,
  SEVERITY_LEVELS,
  EFFORT_LEVELS,
  createScoreCard,
  calculateOverall,
  getGrade,
  createFinding,
  createColorToken,
  createTypeToken,
  createSpacingToken,
  createProjectProfile,
  createColorSystem,
  createTypeSystem,
  createSpacingSystem,
};
