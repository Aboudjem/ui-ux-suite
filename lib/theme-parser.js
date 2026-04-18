/**
 * UI/UX Suite — Tailwind v4 @theme block parser
 *
 * Hand-rolled CSS block parser for @theme and @theme inline at-rules.
 * Zero dependencies. Handles brace nesting, single/double-quoted strings,
 * and /* block *\/ / // line comments without pulling in PostCSS.
 *
 * Tailwind v4 uses @theme blocks to declare CSS-first design tokens:
 *   @theme { --color-primary: oklch(0.6 0.2 250); }
 *   @theme inline { --font-sans: Geist, system-ui; }
 *
 * The "inline" variant stores the raw value per-variable rather than
 * aliasing to a global CSS var. This matters for token extraction.
 */

/**
 * Parse a CSS string and return every @theme / @theme inline block body.
 * Returns an array of { variant: 'default'|'inline', declarations: { name: value } }.
 */
function extractThemeBlocks(cssContent) {
  if (typeof cssContent !== 'string' || !cssContent) return [];

  const themePositions = findAtThemePositions(cssContent);
  const blocks = [];

  for (const start of themePositions) {
    let cursor = start + '@theme'.length;
    let variant = 'default';

    while (cursor < cssContent.length && /\s/.test(cssContent[cursor])) cursor++;
    if (cssContent.slice(cursor, cursor + 6) === 'inline' && /[\s{]/.test(cssContent[cursor + 6] || '')) {
      variant = 'inline';
      cursor += 6;
      while (cursor < cssContent.length && /\s/.test(cssContent[cursor])) cursor++;
    }

    if (cssContent[cursor] !== '{') continue;
    const bodyStart = cursor + 1;
    const bodyEnd = findMatchingBrace(cssContent, cursor);
    if (bodyEnd < 0) continue;

    const body = cssContent.slice(bodyStart, bodyEnd);
    const declarations = parseDeclarations(body);
    blocks.push({ variant, declarations, bodyStart, bodyEnd });
  }

  return blocks;
}

function findAtThemePositions(source) {
  const positions = [];
  let inString = null;
  let inBlockComment = false;
  let inLineComment = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === inString) inString = null;
      continue;
    }

    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '"' || ch === "'") { inString = ch; continue; }

    if (ch === '@' && source.slice(i, i + 6) === '@theme') {
      const after = source[i + 6];
      if (after === undefined || /[\s{]/.test(after)) {
        positions.push(i);
        i += 5;
      }
    }
  }
  return positions;
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  let inString = null;
  let inBlockComment = false;
  let inLineComment = false;

  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === inString) inString = null;
      continue;
    }

    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (ch === '"' || ch === "'") { inString = ch; continue; }

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseDeclarations(body) {
  const declarations = {};
  const decls = splitTopLevel(body, ';');
  for (const rawDecl of decls) {
    const decl = stripComments(rawDecl).trim();
    if (!decl) continue;
    const colonIdx = decl.indexOf(':');
    if (colonIdx <= 0) continue;
    const name = decl.slice(0, colonIdx).trim();
    const value = decl.slice(colonIdx + 1).trim();
    if (!name || !value) continue;
    if (!name.startsWith('--')) continue;
    declarations[name] = value;
  }
  return declarations;
}

function splitTopLevel(source, delimiter) {
  const parts = [];
  let buf = '';
  let depth = 0;
  let inString = null;
  let inBlockComment = false;
  let inLineComment = false;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      buf += ch;
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      buf += ch;
      if (ch === '*' && next === '/') { buf += next; inBlockComment = false; i++; }
      continue;
    }
    if (inString) {
      buf += ch;
      if (ch === '\\') { buf += next; i++; continue; }
      if (ch === inString) inString = null;
      continue;
    }

    if (ch === '/' && next === '*') { buf += ch + next; inBlockComment = true; i++; continue; }
    if (ch === '/' && next === '/') { buf += ch + next; inLineComment = true; i++; continue; }
    if (ch === '"' || ch === "'") { inString = ch; buf += ch; continue; }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;

    if (ch === delimiter && depth === 0) {
      parts.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}

function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '');
}

/**
 * Extract design tokens from every @theme block in the content.
 * Groups declarations by semantic category based on Tailwind v4 naming conventions.
 * https://tailwindcss.com/docs/theme
 */
function extractThemeTokens(cssContent) {
  const blocks = extractThemeBlocks(cssContent);
  const tokens = {
    colors: {},
    fonts: {},
    fontSizes: {},
    fontWeights: {},
    radii: {},
    shadows: {},
    spacing: {},
    breakpoints: {},
    other: {},
  };

  for (const block of blocks) {
    for (const [name, value] of Object.entries(block.declarations)) {
      const key = name.slice(2); // strip "--"
      if (key.startsWith('color-')) tokens.colors[key] = value;
      else if (key.startsWith('font-size-') || key.startsWith('text-')) tokens.fontSizes[key] = value;
      else if (key.startsWith('font-weight-')) tokens.fontWeights[key] = value;
      else if (key.startsWith('font-') || key === 'font-sans' || key === 'font-serif' || key === 'font-mono') {
        tokens.fonts[key] = value;
      }
      else if (key.startsWith('radius-') || key.startsWith('rounded-')) tokens.radii[key] = value;
      else if (key.startsWith('shadow-')) tokens.shadows[key] = value;
      else if (key.startsWith('spacing-') || key.startsWith('space-')) tokens.spacing[key] = value;
      else if (key.startsWith('breakpoint-') || key.startsWith('screen-')) tokens.breakpoints[key] = value;
      else tokens.other[key] = value;
    }
  }

  const counts = {
    colors: Object.keys(tokens.colors).length,
    fonts: Object.keys(tokens.fonts).length,
    fontSizes: Object.keys(tokens.fontSizes).length,
    fontWeights: Object.keys(tokens.fontWeights).length,
    radii: Object.keys(tokens.radii).length,
    shadows: Object.keys(tokens.shadows).length,
    spacing: Object.keys(tokens.spacing).length,
    breakpoints: Object.keys(tokens.breakpoints).length,
    other: Object.keys(tokens.other).length,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    blocks: blocks.length,
    hasDefault: blocks.some(b => b.variant === 'default'),
    hasInline: blocks.some(b => b.variant === 'inline'),
    total,
    counts,
    tokens,
  };
}

function detectTailwindV4Theme(cssContent) {
  if (typeof cssContent !== 'string' || !cssContent) return false;
  return /@import\s+["']tailwindcss["']/.test(cssContent) || /@theme\b/.test(cssContent);
}

module.exports = {
  extractThemeBlocks,
  extractThemeTokens,
  detectTailwindV4Theme,
};
