/**
 * UI/UX Suite - SARIF 2.1.0 serializer
 *
 * Turns an audit result into a SARIF document so GitHub code scanning (or any other SARIF
 * consumer) can put each finding on the line it is about, with no hosted service in between.
 *
 * This module is a pure serializer: it reads the audit object produced by `auditProject`
 * (lib/runner.js) and returns a plain object. It touches no filesystem, opens no socket, and
 * adds no dependency. The finding `evidence` block documented in lib/schema.js
 * (`{ file, line, col, selector, measured, threshold }`) is already the whole SARIF payload.
 *
 * Spec: SARIF 2.1.0, OASIS. Only the parts a static analysis tool needs are emitted.
 */

const { DIMENSIONS } = require('./schema');

const SARIF_SCHEMA = 'https://json.schemastore.org/sarif-2.1.0.json';
const SARIF_VERSION = '2.1.0';
const TOOL_NAME = 'ui-ux-suite';
const TOOL_URI = 'https://github.com/Aboudjem/ui-ux-suite';
const RULE_HELP_URI = 'https://github.com/Aboudjem/ui-ux-suite#what-it-scores';

// severity -> SARIF result level. SARIF allows none|note|warning|error.
const LEVEL_BY_SEVERITY = {
  critical: 'error',
  important: 'warning',
  suggestion: 'note',
  'nice-to-have': 'note',
};

// lib/located-audit.js writes this placeholder when a finding is about the stylesheets as a
// whole rather than one file. It is not a path, so it must never become an artifactLocation.
const NON_FILE_EVIDENCE = new Set(['(stylesheets)', '']);

function levelFor(severity) {
  return LEVEL_BY_SEVERITY[severity] || 'note';
}

/**
 * Every finding on the score card, in dimension order, paired with its dimension id.
 *
 * The pairing matters: located findings built by createFinding() carry their own `dimension`,
 * but the aggregate findings the scorers push carry only `severity`, `msg` and `laws`, and take
 * their dimension from the bucket they sit in. Resolving it here is what keeps every SARIF
 * result's ruleId non-empty.
 */
function collectFindings(audit) {
  const out = [];
  const dims = (audit && audit.scoreCard && audit.scoreCard.dimensions) || [];
  for (const dim of dims) {
    for (const f of dim.findings || []) out.push({ finding: f, dimension: f.dimension || dim.id });
  }
  return out;
}

/**
 * SARIF wants a forward-slash, percent-encoded relative URI. `evidence.file` is already relative
 * (lib/located-audit.js stores the `rel` path), so this normalises separators, strips a leading
 * "./", and encodes each segment so a space or a `#` cannot break the URI.
 *
 * Known limitation: the path is relative to the directory that was audited, not necessarily to
 * the repository root. A consumer that resolves from the repo root (GitHub code scanning does)
 * needs the audit run from the repo root, or the paths rebased on upload.
 */
function toUri(file) {
  return String(file)
    .split('\\')
    .join('/')
    .replace(/^\.\//, '')
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/');
}

function locationsFor(finding) {
  const ev = finding.evidence;
  if (!ev || !ev.file || NON_FILE_EVIDENCE.has(ev.file)) return undefined;

  const physicalLocation = { artifactLocation: { uri: toUri(ev.file) } };

  // SARIF requires region.startLine >= 1, so a missing or zero line means no region at all.
  const line = Number(ev.line);
  if (Number.isFinite(line) && line >= 1) {
    const region = { startLine: line };
    const col = Number(ev.col);
    if (Number.isFinite(col) && col >= 1) region.startColumn = col;
    physicalLocation.region = region;
  }

  return [{ physicalLocation }];
}

function messageFor(finding) {
  const parts = [finding.title || finding.msg || 'Finding'];
  if (finding.evidence && finding.evidence.measured) {
    parts.push(`Measured ${finding.evidence.measured}`);
    if (finding.evidence.threshold) parts[parts.length - 1] += `, expected ${finding.evidence.threshold}`;
    parts[parts.length - 1] += '.';
  }
  if (finding.fix) parts.push(finding.fix);
  return parts.join(' ');
}

/** One rule per dimension that actually produced a finding, in DIMENSIONS order. */
function rulesFor(entries) {
  const used = new Set(entries.map(e => e.dimension).filter(Boolean));
  return DIMENSIONS.filter(d => used.has(d.id)).map(d => ({
    id: d.id,
    name: d.label,
    shortDescription: { text: `${d.label} findings from a ui-ux-suite audit.` },
    helpUri: RULE_HELP_URI,
  }));
}

/**
 * Build the SARIF 2.1.0 document for an audit result.
 *
 * @param {object} audit  the object returned by auditProject()
 * @param {object} [options]
 * @param {string} [options.version]  tool version, normally package.json's
 * @returns {object} a SARIF 2.1.0 log, ready for JSON.stringify
 */
function renderSarifReport(audit, options = {}) {
  const entries = collectFindings(audit);
  const rules = rulesFor(entries);
  const ruleIndex = new Map(rules.map((r, i) => [r.id, i]));

  const results = entries.map(({ finding, dimension }) => {
    const result = {
      ruleId: dimension,
      level: levelFor(finding.severity),
      message: { text: messageFor(finding) },
    };
    if (ruleIndex.has(dimension)) result.ruleIndex = ruleIndex.get(dimension);
    const locations = locationsFor(finding);
    if (locations) result.locations = locations;
    return result;
  });

  return {
    $schema: SARIF_SCHEMA,
    version: SARIF_VERSION,
    runs: [
      {
        tool: {
          driver: {
            name: TOOL_NAME,
            version: options.version || '0.0.0',
            informationUri: TOOL_URI,
            rules,
          },
        },
        // Columns come from JavaScript string offsets, which are UTF-16 code units. SARIF
        // requires a text-analysis run that reports columns to say so.
        columnKind: 'utf16CodeUnits',
        results,
      },
    ],
  };
}

module.exports = {
  renderSarifReport,
  levelFor,
  toUri,
  SARIF_VERSION,
  SARIF_SCHEMA,
};
