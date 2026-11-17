#!/usr/bin/env node
'use strict';

/**
 * Prints the CHANGELOG.md entry of one version, for the GitHub release body.
 *
 *   node scripts/release-notes.js 0.7.0
 *
 * Exits 1 when the version has no entry or the entry is empty, so a release cannot ship with
 * a blank body or with a bare commit list.
 */

const fs = require('fs');
const path = require('path');

function notesFor(version, changelog) {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex(l => l.startsWith(`## [${version}]`));
  if (start < 0) return null;
  let end = lines.findIndex((l, i) => i > start && /^## \[/.test(l));
  if (end < 0) end = lines.length;
  return lines.slice(start + 1, end).join('\n').trim();
}

module.exports = { notesFor };

if (require.main === module) {
  const version = (process.argv[2] || '').replace(/^v/, '');
  if (!version) {
    console.error('Usage: node scripts/release-notes.js <version>');
    process.exit(1);
  }
  const changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  const notes = notesFor(version, changelog);
  if (!notes) {
    console.error(`CHANGELOG.md has no entry (or an empty one) for ${version}. Add "## [${version}] - YYYY-MM-DD" first.`);
    process.exit(1);
  }
  process.stdout.write(notes + '\n');
}
