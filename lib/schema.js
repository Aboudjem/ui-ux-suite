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

let _findingSeq = 0;

/**
 * Build a finding. The rebuild requires the `evidence` block for every audit-pipeline finding:
 *   evidence: { file, line, col, selector, measured, threshold, screenshot }
 * A finding that names where it lives (file:line / selector), the measured wrong value, and a
 * concrete fix is what makes the audit "specific + located + measured + fixed".
 *
 * `idSeed` makes ids deterministic (no Date.now/Math.random) so output is stable across runs
 * for snapshot tests; falls back to a sequence counter.
 */
function createFinding({ dimension, severity, title, description, impact, fix, effort, before, after, laws, nielsen, wcag, evidence, confidence, idSeed }) {
  const seed = idSeed != null ? idSeed : (_findingSeq++);
  return {
    id: `${dimension}-${seed}`,
    dimension,
    severity,
    title,
    description: description || null,
    impact: impact || null,
    fix: fix || null,
    effort: effort || null,
    before: before != null ? before : null,
    after: after != null ? after : null,
    laws: Array.isArray(laws) && laws.length > 0 ? laws : undefined,
    nielsen: Array.isArray(nielsen) && nielsen.length > 0 ? nielsen : undefined,
    wcag: Array.isArray(wcag) && wcag.length > 0 ? wcag : undefined,
    evidence: evidence || undefined,
    confidence: confidence || undefined,
  };
}

function resetFindingSeq() { _findingSeq = 0; }

// --- Laws of UX: canonical slug allow-list (verified against lawsofux.com 2026-05-29) ---
// Keys are the internal slug used in scorers; `url` is the canonical deep-link (note the
// percent-encoded umlaut for Prägnanz, verified live). Adding a slug here is required before
// any scorer may cite it — validateLaws() + a unit test enforce this.

const LAW_META = {
  'aesthetic-usability-effect': { name: 'Aesthetic-Usability Effect', url: 'https://lawsofux.com/aesthetic-usability-effect/' },
  'doherty-threshold': { name: 'Doherty Threshold', url: 'https://lawsofux.com/doherty-threshold/' },
  'fittss-law': { name: "Fitts's Law", url: 'https://lawsofux.com/fittss-law/' },
  'goal-gradient-effect': { name: 'Goal-Gradient Effect', url: 'https://lawsofux.com/goal-gradient-effect/' },
  'hicks-law': { name: "Hick's Law", url: 'https://lawsofux.com/hicks-law/' },
  'jakobs-law': { name: "Jakob's Law", url: 'https://lawsofux.com/jakobs-law/' },
  'law-of-common-region': { name: 'Law of Common Region', url: 'https://lawsofux.com/law-of-common-region/' },
  'law-of-proximity': { name: 'Law of Proximity', url: 'https://lawsofux.com/law-of-proximity/' },
  'law-of-pragnanz': { name: 'Law of Prägnanz', url: 'https://lawsofux.com/law-of-pr%C3%A4gnanz/' },
  'law-of-similarity': { name: 'Law of Similarity', url: 'https://lawsofux.com/law-of-similarity/' },
  'law-of-uniform-connectedness': { name: 'Law of Uniform Connectedness', url: 'https://lawsofux.com/law-of-uniform-connectedness/' },
  'millers-law': { name: "Miller's Law", url: 'https://lawsofux.com/millers-law/' },
  'occams-razor': { name: "Occam's Razor", url: 'https://lawsofux.com/occams-razor/' },
  'pareto-principle': { name: 'Pareto Principle', url: 'https://lawsofux.com/pareto-principle/' },
  'parkinsons-law': { name: "Parkinson's Law", url: 'https://lawsofux.com/parkinsons-law/' },
  'peak-end-rule': { name: 'Peak-End Rule', url: 'https://lawsofux.com/peak-end-rule/' },
  'postels-law': { name: "Postel's Law", url: 'https://lawsofux.com/postels-law/' },
  'serial-position-effect': { name: 'Serial Position Effect', url: 'https://lawsofux.com/serial-position-effect/' },
  'teslers-law': { name: "Tesler's Law", url: 'https://lawsofux.com/teslers-law/' },
  'von-restorff-effect': { name: 'Von Restorff Effect', url: 'https://lawsofux.com/von-restorff-effect/' },
  'zeigarnik-effect': { name: 'Zeigarnik Effect', url: 'https://lawsofux.com/zeigarnik-effect/' },
};

const LAWS_SLUGS = Object.keys(LAW_META);

function validateLaws(laws) {
  if (!Array.isArray(laws)) return { valid: [], unknown: [] };
  const valid = [];
  const unknown = [];
  for (const s of laws) {
    if (LAW_META[s]) valid.push(s); else unknown.push(s);
  }
  return { valid, unknown };
}

// WCAG success-criterion labels, for accessibility findings (cite the SC, not a UX law).
const WCAG_SC = {
  '1.1.1': 'Non-text Content (A)',
  '1.4.1': 'Use of Color (A)',
  '1.4.3': 'Contrast (Minimum) (AA)',
  '1.4.10': 'Reflow (AA)',
  '1.4.11': 'Non-text Contrast (AA)',
  '1.4.12': 'Text Spacing (AA)',
  '2.4.7': 'Focus Visible (AA)',
  '2.4.11': 'Focus Not Obscured (Minimum) (AA)',
  '2.5.8': 'Target Size (Minimum) (AA)',
  '2.5.5': 'Target Size (Enhanced) (AAA)',
  '3.1.1': 'Language of Page (A)',
  '3.3.2': 'Labels or Instructions (A)',
};

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
  resetFindingSeq,
  LAW_META,
  LAWS_SLUGS,
  validateLaws,
  WCAG_SC,
  createColorToken,
  createTypeToken,
  createSpacingToken,
  createProjectProfile,
  createColorSystem,
  createTypeSystem,
  createSpacingSystem,
};
