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

const channelHex = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
const rgbToHexLocal = (r, g, b) => '#' + channelHex(r) + channelHex(g) + channelHex(b);

// Parse a LITERAL color token to {r,g,b,a} (a in [0,1]). Handles #rgb/#rgba/#rrggbb/#rrggbbaa and
// rgb()/rgba(). Returns null for non-literal (var/keyword/gradient). Does NOT resolve var().
function parseColorWithAlpha(value) {
  if (!value) return null;
  const s = String(value).trim();
  const hx = s.match(HEX_RE);
  if (hx) {
    let h = hx[0].slice(1);
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    else if (h.length === 4) h = h.split('').map(c => c + c).join('');
    if (h.length === 6) return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
    if (h.length === 8) return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: parseInt(h.slice(6, 8), 16) / 255 };
  }
  const m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/i);
  if (m) {
    let a = 1;
    if (m[4] != null) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a: isNaN(a) ? 1 : a };
  }
  return null;
}

// Resolve a value (following var() chains) to {r,g,b,a}, or null if not a literal color.
function resolveColorRGBA(value, varMap, depth = 0) {
  if (!value || depth > 6) return null;
  const lit = parseColorWithAlpha(value);
  if (lit) return lit;
  const v = value.match(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/i);
  if (v) {
    const ref = varMap[v[1]];
    if (ref) { const r = resolveColorRGBA(ref, varMap, depth + 1); if (r) return r; }
    if (v[2]) return resolveColorRGBA(v[2].trim(), varMap, depth + 1); // fallback
  }
  const sass = value.trim().match(/^\$[\w-]+$/); // SCSS variable reference
  if (sass && varMap[value.trim()]) return resolveColorRGBA(varMap[value.trim()], varMap, depth + 1);
  return null;
}

// Resolve a value to an OPAQUE hex (ignores alpha). null if not a literal color. Back-compat.
function resolveColor(value, varMap) {
  const c = resolveColorRGBA(value, varMap);
  return c ? rgbToHexLocal(c.r, c.g, c.b) : null;
}

// Composite a (possibly translucent) top color over an opaque base hex → opaque hex.
function compositeOver(top, baseHex) {
  const base = hexToRgb(baseHex);
  const a = Math.max(0, Math.min(1, top.a == null ? 1 : top.a));
  return rgbToHexLocal(top.r * a + base.r * (1 - a), top.g * a + base.g * (1 - a), top.b * a + base.b * (1 - a));
}

// Does this selector define GLOBAL custom properties (apply to the whole document)? Only :root/html/
// body/* do. A `--foreground` set on `.page`/`.card` is component-scoped and must NOT win for a
// `body`/global rule (the v0.4 fix for CSS-Module-scoped vars clobbering the real :root value).
function isGlobalVarScope(selector) {
  const s = (selector || '').toLowerCase().trim();
  if (s === '' || s === ':root' || s === 'html' || s === 'body' || s === '*') return true;
  if (/(^|\s|,):root(\b|\.|:|\s|,|$)/.test(s)) return true;          // :root, html:root, :root.dark
  if (/(^|,)\s*(html|body)\s*(,|$)/.test(s)) return true;            // html, body / body, html
  if (/(^|\s)(html|body)(\.[\w-]+|\[[^\]]+\])*(\s|$)/.test(s)) return true; // .dark body, html[data-theme]
  return false;
}

// Build a CSS custom-property map (--name -> raw value), CASCADE-AWARE. Precedence (highest first):
// global :root/html/body base defs > global @media defs > component-scoped base defs > component
// @media defs. SCSS $vars are file-global. This keeps a `:root` value from being clobbered by a
// dark-mode override (fg===bg fix) AND by a component-local redefinition (multi-FP fix).
function buildVarMap(declarations) {
  const globalBase = {}, globalAt = {}, localBase = {}, localAt = {};
  for (const d of declarations) {
    if (!d.prop || !(d.prop.startsWith('--') || d.prop.startsWith('$'))) continue;
    const global = d.prop.startsWith('$') || isGlobalVarScope(d.selector);
    const bucket = d.atRule ? (global ? globalAt : localAt) : (global ? globalBase : localBase);
    bucket[d.prop] = d.value; // last-wins within a bucket
  }
  return Object.assign({}, localAt, localBase, globalAt, globalBase); // globalBase wins overall
}

function luminanceOf(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

// Resolve a background value to an OPAQUE hex over `baseHex`, or null if indeterminate.
// - gradient/url/image  -> null (caller falls back to the page surface)
// - translucent rgba/hex8 -> composited over baseHex (null baseHex -> null, i.e. skip)
// - fully transparent    -> baseHex
// - opaque solid         -> its hex
function resolveBackgroundHex(value, varMap, baseHex) {
  if (!value || /gradient|url\(|image|cross-fade|paint\(/i.test(value)) return baseHex || null;
  const c = resolveColorRGBA(value, varMap);
  if (!c) return baseHex || null; // unresolved var/keyword -> use surface behind it
  if (c.a >= 0.95) return rgbToHexLocal(c.r, c.g, c.b);
  if (c.a <= 0.05) return baseHex || null; // effectively transparent
  return baseHex ? compositeOver(c, baseHex) : null; // translucent tint needs a known surface
}

// A solid (opaque) background hex usable for surface-vs-surface comparison; null if translucent/indeterminate.
function solidBackgroundHex(value, varMap) {
  if (!value || /gradient|url\(|image/i.test(value)) return null;
  const c = resolveColorRGBA(value, varMap);
  return c && c.a >= 0.95 ? rgbToHexLocal(c.r, c.g, c.b) : null;
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

// A selector targets the page surface if it is (or scopes) body/html/:root — including theme-scoped
// forms like `.dark body`, `html[data-theme="dark"]`, `:root.dark`.
function isPageSelector(selector) {
  if (!selector) return false;
  const sel = selector.toLowerCase();
  if (PAGE_SELECTORS.includes(sel)) return true;
  return /(^|\s|\.|#|\[)(body|html)(\s|$|\.|\[|:)/.test(sel) || /(^|\s):root\b/.test(sel);
}

// Collect every distinct, resolved page-surface hex declared anywhere in the project (explicit
// body/html/:root backgrounds — base AND @media/dark-scoped — plus theme bg vars).
function collectPageSurfaces(declarations, varMap) {
  const hexes = new Set();
  for (const d of declarations) {
    if (d.atRule) continue; // @media/@supports dark overrides are theme VARIANTS of one site, not a 2nd site
    if (!d.selector || !/^background(-color)?$/.test(d.prop)) continue;
    if (!isPageSelector(d.selector)) continue;
    const hex = solidBackgroundHex(d.value, varMap);
    if (hex) hexes.add(hex.toLowerCase());
  }
  for (const d of declarations) {
    if (d.atRule) continue;
    if (!d.prop || !d.prop.startsWith('--')) continue;
    if (!BG_VAR_NAMES.includes(d.prop)) continue;
    if (!isGlobalVarScope(d.selector)) continue; // component-local --background is not the page surface
    const hex = resolveColor(d.value, varMap);
    if (hex) hexes.add(hex.toLowerCase());
  }
  return [...hexes];
}

/**
 * Resolve the page background to a single literal hex, or null when indeterminate.
 * Returns null when (a) the project mixes light AND dark page surfaces (a multi-theme or multi-site
 * codebase — we cannot know which surface a given rule sits on, so callers must SKIP rules that lack
 * their own background rather than assume one), or (b) no surface is declared but a dark theme is
 * signalled. This is the v0.4 fix for cross-file / multi-site surface misresolution.
 */
function resolvePageBackground(declarations, varMap) {
  varMap = varMap || buildVarMap(declarations);
  const surfaces = collectPageSurfaces(declarations, varMap);
  const hasLight = surfaces.some(h => luminanceOf(h) >= 0.5);
  const hasDark = surfaces.some(h => luminanceOf(h) < 0.35);
  if (hasLight && hasDark) return null; // conflicting surfaces — ambiguous, never assume one
  if (surfaces.length > 0) {
    // Single coherent theme. Prefer an explicit body/html/:root background; else any surface.
    for (const d of declarations) {
      if (d.selector && isPageSelector(d.selector) && /^background(-color)?$/.test(d.prop)) {
        const hex = solidBackgroundHex(d.value, varMap);
        if (hex) return hex.toLowerCase();
      }
    }
    return surfaces[0];
  }
  // No explicit page surface. If anything signals a dark theme, don't assume white — return null.
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

    // Resolve the effective surface first (rule bg composited over the page; null = indeterminate).
    const bgDecl = decls.find(d => d.prop === 'background-color' || d.prop === 'background');
    const bg = resolveBackgroundHex(bgDecl ? bgDecl.value : null, varMap, pageBg);
    if (!bg) continue; // surface indeterminate (var-themed/dark/translucent over unknown) — skip, never assume

    // Resolve the text color; composite over the surface if it is itself translucent.
    const fgRGBA = resolveColorRGBA(colorDecl.value, varMap);
    if (!fgRGBA) continue; // unresolved var / keyword — don't guess
    const fg = (fgRGBA.a != null && fgRGBA.a < 0.95) ? compositeOver(fgRGBA, bg) : rgbToHexLocal(fgRGBA.r, fgRGBA.g, fgRGBA.b);

    // Guard: fg === bg is definitionally an unresolved/aliased pairing (var collision, alpha strip),
    // never a real "1:1" contrast failure on a shipped page. Skip it (skeptic must-fix #2).
    if (fg.toLowerCase() === bg.toLowerCase()) continue;

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
