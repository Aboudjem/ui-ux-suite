/**
 * UI/UX Suite — HTML report renderer.
 *
 * renderHtmlReport(auditResult) -> a complete, standalone, dark-theme HTML string.
 *
 * Self-contained by design:
 *   - inline <style>, no external CSS / JS / fonts / CDN
 *   - no <script> required (and none emitted)
 *   - system font stack only
 *
 * Audit-then-suggest: this module only READS the audit result; it never mutates it
 * and never touches the audited project. Every value pulled out of the audit
 * (selectors, measured values, file paths, fix snippets) is treated as UNTRUSTED
 * input and HTML-escaped before it reaches the output, so a project whose CSS
 * contains markup-like selectors cannot inject script into the report.
 *
 * Zero runtime dependencies (Node built-ins only) — this file requires lib/schema
 * solely for LAW_META / WCAG_SC citation metadata.
 */

'use strict';

const { LAW_META, WCAG_SC } = require('./schema');

// --- escaping ---------------------------------------------------------------

/**
 * Escape a value for safe insertion into HTML text or a double-quoted attribute.
 * Handles every byte that can break out of either context.
 */
function esc(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- presentation tables ----------------------------------------------------

const SEVERITY_ORDER = ['critical', 'important', 'suggestion', 'nice-to-have'];

const SEVERITY_LABEL = {
  critical: 'Critical',
  important: 'Important',
  suggestion: 'Suggestion',
  'nice-to-have': 'Nice to have',
};

/** Returns a CSS class slug for a severity, defaulting safely. */
function severityClass(severity) {
  return SEVERITY_ORDER.includes(severity) ? severity : 'suggestion';
}

/** Map an overall score (0-10, or null) to a colour band class. */
function scoreBand(score) {
  if (score == null) return 'none';
  if (score >= 8) return 'good';
  if (score >= 6) return 'ok';
  if (score >= 4) return 'warn';
  return 'bad';
}

// --- small render helpers ---------------------------------------------------

/** Render the citation row for a finding (laws + WCAG SCs). */
function renderCitations(finding) {
  const chips = [];

  if (Array.isArray(finding.laws)) {
    for (const slug of finding.laws) {
      const meta = LAW_META[slug];
      if (meta) {
        chips.push(
          `<a class="cite cite-law" href="${esc(meta.url)}" target="_blank" rel="noreferrer noopener">${esc(meta.name)}</a>`
        );
      } else {
        // Unknown slug: still show it (escaped, non-linked) rather than drop the citation.
        chips.push(`<span class="cite cite-law">${esc(slug)}</span>`);
      }
    }
  }

  if (Array.isArray(finding.nielsen)) {
    for (const n of finding.nielsen) {
      chips.push(`<span class="cite cite-nielsen">Nielsen #${esc(n)}</span>`);
    }
  }

  if (Array.isArray(finding.wcag)) {
    for (const sc of finding.wcag) {
      const label = WCAG_SC[sc];
      const text = label ? `WCAG ${sc} · ${label}` : `WCAG ${sc}`;
      chips.push(`<span class="cite cite-wcag">${esc(text)}</span>`);
    }
  }

  if (chips.length === 0) return '';
  return `<div class="cites">${chips.join('')}</div>`;
}

/** Render the Where row from evidence (file:line:col + selector). */
function renderWhere(evidence) {
  if (!evidence) return '';
  const parts = [];

  let loc = '';
  if (evidence.file != null) {
    loc = String(evidence.file);
    if (evidence.line != null) {
      loc += `:${evidence.line}`;
      if (evidence.col != null) loc += `:${evidence.col}`;
    }
  }
  if (loc) parts.push(`<code class="mono">${esc(loc)}</code>`);
  if (evidence.selector != null && evidence.selector !== '') {
    parts.push(`<code class="mono sel">${esc(evidence.selector)}</code>`);
  }

  if (parts.length === 0) return '';
  return `<div class="row"><span class="row-label">Where</span><span class="row-val">${parts.join(' ')}</span></div>`;
}

/** Render the Measured-vs-threshold row. */
function renderMeasured(evidence) {
  if (!evidence) return '';
  const hasMeasured = evidence.measured != null && evidence.measured !== '';
  const hasThreshold = evidence.threshold != null && evidence.threshold !== '';
  if (!hasMeasured && !hasThreshold) return '';

  let val = '';
  if (hasMeasured) val += `<code class="mono bad-val">${esc(evidence.measured)}</code>`;
  if (hasThreshold) {
    val += `<span class="vs">vs threshold</span><code class="mono ok-val">${esc(evidence.threshold)}</code>`;
  }
  return `<div class="row"><span class="row-label">Measured</span><span class="row-val">${val}</span></div>`;
}

/** Render a labelled text row (Why / Impact / Fix). */
function renderTextRow(label, text) {
  if (text == null || text === '') return '';
  return `<div class="row"><span class="row-label">${esc(label)}</span><span class="row-val">${esc(text)}</span></div>`;
}

/** Render the before -> after diff block (red / green). */
function renderDiff(finding) {
  const hasBefore = finding.before != null && finding.before !== '';
  const hasAfter = finding.after != null && finding.after !== '';
  if (!hasBefore && !hasAfter) return '';

  let out = '<div class="diff">';
  if (hasBefore) {
    out += `<div class="diff-line diff-before"><span class="diff-sign">-</span><code class="mono">${esc(finding.before)}</code></div>`;
  }
  if (hasAfter) {
    out += `<div class="diff-line diff-after"><span class="diff-sign">+</span><code class="mono">${esc(finding.after)}</code></div>`;
  }
  out += '</div>';
  return out;
}

/** Render an optional screenshot, only when evidence.screenshot is set. */
function renderScreenshot(evidence) {
  if (!evidence || evidence.screenshot == null || evidence.screenshot === '') return '';
  const src = esc(evidence.screenshot);
  return `<div class="shot"><img src="${src}" alt="Screenshot evidence" loading="lazy" /></div>`;
}

/** Render one finding card. */
function renderFinding(finding) {
  const sev = severityClass(finding.severity);
  const sevLabel = SEVERITY_LABEL[sev] || sev;

  const meta = [];
  if (finding.dimension) meta.push(`<span class="tag">${esc(finding.dimension)}</span>`);
  if (finding.effort) meta.push(`<span class="tag tag-effort">effort: ${esc(finding.effort)}</span>`);
  if (finding.confidence) meta.push(`<span class="tag tag-conf">${esc(finding.confidence)}</span>`);

  return [
    `<article class="finding sev-${esc(sev)}">`,
    '<header class="finding-head">',
    `<span class="chip chip-${esc(sev)}">${esc(sevLabel)}</span>`,
    `<h3 class="finding-title">${esc(finding.title)}</h3>`,
    '</header>',
    meta.length ? `<div class="finding-meta">${meta.join('')}</div>` : '',
    renderWhere(finding.evidence),
    renderMeasured(finding.evidence),
    renderTextRow('Why', finding.description),
    renderTextRow('Impact', finding.impact),
    renderTextRow('Fix', finding.fix),
    renderDiff(finding),
    renderScreenshot(finding.evidence),
    renderCitations(finding),
    '</article>',
  ].join('');
}

/** Render the 12-dimension score-bar table. */
function renderDimensionTable(scoreCard) {
  const dims = (scoreCard && Array.isArray(scoreCard.dimensions)) ? scoreCard.dimensions : [];
  const rows = dims.map((d) => {
    const score = (typeof d.score === 'number') ? d.score : null;
    const band = scoreBand(score);
    const pct = score == null ? 0 : Math.max(0, Math.min(100, (score / 10) * 100));
    const scoreText = score == null ? '—' : score.toFixed(1);
    const weightText = (typeof d.weight === 'number') ? `${Math.round(d.weight * 100)}%` : '';
    const findingCount = Array.isArray(d.findings) ? d.findings.length : 0;
    return [
      '<tr>',
      `<td class="dim-name">${esc(d.label || d.id)}${weightText ? `<span class="dim-weight">${esc(weightText)}</span>` : ''}</td>`,
      `<td class="dim-bar"><span class="bar"><span class="bar-fill band-${band}" style="width:${pct}%"></span></span></td>`,
      `<td class="dim-score band-text-${band}">${esc(scoreText)}</td>`,
      `<td class="dim-count">${findingCount ? esc(findingCount) + (findingCount === 1 ? ' issue' : ' issues') : '—'}</td>`,
      '</tr>',
    ].join('');
  }).join('');

  return [
    '<table class="dims">',
    '<thead><tr><th>Dimension</th><th>Score</th><th></th><th>Findings</th></tr></thead>',
    `<tbody>${rows}</tbody>`,
    '</table>',
  ].join('');
}

/** Render the findings, grouped by severity in priority order. */
function renderFindingsGrouped(findings) {
  const list = Array.isArray(findings) ? findings : [];
  if (list.length === 0) {
    return '<div class="empty">No located findings — nothing measured fell outside threshold.</div>';
  }

  const groups = new Map();
  for (const f of list) {
    const sev = severityClass(f.severity);
    if (!groups.has(sev)) groups.set(sev, []);
    groups.get(sev).push(f);
  }

  const sections = [];
  for (const sev of SEVERITY_ORDER) {
    const group = groups.get(sev);
    if (!group || group.length === 0) continue;
    const label = SEVERITY_LABEL[sev] || sev;
    sections.push([
      '<section class="sev-group">',
      `<h2 class="sev-heading sev-heading-${sev}">${esc(label)} <span class="sev-count">${group.length}</span></h2>`,
      group.map(renderFinding).join(''),
      '</section>',
    ].join(''));
  }
  return sections.join('');
}

// --- stylesheet -------------------------------------------------------------

const STYLE = `
:root{
  --bg:#0a0d14; --bg-2:#0f131c; --surface:#141925; --surface-2:#1a2030;
  --border:#232a3a; --border-2:#2e3850;
  --text:#e6eaf2; --text-2:#a4adc0; --text-3:#6b7488;
  --good:#34d399; --ok:#7dd3fc; --warn:#fbbf24; --bad:#f87171; --none:#475067;
  --crit:#f87171; --imp:#fbbf24; --sug:#7dd3fc; --nice:#a78bfa;
  --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:var(--bg);
  background-image:radial-gradient(1200px 600px at 80% -10%,rgba(124,58,237,.10),transparent 60%),
                   radial-gradient(900px 500px at -10% 0%,rgba(56,189,248,.06),transparent 55%);
  color:var(--text);
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  line-height:1.55; font-size:15px; -webkit-font-smoothing:antialiased;
}
.wrap{max-width:920px;margin:0 auto;padding:48px 24px 80px}
a{color:inherit}
code{font-family:var(--mono)}

/* header */
.report-head{display:flex;flex-wrap:wrap;align-items:center;gap:28px;
  padding:28px 30px;border:1px solid var(--border);border-radius:18px;
  background:linear-gradient(180deg,var(--surface),var(--bg-2));margin-bottom:28px}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);margin:0 0 6px}
.report-title{font-size:22px;font-weight:650;margin:0;letter-spacing:-.01em}
.report-sub{color:var(--text-2);font-size:13px;margin-top:6px}
.score-badge{margin-left:auto;text-align:center;min-width:128px;
  border:1px solid var(--border-2);border-radius:16px;padding:16px 20px;background:var(--surface-2)}
.score-num{font-size:40px;font-weight:750;line-height:1;letter-spacing:-.02em}
.score-num .slash{font-size:18px;color:var(--text-3);font-weight:500}
.score-grade{margin-top:6px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--text-2)}

/* dimension table */
.panel{border:1px solid var(--border);border-radius:16px;background:var(--surface);
  padding:8px 22px 14px;margin-bottom:28px}
.panel h2.panel-title{font-size:13px;letter-spacing:.08em;text-transform:uppercase;
  color:var(--text-3);margin:16px 4px 8px}
table.dims{width:100%;border-collapse:collapse}
table.dims thead th{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);
  text-align:left;padding:8px 6px;font-weight:600}
table.dims tbody tr{border-top:1px solid var(--border)}
table.dims td{padding:10px 6px;vertical-align:middle}
.dim-name{font-weight:550;font-size:14px;width:30%}
.dim-weight{color:var(--text-3);font-weight:500;font-size:11px;margin-left:8px}
.dim-bar{width:46%}
.bar{display:block;height:8px;border-radius:99px;background:var(--bg-2);overflow:hidden}
.bar-fill{display:block;height:100%;border-radius:99px}
.dim-score{font-variant-numeric:tabular-nums;font-weight:700;font-size:15px;text-align:right;width:54px}
.dim-count{color:var(--text-2);font-size:12px;text-align:right;white-space:nowrap}
.band-good{background:var(--good)} .band-ok{background:var(--ok)}
.band-warn{background:var(--warn)} .band-bad{background:var(--bad)} .band-none{background:var(--none)}
.band-text-good{color:var(--good)} .band-text-ok{color:var(--ok)}
.band-text-warn{color:var(--warn)} .band-text-bad{color:var(--bad)} .band-text-none{color:var(--text-3)}

/* insufficient evidence */
.insufficient{border:1px solid var(--border-2);border-left:4px solid var(--warn);
  border-radius:14px;background:var(--surface);padding:22px 26px;margin-bottom:28px}
.insufficient h2{margin:0 0 8px;font-size:17px}
.insufficient p{margin:0;color:var(--text-2)}

/* severity groups */
.sev-group{margin-top:34px}
.sev-heading{display:flex;align-items:center;gap:12px;font-size:16px;margin:0 0 16px;
  padding-bottom:10px;border-bottom:1px solid var(--border)}
.sev-count{font-size:12px;font-weight:600;color:var(--text-2);background:var(--surface-2);
  border:1px solid var(--border);border-radius:99px;padding:2px 10px}
.sev-heading-critical{color:var(--crit)} .sev-heading-important{color:var(--imp)}
.sev-heading-suggestion{color:var(--sug)} .sev-heading-nice-to-have{color:var(--nice)}

/* finding card */
.finding{border:1px solid var(--border);border-radius:14px;background:var(--surface);
  padding:18px 20px;margin-bottom:14px;border-left-width:4px}
.finding.sev-critical{border-left-color:var(--crit)} .finding.sev-important{border-left-color:var(--imp)}
.finding.sev-suggestion{border-left-color:var(--sug)} .finding.sev-nice-to-have{border-left-color:var(--nice)}
.finding-head{display:flex;align-items:flex-start;gap:12px}
.finding-title{font-size:15.5px;font-weight:600;margin:0;line-height:1.4}
.chip{flex:none;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
  border-radius:6px;padding:3px 8px;margin-top:2px}
.chip-critical{background:rgba(248,113,113,.16);color:var(--crit);border:1px solid rgba(248,113,113,.3)}
.chip-important{background:rgba(251,191,36,.15);color:var(--imp);border:1px solid rgba(251,191,36,.3)}
.chip-suggestion{background:rgba(125,211,252,.14);color:var(--sug);border:1px solid rgba(125,211,252,.3)}
.chip-nice-to-have{background:rgba(167,139,250,.15);color:var(--nice);border:1px solid rgba(167,139,250,.3)}
.finding-meta{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 4px}
.tag{font-size:11px;color:var(--text-2);background:var(--bg-2);border:1px solid var(--border);
  border-radius:6px;padding:2px 8px}
.tag-conf{color:var(--good);border-color:rgba(52,211,153,.3)}

.row{display:flex;gap:14px;padding:7px 0;border-top:1px solid var(--border);align-items:baseline}
.row:first-of-type{border-top:1px solid var(--border)}
.finding-meta + .row{border-top:1px solid var(--border)}
.row-label{flex:none;width:74px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;
  color:var(--text-3);font-weight:600;padding-top:1px}
.row-val{color:var(--text);font-size:14px;min-width:0;word-break:break-word}
.mono{font-family:var(--mono);font-size:12.5px;background:var(--bg-2);border:1px solid var(--border);
  border-radius:6px;padding:2px 7px;color:var(--text);white-space:pre-wrap;word-break:break-all}
.sel{color:#c4b5fd}
.bad-val{color:var(--bad);border-color:rgba(248,113,113,.3)}
.ok-val{color:var(--good);border-color:rgba(52,211,153,.3)}
.vs{color:var(--text-3);font-size:12px;margin:0 8px}

/* diff */
.diff{margin:12px 0 4px;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--bg-2)}
.diff-line{display:flex;gap:10px;align-items:flex-start;padding:7px 12px;font-family:var(--mono);font-size:12.5px}
.diff-sign{flex:none;font-weight:700;width:10px;text-align:center;opacity:.8}
.diff-before{background:rgba(248,113,113,.08);color:#fca5a5}
.diff-before .diff-sign{color:var(--bad)}
.diff-after{background:rgba(52,211,153,.08);color:#86efac;border-top:1px solid var(--border)}
.diff-after .diff-sign{color:var(--good)}
.diff-line code{background:none;border:none;padding:0;color:inherit;white-space:pre-wrap;word-break:break-all}

/* screenshot */
.shot{margin:12px 0 4px}
.shot img{max-width:100%;border:1px solid var(--border);border-radius:10px;display:block}

/* citations */
.cites{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)}
.cite{font-size:11px;border-radius:6px;padding:3px 9px;text-decoration:none;border:1px solid var(--border)}
.cite-law{background:rgba(124,58,237,.12);color:#c4b5fd;border-color:rgba(124,58,237,.3)}
.cite-law:hover{background:rgba(124,58,237,.22)}
.cite-nielsen{background:rgba(56,189,248,.1);color:#7dd3fc;border-color:rgba(56,189,248,.3)}
.cite-wcag{background:rgba(52,211,153,.1);color:#6ee7b7;border-color:rgba(52,211,153,.3)}

.empty{color:var(--text-2);text-align:center;padding:40px;border:1px dashed var(--border);border-radius:14px}

footer.report-foot{margin-top:54px;padding-top:18px;border-top:1px solid var(--border);
  color:var(--text-3);font-size:12px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between}
`;

// --- top-level renderer -----------------------------------------------------

/**
 * Render a complete standalone HTML report for an audit result.
 * @param {object} auditResult result of auditProject(projectPath)
 * @returns {string} a full HTML document
 */
function renderHtmlReport(auditResult) {
  const result = auditResult || {};
  const scoreCard = result.scoreCard || {};
  const insufficient = result.insufficientEvidence === true;

  const overall = (typeof scoreCard.overall === 'number') ? scoreCard.overall : null;
  const grade = scoreCard.grade || null;
  const band = scoreBand(overall);

  const located = (result.located && Array.isArray(result.located.findings))
    ? result.located.findings
    : [];

  // Header sub-line: file counts + duration.
  const files = result.files || {};
  const fileBits = [];
  if (files.css != null) fileBits.push(`${esc(files.css)} CSS`);
  if (files.jsx != null) fileBits.push(`${esc(files.jsx)} JSX`);
  if (files.html != null) fileBits.push(`${esc(files.html)} HTML`);
  const subParts = [];
  if (fileBits.length) subParts.push(`Scanned ${fileBits.join(' · ')}`);
  if (typeof result.duration === 'number') subParts.push(`${esc(result.duration)} ms`);
  if (located.length) subParts.push(`${located.length} located findings`);
  const subLine = subParts.join('  ·  ');

  // Header score badge.
  let scoreBadge;
  if (insufficient || overall == null) {
    scoreBadge = `
      <div class="score-badge">
        <div class="score-num band-text-none">—</div>
        <div class="score-grade">Not scored</div>
      </div>`;
  } else {
    scoreBadge = `
      <div class="score-badge">
        <div class="score-num band-text-${band}">${esc(overall.toFixed(1))}<span class="slash"> / 10</span></div>
        <div class="score-grade">${esc(grade || '')}</div>
      </div>`;
  }

  // Body: insufficient-evidence state, or the dimension table + findings.
  let body;
  if (insufficient) {
    body = `
      <section class="insufficient">
        <h2>Insufficient evidence</h2>
        <p>The audit could not gather enough measurable signal from this project to produce a
        score or located findings. This usually means too few stylesheet / component files were
        found, or the design surface could not be read. No score or findings are reported rather
        than guessing.</p>
      </section>`;
  } else {
    body = [
      '<div class="panel">',
      '<h2 class="panel-title">Scores by dimension</h2>',
      renderDimensionTable(scoreCard),
      '</div>',
      renderFindingsGrouped(located),
    ].join('');
  }

  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>UI/UX Audit Report</title>',
    `<style>${STYLE}</style>`,
    '</head>',
    '<body>',
    '<div class="wrap">',
    '<header class="report-head">',
    '<div class="report-head-text">',
    '<p class="eyebrow">UI/UX Suite</p>',
    '<h1 class="report-title">Design Audit Report</h1>',
    subLine ? `<div class="report-sub">${subLine}</div>` : '',
    '</div>',
    scoreBadge,
    '</header>',
    body,
    '<footer class="report-foot">',
    '<span>Generated by UI/UX Suite — evidence-based design audit</span>',
    `<span>${esc(scoreCard.generatedAt || '')}</span>`,
    '</footer>',
    '</div>',
    '</body>',
    '</html>',
  ].join('\n');
}

module.exports = { renderHtmlReport };
