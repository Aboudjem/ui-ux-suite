/**
 * UI/UX Suite — Static contrast pairing (the marquee feature, previously hardcoded OFF).
 *
 * The v0.3 engine set `contrastIssues:[]` / `contrastFailures:0` unconditionally and never fed
 * fg/bg pairs to the (capable) color-engine. This module pairs a rule's `color` with its own
 * `background[-color]` — or the resolved page surface when the rule's background is
 * transparent/absent — then computes the WCAG 2.x ratio (split: 1.4.3 text vs 1.4.11 non-text)
 * plus APCA Lc, and computes the nearest-passing `after` hex. Every finding is located at the
 * declaration's selector:file:line.
 *
 * Zero runtime dependencies (uses lib/color-engine only).
 */

'use strict';

const { hexToRgb, rgbToHex, contrastRatio, apcaContrast, apcaLevel } = require('./color-engine');

const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;

/** First literal hex color in a CSS value, or null (ignores var()/gradients/keywords). */
function firstHex(value) {
  if (!value) return null;
  const m = value.match(HEX_RE);
  return m ? normalizeHex(m[0]) : null;
}

/** Expand #abc / #abcd to #aabbcc; drop alpha for ratio math. */
function normalizeHex(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6); // strip alpha for contrast estimate
  return '#' + h.slice(0, 6).toLowerCase();
}

function isTransparentish(value) {
  return !value || /\b(transparent|none|inherit|currentcolor|initial|unset)\b/i.test(value) &&
    !HEX_RE.test(value);
}

// rgb()/rgba() → hex (so var-resolved rgb tokens and rgba surfaces can be measured).
function rgbFuncToHex(value) {
  const m = String(value).match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!m) return null;
  const h = n => Math.max(0, Math.min(255, parseInt(n, 10))).toString(16).padStart(2, '0');
  return '#' + h(m[1]) + h(m[2]) + h(m[3]);
}

// Build a CSS custom-property map (--name -> raw value) from all declarations (last wins).
function buildVarMap(declarations) {
  const map = {};
  for (const d of declarations) {
    if (d.prop && d.prop.startsWith('--')) map[d.prop] = d.value;
  }
  return map;
}

// Resolve a CSS value to a literal hex, following var() chains (incl. fallbacks). null if unknown.
function resolveColor(value, varMap, depth = 0) {
  if (!value || depth > 6) return null;
  const direct = firstHex(value);
  if (direct) return direct;
  const rgb = rgbFuncToHex(value);
  if (rgb) return rgb;
  const v = value.match(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/i);
  if (v) {
    const ref = varMap[v[1]];
    if (ref) { const r = resolveColor(ref, varMap, depth + 1); if (r) return r; }
    if (v[2]) return resolveColor(v[2].trim(), varMap, depth + 1); // fallback
  }
  return null;
}

function luminanceOf(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

// A solid background value usable for contrast: not a gradient/image/multi-stop. Returns hex or null.
function solidBackgroundHex(value, varMap) {
  if (!value || /gradient|url\(|image/i.test(value)) return null;
  return resolveColor(value, varMap);
}

// Gradient-clipped / painted text (text colored by a background, not a solid `color`) — unmeasurable statically.
function isPaintedText(decls) {
  return decls.some(d =>
    (d.prop === 'background-clip' || d.prop === '-webkit-background-clip') && /text/i.test(d.value) ||
    (d.prop === '-webkit-text-fill-color' && /transparent/i.test(d.value)));
}

/** Approximate px size of a font-size value for the large-text threshold (1pt≈1.333px). */
function fontPx(value) {
  if (!value) return null;
  const m = value.match(/([\d.]+)\s*(px|pt|rem|em)?/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = m[2] || 'px';
  if (unit === 'px') return n;
  if (unit === 'pt') return n * 1.333;
  if (unit === 'rem' || unit === 'em') return n * 16;
  return n;
}

/** WCAG 1.4.3: large text = >=24px normal OR >=18.66px bold. */
function isLargeText(px, weight) {
  if (px == null) return false;
  const bold = weight != null && weight >= 700;
  return px >= 24 || (bold && px >= 18.66);
}

/**
 * Binary-search a foreground color toward black or white until it meets `target` contrast on bg.
 * Returns the nearest passing hex (preserving hue where possible by blending toward the endpoint).
 */
function suggestAccessibleColor(fgHex, bgHex, target) {
  const bg = hexToRgb(bgHex);
  const fg = hexToRgb(fgHex);
  // Choose the endpoint that can reach the target: darker if bg is light, lighter if bg is dark.
  const bgLum = (0.2126 * srgb(bg.r) + 0.7152 * srgb(bg.g) + 0.0722 * srgb(bg.b));
  const endpoint = bgLum > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  // If even the endpoint can't reach target on this bg, return the endpoint.
  if (contrastRatio(endpoint, bg) < target) return rgbToHex(endpoint.r, endpoint.g, endpoint.b);
  let lo = 0, hi = 1, best = endpoint;
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2;
    const cand = {
      r: Math.round(fg.r + (endpoint.r - fg.r) * t),
      g: Math.round(fg.g + (endpoint.g - fg.g) * t),
      b: Math.round(fg.b + (endpoint.b - fg.b) * t),
    };
    if (contrastRatio(cand, bg) >= target) { best = cand; hi = t; } else { lo = t; }
  }
  return rgbToHex(best.r, best.g, best.b);
}

function srgb(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

const PAGE_SELECTORS = ['body', 'html', ':root', 'html, body', 'body, html', '*', 'main'];
const BG_VAR_NAMES = ['--bg', '--background', '--background-color', '--bg-color', '--color-bg',
  '--surface', '--surface-base', '--base', '--color-background', '--page-bg', '--body-bg'];

/**
 * Resolve the page background to a literal hex. Resolves var()/rgb() and the `background` shorthand.
 * Returns null when it cannot be determined AND the theme looks dark — so callers SKIP rather than
 * falsely assume white (the v0.4 fix for "white text on a var-themed dark page = 1:1" false positives).
 */
function resolvePageBackground(declarations, varMap) {
  varMap = varMap || buildVarMap(declarations);
  for (const d of declarations) {
    if (!d.selector) continue;
    const sel = d.selector.toLowerCase();
    if (PAGE_SELECTORS.includes(sel) && /^background(-color)?$/.test(d.prop)) {
      const hex = solidBackgroundHex(d.value, varMap);
      if (hex) return hex;
    }
  }
  for (const name of BG_VAR_NAMES) {
    if (varMap[name]) { const hex = resolveColor(varMap[name], varMap); if (hex) return hex; }
  }
  // No explicit page background. If anything signals a dark theme, don't assume white — return null.
  const darkSignal = Object.entries(varMap).some(([k, v]) => {
    if (!/bg|background|surface|base|page|body|dark|shell|canvas/i.test(k)) return false;
    const hex = resolveColor(v, varMap);
    return hex && luminanceOf(hex) < 0.35;
  });
  return darkSignal ? null : '#ffffff';
}

/**
 * Analyze text contrast per rule. Returns an array of located finding-seeds:
 *   { kind, severity, selector, file, line, fg, bg, ratio, apca, threshold, suggestion, large }
 * (The located-audit layer turns these into createFinding objects.)
 */
function analyzeTextContrast(declarations) {
  const varMap = buildVarMap(declarations);
  const pageBg = resolvePageBackground(declarations, varMap);
  // Group declarations by file+selector (a selector's declarations share a rule in most CSS).
  const rules = new Map();
  for (const d of declarations) {
    if (!d.selector) continue;
    const k = `${d.file}|${d.selector}`;
    if (!rules.has(k)) rules.set(k, { file: d.file, selector: d.selector, decls: [] });
    rules.get(k).decls.push(d);
  }

  const findings = [];
  for (const { file, selector, decls } of rules.values()) {
    if (isPaintedText(decls)) continue; // gradient/clipped text — colored by a background, not measurable
    const colorDecl = decls.find(d => d.prop === 'color');
    if (!colorDecl) continue;
    const fg = resolveColor(colorDecl.value, varMap);
    if (!fg) continue; // unresolved var / keyword — don't guess

    const bgDecl = decls.find(d => d.prop === 'background-color' || d.prop === 'background');
    let bg = bgDecl ? solidBackgroundHex(bgDecl.value, varMap) : null;
    if (!bg) bg = pageBg; // transparent/absent/gradient background → fall back to the page surface
    if (!bg) continue;   // surface indeterminate (var-themed/dark) — skip rather than assume white

    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    const ratio = Math.round(contrastRatio(fgRgb, bgRgb) * 100) / 100;
    const apca = Math.round(Math.abs(apcaContrast(fgRgb, bgRgb)) * 10) / 10;

    const fsDecl = decls.find(d => d.prop === 'font-size');
    const fwDecl = decls.find(d => d.prop === 'font-weight');
    const px = fsDecl ? fontPx(fsDecl.value) : null;
    const weight = fwDecl ? parseInt(fwDecl.value, 10) : null;
    const large = isLargeText(px, weight);
    const threshold = large ? 3.0 : 4.5;

    if (ratio < threshold) {
      const suggestion = suggestAccessibleColor(fg, bg, threshold);
      findings.push({
        kind: 'text-contrast',
        severity: ratio < 3 ? 'critical' : 'important',
        selector, file, line: colorDecl.line, col: colorDecl.col,
        fg, bg, ratio, apca, threshold, large, suggestion,
        bgFromPage: !bgDecl,
      });
    }
  }
  return findings;
}

/**
 * Surface separation: a section/card whose background differs from the page background by < 3:1
 * (WCAG 1.4.11 non-text) AND has no border/box-shadow has an invisible boundary.
 */
function analyzeSurfaceSeparation(declarations) {
  const varMap = buildVarMap(declarations);
  const pageBg = resolvePageBackground(declarations, varMap);
  if (!pageBg) return []; // page surface indeterminate — can't judge separation
  const pageRgb = hexToRgb(pageBg);
  const bySelector = new Map();
  for (const d of declarations) {
    if (!d.selector) continue;
    const k = `${d.file}|${d.selector}`;
    if (!bySelector.has(k)) bySelector.set(k, { file: d.file, selector: d.selector, decls: [] });
    bySelector.get(k).decls.push(d);
  }
  const findings = [];
  for (const { file, selector, decls } of bySelector.values()) {
    const sel = selector.toLowerCase();
    if (PAGE_SELECTORS.includes(sel)) continue;
    const looksLikeSurface = /(section|card|panel|surface|well|tile|box|hero|banner|sidebar|aside|footer|header|modal|sheet)/.test(sel);
    const bgDecl = decls.find(d => d.prop === 'background-color' || d.prop === 'background');
    if (!bgDecl) continue;
    const bg = solidBackgroundHex(bgDecl.value, varMap);
    if (!bg || bg === pageBg) continue;
    if (!looksLikeSurface) continue;
    const ratio = Math.round(contrastRatio(hexToRgb(bg), pageRgb) * 100) / 100;
    const hasBorder = decls.some(d => /^border(-(top|right|bottom|left|width|style|color))?$/.test(d.prop) && !/\b0(px)?\b|none/.test(d.value));
    const hasShadow = decls.some(d => d.prop === 'box-shadow' && !/none/.test(d.value));
    if (ratio < 3 && !hasBorder && !hasShadow) {
      findings.push({
        kind: 'surface-separation',
        severity: 'important',
        selector, file, line: bgDecl.line, col: bgDecl.col,
        bg, pageBg, ratio,
      });
    }
  }
  return findings;
}

module.exports = {
  firstHex,
  normalizeHex,
  fontPx,
  isLargeText,
  suggestAccessibleColor,
  resolvePageBackground,
  analyzeTextContrast,
  analyzeSurfaceSeparation,
  buildVarMap,
  resolveColor,
  solidBackgroundHex,
  isPaintedText,
};
