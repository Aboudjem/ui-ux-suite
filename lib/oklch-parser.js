/**
 * UI/UX Suite — OKLCH Color Parser
 * Parse OKLCH notation and convert to sRGB for contrast calculations.
 * Based on https://bottosson.github.io/posts/oklab/ reference implementation.
 */

// Parse oklch() notation
function parseOklch(str) {
  // Match: oklch(0.62 0.19 185) or oklch(62% 0.19 185 / 0.5)
  const match = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/);
  if (!match) return null;

  let l = parseFloat(match[1]);
  if (match[1].endsWith('%')) l = l / 100;
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);
  let alpha = 1;
  if (match[4]) {
    alpha = parseFloat(match[4]);
    if (match[4].endsWith('%')) alpha = alpha / 100;
  }

  return { l, c, h, alpha };
}

// OKLCH -> OKLab
function oklchToOklab({ l, c, h }) {
  const hRad = (h * Math.PI) / 180;
  return {
    L: l,
    a: c * Math.cos(hRad),
    b: c * Math.sin(hRad),
  };
}

// OKLab -> linear sRGB
// Reference: https://bottosson.github.io/posts/oklab/
function oklabToLinearSrgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

// Linear sRGB -> sRGB (gamma correction)
function linearToGamma(c) {
  if (c <= 0) return 0;
  if (c >= 1) return 1;
  return c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
}

function linearSrgbToSrgb({ r, g, b }) {
  return {
    r: Math.round(Math.max(0, Math.min(1, linearToGamma(r))) * 255),
    g: Math.round(Math.max(0, Math.min(1, linearToGamma(g))) * 255),
    b: Math.round(Math.max(0, Math.min(1, linearToGamma(b))) * 255),
  };
}

// Full pipeline: oklch string -> sRGB {r,g,b}
function oklchToRgb(oklchStr) {
  const parsed = parseOklch(oklchStr);
  if (!parsed) return null;
  const lab = oklchToOklab(parsed);
  const linear = oklabToLinearSrgb(lab);
  return linearSrgbToSrgb(linear);
}

function oklchToHex(oklchStr) {
  const rgb = oklchToRgb(oklchStr);
  if (!rgb) return null;
  return '#' + [rgb.r, rgb.g, rgb.b].map(c => c.toString(16).padStart(2, '0')).join('');
}

// Extract all OKLCH values from CSS content
function extractOklchColors(content) {
  const regex = /oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+(?:\s*\/\s*[\d.]+%?)?\s*\)/g;
  return content.match(regex) || [];
}

module.exports = {
  parseOklch,
  oklchToOklab,
  oklabToLinearSrgb,
  linearSrgbToSrgb,
  oklchToRgb,
  oklchToHex,
  extractOklchColors,
};
