/**
 * UI/UX Suite — Located-token model (the foundation of specific, located findings).
 *
 * The pre-rebuild engine concatenated every file into one blob and ran global regexes,
 * so a finding could never say WHICH file/line/selector a value came from. This module
 * keeps file identity and computes line/col from a match offset, and provides a tolerant,
 * zero-dependency CSS rule scanner that associates each declaration with its selector.
 *
 * Zero runtime dependencies. Pure functions; safe to unit test in isolation.
 */

'use strict';

/**
 * Convert a 0-based character index into a 1-based {line, col}.
 * Counts newlines up to `index`. O(n) but n is one file.
 */
function indexToLineCol(content, index) {
  if (index < 0) index = 0;
  if (index > content.length) index = content.length;
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10 /* \n */) {
      line++;
      lastNewline = i;
    }
  }
  return { line, col: index - lastNewline };
}

/**
 * Find every match of `regex` in `content`, returning located matches.
 * `regex` must be a RegExp; a global copy is made so callers needn't worry about flags/lastIndex.
 * Returns [{ value, groups, index, line, col }].
 */
function findMatches(content, regex, opts = {}) {
  const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
  const re = new RegExp(regex.source, flags);
  const out = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    if (m.index === re.lastIndex) re.lastIndex++; // avoid zero-width infinite loop
    const { line, col } = indexToLineCol(content, m.index);
    out.push({
      value: m[0],
      groups: m.slice(1),
      index: m.index,
      line,
      col,
      ...(opts.file ? { file: opts.file } : {}),
      ...(opts.type ? { type: opts.type } : {}),
    });
  }
  return out;
}

/**
 * Build a mask of which character offsets are inside a CSS/JS comment or a string literal.
 * Used so detectors don't false-positive on text inside comments (the v0.3 focus-visible bug:
 * a literal `focus-visible` inside a JSX comment was read as a real focus rule).
 * Returns a Uint8Array where 1 = code, 0 = comment-or-string. Same length as content.
 */
function codeMask(content) {
  const mask = new Uint8Array(content.length).fill(1);
  let i = 0;
  const n = content.length;
  while (i < n) {
    const c = content[i];
    const c2 = content[i + 1];
    // Block comment / JSX-CSS comment  /* ... */
    if (c === '/' && c2 === '*') {
      let j = i + 2;
      while (j < n && !(content[j] === '*' && content[j + 1] === '/')) j++;
      const end = Math.min(j + 2, n);
      for (let k = i; k < end; k++) mask[k] = 0;
      i = end;
      continue;
    }
    // Line comment  // ...   (JS/JSX/SCSS; not valid in plain CSS but harmless)
    if (c === '/' && c2 === '/') {
      let j = i + 2;
      while (j < n && content[j] !== '\n') j++;
      for (let k = i; k < j; k++) mask[k] = 0;
      i = j;
      continue;
    }
    // String literals  ' " `
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      let j = i + 1;
      while (j < n) {
        if (content[j] === '\\') { j += 2; continue; }
        if (content[j] === quote) { j++; break; }
        j++;
      }
      for (let k = i; k < j; k++) mask[k] = 0;
      i = j;
      continue;
    }
    i++;
  }
  return mask;
}

/** Is the character at `index` inside a comment or string literal? */
function isMasked(mask, index) {
  return index >= 0 && index < mask.length && mask[index] === 0;
}

/**
 * Tolerant, zero-dep CSS/SCSS rule scanner.
 * Walks the file char-by-char (skipping comments + strings), maintaining a selector stack so
 * nested SCSS rules resolve to a chained selector. Returns a flat list of declarations, each
 * with its file, line, col, the property, the value, and the full selector chain it lives under.
 *
 * Handles: flat rules, nested SCSS, @media/@supports blocks (treated as selector context),
 * multi-selector groups, comments, strings. Does NOT fully resolve `&` nesting semantics — it
 * keeps the raw chain, which is enough to locate and name a finding.
 *
 * Returns {
 *   declarations: [{ file, prop, value, line, col, index, selector, atRule }],
 *   rules: [{ file, selector, line, declarations: [...] }]
 * }
 */
function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
}

function scanCss(content, file) {
  const mask = codeMask(content);
  const declarations = [];
  const rules = [];
  const stack = []; // [{ selector, atRule, line, ruleObj }]
  const n = content.length;

  let i = 0;
  let tokenStart = 0; // start of the current selector/declaration token

  // First non-whitespace code char (mask===1) in [start, end); -1 if none.
  function firstCodeIndex(start, end) {
    for (let k = start; k < end; k++) {
      if (mask[k] === 1 && !/\s/.test(content[k])) return k;
    }
    return -1;
  }

  function currentSelectorChain() {
    const sels = stack.filter(s => !s.atRule).map(s => s.selector);
    return sels.join(' ');
  }
  function currentAtRule() {
    const at = stack.filter(s => s.atRule).map(s => s.selector);
    return at.length ? at[at.length - 1] : null;
  }

  function flushDeclaration(start, endIndex) {
    const text = stripComments(content.slice(start, endIndex)).trim();
    if (!text) return;
    const colonIdx = text.indexOf(':');
    if (colonIdx === -1) return;
    const prop = text.slice(0, colonIdx).trim();
    const value = text.slice(colonIdx + 1).trim().replace(/\s+/g, ' ');
    if (!prop || !value || /\s/.test(prop) || prop.startsWith('@')) return;
    const declStart = firstCodeIndex(start, endIndex);
    if (declStart === -1) return;
    const { line, col } = indexToLineCol(content, declStart);
    const selector = currentSelectorChain();
    const decl = {
      file, prop: prop.toLowerCase(), value, rawValue: text.slice(colonIdx + 1).trim(),
      line, col, index: declStart,
      selector: selector || null,
      atRule: currentAtRule(),
    };
    declarations.push(decl);
    const top = stack[stack.length - 1];
    if (top && top.ruleObj) top.ruleObj.declarations.push(decl);
  }

  while (i < n) {
    if (mask[i] === 0) { i++; continue; } // inside comment/string
    const c = content[i];

    if (c === '{') {
      const sel = stripComments(content.slice(tokenStart, i)).trim().replace(/\s+/g, ' ');
      const atRule = sel.startsWith('@');
      const selStart = firstCodeIndex(tokenStart, i);
      const line = selStart === -1 ? indexToLineCol(content, i).line : indexToLineCol(content, selStart).line;
      const ruleObj = { file, selector: sel, line, declarations: [] };
      if (!atRule && sel) rules.push(ruleObj);
      stack.push({ selector: sel, atRule, line, ruleObj });
      i++;
      tokenStart = i;
      continue;
    }
    if (c === '}') {
      flushDeclaration(tokenStart, i); // trailing declaration without a semicolon
      stack.pop();
      i++;
      tokenStart = i;
      continue;
    }
    if (c === ';') {
      flushDeclaration(tokenStart, i);
      i++;
      tokenStart = i;
      continue;
    }
    i++;
  }

  return { declarations, rules };
}

module.exports = {
  indexToLineCol,
  findMatches,
  codeMask,
  isMasked,
  scanCss,
};
