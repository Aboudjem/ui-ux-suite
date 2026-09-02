/**
 * UI/UX Suite - baseline comparison
 *
 * Lets a team adopt the audit on a codebase that already has debt. `--write-baseline` records
 * what is wrong today; `--baseline <file> --fail-on-regression` then fails CI only when
 * something NEW appears, or when the overall score drops.
 *
 * This module never touches the filesystem. It builds and compares plain objects; the CLI owns
 * reading and writing the file. Zero dependencies, in keeping with the rest of the package.
 */

const BASELINE_VERSION = 1;
const TOOL_NAME = 'ui-ux-suite';

/**
 * Walk the score card and pair every finding with its dimension id.
 *
 * Located findings built by createFinding() carry their own `dimension`. The aggregate findings
 * the scorers push carry only `severity`, `msg` and `laws`, and take their dimension from the
 * bucket they sit in.
 */
function collectEntries(audit) {
  const out = [];
  const dims = (audit && audit.scoreCard && audit.scoreCard.dimensions) || [];
  for (const dim of dims) {
    for (const f of dim.findings || []) out.push({ finding: f, dimension: f.dimension || dim.id });
  }
  return out;
}

/**
 * The stable key for one finding: dimension, file and line.
 *
 * Deliberately not the finding `id`. lib/schema.js falls back to a per-run sequence counter when
 * no `idSeed` is given, so ids shift the moment an unrelated finding appears earlier in the run.
 *
 * `evidence` can be absent entirely (lib/schema.js emits `evidence || undefined`), which is the
 * case for every aggregate scorer finding. Those all collapse to `<dimension>||`, so two
 * different aggregate findings in one dimension share a key. Keys map to COUNTS rather than
 * booleans precisely so that case still behaves: a second finding under an existing key raises
 * the count and is reported as a regression.
 */
function findingKey(finding, dimensionId) {
  const dimension = (finding && finding.dimension) || dimensionId || '';
  const ev = (finding && finding.evidence) || {};
  const file = ev.file == null ? '' : String(ev.file);
  const line = ev.line == null ? '' : String(ev.line);
  return `${dimension}|${file}|${line}`;
}

/** Count findings per key. */
function countByKey(audit) {
  const counts = Object.create(null);
  for (const { finding, dimension } of collectEntries(audit)) {
    const key = findingKey(finding, dimension);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

/**
 * Snapshot an audit as a baseline document.
 *
 * @param {object} audit  the object returned by auditProject()
 * @returns {{version:number, tool:string, overall:(number|null), findings:Object<string,number>}}
 */
function buildBaseline(audit) {
  const counts = countByKey(audit);
  const findings = {};
  for (const key of Object.keys(counts).sort()) findings[key] = counts[key];
  return {
    version: BASELINE_VERSION,
    tool: TOOL_NAME,
    overall: audit && audit.scoreCard ? audit.scoreCard.overall : null,
    findings,
  };
}

/**
 * Is this a baseline document this version can read?
 *
 * The `version` and `tool` fields exist to catch a file from another tool or a future format.
 * Returns a human-readable reason, or null when the document is usable.
 */
function baselineProblem(baseline) {
  if (!baseline || typeof baseline !== 'object') return 'not a JSON object';
  if (!baseline.findings || typeof baseline.findings !== 'object') return 'no findings map';
  if (baseline.tool != null && baseline.tool !== TOOL_NAME) {
    return `written by ${baseline.tool}, not ${TOOL_NAME}`;
  }
  if (baseline.version != null && Number(baseline.version) > BASELINE_VERSION) {
    return `format version ${baseline.version} is newer than this build understands (${BASELINE_VERSION})`;
  }
  return null;
}

/**
 * Compare two baseline documents.
 *
 * A regression is either a key whose count went up (or that is new), or an overall score that
 * dropped. Findings that disappeared are reported but are never a failure.
 *
 * Known limit of a count-based key: if one finding is resolved while a different finding appears
 * under the same key, the count does not move and the swap is invisible. Aggregate findings all
 * share `<dimension>||`, so that case is realistic. Inserting a line above an existing issue
 * likewise shifts its key and reads as new. The key shape is fixed, so these are documented
 * rather than worked around.
 *
 * @returns {{newFindings: Array<{key:string, was:number, now:number}>,
 *            resolvedFindings: Array<{key:string, was:number, now:number}>,
 *            scoreDropped: boolean, before:(number|null), after:(number|null),
 *            regressed: boolean}}
 */
function compareBaselines(current, baseline) {
  const now = (current && current.findings) || {};
  const was = (baseline && baseline.findings) || {};

  const newFindings = [];
  for (const key of Object.keys(now).sort()) {
    const before = was[key] || 0;
    if (now[key] > before) newFindings.push({ key, was: before, now: now[key] });
  }

  const resolvedFindings = [];
  for (const key of Object.keys(was).sort()) {
    const after = now[key] || 0;
    if (after < was[key]) resolvedFindings.push({ key, was: was[key], now: after });
  }

  const before = baseline && baseline.overall != null ? baseline.overall : null;
  const after = current && current.overall != null ? current.overall : null;
  const scoreDropped = before != null && after != null && after < before;

  return {
    newFindings,
    resolvedFindings,
    scoreDropped,
    before,
    after,
    regressed: newFindings.length > 0 || scoreDropped,
  };
}

/** Compare a live audit against a baseline document. */
function compareToBaseline(audit, baseline) {
  return compareBaselines(buildBaseline(audit), baseline);
}

/** Human-readable regression summary for stderr. Returns an empty string when nothing regressed. */
function formatRegression(comparison) {
  if (!comparison.regressed) return '';
  const lines = [];
  if (comparison.scoreDropped) {
    lines.push(`Overall score dropped: ${comparison.before} -> ${comparison.after}`);
  }
  for (const f of comparison.newFindings) {
    const [dimension, file, line] = f.key.split('|');
    const where = file ? `${file}${line ? ':' + line : ''}` : '(no file)';
    const delta = f.was === 0 ? 'new' : `${f.was} -> ${f.now}`;
    lines.push(`New ${dimension} finding at ${where} (${delta})`);
  }
  return lines.join('\n');
}

module.exports = {
  BASELINE_VERSION,
  buildBaseline,
  compareBaselines,
  compareToBaseline,
  baselineProblem,
  findingKey,
  countByKey,
  formatRegression,
};
