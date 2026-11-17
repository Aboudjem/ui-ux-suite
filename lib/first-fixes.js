/**
 * UI/UX Suite: the three things to do first.
 *
 * Every report format opens with the same short list, so the choice lives in one place and the
 * Markdown and HTML reports cannot disagree about it.
 */

// The kind of a located finding is its id without the trailing counter: `accessibility-c3` and
// `accessibility-c4` are the same kind of problem, so only one of them belongs in a top-3 list.
function findingKind(f) {
  return f.id ? String(f.id).replace(/\d+$/, '') : (f.dimension || '') + '|' + (f.msg || f.title || '');
}

// The three things to do first: the most severe findings, one per kind, located ones first.
function pickFirstFixes(findings, max = 3) {
  const picked = [];
  const seen = new Set();
  for (const f of findings) {
    const kind = findingKind(f);
    if (seen.has(kind)) continue;
    seen.add(kind);
    picked.push(f);
    if (picked.length === max) return picked;
  }
  // Fewer kinds than slots: fill up with the next most severe findings of a kind already shown.
  for (const f of findings) {
    if (picked.length === max) break;
    if (!picked.includes(f)) picked.push(f);
  }
  return picked;
}

function shorten(text, max = 150) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max)).replace(/[,;:(]$/, '') + ' ...';
}

module.exports = { findingKind, pickFirstFixes, shorten };
