/**
 * UI/UX Suite — Located audit (the specificity engine).
 *
 * Produces element-level, located, measured, FIXED findings via createFinding(). Each detector
 * reads located tokens (lib/locator) and emits findings carrying evidence:{file,line,selector,
 * measured,threshold}. This is the layer that moves the specificity score off 0%.
 *
 * Read-only: scans source, never writes to the audited project (audit-then-suggest).
 * Zero runtime dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { createFinding } = require('./schema');
const { scanCss, findMatches, codeMask } = require('./locator');
const { analyzeTextContrast, analyzeSurfaceSeparation, firstHex } = require('./static-contrast');
const { hexToRgb, deltaE } = require('./color-engine');

const CSS_EXT = ['.css', '.scss', '.sass'];
const JSX_EXT = ['.tsx', '.jsx', '.vue', '.svelte'];
const HTML_EXT = ['.html', '.htm'];
const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.cache',
  'coverage', '.turbo', 'out', '.vercel', 'storybook-static', '.svelte-kit', '.nuxt']);

function walk(dir, exts, maxDepth = 6) {
  const results = [];
  (function rec(cur, depth) {
    if (depth > maxDepth) return;
    let entries;
    try { entries = fs.readdirSync(cur, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (IGNORED_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      const fp = path.join(cur, e.name);
      if (e.isDirectory()) rec(fp, depth + 1);
      else if (exts.some(x => e.name.endsWith(x))) results.push(fp);
    }
  })(dir, 0);
  return results;
}

function readRel(file, root) {
  try { return { rel: path.relative(root, file), content: fs.readFileSync(file, 'utf8') }; }
  catch { return null; }
}

const px = v => { const m = String(v).match(/(-?[\d.]+)\s*px/); return m ? parseFloat(m[1]) : null; };
const INTERACTIVE_SEL = /(btn|button|cta|nav-link|link|icon-btn|tab|chip|pill|menu-item|action|toggle)/i;

// Collapse numbered "series" selectors (.swatch-07, .swatch-08, …) so a palette demo with many
// low-contrast variants becomes ONE grouped finding instead of dozens of near-identical ones.
function seriesBase(selector) {
  return (selector || '').replace(/[-_]?\d+$/, '').trim();
}
function groupSeries(seeds) {
  const groups = new Map();
  for (const s of seeds) {
    const base = seriesBase(s.selector);
    const k = `${s.file}|${base}`;
    if (!groups.has(k)) groups.set(k, { base, file: s.file, items: [] });
    groups.get(k).items.push(s);
  }
  const singles = [];
  const summaries = [];
  for (const g of groups.values()) {
    if (g.items.length > 3 && g.base) {
      const worst = g.items.slice().sort((a, b) => a.ratio - b.ratio)[0];
      const lines = g.items.map(i => i.line).filter(Boolean);
      summaries.push({ ...worst, _group: g.items.length, _base: g.base, _lineRange: lines.length ? `${Math.min(...lines)}–${Math.max(...lines)}` : '' });
    } else {
      singles.push(...g.items);
    }
  }
  return { singles, summaries };
}

// --- Detector: text contrast + surface separation (delegates to static-contrast) ---
function detectContrast(cssDecls, seed) {
  const findings = [];
  let n = seed;
  const { singles, summaries } = groupSeries(analyzeTextContrast(cssDecls));
  for (const g of summaries) {
    findings.push(createFinding({
      idSeed: `c${n++}`,
      dimension: 'accessibility',
      severity: g.ratio < 3 ? 'critical' : 'important',
      title: `${g._group} \`${g._base}*\` color variants fail WCAG AA contrast (worst ${g.ratio}:1)`,
      description: `${g._group} selectors matching \`${g._base}*\` (${g.file}:${g._lineRange}) set text colors that fail WCAG 2.2 §1.4.3 on their background; the worst is \`${g.fg}\` on \`${g.bg}\` = ${g.ratio}:1.`,
      impact: 'A whole family of low-contrast colors is unreadable as text and signals a palette without an accessible-by-default scale.',
      fix: `Rebuild this color set against the surface it sits on so each meets ≥ 4.5:1 (e.g. the worst, \`${g.fg}\`, should be \`${g.suggestion}\` or darker), or reserve these as decorative-only (never text).`,
      effort: 'medium',
      wcag: ['1.4.3'],
      confidence: 'confirmed',
      evidence: { file: g.file, line: g.line, selector: `${g._base}*`, measured: `${g._group} pairs, worst ${g.ratio}:1`, threshold: '4.5:1' },
    }));
  }
  for (const c of singles) {
    findings.push(createFinding({
      idSeed: `c${n++}`,
      dimension: c.kind === 'surface-separation' ? 'hierarchy' : 'accessibility',
      severity: c.severity,
      title: `Low text contrast on \`${c.selector}\` — ${c.ratio}:1`,
      description: `Text \`${c.fg}\` on ${c.bgFromPage ? 'page background ' : ''}\`${c.bg}\` measures ${c.ratio}:1 (APCA Lc ${c.apca}). WCAG 2.2 §1.4.3 requires ≥ ${c.threshold}:1 for ${c.large ? 'large' : 'normal'} text.`,
      impact: 'Users with low vision (and most users in bright light) cannot read this text.',
      fix: `Change \`color\` on \`${c.selector}\` from \`${c.fg}\` to \`${c.suggestion}\` (meets ${c.threshold}:1 on \`${c.bg}\`), or darken further.`,
      before: `color: ${c.fg};`,
      after: `color: ${c.suggestion};`,
      effort: 'trivial',
      wcag: ['1.4.3'],
      confidence: 'confirmed',
      evidence: { file: c.file, line: c.line, col: c.col, selector: c.selector, measured: `${c.ratio}:1 (APCA Lc ${c.apca})`, threshold: `${c.threshold}:1` },
    }));
  }
  for (const s of analyzeSurfaceSeparation(cssDecls)) {
    findings.push(createFinding({
      idSeed: `c${n++}`,
      dimension: 'hierarchy',
      severity: s.severity,
      title: `Invisible surface boundary on \`${s.selector}\` — ${s.ratio}:1 vs page`,
      description: `\`${s.selector}\` background \`${s.bg}\` differs from the page background \`${s.pageBg}\` by only ${s.ratio}:1, with no border or shadow — the section has no visible boundary (WCAG 2.2 §1.4.11 expects ≥ 3:1 for meaningful non-text boundaries).`,
      impact: 'The section does not read as a distinct region; visual grouping is lost.',
      fix: `Deepen the surface (e.g. a darker \`background\`) or add a \`1px\` border / subtle \`box-shadow\` so \`${s.selector}\` separates from the page.`,
      before: `background: ${s.bg}; /* on #${s.pageBg.replace('#','')} page, no border */`,
      after: `background: ${s.bg}; border: 1px solid rgba(0,0,0,.08); box-shadow: 0 1px 2px rgba(0,0,0,.06);`,
      effort: 'trivial',
      wcag: ['1.4.11'],
      confidence: 'confirmed',
      evidence: { file: s.file, line: s.line, selector: s.selector, measured: `${s.ratio}:1 vs page`, threshold: '3:1' },
    }));
  }
  return findings;
}

// --- Detector: body text too small (located, real value, no 12px filter) ---
function detectSmallText(cssDecls, seed) {
  const findings = [];
  let n = seed;
  const bodyish = /(body|copy|text|paragraph|p\b|content|description|caption|fine-print|price|label|li\b)/i;
  for (const d of cssDecls) {
    if (d.prop !== 'font-size') continue;
    const size = px(d.value);
    if (size == null || size >= 14) continue;
    // skip obviously-tiny utility/caption tokens? No — report them, they are real.
    const sel = d.selector || '(unknown)';
    const isBody = bodyish.test(sel) || sel === 'body' || sel === 'p';
    findings.push(createFinding({
      idSeed: `t${n++}`,
      dimension: 'typography',
      severity: size < 12 ? 'important' : 'suggestion',
      title: `Text too small on \`${sel}\` — ${size}px`,
      description: `\`${sel}\` sets \`font-size: ${size}px\`, below the 14px minimum (16px recommended) for ${isBody ? 'body' : 'readable'} text.`,
      impact: 'Small body text strains readability, especially on mobile and for low-vision users.',
      fix: `Raise \`font-size\` on \`${sel}\` to \`16px\` (or ≥14px) with \`line-height: 1.5\`.`,
      before: `font-size: ${size}px;`,
      after: 'font-size: 16px; line-height: 1.5;',
      effort: 'trivial',
      laws: ['aesthetic-usability-effect'],
      confidence: 'confirmed',
      evidence: { file: d.file, line: d.line, col: d.col, selector: sel, measured: `${size}px`, threshold: '14px min / 16px ideal' },
    }));
  }
  return findings;
}

// --- Detector: off-grid spacing (located per declaration) ---
function detectOffGridSpacing(cssDecls, seed) {
  const findings = [];
  let n = seed;
  const SPACING_PROPS = /^(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left))?$/;
  const snap = v => { const eights = Math.max(4, Math.round(v / 8) * 8); const fours = Math.round(v / 4) * 4; return Math.abs(fours - v) <= Math.abs(eights - v) ? fours : eights; };
  for (const d of cssDecls) {
    if (!SPACING_PROPS.test(d.prop)) continue;
    const vals = (d.value.match(/-?[\d.]+px/g) || []).map(px);
    const offenders = vals.filter(v => v != null && v > 0 && v % 4 !== 0);
    if (offenders.length === 0) continue;
    const fixes = offenders.map(v => `${v}→${snap(v)}`).join(', ');
    findings.push(createFinding({
      idSeed: `s${n++}`,
      dimension: 'layout',
      severity: 'suggestion',
      title: `Off-scale spacing on \`${d.selector}\` — ${offenders.map(v => v + 'px').join(', ')}`,
      description: `\`${d.selector}\` uses \`${d.prop}: ${d.value}\` with value(s) ${offenders.map(v => v + 'px').join(', ')} that are off any 4px/8px grid.`,
      impact: 'Ad-hoc spacing breaks visual rhythm and makes the layout feel inconsistent.',
      fix: `Snap to an 8px scale: ${fixes}.`,
      before: `${d.prop}: ${d.value};`,
      after: `${d.prop}: ${d.value.replace(/-?[\d.]+px/g, m => { const v = px(m); return v && v % 4 ? snap(v) + 'px' : m; })};`,
      effort: 'trivial',
      laws: ['law-of-proximity', 'law-of-similarity'],
      confidence: 'confirmed',
      evidence: { file: d.file, line: d.line, col: d.col, selector: d.selector, measured: offenders.map(v => v + 'px').join(', '), threshold: '4px/8px grid' },
    }));
  }
  return findings;
}

// --- Detector: static touch targets (located, AA 24 + AAA 44) ---
function detectTouchTargets(cssDecls, seed) {
  const findings = [];
  let n = seed;
  const bySel = new Map();
  for (const d of cssDecls) {
    if (!d.selector) continue;
    const k = `${d.file}|${d.selector}`;
    if (!bySel.has(k)) bySel.set(k, { file: d.file, selector: d.selector, decls: [] });
    bySel.get(k).decls.push(d);
  }
  for (const { file, selector, decls } of bySel.values()) {
    if (!INTERACTIVE_SEL.test(selector)) continue;
    const w = decls.find(d => d.prop === 'width'); const h = decls.find(d => d.prop === 'height');
    const minw = decls.find(d => d.prop === 'min-width'); const minh = decls.find(d => d.prop === 'min-height');
    const wv = w ? px(w.value) : (minw ? px(minw.value) : null);
    const hv = h ? px(h.value) : (minh ? px(minh.value) : null);
    const small = [];
    if (wv != null && wv < 44) small.push(`width ${wv}px`);
    if (hv != null && hv < 44) small.push(`height ${hv}px`);
    if (small.length === 0) continue;
    const failsAA = (wv != null && wv < 24) || (hv != null && hv < 24);
    const anchor = w || h || minw || minh;
    findings.push(createFinding({
      idSeed: `tt${n++}`,
      dimension: 'platform',
      severity: failsAA ? 'important' : 'suggestion',
      title: `Touch target too small on \`${selector}\` — ${small.join(', ')}`,
      description: `\`${selector}\` is ${small.join(', ')}, ${failsAA ? 'below the 24×24px WCAG 2.2 §2.5.8 (AA) minimum' : 'below the 44×44px WCAG §2.5.5 (AAA) / iOS HIG enhanced target'}.`,
      impact: 'Small controls are hard to tap accurately, especially on touch devices and for motor-impaired users.',
      fix: `Set \`min-width: 44px; min-height: 44px\` on \`${selector}\` (or expand the hit area with padding).`,
      before: small.map((s, i) => `${s.split(' ')[0]}: ${(s.match(/\d+/) || [''])[0]}px;`).join(' '),
      after: 'min-width: 44px; min-height: 44px;',
      effort: 'trivial',
      wcag: failsAA ? ['2.5.8'] : ['2.5.5'],
      laws: ['fittss-law'],
      confidence: 'confirmed',
      evidence: { file: anchor.file, line: anchor.line, selector, measured: small.join(', '), threshold: '24×24 (AA) / 44×44 (AAA)' },
    }));
  }
  return findings;
}

// --- Detector: missing :focus-visible (mask-aware — fixes the comment false-positive) ---
function detectMissingFocus(cssFiles, cssDecls, jsxFiles, seed) {
  let hasFocusRule = false;
  for (const { content } of cssFiles) {
    const mask = codeMask(content);
    const re = /:focus-visible|:focus\b/g; let m;
    while ((m = re.exec(content)) !== null) { if (mask[m.index] === 1) { hasFocusRule = true; break; } }
    if (hasFocusRule) break;
  }
  // also check JSX className focus-visible: variants (mask-aware)
  if (!hasFocusRule) {
    for (const { content } of jsxFiles) {
      const mask = codeMask(content);
      const re = /focus-visible:|focus:|outline-/g; let m;
      while ((m = re.exec(content)) !== null) { if (mask[m.index] === 1) { hasFocusRule = true; break; } }
      if (hasFocusRule) break;
    }
  }
  if (hasFocusRule) return [];
  const hasInteractive = cssDecls.some(d => d.selector && INTERACTIVE_SEL.test(d.selector));
  if (!hasInteractive) return [];
  const anchor = cssDecls.find(d => d.selector && INTERACTIVE_SEL.test(d.selector));
  return [createFinding({
    idSeed: `f${seed}`,
    dimension: 'accessibility',
    severity: 'critical',
    title: 'No visible keyboard focus indicator anywhere',
    description: `No \`:focus-visible\`/\`:focus\` rule or focus utility was found in any stylesheet or component, yet interactive elements exist (e.g. \`${anchor ? anchor.selector : 'buttons/links'}\`). Keyboard focus is invisible (WCAG 2.2 §2.4.7).`,
    impact: 'Keyboard and switch users cannot see which element is focused — the interface is unusable without a mouse.',
    fix: 'Add a focus ring to all interactive elements: `:focus-visible { outline: 2px solid var(--ring, #2563eb); outline-offset: 2px; }`.',
    before: '/* no focus styles */',
    after: ':focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }',
    effort: 'small',
    wcag: ['2.4.7'],
    confidence: 'confirmed',
    evidence: { file: anchor ? anchor.file : '(stylesheets)', line: anchor ? anchor.line : 0, selector: anchor ? anchor.selector : 'interactive elements', measured: '0 focus rules', threshold: 'WCAG 2.4.7' },
  })];
}

// --- Detector: too many font families (located per declaration) ---
function detectTooManyFonts(cssDecls, seed) {
  const families = [];
  const seen = new Set();
  for (const d of cssDecls) {
    if (d.prop !== 'font-family') continue;
    const fam = d.value.split(',')[0].replace(/['"]/g, '').trim();
    if (!fam || /inherit|initial|unset|var\(/i.test(fam)) continue;
    if (!seen.has(fam.toLowerCase())) { seen.add(fam.toLowerCase()); families.push({ fam, d }); }
  }
  if (families.length <= 2) return [];
  const list = families.map(f => `\`${f.fam}\` (${f.d.file}:${f.d.line})`).join(', ');
  return [createFinding({
    idSeed: `ff${seed}`,
    dimension: 'typography',
    severity: 'important',
    title: `${families.length} font families — use 1–2 max`,
    description: `${families.length} distinct \`font-family\` declarations found: ${list}. More than two typefaces fragments the visual system.`,
    impact: 'Too many fonts looks unprofessional, hurts brand coherence, and adds web-font payload.',
    fix: 'Keep one display family + one body family; delete the rest and map usages to the two kept families.',
    before: families.map(f => `font-family: ${f.fam};`).join('\n'),
    after: 'font-family: var(--font-display);  /* headings */\nfont-family: var(--font-body);     /* everything else */',
    effort: 'small',
    laws: ['occams-razor', 'aesthetic-usability-effect'],
    confidence: 'confirmed',
    evidence: { file: families[0].d.file, line: families[0].d.line, selector: families[0].d.selector, measured: `${families.length} families: ${families.map(f => f.fam).join(', ')}`, threshold: '1–2 families' },
  })];
}

// --- Detector: near-duplicate colors (located, names which two + which to keep) ---
function detectNearDuplicateColors(cssDecls, seed) {
  const colorDecls = [];
  for (const d of cssDecls) {
    if (!/color|background|border|fill|stroke|outline/.test(d.prop)) continue;
    const hex = firstHex(d.value);
    if (hex) colorDecls.push({ hex, d });
  }
  const findings = [];
  let n = seed;
  const reported = new Set();
  for (let i = 0; i < colorDecls.length; i++) {
    for (let j = i + 1; j < colorDecls.length; j++) {
      const a = colorDecls[i], b = colorDecls[j];
      if (a.hex === b.hex) continue;
      const key = [a.hex, b.hex].sort().join('|');
      if (reported.has(key)) continue;
      let dE;
      try { dE = deltaE(hexToRgb(a.hex), hexToRgb(b.hex)); } catch { continue; }
      if (dE < 3) {
        reported.add(key);
        findings.push(createFinding({
          idSeed: `nd${n++}`,
          dimension: 'color',
          severity: 'suggestion',
          title: `Near-duplicate colors \`${a.hex}\` ≈ \`${b.hex}\` (ΔE ${dE.toFixed(1)})`,
          description: `\`${a.hex}\` (${a.d.file}:${a.d.line}, \`${a.d.selector}\`) and \`${b.hex}\` (${b.d.file}:${b.d.line}, \`${b.d.selector}\`) differ by ΔE ${dE.toFixed(1)} — imperceptible (ΔE < 3).`,
          impact: 'Redundant near-identical colors bloat the palette and prevent a coherent token system.',
          fix: `Keep \`${a.hex}\` and replace \`${b.hex}\` with it (or promote both to one \`--color-*\` token).`,
          before: `${b.d.prop}: ${b.hex};`,
          after: `${b.d.prop}: ${a.hex};`,
          effort: 'trivial',
          laws: ['law-of-similarity'],
          confidence: 'confirmed',
          evidence: { file: b.d.file, line: b.d.line, selector: b.d.selector, measured: `ΔE ${dE.toFixed(1)} vs ${a.hex}`, threshold: 'ΔE ≥ 3' },
        }));
      }
    }
    if (findings.length >= 8) break; // cap noise
  }
  return findings;
}

// --- Detectors over JSX/HTML text (copy/CRO + a11y content) ---
const GENERIC_CTA = /^(submit|next|ok|go|button|click here|learn more|read more|continue|here|click|more)$/i;

// Mask comments/strings (JS/CSS via codeMask) PLUS HTML <!-- --> comments, so detectors don't fire
// on markup that appears inside a JSDoc block or an HTML comment (skeptic must-fix #3).
function markupMask(content) {
  const mask = codeMask(content);
  const re = /<!--[\s\S]*?-->/g; let m;
  while ((m = re.exec(content)) !== null) {
    for (let i = m.index; i < m.index + m[0].length && i < mask.length; i++) mask[i] = 0;
  }
  return mask;
}

function detectMarkup(jsxFiles, htmlFiles, seed) {
  const findings = [];
  let n = seed;
  const all = [...jsxFiles.map(f => ({ ...f, html: false })), ...htmlFiles.map(f => ({ ...f, html: true }))];

  for (const { rel, content, html } of all) {
    const mask = markupMask(content);
    const inCode = idx => mask[idx] === 1;
    // images without alt
    for (const m of findMatches(content, /<img\b[^>]*>/gi, { file: rel })) {
      if (!inCode(m.index)) continue;
      if (!/\balt\s*=/.test(m.value)) {
        findings.push(createFinding({
          idSeed: `img${n++}`, dimension: 'accessibility', severity: 'important',
          title: `<img> missing \`alt\` at ${rel}:${m.line}`,
          description: `\`${m.value.slice(0, 80)}\` has no \`alt\` attribute (WCAG 2.2 §1.1.1).`,
          impact: 'Screen-reader users get no description; the image is announced as a filename or skipped.',
          fix: 'Add descriptive `alt="…"` for meaningful images, or `alt=""` for decorative ones.',
          before: m.value.slice(0, 80), after: m.value.replace(/<img/i, '<img alt="describe the image"').slice(0, 90),
          effort: 'trivial', wcag: ['1.1.1'], confidence: 'confirmed',
          evidence: { file: rel, line: m.line, selector: '<img>', measured: 'no alt attribute', threshold: 'WCAG 1.1.1' },
        }));
      }
    }
    // inputs without programmatic label
    for (const m of findMatches(content, /<input\b[^>]*>/gi, { file: rel })) {
      if (!inCode(m.index)) continue;
      const typeM = m.value.match(/type\s*=\s*["']?(\w+)/i);
      const type = typeM ? typeM[1].toLowerCase() : 'text';
      if (['hidden', 'submit', 'button', 'image', 'reset'].includes(type)) continue;
      const hasAria = /aria-label\s*=|aria-labelledby\s*=/.test(m.value);
      const hasId = /\bid\s*=/.test(m.value);
      const labelFor = hasId ? new RegExp(`<label[^>]*\\bfor=["']?${(m.value.match(/\bid\s*=\s*["']?([\w-]+)/i) || [])[1]}`).test(content) : false;
      if (!hasAria && !labelFor) {
        findings.push(createFinding({
          idSeed: `inp${n++}`, dimension: 'accessibility', severity: 'important',
          title: `Form input has no associated label at ${rel}:${m.line}`,
          description: `\`${m.value.slice(0, 80)}\` has no \`<label for>\`, \`aria-label\`, or \`aria-labelledby\`${/placeholder/.test(m.value) ? ' (a placeholder is not a label)' : ''} (WCAG 2.2 §3.3.2 / §1.1.1).`,
          impact: 'Screen-reader users cannot tell what the field is for; placeholder text disappears on input.',
          fix: `Add a \`<label htmlFor="…">\` + matching \`id\`, or an \`aria-label\`.`,
          before: m.value.slice(0, 80), after: `<label htmlFor="field">Label</label>\n${m.value.replace(/<input/i, '<input id="field"').slice(0, 80)}`,
          effort: 'small', wcag: ['3.3.2', '1.1.1'], confidence: 'likely',
          evidence: { file: rel, line: m.line, selector: '<input>', measured: 'no label/aria-label', threshold: 'WCAG 3.3.2' },
        }));
      }
    }
    // generic CTA labels in buttons / links
    for (const m of findMatches(content, /<(?:button|a)\b[^>]*>([^<]{1,40})<\/(?:button|a)>/gi, { file: rel })) {
      if (!inCode(m.index)) continue;
      const text = (m.groups[0] || '').trim();
      if (GENERIC_CTA.test(text)) {
        findings.push(createFinding({
          idSeed: `cta${n++}`, dimension: 'flows', severity: 'suggestion',
          title: `Generic CTA label "${text}" at ${rel}:${m.line}`,
          description: `A call-to-action reads "${text}" — generic labels test worse than outcome-specific ones (e.g. "Next"→"Create account" raised completion ~14%, Baymard/CRO research).`,
          impact: 'Vague button copy reduces click-through and conversion.',
          fix: `Rename to the outcome, e.g. "Create account", "Start free trial", "Get the report".`,
          before: m.value.slice(0, 80), after: m.value.replace(text, 'Create account').slice(0, 80),
          effort: 'trivial', laws: ['doherty-threshold'], nielsen: [2], confidence: 'likely',
          evidence: { file: rel, line: m.line, selector: `<${m.value[1] === 'b' ? 'button' : 'a'}>`, measured: `"${text}"`, threshold: 'outcome-specific label' },
        }));
      }
    }
    // missing viewport meta in HTML
    if (html && /<head\b/i.test(content) && !/<meta[^>]+name=["']?viewport/i.test(content)) {
      const headM = findMatches(content, /<head\b[^>]*>/i, { file: rel })[0];
      findings.push(createFinding({
        idSeed: `vp${n++}`, dimension: 'responsive', severity: 'important',
        title: `Missing viewport meta at ${rel}`,
        description: 'No `<meta name="viewport">` — the page will not scale to device width and renders zoomed-out/broken on mobile.',
        impact: 'Mobile users get a desktop-width page they must pinch-zoom; fails responsive baseline.',
        fix: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1">` to `<head>`.',
        before: '<head>', after: '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">',
        effort: 'trivial', laws: ['jakobs-law'], confidence: 'confirmed',
        evidence: { file: rel, line: headM ? headM.line : 1, selector: '<head>', measured: 'no viewport meta', threshold: 'responsive baseline' },
      }));
    }
  }
  return findings;
}

// --- Detector: fixed-width / no responsive breakpoints (located) ---
function detectFixedWidth(cssDecls, cssFiles, seed) {
  const findings = [];
  let n = seed;
  let mediaCount = 0;
  for (const { content } of cssFiles) {
    const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    mediaCount += (noComments.match(/@media\b/g) || []).length;
  }
  // big fixed widths on layout containers
  for (const d of cssDecls) {
    if (d.prop !== 'width') continue;
    const w = px(d.value);
    if (w == null || w < 768) continue;
    const sel = (d.selector || '').toLowerCase();
    if (!/(layout|container|wrapper|page|main|content|shell|app|grid|root)/.test(sel)) continue;
    findings.push(createFinding({
      idSeed: `fw${n++}`, dimension: 'responsive', severity: mediaCount === 0 ? 'critical' : 'important',
      title: `Fixed ${w}px width on \`${d.selector}\`${mediaCount === 0 ? ' with 0 media queries' : ''}`,
      description: `\`${d.selector}\` is hard-coded to \`width: ${w}px\`${mediaCount === 0 ? ' and the project has no \`@media\` queries' : ''} — the layout cannot adapt below ${w}px.`,
      impact: `On any viewport narrower than ${w}px the content overflows or is clipped; mobile is broken.`,
      fix: `Use \`max-width: ${w}px; width: 100%\` and add responsive breakpoints (sm/md/lg).`,
      before: `width: ${w}px;`, after: `max-width: ${w}px; width: 100%;`,
      effort: 'medium', laws: ['jakobs-law'], confidence: 'confirmed',
      evidence: { file: d.file, line: d.line, selector: d.selector, measured: `width: ${w}px, ${mediaCount} @media`, threshold: 'fluid + breakpoints' },
    }));
  }
  return findings;
}

/**
 * Run all located detectors over a project. Returns { findings, stats }.
 * `findings` are createFinding objects with evidence; the caller merges them into the scorecard.
 */
function runLocatedAudit(projectPath) {
  const cssPaths = walk(projectPath, CSS_EXT);
  const jsxPaths = walk(projectPath, JSX_EXT);
  const htmlPaths = walk(projectPath, HTML_EXT);

  const cssFiles = cssPaths.map(f => readRel(f, projectPath)).filter(Boolean);
  const jsxFiles = jsxPaths.map(f => readRel(f, projectPath)).filter(Boolean);
  const htmlFiles = htmlPaths.map(f => readRel(f, projectPath)).filter(Boolean);

  let cssDecls = [];
  for (const { rel, content } of cssFiles) cssDecls = cssDecls.concat(scanCss(content, rel).declarations);

  const findings = [
    ...detectContrast(cssDecls, 0),
    ...detectSmallText(cssDecls, 0),
    ...detectOffGridSpacing(cssDecls, 0),
    ...detectTouchTargets(cssDecls, 0),
    ...detectMissingFocus(cssFiles, cssDecls, jsxFiles, 0),
    ...detectTooManyFonts(cssDecls, 0),
    ...detectNearDuplicateColors(cssDecls, 0),
    ...detectFixedWidth(cssDecls, cssFiles, 0),
    ...detectMarkup(jsxFiles, htmlFiles, 0),
  ];

  return {
    findings,
    stats: {
      cssFiles: cssFiles.length,
      jsxFiles: jsxFiles.length,
      htmlFiles: htmlFiles.length,
      declarations: cssDecls.length,
      locatedFindings: findings.length,
    },
  };
}

module.exports = {
  runLocatedAudit,
  // exported for unit tests:
  detectContrast, detectSmallText, detectOffGridSpacing, detectTouchTargets,
  detectMissingFocus, detectTooManyFonts, detectNearDuplicateColors, detectMarkup, detectFixedWidth,
  walk,
};
