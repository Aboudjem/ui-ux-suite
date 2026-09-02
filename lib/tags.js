/**
 * UI/UX Suite - rule tags and tag filtering
 *
 * Tags are DERIVED, never stored. Every tag comes from a field the finding already carries:
 * its WCAG success criteria, its Laws of UX slugs, its Nielsen heuristic numbers, its dimension
 * and its severity. There is no second taxonomy to keep in sync.
 *
 *   wcag: ['1.4.3']              -> 'wcag:1.4.3', 'wcag2aa'
 *   laws: ['fittss-law']         -> 'law:fittss-law'
 *   nielsen: [2]                 -> 'nielsen:2'
 *   dimension 'accessibility'    -> 'dimension:accessibility'
 *   severity 'critical'          -> 'severity:critical'
 *
 * Filtering is a presentation transform: it changes which findings are shown, never the scores.
 * `--fail-under` therefore behaves identically with and without a filter.
 *
 * Zero dependencies.
 */

const { LAW_META, WCAG_SC, SEVERITY_LEVELS } = require('./schema');

// Same ordering lib/runner.js uses to rank topFindings, derived from the schema so the two
// cannot drift apart, and the same cap.
const SEVERITY_RANK = Object.fromEntries(SEVERITY_LEVELS.map((s, i) => [s, i]));
const TOP_FINDINGS_CAP = 30;

/** '(AA)' at the end of a WCAG_SC label becomes the conformance tag 'wcag2aa'. */
function levelTagForCriterion(sc) {
  const label = WCAG_SC[sc];
  if (!label) return null;
  const m = /\((A|AA|AAA)\)\s*$/.exec(label);
  return m ? `wcag2${m[1].toLowerCase()}` : null;
}

/**
 * Tags for one finding.
 *
 * @param {object} finding
 * @param {string} [dimensionId] the id of the bucket the finding sits in. Aggregate scorer
 *   findings carry no `dimension` of their own and take it from their bucket.
 * @returns {string[]} unique tags, in a stable order
 */
function tagsForFinding(finding, dimensionId) {
  if (!finding) return [];
  const tags = [];
  const push = t => { if (t && !tags.includes(t)) tags.push(t); };

  const dimension = finding.dimension || dimensionId;
  if (dimension) push(`dimension:${dimension}`);
  if (finding.severity) push(`severity:${finding.severity}`);

  for (const sc of finding.wcag || []) {
    push(`wcag:${sc}`);
    // A criterion outside the WCAG_SC table (deep mode can cite one) still gets its own tag,
    // it just has no conformance level to derive.
    push(levelTagForCriterion(sc));
  }

  // createFinding does not validate law slugs, so validation happens here.
  for (const slug of finding.laws || []) {
    if (LAW_META[slug]) push(`law:${slug}`);
  }

  for (const n of finding.nielsen || []) push(`nielsen:${n}`);

  return tags;
}

/** Parse a `--tags a,b` value into a clean list. */
function parseTagList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Does a finding pass the filter?
 *
 * Include matches ANY listed tag. Exclude matches ANY listed tag. Exclude is applied after
 * include, so it always wins for a finding carrying both.
 */
function matchesFilter(tags, { include = [], exclude = [] } = {}) {
  const lower = tags.map(t => t.toLowerCase());
  if (include.length && !include.some(t => lower.includes(t))) return false;
  if (exclude.length && exclude.some(t => lower.includes(t))) return false;
  return true;
}

function filterFindings(findings, filter, dimensionId) {
  return (findings || []).filter(f => matchesFilter(tagsForFinding(f, dimensionId), filter));
}

/** Every tag present in an audit, sorted. Useful for `--tags` discovery and for tests. */
function allTags(audit) {
  const seen = new Set();
  for (const dim of (audit && audit.scoreCard && audit.scoreCard.dimensions) || []) {
    for (const f of dim.findings || []) {
      for (const t of tagsForFinding(f, dim.id)) seen.add(t);
    }
  }
  return [...seen].sort();
}

/**
 * Apply a tag filter to an audit result, in place.
 *
 * Three collections have to move together or the report contradicts itself:
 *  - `scoreCard.dimensions[].findings`, the source of truth;
 *  - `scoreCard.topFindings`, which lib/runner.js ranks and caps at 30 BEFORE any filter could
 *    run, so it is rebuilt from the filtered findings rather than filtered in place. Without the
 *    rebuild, a match that sat below the original cap would stay invisible;
 *  - `located.findings`, which lib/report-html.js renders directly and which supplies the
 *    displayed located total in formatReport.
 *
 * Scores are NOT recomputed. calculateOverall reads dimension scores, never finding arrays, so
 * leaving them alone is what keeps a filtered run and a full run in agreement.
 */
function applyTagFilter(audit, filter) {
  if (!audit || !audit.scoreCard) return audit;
  if (!filter || ((!filter.include || !filter.include.length) && (!filter.exclude || !filter.exclude.length))) {
    return audit;
  }

  for (const dim of audit.scoreCard.dimensions || []) {
    dim.findings = filterFindings(dim.findings, filter, dim.id);
    if (dim.locatedCount != null) {
      dim.locatedCount = dim.findings.filter(f => f.located).length;
    }
  }

  audit.scoreCard.topFindings = (audit.scoreCard.dimensions || [])
    .flatMap(d => (d.findings || []).map(f => ({ ...f, dimension: f.dimension || d.id })))
    .sort((a, b) => {
      const s = (SEVERITY_RANK[a.severity] ?? SEVERITY_LEVELS.length) - (SEVERITY_RANK[b.severity] ?? SEVERITY_LEVELS.length);
      if (s !== 0) return s;
      return (b.located ? 1 : 0) - (a.located ? 1 : 0);
    })
    .slice(0, TOP_FINDINGS_CAP);

  if (audit.located && Array.isArray(audit.located.findings)) {
    audit.located.findings = filterFindings(audit.located.findings, filter);
  }

  return audit;
}

module.exports = {
  tagsForFinding,
  parseTagList,
  matchesFilter,
  filterFindings,
  applyTagFilter,
  allTags,
  levelTagForCriterion,
  TOP_FINDINGS_CAP,
};
